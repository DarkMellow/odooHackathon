import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/employee/attendance/check-in
 * Private/Authenticated access (Employee role only).
 * Records check-in time for the current UTC date. Enforces a single check-in.
 */
router.post(
  '/check-in',
  verifyToken,
  requireRole(['EMPLOYEE']),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session is invalid.',
      });
    }

    const now = new Date();
    // Zero out the time portion to get the current UTC date
    const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Check if check-in already exists for today
    const existingRecord = await prisma.attendance.findUnique({
      where: {
        userId_date_unique: {
          userId,
          date: utcToday,
        },
      },
    });

    if (existingRecord) {
      if (existingRecord.checkIn) {
        return res.status(409).json({
          success: false,
          message: 'You have already checked in for today.',
        });
      }

      // If a placeholder record exists (e.g., set by another system) but check-in is null, update it
      const updatedRecord = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkIn: now,
          status: 'PRESENT',
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Checked in successfully.',
        attendance: updatedRecord,
      });
    }

    // Create a new attendance record
    const newRecord = await prisma.attendance.create({
      data: {
        userId,
        date: utcToday,
        checkIn: now,
        status: 'PRESENT',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Checked in successfully.',
      attendance: newRecord,
    });
  })
);

/**
 * POST /api/employee/attendance/check-out
 * Private/Authenticated access (Employee role only).
 * Records check-out time. Only succeeds if check-in exists.
 */
router.post(
  '/check-out',
  verifyToken,
  requireRole(['EMPLOYEE']),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session is invalid.',
      });
    }

    const now = new Date();
    // Zero out the time portion to get the current UTC date
    const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Find the record for today
    const existingRecord = await prisma.attendance.findUnique({
      where: {
        userId_date_unique: {
          userId,
          date: utcToday,
        },
      },
    });

    if (!existingRecord || !existingRecord.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first before checking out.',
      });
    }

    if (existingRecord.checkOut) {
      return res.status(409).json({
        success: false,
        message: 'You have already checked out for today.',
      });
    }

    // Update the record with check-out timestamp
    const updatedRecord = await prisma.attendance.update({
      where: { id: existingRecord.id },
      data: {
        checkOut: now,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully.',
      attendance: updatedRecord,
    });
  })
);

/**
 * GET /api/employee/attendance/history
 * Private/Authenticated access (Employee role only).
 * Lists historical logs. Query filters: startDate, endDate (defaults to current week).
 */
router.get(
  '/history',
  verifyToken,
  requireRole(['EMPLOYEE']),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session is invalid.',
      });
    }

    let start: Date;
    let end: Date;

    if (req.query.startDate) {
      const parsedStart = new Date(req.query.startDate as string);
      if (isNaN(parsedStart.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate format. Use YYYY-MM-DD.',
        });
      }
      start = parsedStart;
    } else {
      // Monday of the current week (UTC)
      const now = new Date();
      const currentDay = now.getUTCDay();
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + distanceToMonday));
    }

    if (req.query.endDate) {
      const parsedEnd = new Date(req.query.endDate as string);
      if (isNaN(parsedEnd.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid endDate format. Use YYYY-MM-DD.',
        });
      }
      end = parsedEnd;
    } else {
      // Sunday of the current week (UTC)
      const now = new Date();
      const currentDay = now.getUTCDay();
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + distanceToMonday));
      end = new Date(Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() + 6));
    }

    const logs = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      logs,
    });
  })
);

export default router;
