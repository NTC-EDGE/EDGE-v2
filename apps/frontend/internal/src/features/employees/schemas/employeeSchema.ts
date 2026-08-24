import { z } from 'zod';

export const employeeFormSchema = z.object({
  role: z.enum([
    'Admin',
    'Evaluator',
    'Manager',
    'Staff',
    'Chief of EOD',
    'Regional Director',
    'Legal',
    'Accountant',
    'Cashier',
  ]),
  lastName: z.string().trim().min(1, 'Last Name is required'),
  firstName: z.string().trim().min(1, 'First Name is required'),
  middleName: z.string(),
  suffix: z.string(),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Enter a valid email address'),
  region: z.string().trim().min(1, 'Region is required'),
  level: z.string().trim().min(1, 'Level is required'),
  title: z.string().trim().min(1, 'Title is required'),
  division: z.string().trim().min(1, 'Division is required'),
  position: z.string().trim().min(1, 'Position is required'),
  designation: z.string(),
  signatureDisplay: z.enum(['beside', 'above']),
  signatureFileName: z.string().nullable(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
