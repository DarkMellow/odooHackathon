import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded for local testing/utility files
dotenv.config();

export interface TokenPayload {
  userId: number;
  email: string;
  role: Role;
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_should_be_changed_in_production_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_should_be_changed_in_production_12345';

/**
 * Generates an Access Token valid for 15 minutes.
 * @param payload The payload to embed in the token.
 * @returns The signed JWT string.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

/**
 * Generates a Refresh Token valid for 7 days.
 * @param payload The payload to embed in the token.
 * @returns The signed JWT string.
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies an Access Token.
 * @param token The JWT string to verify.
 * @returns The decoded TokenPayload.
 * @throws Error if the token is invalid or expired.
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
}

/**
 * Verifies a Refresh Token.
 * @param token The JWT string to verify.
 * @returns The decoded TokenPayload.
 * @throws Error if the token is invalid or expired.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
