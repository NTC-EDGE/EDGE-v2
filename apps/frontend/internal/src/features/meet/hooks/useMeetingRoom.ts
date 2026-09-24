import { useState, useCallback, useEffect, useRef } from 'react';
import { meetService, Meeting, safeAsync, realTimeService } from '@edge/api';
import { useWebRtcMeeting } from './useWebRtcMeeting';

export type RecordingAccessPermission = 'HostOnly' | 'AllParticipants' | 'Selected';

export function clearMeetingSessionState(meetingCode?: string) {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    if (meetingCode) {
      window.sessionStorage.removeItem(`edge_meet_${meetingCode}_mic_muted`);
      window.sessionStorage.removeItem(`edge_meet_${meetingCode}_video_muted`);
    }
    window.sessionStorage.removeItem('edge_active_meeting_code');
  }
}

export function useMeetingRoom(initialMeeting?: Meeting | null, currentUserId?: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(initialMeeting ?? null);
  const meetingCode = meeting?.meetingCode;

  const getInitialMutedState = (key: string, defaultVal: boolean): boolean => {
    if (typeof window !== 'undefined' && window.sessionStorage && meetingCode) {
      const saved = window.sessionStorage.getItem(`edge_meet_${meetingCode}_${key}`);
      if (saved !== null) {
        try {
          return JSON.parse(saved) as boolean;
        } catch {
          return defaultVal;
        }
      }
    }
    return defaultVal;
  };

  const [isMicMuted, setIsMicMuted] = useState<boolean>(() => getInitialMutedState('mic_muted', false));
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(() => getInitialMutedState('video_muted', false));
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordingAccess, setRecordingAccess] = useState<RecordingAccessPermission>('HostOnly');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string }[]>([]);

  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync state if meeting code updates
  useEffect(() => {
    if (meetingCode) {
      setIsMicMuted(getInitialMutedState('mic_muted', false));
      setIsVideoMuted(getInitialMutedState('video_muted', false));
    }
  }, [meetingCode]);

  // Real-time room connection and reaction listener
  useEffect(() => {
    if (!meetingCode) return;

    void realTimeService.joinMeeting(meetingCode);

    const unsubReaction = realTimeService.onReactionReceived((_userId, emoji) => {
      const reactionId = `${Date.now()}_${Math.random()}`;
      setFloatingEmojis((prev) => [...prev, { id: reactionId, emoji }]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((r) => r.id !== reactionId));
      }, 3000);
    });

    return () => {
      unsubReaction();
      void realTimeService.leaveMeeting(meetingCode);
    };
  }, [meetingCode]);

  // Real-time WebRTC Mesh & Hardware Capture (Camera, Mic, Speakers)
  const {
    localStream,
    screenStream,
    remoteStreams,
    isSpeaking,
    mediaError,
    isScreenSharingActive,
    toggleScreenShare,
    stopAllMediaTracks,
  } = useWebRtcMeeting({
    meetingCode,
    currentUserId,
    isMicMuted,
    isVideoMuted,
  });

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingSeconds(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const toggleMic = useCallback(() => {
    setIsMicMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.sessionStorage && meetingCode) {
        window.sessionStorage.setItem(`edge_meet_${meetingCode}_mic_muted`, JSON.stringify(next));
      }
      return next;
    });
  }, [meetingCode]);

  const toggleVideo = useCallback(() => {
    setIsVideoMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.sessionStorage && meetingCode) {
        window.sessionStorage.setItem(`edge_meet_${meetingCode}_video_muted`, JSON.stringify(next));
      }
      return next;
    });
  }, [meetingCode]);

  const leaveAndResetRoom = useCallback(() => {
    stopAllMediaTracks();
    clearMeetingSessionState(meetingCode);
  }, [meetingCode, stopAllMediaTracks]);

  const toggleRecording = useCallback(() => {
    setIsRecording((prev) => !prev);
  }, []);

  const toggleHandRaise = useCallback(async () => {
    if (meeting === null) return;
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);

    await safeAsync(
      meetService.executeAction({
        meetingCode: meeting.meetingCode,
        actionType: nextState ? 'RaiseHand' : 'LowerHand',
      })
    );
  }, [meeting, isHandRaised]);

  const triggerReaction = useCallback(
    async (emoji: string) => {
      if (meeting === null) return;
      const reactionId = `${Date.now()}_${Math.random()}`;
      setFloatingEmojis((prev) => [...prev, { id: reactionId, emoji }]);

      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((r) => r.id !== reactionId));
      }, 3000);

      void realTimeService.sendMeetingReaction(meeting.meetingCode, emoji);

      await safeAsync(
        meetService.executeAction({
          meetingCode: meeting.meetingCode,
          actionType: 'EmojiReaction',
          actionPayload: emoji,
        })
      );
    },
    [meeting]
  );

  const formattedRecordingTime = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(
    recordingSeconds % 60
  ).padStart(2, '0')}`;

  const isHost = meeting !== null && currentUserId !== undefined && meeting.hostUserId === currentUserId;

  return {
    meeting,
    setMeeting,
    isHost,
    isMicMuted,
    isVideoMuted,
    isHandRaised,
    isScreenSharing: isScreenSharingActive,
    isRecording,
    recordingSeconds,
    formattedRecordingTime,
    recordingAccess,
    setRecordingAccess,
    floatingEmojis,
    localStream,
    screenStream,
    remoteStreams,
    isSpeaking,
    mediaError,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    toggleHandRaise,
    triggerReaction,
    leaveAndResetRoom,
    stopAllMediaTracks,
  };
}
