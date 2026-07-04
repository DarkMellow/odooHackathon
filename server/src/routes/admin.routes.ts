import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { reviewLeaveSchema } from '../validators/leave.validator';
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

/**
 * GET /api/admin/leave/approvals
 * Private/HR only.
 * Returns all PENDING leave requests, including employee profile info.
 */
router.get(
  '/leave/approvals',
  verifyToken,
  requireRole(['HR']),
  asyncHandler(async (req: Request, res: Response) => {
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            employeeId: true,
            profile: {
              select: {
                fullName: true,
                department: true,
                designation: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    // Flatten for easier consumption on the client
    const formatted = pendingLeaves.map((leave) => ({
      id: leave.id,
      userId: leave.userId,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      totalDays: leave.totalDays,
      status: leave.status,
      employeeRemarks: leave.employeeRemarks,
      createdAt: leave.createdAt,
      // Employee info
      employeeId: leave.user.employeeId,
      fullName: leave.user.profile?.fullName ?? 'Unknown',
      department: leave.user.profile?.department ?? null,
      designation: leave.user.profile?.designation ?? null,
      profilePictureUrl: leave.user.profile?.profilePictureUrl ?? null,
    }));

    return res.status(200).json({ success: true, leaveRequests: formatted });
  })
);

/**
 * GET /api/admin/leave/stats
 * Private/HR only.
 * Returns aggregate stats: total approved leaves this month and per-employee leaderboard.
 */
router.get(
  '/leave/stats',
  verifyToken,
  requireRole(['HR']),
  asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

    // Total approved leaves this month
    const approvedThisMonth = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        decisionDate: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { totalDays: true },
    });

    const totalApprovedLeaves = approvedThisMonth.length;
    const totalApprovedDays = approvedThisMonth.reduce((sum, l) => sum + l.totalDays, 0);

    // Per-employee approved leave counts (leaderboard)
    const leaderboard = await prisma.leaveRequest.groupBy({
      by: ['userId'],
      where: { status: 'APPROVED' },
      _count: { id: true },
      _sum: { totalDays: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Fetch profiles for leaderboard
    const userIds = leaderboard.map((l) => l.userId);
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: userIds } },
      select: {
        userId: true,
        fullName: true,
        designation: true,
        user: { select: { employeeId: true } },
      },
    });

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    const leaderboardFormatted = leaderboard.map((entry) => {
      const profile = profileMap.get(entry.userId);
      return {
        userId: entry.userId,
        employeeId: profile?.user?.employeeId ?? '',
        fullName: profile?.fullName ?? 'Unknown',
        designation: profile?.designation ?? '',
        approvedCount: entry._count.id,
        daysCount: entry._sum.totalDays ?? 0,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalApprovedLeaves,
        totalApprovedDays,
        currentMonth: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      },
      leaderboard: leaderboardFormatted,
    });
  })
);

/**
 * PUT /api/admin/leave/approvals/:id
 * Private/HR only.
 * Approves or rejects a pending leave request.
 * On approval, upserts attendance records for the leave date range.
 */
router.put(
  '/leave/approvals/:id',
  verifyToken,
  requireRole(['HR']),
  validate(reviewLeaveSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const reviewerId = req.user?.userId;
    const leaveId = parseInt(req.params.id, 10);

    if (!reviewerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    if (isNaN(leaveId)) {
      return res.status(400).json({ success: false, message: 'Invalid leave request ID.' });
    }

    const { status, hrComments } = req.body;

    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== 'PENDING') {
      return res.status(409).json({
        success: false,
        message: `This leave request is already ${leave.status.toLowerCase()}.`,
      });
    }

    // HR cannot approve their own leave requests (self-approval prevention)
    if (leave.userId === reviewerId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot review your own leave request.',
      });
    }

    const now = new Date();

    // Update the leave request status
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        hrComments: hrComments || null,
        reviewedBy: reviewerId,
        decisionDate: now,
      },
    });

    // If approved, upsert attendance records for all dates in the leave range
    if (status === 'APPROVED') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const attendanceUpserts: Promise<any>[] = [];

      const currentDate = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
      );
      const endUTC = new Date(
        Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
      );

      while (currentDate <= endUTC) {
        const dateForAttendance = new Date(currentDate);
        attendanceUpserts.push(
          prisma.attendance.upsert({
            where: {
              userId_date_unique: {
                userId: leave.userId,
                date: dateForAttendance,
              },
            },
            create: {
              userId: leave.userId,
              date: dateForAttendance,
              checkIn: null,
              checkOut: null,
              status: 'LEAVE',
            },
            update: {
              status: 'LEAVE',
              checkIn: null,
              checkOut: null,
            },
          })
        );
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      await Promise.all(attendanceUpserts);
    }

    return res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
      leave: updatedLeave,
    });
  })
);

export default router;
