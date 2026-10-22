import { useState, useEffect, useCallback, useMemo } from 'react';
import { chatService, Conversation, safeAsync, realTimeService } from '@edge/api';
import { useTabQueryParam } from '../../../hooks/useTabQueryParam';

export type ChatFilter = 'All' | 'Unread' | 'Direct' | 'Group' | 'Archived';

const VALID_CHAT_FILTERS: readonly ChatFilter[] = ['All', 'Unread', 'Direct', 'Group', 'Archived'];

export interface ExtendedConversation extends Conversation {
  isArchived?: boolean;
}

export function useChatConversations(tenantId?: string, currentUserId?: string) {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useTabQueryParam<ChatFilter>('tab', 'All', VALID_CHAT_FILTERS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const filterKey = filter === 'All' ? 'all' : filter.toLowerCase();
    const [data, err] = await safeAsync(chatService.getConversations(tenantId, filterKey));
    if (err !== null) {
      setError(err);
    } else if (data !== null) {
      setConversations(data.map((c) => ({ ...c, isArchived: Boolean(c.isArchived) })));
    }
    setIsLoading(false);
  }, [tenantId, filter]);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  // Real-time conversation updates
  useEffect(() => {
    const unsubConv = realTimeService.onConversationUpdated(() => {
      void fetchConversations();
    });

    const unsubMsg = realTimeService.onReceiveMessage((msg) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === msg.conversationId) {
            return {
              ...c,
              lastMessagePreview: msg.content,
              lastMessageAt: msg.createdAt,
              unreadCount: c.unreadCount + 1,
            };
          }
          return c;
        })
      );
    });

    return () => {
      unsubConv();
      unsubMsg();
    };
  }, [fetchConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    await safeAsync(chatService.markAsRead(conversationId));
  }, []);

  const markAsUnread = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: Math.max(1, c.unreadCount + 1) } : c))
    );
    await safeAsync(chatService.markAsUnread(conversationId));
  }, []);

  const archiveConversation = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isArchived: true } : c))
    );
    await safeAsync(chatService.archiveConversation(conversationId));
  }, []);

  const unarchiveConversation = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isArchived: false } : c))
    );
    await safeAsync(chatService.unarchiveConversation(conversationId));
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
  }, []);

  // Filtered & Searched Conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // 1. Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (c.title || '').toLowerCase().includes(query);
        const previewMatch = (c.lastMessagePreview || '').toLowerCase().includes(query);
        const participantMatch = c.participants.some((p) =>
          p.fullName.toLowerCase().includes(query) || p.email.toLowerCase().includes(query)
        );
        if (!titleMatch && !previewMatch && !participantMatch) {
          return false;
        }
      }

      // 2. Tab filter
      if (filter === 'Archived') {
        return Boolean(c.isArchived);
      }

      if (c.isArchived) {
        return false;
      }

      if (filter === 'Unread') {
        return c.unreadCount > 0;
      }
      if (filter === 'Direct') {
        return c.type === 'Direct';
      }
      if (filter === 'Group') {
        return c.type === 'Group' || c.type === 'Channel';
      }

      return true;
    });
  }, [conversations, filter, searchQuery]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [conversations]);

  return {
    conversations: filteredConversations,
    allConversations: conversations,
    totalUnreadCount,
    isLoading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    markAsRead,
    markAsUnread,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    refreshConversations: fetchConversations,
  };
}
