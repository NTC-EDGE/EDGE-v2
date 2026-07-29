import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email address or username is required."),
  password: z
    .string()
    .min(1, "Password is required."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid staff email address."),
});

export type ForgotPasswordRequestFormData = z.infer<typeof forgotPasswordRequestSchema>;

export const forgotPasswordResetSchema = z
  .object({
    code: z
      .string()
      .length(6, "Verification code must be exactly 6 digits."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ForgotPasswordResetFormData = z.infer<typeof forgotPasswordResetSchema>;
