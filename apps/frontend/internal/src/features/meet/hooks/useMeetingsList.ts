import { useState, useEffect, useCallback, useMemo } from 'react';
import { meetService, Meeting, safeAsync, realTimeService } from '@edge/api';
import { useTabQueryParam } from '../../../hooks/useTabQueryParam';

export type MeetingFilter = 'All' | 'Upcoming' | 'Live' | 'History';

const VALID_FILTERS: readonly MeetingFilter[] = ['All', 'Upcoming', 'Live', 'History'];

export function useMeetingsList(tenantId?: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useTabQueryParam<MeetingFilter>('tab', 'All', VALID_FILTERS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notifiedMeetingCodes, setNotifiedMeetingCodes] = useState<Set<string>>(new Set());
  const [scheduledMeetingNotification, setScheduledMeetingNotification] = useState<Meeting | null>(null);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const filterKey = filter === 'All' ? 'all' : filter.toLowerCase();
    const [data, err] = await safeAsync(meetService.getMeetings(tenantId, filterKey));
    if (err !== null) {
      setError(err);
    } else if (data !== null) {
      setMeetings(data.filter((m) => m.status !== 'Cancelled'));
    }
    setIsLoading(false);
  }, [tenantId, filter]);

  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  useEffect(() => {
    const unsubEnded = realTimeService.onMeetingEnded((endedCode) => {
      setMeetings((prev) =>
        prev.map((m) => (m.meetingCode === endedCode ? { ...m, status: 'Cancelled' } : m))
      );
    });
    return () => {
      unsubEnded();
    };
  }, []);

  // Periodic check: When a scheduled meeting reaches its target date and time, notify the user
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date().getTime();
      for (const m of meetings) {
        if (m.status === 'Scheduled' && !notifiedMeetingCodes.has(m.meetingCode)) {
          const startTime = new Date(m.scheduledStartTime).getTime();
          // If within 2 minutes before start time or within 10 minutes after start time
          if (now >= startTime - 60000 && now <= startTime + 600000) {
            setNotifiedMeetingCodes((prev) => new Set([...prev, m.meetingCode]));
            setScheduledMeetingNotification(m);
            break;
          }
        }
      }
    };

    const interval = setInterval(checkSchedule, 15000);
    checkSchedule();

    return () => {
      clearInterval(interval);
    };
  }, [meetings, notifiedMeetingCodes]);

  const cancelOrDeleteMeeting = useCallback(async (meetingCode: string, meetingId: string) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, status: 'Cancelled' } : m))
    );
    await safeAsync(
      meetService.executeAction({
        meetingCode,
        actionType: 'CancelMeeting',
      })
    );
  }, []);

  const filteredMeetings = useMemo(() => {
    const now = new Date();
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

      const isTargetPassed = m.scheduledEndTime
        ? new Date(m.scheduledEndTime) < now
        : new Date(m.scheduledStartTime).getTime() + 86400000 < now.getTime();

      const isDone = m.status === 'Ended' || m.status === 'Cancelled' || (m.status === 'Scheduled' && isTargetPassed);

      // 2. Tab filter
      if (filter === 'Upcoming') {
        return m.status === 'Scheduled' && !isTargetPassed;
      }
      if (filter === 'Live') {
        return m.status === 'Live';
      }
      if (filter === 'History') {
        return isDone;
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
    scheduledMeetingNotification,
    clearScheduledMeetingNotification: () => setScheduledMeetingNotification(null),
    deleteMeeting: cancelOrDeleteMeeting,
    refreshMeetings: fetchMeetings,
  };
}
