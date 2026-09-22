import { useState, useEffect, useCallback } from 'react';
import { meetService, Meeting, safeAsync } from '@edge/api';

export function useMeetingsList(tenantId?: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [data, err] = await safeAsync(meetService.getMeetings(tenantId));
    if (err !== null) {
      setError(err);
    } else if (data !== null) {
      setMeetings(data);
    }
    setIsLoading(false);
  }, [tenantId]);

  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  return {
    meetings,
    isLoading,
    error,
    refreshMeetings: fetchMeetings,
  };
}
