import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .trim(),
  employeeId: z
    .string()
    .min(1, 'Employee ID is required')
    .min(3, 'Employee ID must be at least 3 characters')
    .max(50, 'Employee ID must not exceed 50 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['EMPLOYEE', 'HR'], {
    message: 'Role is required and must be either EMPLOYEE or HR',
  }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
