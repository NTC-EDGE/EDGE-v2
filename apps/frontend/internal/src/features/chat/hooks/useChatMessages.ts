import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, ChatMessage, safeAsync, realTimeService } from '@edge/api';

export interface ExtendedChatMessage extends ChatMessage {
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

export function useChatMessages(conversationId?: string | null, currentUserName?: string) {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (conversationId === undefined || conversationId === null) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    const [data, err] = await safeAsync(chatService.getMessages(conversationId, 0, 50));
    if (err !== null) {
      setError(err);
    } else if (data !== null) {
      setMessages(data.map((m) => ({ ...m, status: 'delivered' })));
    }
    setIsLoading(false);
  }, [conversationId]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  // Real-time SignalR listeners
  useEffect(() => {
    if (!conversationId) return;

    void realTimeService.joinConversation(conversationId);

    const unsubMsg = realTimeService.onReceiveMessage((incomingMsg) => {
      if (incomingMsg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) {
            return prev.map((m) => (m.id === incomingMsg.id ? { ...incomingMsg, status: 'delivered' } : m));
          }
          return [{ ...incomingMsg, status: 'delivered' }, ...prev];
        });
      }
    });

    const unsubTyping = realTimeService.onUserTyping((convId, userId, userName) => {
      if (convId === conversationId) {
        setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
      }
    });

    const unsubStoppedTyping = realTimeService.onUserStoppedTyping((convId, userId) => {
      if (convId === conversationId) {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    });

    return () => {
      unsubMsg();
      unsubTyping();
      unsubStoppedTyping();
      void realTimeService.leaveConversation(conversationId);
      setTypingUsers({});
    };
  }, [conversationId]);

  const sendTypingNotification = useCallback(() => {
    if (!conversationId || !currentUserName) return;
    void realTimeService.sendTyping(conversationId, currentUserName);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (conversationId) {
        void realTimeService.stopTyping(conversationId);
      }
    }, 3000);
  }, [conversationId, currentUserName]);

  const sendMessage = useCallback(
    async (content: string, replyToMessageId?: string | null) => {
      if (conversationId === undefined || conversationId === null) return false;
      setIsSending(true);

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: ExtendedChatMessage = {
        id: tempId,
        conversationId,
        senderId: 'self',
        senderName: currentUserName || 'You',
        content,
        type: 'Text',
        replyToMessageId: replyToMessageId ?? undefined,
        createdAt: new Date().toISOString(),
        attachments: [],
        status: 'sending',
      };

      setMessages((prev) => [optimisticMsg, ...prev]);

      const [sentMsg, err] = await safeAsync(
        chatService.sendMessage({
          conversationId,
          content,
          replyToMessageId: replyToMessageId ?? undefined,
        })
      );
      setIsSending(false);

      if (err !== null) {
        setError(err);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
        );
        return false;
      }

      if (sentMsg !== null) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...sentMsg, status: 'sent' } : m))
        );
        return true;
      }

      return false;
    },
    [conversationId, currentUserName]
  );

  const retryMessage = useCallback(
    async (failedMsg: ExtendedChatMessage) => {
      if (!conversationId) return false;
      setMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: 'sending' } : m))
      );

      const [sentMsg, err] = await safeAsync(
        chatService.sendMessage({
          conversationId,
          content: failedMsg.content,
          replyToMessageId: failedMsg.replyToMessageId ?? undefined,
        })
      );

      if (err !== null) {
        setMessages((prev) =>
          prev.map((m) => (m.id === failedMsg.id ? { ...m, status: 'failed' } : m))
        );
        return false;
      }

      if (sentMsg !== null) {
        setMessages((prev) =>
          prev.map((m) => (m.id === failedMsg.id ? { ...sentMsg, status: 'sent' } : m))
        );
        return true;
      }

      return false;
    },
    [conversationId]
  );

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!conversationId || !newContent.trim()) return false;
      const trimmed = newContent.trim();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: trimmed, isEdited: true }
            : m
        )
      );
      void safeAsync(chatService.editMessage(conversationId, messageId, trimmed));
      return true;
    },
    [conversationId]
  );

  const unsendMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) return false;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      void safeAsync(chatService.unsendMessage(conversationId, messageId));
      return true;
    },
    [conversationId]
  );

  const reactToMessage = useCallback(
    async (messageId: string, emoji: string, userName?: string) => {
      if (!conversationId) return false;
      const reactor = userName || currentUserName || 'You';

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const currentReactions = m.reactions ? [...m.reactions] : [];
          const existingIdx = currentReactions.findIndex((r) => r.emoji === emoji);

          if (existingIdx >= 0) {
            const existing = currentReactions[existingIdx];
            if (!existing) return m;
            const hasReacted = existing.users.includes(reactor);
            if (hasReacted) {
              const updatedUsers = existing.users.filter((u) => u !== reactor);
              if (updatedUsers.length === 0) {
                currentReactions.splice(existingIdx, 1);
              } else {
                currentReactions[existingIdx] = {
                  ...existing,
                  count: updatedUsers.length,
                  users: updatedUsers,
                };
              }
            } else {
              currentReactions[existingIdx] = {
                ...existing,
                count: existing.count + 1,
                users: [...existing.users, reactor],
              };
            }
          } else {
            currentReactions.push({
              emoji,
              count: 1,
              users: [reactor],
            });
          }

          return { ...m, reactions: currentReactions };
        })
      );

      void safeAsync(chatService.reactToMessage(conversationId, messageId, emoji));
      return true;
    },
    [conversationId, currentUserName]
  );

  return {
    messages,
    isLoading,
    isSending,
    error,
    typingUsers: Object.values(typingUsers),
    sendMessage,
    retryMessage,
    editMessage,
    unsendMessage,
    reactToMessage,
    sendTypingNotification,
    refreshMessages: fetchMessages,
  };
}
