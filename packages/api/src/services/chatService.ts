import { apiClient } from '../apiClient';

export interface ChatParticipant {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  tenantId: string;
  tenantName: string;
  role: 'Member' | 'Admin' | 'Owner';
  isMuted: boolean;
  lastReadAt?: string | null;
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  fileExtension: string;
  mimeType: string;
  fileSizeBytes: number;
  storagePath: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  senderTenantId: string;
  senderTenantName: string;
  content: string;
  type: 'Text' | 'File' | 'SystemEvent' | 'MeetingInvite';
  replyToMessageId?: string | null;
  createdAt: string;
  attachments: ChatAttachment[];
}

export interface Conversation {
  id: string;
  title?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  type: 'Direct' | 'Group' | 'Channel';
  scope: 'IntraRegional' | 'InterRegional';
  tenantId?: string | null;
  tenantName?: string | null;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  unreadCount: number;
  participants: ChatParticipant[];
}

export interface CreateConversationPayload {
  title?: string | null;
  description?: string | null;
  type: 'Direct' | 'Group' | 'Channel';
  scope: 'IntraRegional' | 'InterRegional';
  tenantId?: string | null;
  participantUserIds: string[];
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  type?: 'Text' | 'File' | 'SystemEvent' | 'MeetingInvite';
  replyToMessageId?: string | null;
  attachments?: Omit<ChatAttachment, 'id'>[];
}

export const chatService = {
  async getConversations(tenantId?: string): Promise<Conversation[]> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.get<Conversation[]>('/api/v2/chat/conversations', { params });
    return response.data;
  },

  async createConversation(payload: CreateConversationPayload): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/api/v2/chat/conversations', payload);
    return response.data;
  },

  async getMessages(conversationId: string, skip = 0, take = 50): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>(`/api/v2/chat/conversations/${conversationId}/messages`, {
      params: { skip, take },
    });
    return response.data;
  },

  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const response = await apiClient.post<ChatMessage>(
      `/api/v2/chat/conversations/${payload.conversationId}/messages`,
      payload
    );
    return response.data;
  },
};
