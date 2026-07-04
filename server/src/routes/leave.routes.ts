import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middleware/auth.middleware';
import { applyLeaveSchema } from '../validators/leave.validator';
import { ZodError } from 'zod';

const router = Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Zod validation middleware
const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

// Leave quotas (business rules)
const PAID_QUOTA = 15;
const SICK_QUOTA = 5;

/**
 * GET /api/employee/leave
 * Private/Authenticated access (Employee + HR).
 * Returns all leave requests for the calling user, sorted by startDate descending.
 */
router.get(
  '/',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      include: {
        reviewer: {
          select: {
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    return res.status(200).json({ success: true, leaves });
  })
);

/**
 * POST /api/employee/leave/apply
 * Private/Authenticated access (Employee + HR).
 * Submits a new leave request. Validates overlap and quota limits.
 */
router.post(
  '/apply',
  verifyToken,
  validate(applyLeaveSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const { leaveType, startDate, endDate, employeeRemarks } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate total days (inclusive)
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    // --- Quota Check ---
    if (leaveType === 'PAID' || leaveType === 'SICK') {
      const quota = leaveType === 'PAID' ? PAID_QUOTA : SICK_QUOTA;

      const approvedLeaves = await prisma.leaveRequest.findMany({
        where: {
          userId,
          leaveType,
          status: 'APPROVED',
        },
        select: { totalDays: true },
      });

      const usedDays = approvedLeaves.reduce((sum, l) => sum + l.totalDays, 0);

      if (usedDays + totalDays > quota) {
        const remaining = Math.max(0, quota - usedDays);
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType.toLowerCase()} leave balance. You have ${remaining} day(s) remaining.`,
        });
      }
    }

    // --- Overlap Check ---
    // Find any active (PENDING / APPROVED) requests that overlap with the requested range
    const overlapping = await prisma.leaveRequest.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Your request overlaps with an existing active or pending leave application.',
      });
    }

    // --- Create Leave Request ---
    const newLeave = await prisma.leaveRequest.create({
      data: {
        userId,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        employeeRemarks,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      leave: newLeave,
    });
  })
);

/**
 * POST /api/employee/leave/:id/withdraw
 * Private/Authenticated access (Employee + HR).
 * Sets a PENDING leave request to WITHDRAWN. Employee cannot withdraw other employees' leaves.
 */
router.post(
  '/:id/withdraw',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const leaveId = parseInt(req.params.id, 10);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    if (isNaN(leaveId)) {
      return res.status(400).json({ success: false, message: 'Invalid leave ID.' });
    }

    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own leave requests.',
      });
    }

    if (leave.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw a leave request that is already ${leave.status.toLowerCase()}.`,
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'WITHDRAWN' },
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request withdrawn.',
      leave: updated,
    });
  })
);

export default router;
