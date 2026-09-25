import { apiClient } from '../apiClient';

export interface ChatParticipant {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  tenantId?: string | null;
  tenantName?: string | null;
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

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  senderTenantId?: string | null;
  senderTenantName?: string | null;
  content: string;
  type: 'Text' | 'File' | 'SystemEvent' | 'MeetingInvite';
  replyToMessageId?: string | null;
  createdAt: string;
  attachments: ChatAttachment[];
  isEdited?: boolean;
  isUnsent?: boolean;
  reactions?: MessageReaction[];
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
  isArchived?: boolean;
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
  async getConversations(tenantId?: string, filter?: string): Promise<Conversation[]> {
    const params: Record<string, string> = {};
    if (tenantId) params.tenantId = tenantId;
    if (filter) params.filter = filter;
    const response = await apiClient.get<Conversation[]>('/api/v2/chat/conversations', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  },

  async archiveConversation(conversationId: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      `/api/v2/chat/conversations/${conversationId}/archive`
    );
    return response.data.success;
  },

  async unarchiveConversation(conversationId: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      `/api/v2/chat/conversations/${conversationId}/unarchive`
    );
    return response.data.success;
  },

  async createConversation(payload: CreateConversationPayload): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/api/v2/chat/conversations', payload);
    return response.data;
  },

  async addParticipants(conversationId: string, userIds: string[]): Promise<Conversation> {
    const response = await apiClient.post<Conversation>(
      `/api/v2/chat/conversations/${conversationId}/participants`,
      { conversationId, userIds }
    );
    return response.data;
  },

  async removeParticipant(conversationId: string, userId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/api/v2/chat/conversations/${conversationId}/participants/${userId}`
    );
    return response.data.success;
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

  async markAsRead(conversationId: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      `/api/v2/chat/conversations/${conversationId}/read`
    );
    return response.data.success;
  },

  async markAsUnread(conversationId: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      `/api/v2/chat/conversations/${conversationId}/unread`
    );
    return response.data.success;
  },

  async editMessage(conversationId: string, messageId: string, content: string): Promise<boolean> {
    await apiClient.put(`/api/v2/chat/conversations/${conversationId}/messages/${messageId}`, { content });
    return true;
  },

  async unsendMessage(conversationId: string, messageId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/api/v2/chat/conversations/${conversationId}/messages/${messageId}`
    );
    return response.data.success ?? true;
  },

  async reactToMessage(conversationId: string, messageId: string, emoji: string): Promise<boolean> {
    await apiClient.post(`/api/v2/chat/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji });
    return true;
  },
};
