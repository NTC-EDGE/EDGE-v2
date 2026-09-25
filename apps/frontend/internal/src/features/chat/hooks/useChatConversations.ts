import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { chatService, Conversation, safeAsync, realTimeService } from '@edge/api';

export type ChatFilter = 'All' | 'Unread' | 'Direct' | 'Group' | 'Archived';

export interface ExtendedConversation extends Conversation {
  isArchived?: boolean;
}

const ARCHIVED_STORAGE_PREFIX = 'edge_chat_archived_ids';

function getStoredArchivedIds(userId?: string): Set<string> {
  if (Platform.OS !== 'web') return new Set();
  try {
    const key = userId !== undefined && userId !== '' ? `${ARCHIVED_STORAGE_PREFIX}_${userId}` : ARCHIVED_STORAGE_PREFIX;
    const raw = window.localStorage.getItem(key);
    if (raw !== null && raw !== '') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveStoredArchivedIds(set: Set<string>, userId?: string): void {
  if (Platform.OS !== 'web') return;
  try {
    const key = userId !== undefined && userId !== '' ? `${ARCHIVED_STORAGE_PREFIX}_${userId}` : ARCHIVED_STORAGE_PREFIX;
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function useChatConversations(tenantId?: string, currentUserId?: string) {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ChatFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [archivedIds, setArchivedIds] = useState<Set<string>>(() => getStoredArchivedIds(currentUserId));

  useEffect(() => {
    if (currentUserId !== undefined && currentUserId !== '') {
      setArchivedIds(getStoredArchivedIds(currentUserId));
    }
  }, [currentUserId]);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [data, err] = await safeAsync(chatService.getConversations(tenantId));
    if (err !== null) {
      setError(err);
    } else if (data !== null) {
      setConversations(data.map((c) => ({ ...c, isArchived: archivedIds.has(c.id) })));
    }
    setIsLoading(false);
  }, [tenantId, archivedIds]);

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

  const archiveConversation = useCallback((conversationId: string) => {
    setArchivedIds((prev) => {
      const next = new Set([...prev, conversationId]);
      saveStoredArchivedIds(next, currentUserId);
      return next;
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isArchived: true } : c))
    );
  }, [currentUserId]);

  const unarchiveConversation = useCallback((conversationId: string) => {
    setArchivedIds((prev) => {
      const next = new Set(prev);
      next.delete(conversationId);
      saveStoredArchivedIds(next, currentUserId);
      return next;
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isArchived: false } : c))
    );
  }, [currentUserId]);

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
