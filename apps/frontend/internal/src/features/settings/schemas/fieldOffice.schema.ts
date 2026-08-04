import { z } from 'zod';

export const fieldOfficeSchema = z.object({
  name: z.string().min(2, 'Branch Name must be at least 2 characters'),
  code: z.string().min(2, 'Branch Code must be at least 2 characters'),
  category: z.enum(['Main', 'Extension'], {
    message: 'Please select a Branch Category (Main or Extension)',
  }),
  address: z.string().min(2, 'Office Address is required'),
  contactPhone: z.string().min(2, 'Contact Phone is required'),
  contactEmail: z.string().email('Please enter a valid email address'),
  officerName: z.string().optional(),
  officerEmail: z.string().email('Please enter a valid officer email').or(z.literal('')).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  allowSpectrumInspection: z.boolean().optional(),
  allowPermitIssuance: z.boolean().optional(),
  allowComplaintReception: z.boolean().optional(),
});

export type FieldOfficeFormValues = z.infer<typeof fieldOfficeSchema>;
