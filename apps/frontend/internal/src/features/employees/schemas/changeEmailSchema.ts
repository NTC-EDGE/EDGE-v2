import { z } from 'zod';

export const changeEmailSchema = z
  .object({
    newEmail: z
      .string()
      .min(1, 'New email address is required')
      .email('Enter a valid email address'),
    confirmEmail: z
      .string()
      .min(1, 'Please confirm the new email address')
      .email('Enter a valid email address'),
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: 'Email addresses do not match',
    path: ['confirmEmail'],
  });

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
