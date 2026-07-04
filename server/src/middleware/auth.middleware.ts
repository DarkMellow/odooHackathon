import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { Role } from '@prisma/client';

// Augment the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify that the client has a valid access token in cookies.
 * Attaches the verified user payload to the request object.
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is missing. Please log in.',
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token.',
    });
  }
};

/**
 * Middleware guard to check if the authenticated user has one of the allowed roles.
 * Must be used after verifyToken middleware.
 * @param allowedRoles Array of Roles permitted to access the route.
 */
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource.',
      });
    }

    next();
  };
};
