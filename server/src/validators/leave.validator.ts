import { z } from 'zod';

/**
 * Schema for submitting a new leave application (Employee).
 */
export const applyLeaveSchema = z.object({
  leaveType: z.enum(['PAID', 'SICK', 'UNPAID'] as const, {
    error: "Leave type must be PAID, SICK, or UNPAID.",
  }),
  startDate: z
    .string({ error: 'Start date is required.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format.'),
  endDate: z
    .string({ error: 'End date is required.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format.'),
  employeeRemarks: z
    .string({ error: 'Employee remarks are required.' })
    .min(10, 'Remarks must be at least 10 characters long.')
    .max(1000, 'Remarks must not exceed 1000 characters.')
    .trim(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be on or after start date.',
    path: ['endDate'],
  }
);

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;

/**
 * Schema for HR reviewing (approving/rejecting) a leave request.
 */
export const reviewLeaveSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED'] as const, {
      error: "Status must be APPROVED or REJECTED.",
    }),
    hrComments: z
      .string()
      .max(1000, 'HR comments must not exceed 1000 characters.')
      .trim()
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.status === 'REJECTED') {
        return data.hrComments && data.hrComments.trim().length >= 5;
      }
      return true;
    },
    {
      message: 'A comment explaining the rejection reason is required.',
      path: ['hrComments'],
    }
  );

export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
