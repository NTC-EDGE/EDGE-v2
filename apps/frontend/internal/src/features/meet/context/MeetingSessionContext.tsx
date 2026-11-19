import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Meeting, meetService, safeAsync } from '@edge/api';
import { useMeetingRoom, InitialJoinPreferences, clearMeetingSessionState } from '../hooks/useMeetingRoom';
import {
  ACTIVE_MEETING_STORAGE_KEY,
  isCustomEventWithCode,
  JOIN_MEETING_EVENT_NAME,
} from '../utils/meetingNavigationHelper';

export type MeetingRoomController = ReturnType<typeof useMeetingRoom>;

export interface MeetingSessionContextValue {
  lobbyMeeting: Meeting | null;
  activeMeeting: Meeting | null;
  room: MeetingRoomController;
  exitReasonToast: string | null;
  clearExitReasonToast: () => void;
  openPreJoinLobby: (meeting: Meeting) => void;
  closePreJoinLobby: () => void;
  enterMeetingNow: (meeting: Meeting, prefs?: InitialJoinPreferences) => void;
  leaveActiveMeeting: () => Promise<void>;
  endActiveMeetingForEveryone: () => Promise<void>;
}

const MeetingSessionContext = createContext<MeetingSessionContextValue | null>(null);

interface MeetingSessionProviderProps {
  currentUserId?: string;
  currentUserName?: string;
  children: React.ReactNode;
}

function syncBrowserUrlCode(code: string | null): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    if ('sessionStorage' in window && window.sessionStorage) {
      if (code) {
        window.sessionStorage.setItem(ACTIVE_MEETING_STORAGE_KEY, code);
      } else {
        window.sessionStorage.removeItem(ACTIVE_MEETING_STORAGE_KEY);
      }
    }
    if (window.location && typeof window.location.href === 'string') {
      const url = new URL(window.location.href);
      if (code) {
        url.searchParams.set('code', code);
      } else {
        url.searchParams.delete('code');
      }
      window.history.replaceState(null, '', url.toString());
    }
  } catch {
    // Ignore URL/storage restriction
  }
}

export const MeetingSessionProvider: React.FC<MeetingSessionProviderProps> = ({
  currentUserId,
  currentUserName,
  children,
}) => {
  const [lobbyMeeting, setLobbyMeeting] = useState<Meeting | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [joinPrefs, setJoinPrefs] = useState<InitialJoinPreferences | undefined>(undefined);
  const [exitReasonToast, setExitReasonToast] = useState<string | null>(null);

  const handleForceExit = useCallback((reason?: string) => {
    setActiveMeeting(null);
    setLobbyMeeting(null);
    syncBrowserUrlCode(null);
    if (reason) {
      setExitReasonToast(reason);
    }
  }, []);

  const room = useMeetingRoom(
    activeMeeting,
    currentUserId,
    currentUserName,
    joinPrefs,
    handleForceExit
  );

  const openPreJoinLobby = useCallback((meeting: Meeting) => {
    setLobbyMeeting(meeting);
    syncBrowserUrlCode(meeting.meetingCode);
  }, []);

  const closePreJoinLobby = useCallback(() => {
    setLobbyMeeting(null);
    if (activeMeeting === null) {
      syncBrowserUrlCode(null);
    }
  }, [activeMeeting]);

  const enterMeetingNow = useCallback((meeting: Meeting, prefs?: InitialJoinPreferences) => {
    setLobbyMeeting(null);
    setJoinPrefs(prefs);
    setActiveMeeting(meeting);
    syncBrowserUrlCode(meeting.meetingCode);
  }, []);

  const leaveActiveMeeting = useCallback(async () => {
    const code = activeMeeting?.meetingCode;
    await room.leaveAndResetRoom();
    setActiveMeeting(null);
    clearMeetingSessionState(code);
    syncBrowserUrlCode(null);
  }, [activeMeeting?.meetingCode, room]);

  const endActiveMeetingForEveryone = useCallback(async () => {
    const code = activeMeeting?.meetingCode;
    await room.endMeetingForEveryone();
    setActiveMeeting(null);
    clearMeetingSessionState(code);
    syncBrowserUrlCode(null);
  }, [activeMeeting?.meetingCode, room]);

  // Listen globally for incoming-call accept or Chat-to-Meet immediate launch events
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    const handleJoinEvent = (event: Event) => {
      if (!isCustomEventWithCode(event)) return;
      const { code, immediate, audioOnly } = event.detail;
      if (!code) return;

      void (async () => {
        const [fetched, err] = await safeAsync(meetService.getMeetingByCode(code));
        if (fetched !== null && err === null && fetched.status !== 'Ended' && fetched.status !== 'Cancelled') {
          if (immediate) {
            enterMeetingNow(fetched, {
              micMuted: false,
              videoMuted: Boolean(audioOnly),
            });
          } else {
            openPreJoinLobby(fetched);
          }
        }
      })();
    };

    window.addEventListener(JOIN_MEETING_EVENT_NAME, handleJoinEvent);
    return () => {
      window.removeEventListener(JOIN_MEETING_EVENT_NAME, handleJoinEvent);
    };
  }, [enterMeetingNow, openPreJoinLobby]);

  // Restore URL ?code=... (opens Pre-Join Lobby) or sessionStorage active meeting on page reload
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (activeMeeting !== null || lobbyMeeting !== null) return;

    let urlCode: string | null = null;
    let sessionCode: string | null = null;
    try {
      if (window.location && typeof window.location.search === 'string') {
        const params = new URLSearchParams(window.location.search);
        urlCode = params.get('code');
      }
      if ('sessionStorage' in window && window.sessionStorage) {
        sessionCode = window.sessionStorage.getItem(ACTIVE_MEETING_STORAGE_KEY);
      }
    } catch {
      // ignore
    }

    const codeToLoad = urlCode || sessionCode;
    if (!codeToLoad) return;

    void (async () => {
      const [fetched, err] = await safeAsync(meetService.getMeetingByCode(codeToLoad));
      if (fetched !== null && err === null && fetched.status !== 'Ended' && fetched.status !== 'Cancelled') {
        if (sessionCode && sessionCode === codeToLoad && !urlCode) {
          enterMeetingNow(fetched);
        } else {
          // Smart Context Entry: Direct URL ?code= opens the Google Meet-style Pre-Join Lobby!
          openPreJoinLobby(fetched);
        }
      } else {
        syncBrowserUrlCode(null);
      }
    })();
  }, []);

  return (
    <MeetingSessionContext.Provider
      value={{
        lobbyMeeting,
        activeMeeting,
        room,
        exitReasonToast,
        clearExitReasonToast: () => setExitReasonToast(null),
        openPreJoinLobby,
        closePreJoinLobby,
        enterMeetingNow,
        leaveActiveMeeting,
        endActiveMeetingForEveryone,
      }}
    >
      {children}
    </MeetingSessionContext.Provider>
  );
};

export function useMeetingSession(): MeetingSessionContextValue | null {
  return useContext(MeetingSessionContext);
}
