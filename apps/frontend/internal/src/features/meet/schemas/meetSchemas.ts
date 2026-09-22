import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(3, 'Meeting title must be at least 3 characters').max(150, 'Title too long'),
  description: z.string().max(300, 'Description too long').optional(),
  scope: z.enum(['IntraRegional', 'InterRegional']),
  scheduledStartTime: z.string().min(1, 'Start time is required'),
  participantUserIds: z.array(z.string()).optional(),
});

export type CreateMeetingFormValues = z.infer<typeof createMeetingSchema>;

export const createDirectMeetingSchema = z.object({
  colleagueEmailOrId: z.string().min(1, 'Colleague ID or email is required'),
  title: z.string().max(150).optional(),
  scope: z.enum(['IntraRegional', 'InterRegional']),
});

export type CreateDirectMeetingFormValues = z.infer<typeof createDirectMeetingSchema>;

export const createPollSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(200, 'Question too long'),
  option1: z.string().min(1, 'Option 1 is required'),
  option2: z.string().min(1, 'Option 2 is required'),
  option3: z.string().optional(),
  isAnonymous: z.boolean(),
});

export type CreatePollFormValues = z.infer<typeof createPollSchema>;
