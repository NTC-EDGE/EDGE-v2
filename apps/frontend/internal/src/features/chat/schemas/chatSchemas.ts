import { z } from 'zod';

export const createGroupChatSchema = z.object({
  title: z.string().min(2, 'Group title must be at least 2 characters').max(100, 'Title too long'),
  description: z.string().max(250, 'Description too long').optional(),
  scope: z.enum(['IntraRegional', 'InterRegional']),
  participantUserIds: z.array(z.string()).min(1, 'Select at least 1 participant'),
});

export type CreateGroupChatFormValues = z.infer<typeof createGroupChatSchema>;

export const createDirectChatSchema = z.object({
  recipientUserId: z.string().min(1, 'Please select or enter the colleague user ID / email'),
  scope: z.enum(['IntraRegional', 'InterRegional']),
  initialMessage: z.string().max(2000, 'Message too long').optional(),
});

export type CreateDirectChatFormValues = z.infer<typeof createDirectChatSchema>;

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  replyToMessageId: z.string().optional(),
});

export type SendMessageFormValues = z.infer<typeof sendMessageSchema>;
