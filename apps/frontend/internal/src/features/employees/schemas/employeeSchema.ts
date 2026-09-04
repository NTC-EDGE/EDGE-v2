import { z } from 'zod';

export const employeeFormSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  firstName: z.string().min(1, 'First Name is required'),
  middleName: z.string(),
  suffix: z.string(),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Enter a valid email address'),
  fieldOffice: z.string(),
  region: z.string(),
  level: z.string(),
  title: z.string(),
  division: z.string(),
  position: z.string(),
  designation: z.string(),
  signatureDisplay: z.enum(['beside', 'above']),
  signatureFileName: z.string().nullable(),
  provisioningMethod: z.enum(['email', 'manual']),
  password: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
