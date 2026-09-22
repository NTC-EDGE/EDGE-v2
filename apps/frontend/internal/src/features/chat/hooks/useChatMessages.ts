import { useState, useEffect, useCallback } from 'react';
import { chatService, ChatMessage, safeAsync } from '@edge/api';

export function useChatMessages(conversationId?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      setMessages(data);
    }
    setIsLoading(false);
  }, [conversationId]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, replyToMessageId?: string | null) => {
      if (conversationId === undefined || conversationId === null) return false;
      setIsSending(true);
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
        return false;
      }
      if (sentMsg !== null) {
        setMessages((prev) => [sentMsg, ...prev]);
        return true;
      }
      return false;
    },
    [conversationId]
  );

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    refreshMessages: fetchMessages,
  };
}
