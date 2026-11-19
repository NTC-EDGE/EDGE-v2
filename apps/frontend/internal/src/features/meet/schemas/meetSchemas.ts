import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(3, 'Meeting title must be at least 3 characters').max(150, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
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
    .max(120, 'Meeting code or link too long')
    .transform((val) => {
      const trimmed = val.trim();
      try {
        if (trimmed.includes('code=')) {
          const idx = trimmed.indexOf('code=');
          const after = trimmed.slice(idx + 5);
          const ampIdx = after.indexOf('&');
          return decodeURIComponent(ampIdx >= 0 ? after.slice(0, ampIdx) : after).trim();
        }
      } catch {
        // Fallback to raw input
      }
      return trimmed;
    }),
});

export type JoinMeetingFormValues = z.infer<typeof joinMeetingSchema>;

export const createDirectMeetingSchema = z.object({
  colleagueEmailOrId: z.string().min(1, 'Colleague ID or email is required'),
  title: z.string().max(150).optional(),
  scope: z.enum(['IntraRegional', 'InterRegional']),
});

export type CreateDirectMeetingFormValues = z.infer<typeof createDirectMeetingSchema>;

export const createPollSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(250, 'Question too long'),
  option1: z.string().min(1, 'Option 1 is required').max(120),
  option2: z.string().min(1, 'Option 2 is required').max(120),
  option3: z.string().max(120).optional(),
  option4: z.string().max(120).optional(),
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

export function isBooleanValue(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isValidParticipantRole(value: unknown): value is 'Member' | 'Admin' | 'Owner' {
  return value === 'Member' || value === 'Admin' || value === 'Owner';
}
