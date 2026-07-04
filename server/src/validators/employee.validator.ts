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
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
