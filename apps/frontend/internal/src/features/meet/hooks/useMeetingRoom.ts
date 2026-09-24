import { useState, useCallback, useEffect, useRef } from 'react';
import { meetService, Meeting, safeAsync, realTimeService } from '@edge/api';

export type RecordingAccessPermission = 'HostOnly' | 'AllParticipants' | 'Selected';

export function useMeetingRoom(initialMeeting?: Meeting | null, currentUserId?: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(initialMeeting ?? null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordingAccess, setRecordingAccess] = useState<RecordingAccessPermission>('HostOnly');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string }[]>([]);

  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const meetingCode = meeting?.meetingCode;

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
    setIsMicMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoMuted((prev) => !prev);
  }, []);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing((prev) => !prev);
  }, []);

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
    isScreenSharing,
    isRecording,
    recordingSeconds,
    formattedRecordingTime,
    recordingAccess,
    setRecordingAccess,
    floatingEmojis,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    toggleHandRaise,
    triggerReaction,
  };
}
