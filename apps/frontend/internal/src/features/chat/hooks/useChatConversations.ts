import { useState, useEffect, useCallback } from 'react';
import { chatService, Conversation, safeAsync } from '@edge/api';

export function useChatConversations(tenantId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [data, err] = await safeAsync(chatService.getConversations(tenantId));
    if (err !== null) {
      setError(err);
    } else if (data !== null) {
      setConversations(data);
    }
    setIsLoading(false);
  }, [tenantId]);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refreshConversations: fetchConversations,
  };
}
