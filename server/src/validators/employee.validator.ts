import { z } from 'zod';

export const updateProfileSchema = z.object({
  phone: z
    .string()
    .max(20, 'Phone number must not exceed 20 characters')
    .trim()
    .optional()
    .nullable(),
  address: z
    .string()
    .trim()
    .optional()
    .nullable(),
  profilePictureUrl: z
    .string()
    .max(512, 'Profile picture URL must not exceed 512 characters')
    .trim()
    .optional()
    .nullable(),
  dob: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  emergencyContact: z
    .string()
    .max(255, 'Emergency contact must not exceed 255 characters')
    .trim()
    .optional()
    .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const preRegisterSchema = z.object({
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
  department: z
    .string()
    .min(1, 'Department is required')
    .max(100, 'Department must not exceed 100 characters')
    .trim(),
  designation: z
    .string()
    .min(1, 'Designation is required')
    .max(100, 'Designation must not exceed 100 characters')
    .trim(),
  role: z.enum(['EMPLOYEE', 'HR']).optional(),
});

export type PreRegisterInput = z.infer<typeof preRegisterSchema>;

