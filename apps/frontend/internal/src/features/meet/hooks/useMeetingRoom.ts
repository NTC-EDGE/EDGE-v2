import { useState, useCallback } from 'react';
import { meetService, Meeting, safeAsync } from '@edge/api';

export function useMeetingRoom(initialMeeting?: Meeting | null) {
  const [meeting, setMeeting] = useState<Meeting | null>(initialMeeting ?? null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string }[]>([]);

  const toggleMic = useCallback(() => {
    setIsMicMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoMuted((prev) => !prev);
  }, []);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing((prev) => !prev);
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

  return {
    meeting,
    setMeeting,
    isMicMuted,
    isVideoMuted,
    isHandRaised,
    isScreenSharing,
    floatingEmojis,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
    triggerReaction,
  };
}
