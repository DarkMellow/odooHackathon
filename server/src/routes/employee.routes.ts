import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middleware/auth.middleware';
import { updateProfileSchema } from '../validators/employee.validator';
import { ZodError } from 'zod';

const router = Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation Middleware
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
 * GET /api/employee/profile
 * Private/Authenticated access. Returns the caller's complete profile.
 */
router.get(
  '/profile',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session is invalid.',
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  })
);

/**
 * PUT /api/employee/profile
 * Private/Authenticated access. Updates the caller's limited fields (phone, address, profile image).
 */
router.put(
  '/profile',
  verifyToken,
  validate(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session is invalid.',
      });
    }

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    // Extract only permitted fields for updating
    const { phone, address, profilePictureUrl } = req.body;

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        phone,
        address,
        profilePictureUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedProfile,
    });
  })
);

export default router;
