import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(3, 'Meeting title must be at least 3 characters').max(150, 'Title too long'),
  description: z.string().max(300, 'Description too long').optional(),
  scope: z.enum(['IntraRegional', 'InterRegional']),
  meetingDate: z.string().min(1, 'Meeting date is required'),
  meetingTime: z.string().min(1, 'Meeting time is required'),
  durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  scheduledStartTime: z.string().min(1, 'Start time is required'),
  scheduledEndTime: z.string().optional(),
  participantUserIds: z.array(z.string()).optional(),
});

export type CreateMeetingFormValues = z.infer<typeof createMeetingSchema>;

export const joinMeetingSchema = z.object({
  meetingCode: z
    .string()
    .min(3, 'Meeting code must be at least 3 characters')
    .max(50, 'Meeting code too long')
    .transform((val) => val.trim()),
});

export type JoinMeetingFormValues = z.infer<typeof joinMeetingSchema>;

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

export const executeMeetingActionSchema = z.object({
  meetingCode: z.string().min(1, 'Meeting code is required'),
  actionType: z.enum([
    'RaiseHand',
    'LowerHand',
    'EmojiReaction',
    'MuteParticipant',
    'SpotlightParticipant',
    'AdmitFromLobby',
    'KickParticipant',
    'EndMeeting',
    'CancelMeeting',
    'LeaveMeeting',
  ]),
  targetUserId: z.string().nullable().optional(),
  actionPayload: z.string().nullable().optional(),
});

export type ExecuteMeetingActionFormValues = z.infer<typeof executeMeetingActionSchema>;
