import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { updateProfileSchema, preRegisterSchema } from '../validators/employee.validator';
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
            salaryStructures: {
              orderBy: {
                effectiveDate: 'desc',
              },
              take: 1,
            },
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
    const { phone, address, profilePictureUrl, dob, emergencyContact } = req.body;

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        phone,
        address,
        profilePictureUrl,
        dob,
        emergencyContact,
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
            salaryStructures: {
              orderBy: {
                effectiveDate: 'desc',
              },
              take: 1,
            },
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

/**
 * GET /api/employee
 * Private/Authenticated access. Returns list of all employees with their profiles, current attendance status, and salary structures.
 */
router.get(
  '/',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const dateStr = req.query.date as string;
    let targetDate: Date;

    if (dateStr) {
      targetDate = new Date(dateStr);
    } else {
      const now = new Date();
      targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    const utcDate = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));

    const employees = await prisma.user.findMany({
      include: {
        profile: true,
        attendances: {
          where: {
            date: utcDate,
          },
        },
        salaryStructures: {
          orderBy: {
            effectiveDate: 'desc',
          },
          take: 1,
        },
      },
    });

    const pendingEmployees = await prisma.preRegisteredEmployee.findMany({
      where: {
        isRegistered: false,
      },
    });

    const mappedRegistered = employees.map((emp) => {
      const todayAttendance = emp.attendances[0];
      const salaryStructure = emp.salaryStructures[0];
      return {
        id: emp.id,
        employeeId: emp.employeeId,
        email: emp.email,
        role: emp.role,
        isVerified: emp.isVerified,
        isRegistered: true,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
        profile: emp.profile,
        todayAttendance: todayAttendance ? {
          id: todayAttendance.id,
          userId: todayAttendance.userId,
          date: todayAttendance.date,
          checkIn: todayAttendance.checkIn,
          checkOut: todayAttendance.checkOut,
          status: todayAttendance.status,
        } : null,
        salaryStructures: salaryStructure ? [
          {
            id: salaryStructure.id,
            userId: salaryStructure.userId,
            baseSalary: Number(salaryStructure.baseSalary),
            allowances: salaryStructure.allowances,
            deductions: salaryStructure.deductions,
            netPay: Number(salaryStructure.netPay),
            effectiveDate: salaryStructure.effectiveDate,
          }
        ] : [],
      };
    });

    const mappedPending = pendingEmployees.map((pe) => ({
      id: pe.id,
      employeeId: pe.employeeId,
      email: 'Pending Registration',
      role: pe.role,
      isVerified: false,
      isRegistered: false,
      createdAt: pe.createdAt,
      updatedAt: pe.updatedAt,
      profile: {
        id: pe.id,
        userId: 0,
        fullName: pe.fullName,
        dob: null,
        phone: null,
        address: null,
        emergencyContact: null,
        profilePictureUrl: null,
        department: pe.department,
        designation: pe.designation,
        dateOfJoining: pe.createdAt,
        reportingManager: null,
        createdAt: pe.createdAt,
        updatedAt: pe.updatedAt,
      },
      todayAttendance: {
        id: 0,
        userId: 0,
        date: utcDate,
        checkIn: null,
        checkOut: null,
        status: 'PENDING',
      },
      salaryStructures: [],
    }));

    return res.status(200).json({
      success: true,
      employees: [
        ...mappedRegistered,
        ...mappedPending,
      ],
    });
  })
);

/**
 * POST /api/employee/pre-register
 * Private/HR access. Pre-registers a new employee ID and full name.
 */
router.post(
  '/pre-register',
  verifyToken,
  requireRole(['HR']),
  validate(preRegisterSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { fullName, employeeId, department, designation, role } = req.body;

    // Check if employeeId already exists in Users
    const existingUser = await prisma.user.findUnique({
      where: { employeeId },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this ID is already registered.',
      });
    }

    // Check if employeeId already exists in PreRegisteredEmployee
    const existingPreRegister = await prisma.preRegisteredEmployee.findUnique({
      where: { employeeId },
    });

    if (existingPreRegister) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this ID has already been pre-registered.',
      });
    }

    // Save to database
    const newPreRegistered = await prisma.preRegisteredEmployee.create({
      data: {
        employeeId,
        fullName,
        department,
        designation,
        role: role === 'HR' ? 'HR' : 'EMPLOYEE',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Employee pre-registered successfully.',
      employee: newPreRegistered,
    });
  })
);

export default router;
