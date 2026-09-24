import { useState, useEffect, useCallback, useMemo } from 'react';
import { meetService, Meeting, safeAsync } from '@edge/api';

export type MeetingFilter = 'All' | 'Upcoming' | 'Live' | 'History';

export function useMeetingsList(tenantId?: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MeetingFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const deleteMeeting = useCallback((meetingId: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
  }, []);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      // 1. Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (m.title || '').toLowerCase().includes(query);
        const hostMatch = (m.hostUserName || '').toLowerCase().includes(query);
        const descMatch = (m.description || '').toLowerCase().includes(query);
        const codeMatch = (m.meetingCode || '').toLowerCase().includes(query);
        if (!titleMatch && !hostMatch && !descMatch && !codeMatch) {
          return false;
        }
      }

      // 2. Tab filter
      if (filter === 'Upcoming') {
        return m.status === 'Scheduled';
      }
      if (filter === 'Live') {
        return m.status === 'Live';
      }
      if (filter === 'History') {
        return m.status === 'Ended' || m.status === 'Cancelled';
      }

      return true;
    });
  }, [meetings, filter, searchQuery]);

  return {
    meetings: filteredMeetings,
    allMeetings: meetings,
    isLoading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    deleteMeeting,
    refreshMeetings: fetchMeetings,
  };
}
