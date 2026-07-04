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
  about: z
    .string()
    .trim()
    .optional()
    .nullable(),
  loveAboutJob: z
    .string()
    .trim()
    .optional()
    .nullable(),
  interestsHobbies: z
    .string()
    .trim()
    .optional()
    .nullable(),
  skills: z
    .array(z.string())
    .optional()
    .nullable(),
  certs: z
    .array(z.string())
    .optional()
    .nullable(),
  nationality: z
    .string()
    .max(100, 'Nationality must not exceed 100 characters')
    .trim()
    .optional()
    .nullable(),
  personalEmail: z
    .string()
    .max(255, 'Personal email must not exceed 255 characters')
    .trim()
    .optional()
    .nullable(),
  gender: z
    .string()
    .max(50, 'Gender must not exceed 50 characters')
    .trim()
    .optional()
    .nullable(),
  maritalStatus: z
    .string()
    .max(50, 'Marital status must not exceed 50 characters')
    .trim()
    .optional()
    .nullable(),
  bankAccount: z
    .string()
    .max(50, 'Bank account number must not exceed 50 characters')
    .trim()
    .optional()
    .nullable(),
  bankName: z
    .string()
    .max(100, 'Bank name must not exceed 100 characters')
    .trim()
    .optional()
    .nullable(),
  ifscCode: z
    .string()
    .max(20, 'IFSC code must not exceed 20 characters')
    .trim()
    .optional()
    .nullable(),
  panNo: z
    .string()
    .max(20, 'PAN number must not exceed 20 characters')
    .trim()
    .optional()
    .nullable(),
  uanNo: z
    .string()
    .max(20, 'UAN must not exceed 20 characters')
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

