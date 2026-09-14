import { z } from 'zod';

export const scheduleFormSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  venue: z.string().min(1, 'Venue is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  startApplication: z.string().optional(),
  endApplication: z.string().optional(),
  maximumSlots: z.string().optional(),
  remarks: z.string().optional(),
  isPublished: z.boolean(),
});

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;
