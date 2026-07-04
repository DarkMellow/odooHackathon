import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/crypto';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';
import { signupSchema, loginSchema } from '../validators/auth.validator';
import { ZodError } from 'zod';
import { Resend } from 'resend';

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
 * POST /api/auth/signup
 * Public access. Registers a user, hashes password, saves unverified profile, and stores verification token.
 */
router.post(
  '/signup',
  validate(signupSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { fullName, employeeId, email, password, role } = req.body;

    // Check if user already exists with email or employeeId
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { employeeId }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or employee ID is already registered.',
      });
    }

    // Validate against PreRegisteredEmployee
    const preRegistered = await prisma.preRegisteredEmployee.findUnique({
      where: { employeeId },
    });

    if (!preRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is not pre-registered. Please contact HR.',
      });
    }

    // Check if name matches (case-insensitive and trimmed)
    if (preRegistered.fullName.trim().toLowerCase() !== fullName.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and Full Name do not match our HR records.',
      });
    }

    if (preRegistered.isRegistered) {
      return res.status(409).json({
        success: false,
        message: 'This employee ID is already registered.',
      });
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Generate verification token (expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create user, profile, and verification token in a transaction
    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          employeeId,
          email,
          passwordHash,
          role: preRegistered.role, // Enforce the role HR assigned
          isVerified: false,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          fullName: preRegistered.fullName, // Enforce pre-registered name
          department: preRegistered.department,
          designation: preRegistered.designation,
        },
      });

      await tx.verificationToken.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt,
        },
      });

      await tx.preRegisteredEmployee.update({
        where: { employeeId },
        data: { isRegistered: true },
      });

      return user;
    });

    // Dispatch verification email via Resend if API Key is configured
    const apiKey = process.env.RESEND_API_KEY;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationLink = `${clientUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: 'EasyHR <onboarding@resend.dev>',
          to: [email],
          subject: 'EasyHR: Verify Your Email Address',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #3b82f6; margin-top: 0;">Welcome to EasyHR!</h2>
              <p>Hello <strong>${fullName}</strong>,</p>
              <p>Thank you for registering. Please verify your email address to activate your account and access your dashboard.</p>
              <div style="margin: 24px 0;">
                <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
              </div>
              <p style="font-size: 11px; color: #64748b; margin-bottom: 4px;">If the button above does not work, copy and paste this URL into your browser:</p>
              <p style="font-size: 11px; color: #3b82f6; word-break: break-all; margin-top: 0;">${verificationLink}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8;">If you did not request this account, you can safely ignore this email.</p>
            </div>
          `,
        });
        console.log(`[Resend] Verification email dispatched successfully to ${email}`);
      } catch (mailErr) {
        console.error('[Resend] Failed to send verification email:', mailErr);
      }
    } else {
      console.warn(
        `[Resend] RESEND_API_KEY is not defined in backend .env. ` +
        `Verification email skipped. Mock verification URL:\n${verificationLink}`
      );
    }

    // Return response with verificationToken so frontend can also see it in the dev console
    return res.status(201).json({
      success: true,
      message: 'Account created. Please check email for verification link.',
      userId: newUser.id,
      verificationToken,
    });
  })
);

/**
 * GET /api/auth/verify-email
 * Public access. Validates verification token and marks user verified.
 */
router.get(
  '/verify-email',
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }

    const verificationTokenRecord = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationTokenRecord) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    if (verificationTokenRecord.expiresAt < new Date()) {
      // Cleanup expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please sign up again.',
      });
    }

    // Mark user as verified and delete verification token
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: verificationTokenRecord.userId },
        data: { isVerified: true },
      });

      await tx.verificationToken.delete({
        where: { token },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
    });
  })
);

/**
 * POST /api/auth/login
 * Public access. Verifies credentials and sets HTTP-Only cookies.
 */
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      // Dummy check to prevent timing attacks
      await comparePassword(password, '$2a$12$dummyHashdummyHashdummyHashdummyHashdummyHashdummy');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check verification status
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email address is not verified yet. Please check your inbox.',
      });
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate tokens
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
      },
    });

    // Write cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.profile?.fullName || 'User',
        role: user.role,
      },
    });
  })
);

/**
 * POST /api/auth/logout
 * Private/Authenticated access. Revokes active session refresh token and clears cookies.
 */
router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Revoke from database
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out.',
    });
  })
);

/**
 * POST /api/auth/refresh
 * Public access (reads cookies). Rotates refresh and access tokens.
 */
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is missing.',
      });
    }

    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    // Check if refresh token exists in database
    const dbRefreshToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!dbRefreshToken) {
      // Token reuse detection or revoked token.
      // Clear cookies for security.
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return res.status(401).json({
        success: false,
        message: 'Session has been revoked or expired.',
      });
    }

    if (dbRefreshToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired. Please log in again.',
      });
    }

    const tokenPayload: TokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    // Generate new tokens
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Save new refresh token and delete old one in a transaction
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { token: refreshToken },
      }),
      prisma.refreshToken.create({
        data: {
          userId: payload.userId,
          token: newRefreshToken,
          expiresAt: newExpiry,
        },
      }),
    ]);

    // Write new cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully.',
    });
  })
);

export default router;
