import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  meetService,
  Meeting,
  MeetingParticipant,
  MeetingPoll,
  safeAsync,
  realTimeService,
  ActiveRoomPeerSnapshot,
  RoomJoinedSnapshot,
  WaitingRoomRequestItem,
} from '@edge/api';
import { useWebRtcMeeting } from './useWebRtcMeeting';
import { useMediaDevices } from './useMediaDevices';
import { useLocalMeetingRecorder, RecorderTileSource } from './useLocalMeetingRecorder';
import { isBooleanValue, isValidParticipantRole } from '../schemas/meetSchemas';

export type StageLayoutMode = 'auto' | 'speaker' | 'spotlight';

export interface InMeetingReactionItem {
  emoji: string;
  count: number;
  users: string[];
}

export interface InMeetingChatMessage {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
  isEdited?: boolean;
  isUnsent?: boolean;
  reactions?: InMeetingReactionItem[];
}

export interface InitialJoinPreferences {
  micMuted?: boolean;
  videoMuted?: boolean;
}

export function clearMeetingSessionState(meetingCode?: string) {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      if (meetingCode) {
        window.sessionStorage.removeItem(`edge_meet_${meetingCode}_mic_muted`);
        window.sessionStorage.removeItem(`edge_meet_${meetingCode}_video_muted`);
      }
      window.sessionStorage.removeItem('edge_active_meeting_code');
    } catch {
      // Ignore storage error
    }
  }
}

function readStoredMutedPref(meetingCode: string | undefined, key: string, fallbackVal: boolean): boolean {
  if (typeof window !== 'undefined' && window.sessionStorage && meetingCode) {
    try {
      const saved = window.sessionStorage.getItem(`edge_meet_${meetingCode}_${key}`);
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        if (isBooleanValue(parsed)) {
          return parsed;
        }
      }
    } catch {
      return fallbackVal;
    }
  }
  return fallbackVal;
}

function snapshotPeerToParticipant(peer: ActiveRoomPeerSnapshot): MeetingParticipant {
  return {
    userId: peer.userId || peer.connectionId,
    fullName: peer.fullName && peer.fullName.trim().length > 0 ? peer.fullName : 'Participant',
    email: peer.email ?? '',
    avatarUrl: peer.avatarUrl ?? null,
    role: isValidParticipantRole(peer.role) ? peer.role : 'Member',
    isHandRaised: Boolean(peer.isHandRaised),
    handRaiseQueuePosition: peer.handRaiseQueuePosition ?? null,
    isMutedByHost: Boolean(peer.isMutedByHost),
    isSpotlighted: Boolean(peer.isSpotlighted),
  };
}

export function useMeetingRoom(
  initialMeeting?: Meeting | null,
  currentUserId?: string,
  currentUserName?: string,
  initialPrefs?: InitialJoinPreferences,
  onForceExitRoom?: (reason?: string) => void
) {
  const [meeting, setMeeting] = useState<Meeting | null>(initialMeeting ?? null);
  const meetingCode = meeting?.meetingCode;

  useEffect(() => {
    setMeeting(initialMeeting ?? null);
  }, [initialMeeting]);

  const [isMicMuted, setIsMicMuted] = useState<boolean>(() =>
    initialPrefs?.micMuted !== undefined
      ? initialPrefs.micMuted
      : readStoredMutedPref(meetingCode, 'mic_muted', false)
  );
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(() =>
    initialPrefs?.videoMuted !== undefined
      ? initialPrefs.videoMuted
      : readStoredMutedPref(meetingCode, 'video_muted', false)
  );
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string }[]>([]);
  const [dynamicPeers, setDynamicPeers] = useState<Record<string, MeetingParticipant>>({});
  const [waitingRequests, setWaitingRequests] = useState<WaitingRoomRequestItem[]>([]);
  const [polls, setPolls] = useState<MeetingPoll[]>(initialMeeting?.polls ?? []);
  const [chatMessages, setChatMessages] = useState<InMeetingChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [remoteRecordingHost, setRemoteRecordingHost] = useState<string | null>(null);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [layoutMode, setLayoutMode] = useState<StageLayoutMode>('auto');
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [spotlightedUserId, setSpotlightedUserId] = useState<string | null>(null);
  const [showExistingSessionModal, setShowExistingSessionModal] = useState<boolean>(false);
  const [roomNotice, setRoomNotice] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const isChatOpenRef = useRef<boolean>(isChatOpen);
  isChatOpenRef.current = isChatOpen;

  const onForceExitRef = useRef(onForceExitRoom);
  onForceExitRef.current = onForceExitRoom;

  const pushNotice = useCallback((message: string, variant: 'success' | 'error' = 'success') => {
    setRoomNotice({ message, variant });
  }, []);

  const clearNotice = useCallback(() => {
    setRoomNotice(null);
  }, []);

  // Sync state when entering a new meeting
  useEffect(() => {
    if (!meetingCode) {
      setDynamicPeers({});
      setWaitingRequests([]);
      setPolls([]);
      setChatMessages([]);
      setUnreadChatCount(0);
      setIsChatOpen(false);
      setRemoteRecordingHost(null);
      setCallDurationSeconds(0);
      setPinnedUserId(null);
      setSpotlightedUserId(null);
      setShowExistingSessionModal(false);
      return;
    }

    setPolls(initialMeeting?.polls ?? []);
    const initialSpot = initialMeeting?.participants.find((p) => p.isSpotlighted);
    setSpotlightedUserId(initialSpot ? initialSpot.userId : null);

    if (initialPrefs?.micMuted !== undefined) {
      setIsMicMuted(initialPrefs.micMuted);
    } else {
      setIsMicMuted(readStoredMutedPref(meetingCode, 'mic_muted', false));
    }
    if (initialPrefs?.videoMuted !== undefined) {
      setIsVideoMuted(initialPrefs.videoMuted);
    } else {
      setIsVideoMuted(readStoredMutedPref(meetingCode, 'video_muted', false));
    }
  }, [meetingCode, initialPrefs?.micMuted, initialPrefs?.videoMuted]);

  // Call duration timer
  useEffect(() => {
    if (!meetingCode) return;
    const interval = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [meetingCode]);

  const {
    microphones,
    cameras,
    speakers,
    selectedMicId,
    selectedCameraId,
    selectedSpeakerId,
    setSelectedMicId,
    setSelectedCameraId,
    setSelectedSpeakerId,
    refreshDevices,
  } = useMediaDevices(false, isMicMuted, isVideoMuted);

  const isHost = meeting !== null && currentUserId !== undefined && meeting.hostUserId === currentUserId;
  const selfDbParticipant = meeting?.participants.find((p) => p.userId === currentUserId);
  const isHostOrAdmin =
    isHost ||
    selfDbParticipant?.role === 'Owner' ||
    selfDbParticipant?.role === 'Admin';

  const handleRoomSnapshot = useCallback((snapshot: RoomJoinedSnapshot) => {
    if (Array.isArray(snapshot.activePeers)) {
      const peerMap: Record<string, MeetingParticipant> = {};
      snapshot.activePeers.forEach((p) => {
        const mapped = snapshotPeerToParticipant(p);
        peerMap[mapped.userId] = mapped;
        if (mapped.isSpotlighted) {
          setSpotlightedUserId(mapped.userId);
        }
      });
      setDynamicPeers(peerMap);
    }

    if (Array.isArray(snapshot.waitingRequests)) {
      setWaitingRequests(snapshot.waitingRequests);
    }

    if (Array.isArray(snapshot.chatMessages) && snapshot.chatMessages.length > 0) {
      setChatMessages(
        snapshot.chatMessages.map((m) => ({
          id: m.id,
          senderName: m.senderName,
          content: m.content,
          timestamp: m.timestamp,
          isEdited: m.isEdited,
          isUnsent: m.isUnsent,
          reactions: m.reactions ?? [],
        }))
      );
    }

    if (snapshot.isRecording) {
      setRemoteRecordingHost(snapshot.recordingHostName || 'Host');
    } else {
      setRemoteRecordingHost(null);
    }
  }, []);

  const handlePeerJoined = useCallback((peer: ActiveRoomPeerSnapshot) => {
    const mapped = snapshotPeerToParticipant(peer);
    setDynamicPeers((prev) => ({
      ...prev,
      [mapped.userId]: mapped,
    }));
  }, []);

  const handlePeerLeft = useCallback((leftUserId: string) => {
    setDynamicPeers((prev) => {
      if (!(leftUserId in prev)) return prev;
      const copy = { ...prev };
      delete copy[leftUserId];
      return copy;
    });
    setPinnedUserId((prev) => (prev === leftUserId ? null : prev));
    setSpotlightedUserId((prev) => (prev === leftUserId ? null : prev));
  }, []);

  const {
    localStream,
    screenStream,
    remoteStreams,
    remoteScreenStreams,
    peerMediaStates,
    connectedUserIds,
    speakingUserIds,
    isSpeaking,
    mediaError,
    isScreenSharingActive,
    isLargeRoomEconomyMode,
    toggleScreenShare,
    stopAllMediaTracks,
  } = useWebRtcMeeting({
    meetingCode,
    currentUserId,
    isHostOrAdmin,
    isSpotlightedSelf: Boolean(currentUserId && spotlightedUserId === currentUserId),
    isMicMuted,
    isVideoMuted,
    selectedMicId,
    selectedCameraId,
    onRoomSnapshot: handleRoomSnapshot,
    onPeerJoined: handlePeerJoined,
    onPeerLeft: handlePeerLeft,
  });

  // Merge DB participants + dynamically connected peers so everyone in the call renders properly
  const allKnownParticipants = useMemo(() => {
    const merged = new Map<string, MeetingParticipant>();
    if (meeting) {
      meeting.participants.forEach((p) => {
        merged.set(p.userId, p);
      });
    }
    Object.values(dynamicPeers).forEach((dp) => {
      const existing = merged.get(dp.userId);
      if (existing) {
        merged.set(dp.userId, {
          ...existing,
          fullName: existing.fullName || dp.fullName,
          avatarUrl: existing.avatarUrl ?? dp.avatarUrl,
          isHandRaised: dp.isHandRaised || existing.isHandRaised,
          handRaiseQueuePosition: dp.handRaiseQueuePosition ?? existing.handRaiseQueuePosition,
          isMutedByHost: dp.isMutedByHost || existing.isMutedByHost,
          isSpotlighted: dp.isSpotlighted || existing.isSpotlighted,
        });
      } else {
        merged.set(dp.userId, dp);
      }
    });
    return Array.from(merged.values());
  }, [meeting, dynamicPeers]);

  const selfParticipant: MeetingParticipant = useMemo(() => {
    const found = allKnownParticipants.find((p) => p.userId === currentUserId);
    return found
      ? { ...found, isHandRaised }
      : {
          userId: currentUserId ?? 'self',
          fullName: currentUserName ?? 'You',
          email: '',
          role: isHost ? 'Owner' : 'Member',
          isMutedByHost: false,
          isHandRaised,
          isSpotlighted: Boolean(currentUserId && spotlightedUserId === currentUserId),
        };
  }, [allKnownParticipants, currentUserId, currentUserName, isHost, isHandRaised, spotlightedUserId]);

  const activeConnectedParticipants = useMemo(() => {
    const others = allKnownParticipants.filter((p) => {
      if (p.userId === currentUserId || p.userId === 'self') return false;
      return (
        connectedUserIds.includes(p.userId) ||
        Boolean(remoteStreams[p.userId]) ||
        Boolean(dynamicPeers[p.userId])
      );
    });
    return [selfParticipant, ...others];
  }, [allKnownParticipants, selfParticipant, currentUserId, connectedUserIds, remoteStreams, dynamicPeers]);

  // Active Screen Share (either local presenter or remote presenter)
  const activeScreenShare = useMemo(() => {
    if (screenStream !== null && isScreenSharingActive) {
      return {
        stream: screenStream,
        presenterUserId: currentUserId ?? 'self',
        presenterName: currentUserName ?? 'You',
        isSelf: true,
      };
    }

    for (const p of activeConnectedParticipants) {
      if (p.userId === currentUserId || p.userId === 'self') continue;
      const pMedia = peerMediaStates[p.userId];
      const rScreen = remoteScreenStreams[p.userId];
      if ((pMedia?.isScreenSharing && rScreen) || rScreen) {
        return {
          stream: rScreen,
          presenterUserId: p.userId,
          presenterName: p.fullName,
          isSelf: false,
        };
      }
    }
    return null;
  }, [
    screenStream,
    isScreenSharingActive,
    currentUserId,
    currentUserName,
    activeConnectedParticipants,
    peerMediaStates,
    remoteScreenStreams,
  ]);

  const recorderTiles: RecorderTileSource[] = useMemo(
    () =>
      activeConnectedParticipants.map((p) => {
        const isSelf = p.userId === currentUserId || p.userId === 'self';
        return {
          userId: p.userId,
          fullName: p.fullName,
          stream: isSelf ? localStream : (remoteStreams[p.userId] ?? null),
          isVideoMuted: isSelf ? isVideoMuted : Boolean(peerMediaStates[p.userId]?.isVideoMuted),
        };
      }),
    [activeConnectedParticipants, currentUserId, localStream, remoteStreams, isVideoMuted, peerMediaStates]
  );

  const {
    isRecordingSupported,
    isLocalRecording,
    formattedRecordingTime,
    stopRecording: stopLocalRecording,
    toggleLocalRecording,
  } = useLocalMeetingRecorder({
    meetingCode,
    meetingTitle: meeting?.title,
    localStream,
    remoteStreams,
    activeScreenStream: activeScreenShare?.stream ?? null,
    screenPresenterName: activeScreenShare?.presenterName,
    participants: recorderTiles,
    onRecordingStateBroadcast: (active) => {
      if (meetingCode) {
        void realTimeService.updateRecordingState(meetingCode, active);
      }
    },
    onRecordingSaved: (filename) => {
      pushNotice(`Recording saved locally: ${filename}`, 'success');
    },
  });

  // Real-time SignalR Room Subscriptions (Join, Reactions, Moderation, Polls, Chat, Waiting Queue)
  useEffect(() => {
    if (!meetingCode) return;

    const unsubReaction = realTimeService.onReactionReceived((_userId, emoji) => {
      const reactionId = `react_${Date.now()}_${Math.random()}`;
      setFloatingEmojis((prev) => [...prev, { id: reactionId, emoji }]);
    });

    const unsubHost = realTimeService.onHostChanged((newHostUserId, newHostUserName) => {
      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              hostUserId: newHostUserId,
              hostUserName: newHostUserName,
            }
          : prev
      );
      pushNotice(`${newHostUserName} is now the meeting host.`, 'success');
    });

    const unsubHandRaised = realTimeService.onUserRaisedHand((uId, uName, pos) => {
      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.map((p) =>
                p.userId === uId ? { ...p, isHandRaised: true, handRaiseQueuePosition: pos } : p
              ),
            }
          : prev
      );
      setDynamicPeers((prev) => {
        const existing = prev[uId];
        if (!existing) return prev;
        return { ...prev, [uId]: { ...existing, isHandRaised: true, handRaiseQueuePosition: pos } };
      });
      if (uId !== currentUserId) {
        pushNotice(`${uName} raised their hand (#${pos}).`, 'success');
      }
    });

    const unsubHandLowered = realTimeService.onUserLoweredHand((uId) => {
      if (uId === currentUserId) {
        setIsHandRaised(false);
      }
      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.map((p) =>
                p.userId === uId ? { ...p, isHandRaised: false, handRaiseQueuePosition: null } : p
              ),
            }
          : prev
      );
      setDynamicPeers((prev) => {
        const existing = prev[uId];
        if (!existing) return prev;
        return { ...prev, [uId]: { ...existing, isHandRaised: false, handRaiseQueuePosition: null } };
      });
    });

    const unsubMuted = realTimeService.onParticipantMuted((targetUserId, mutedByUserId) => {
      const affectsSelf =
        currentUserId !== undefined &&
        mutedByUserId !== currentUserId &&
        (targetUserId === null || targetUserId === currentUserId);

      if (affectsSelf) {
        setIsMicMuted(true);
        pushNotice('Your microphone was muted by the host.', 'error');
      }

      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.map((p) =>
                targetUserId === null
                  ? p.userId !== mutedByUserId
                    ? { ...p, isMutedByHost: true }
                    : p
                  : p.userId === targetUserId
                    ? { ...p, isMutedByHost: true }
                    : p
              ),
            }
          : prev
      );
    });

    const unsubSpotlight = realTimeService.onSpeakerSpotlighted((targetUserId) => {
      setSpotlightedUserId(targetUserId);
      setLayoutMode(targetUserId ? 'spotlight' : 'auto');
    });

    const unsubKicked = realTimeService.onParticipantKicked((targetUserId, reason) => {
      if (currentUserId !== undefined && targetUserId === currentUserId) {
        stopLocalRecording();
        stopAllMediaTracks();
        clearMeetingSessionState(meetingCode);
        onForceExitRef.current?.(reason || 'You were removed from the meeting.');
      }
    });

    const unsubRecState = realTimeService.onRecordingStateChanged((active, hostName) => {
      setRemoteRecordingHost(active ? hostName : null);
      if (!isLocalRecording) {
        pushNotice(
          active
            ? `${hostName} started recording this meeting.`
            : `${hostName} stopped recording.`,
          'success'
        );
      }
    });

    const unsubPollCreated = realTimeService.onPollCreated((poll) => {
      setPolls((prev) => (prev.some((p) => p.id === poll.id) ? prev : [poll, ...prev]));
      pushNotice(`New live poll: "${poll.question}"`, 'success');
    });

    const unsubPollUpdated = realTimeService.onPollVoteUpdated((pollId, updatedPoll) => {
      setPolls((prev) => prev.map((p) => (p.id === pollId ? updatedPoll : p)));
    });

    const unsubPollClosed = realTimeService.onPollClosed((pollId) => {
      setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, isClosed: true } : p)));
    });

    const unsubJoinReq = realTimeService.onJoinRequested((req) => {
      if (req.meetingCode !== meetingCode) return;
      setWaitingRequests((prev) =>
        prev.some((r) => r.connectionId === req.connectionId) ? prev : [...prev, req]
      );
      pushNotice(`${req.userName} is waiting in the lobby.`, 'success');
    });

    const unsubWaitingQueue = realTimeService.onWaitingQueueUpdated((list) => {
      if (Array.isArray(list)) {
        setWaitingRequests(list);
      }
    });

    const unsubChat = realTimeService.onReceiveMeetingChatMessage((msg) => {
      setChatMessages((prev) => {
        if (msg.id && prev.some((m) => m.id === msg.id)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: msg.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            senderName: msg.senderName,
            content: msg.content,
            timestamp: msg.timestamp,
            reactions: [],
          },
        ];
      });
      if (!isChatOpenRef.current && msg.senderName !== currentUserName) {
        setUnreadChatCount((c) => c + 1);
      }
    });

    const unsubChatEdited = realTimeService.onReceiveMeetingChatEdited(({ messageId, content }) => {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content, isEdited: true } : m))
      );
    });

    const unsubChatUnsent = realTimeService.onReceiveMeetingChatUnsent(({ messageId }) => {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: 'This message was unsent', isUnsent: true } : m
        )
      );
    });

    const unsubChatReact = realTimeService.onReceiveMeetingChatReaction(({ messageId, emoji, userName }) => {
      setChatMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = msg.reactions ? [...msg.reactions] : [];
          const existingIdx = reactions.findIndex((r) => r.emoji === emoji);
          if (existingIdx >= 0) {
            const existing = reactions[existingIdx];
            if (existing) {
              const hasUser = existing.users.includes(userName);
              const nextUsers = hasUser
                ? existing.users.filter((u) => u !== userName)
                : [...existing.users, userName];
              if (nextUsers.length === 0) {
                reactions.splice(existingIdx, 1);
              } else {
                reactions[existingIdx] = { emoji, count: nextUsers.length, users: nextUsers };
              }
            }
          } else {
            reactions.push({ emoji, count: 1, users: [userName] });
          }
          return { ...msg, reactions };
        })
      );
    });

    const unsubDeclined = realTimeService.onCallDeclined((code, _uId, uName) => {
      if (code === meetingCode) {
        pushNotice(`${uName} declined the call.`, 'error');
      }
    });

    const unsubEnded = realTimeService.onMeetingEnded((code) => {
      if (code === meetingCode) {
        stopLocalRecording();
        stopAllMediaTracks();
        clearMeetingSessionState(meetingCode);
        onForceExitRef.current?.('The host has ended this meeting.');
      }
    });

    const unsubExistingSession = realTimeService.onExistingSessionDetected((code) => {
      if (code === meetingCode) {
        setShowExistingSessionModal(true);
      }
    });

    const unsubSwitched = realTimeService.onSessionSwitchedToAnotherDevice((code) => {
      if (code === meetingCode) {
        stopLocalRecording();
        stopAllMediaTracks();
        clearMeetingSessionState(meetingCode);
        onForceExitRef.current?.('Your session was switched to another device.');
      }
    });

    void realTimeService.joinMeeting(meetingCode).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Could not join meeting room.';
      pushNotice(msg, 'error');
    });

    return () => {
      unsubReaction();
      unsubHost();
      unsubHandRaised();
      unsubHandLowered();
      unsubMuted();
      unsubSpotlight();
      unsubKicked();
      unsubRecState();
      unsubPollCreated();
      unsubPollUpdated();
      unsubPollClosed();
      unsubJoinReq();
      unsubWaitingQueue();
      unsubChat();
      unsubChatEdited();
      unsubChatUnsent();
      unsubChatReact();
      unsubDeclined();
      unsubEnded();
      unsubExistingSession();
      unsubSwitched();
      void realTimeService.leaveMeeting(meetingCode);
    };
  }, [
    meetingCode,
    currentUserId,
    currentUserName,
    isLocalRecording,
    pushNotice,
    stopLocalRecording,
    stopAllMediaTracks,
  ]);

  const toggleMic = useCallback(() => {
    setIsMicMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.sessionStorage && meetingCode) {
        try {
          window.sessionStorage.setItem(`edge_meet_${meetingCode}_mic_muted`, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, [meetingCode]);

  const toggleVideo = useCallback(() => {
    setIsVideoMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.sessionStorage && meetingCode) {
        try {
          window.sessionStorage.setItem(`edge_meet_${meetingCode}_video_muted`, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, [meetingCode]);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadChatCount(0);
      }
      return next;
    });
  }, []);

  const sendChatMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !meetingCode) return;

      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sender = currentUserName || 'You';

      setChatMessages((prev) => [
        ...prev,
        { id, senderName: sender, content: trimmed, timestamp, reactions: [] },
      ]);
      void realTimeService.broadcastMeetingChat(meetingCode, {
        id,
        senderName: sender,
        content: trimmed,
        timestamp,
      });
    },
    [meetingCode, currentUserName]
  );

  const editChatMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (!meetingCode) return;
      setChatMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: newContent, isEdited: true } : m))
      );
      void realTimeService.broadcastMeetingChatEdited(meetingCode, { messageId, content: newContent });
    },
    [meetingCode]
  );

  const unsendChatMessage = useCallback(
    (messageId: string) => {
      if (!meetingCode) return;
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: 'This message was unsent', isUnsent: true } : m
        )
      );
      void realTimeService.broadcastMeetingChatUnsent(meetingCode, { messageId });
    },
    [meetingCode]
  );

  const reactToChatMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (!meetingCode) return;
      const actor = currentUserName || 'You';
      setChatMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = msg.reactions ? [...msg.reactions] : [];
          const existingIdx = reactions.findIndex((r) => r.emoji === emoji);
          if (existingIdx >= 0) {
            const existing = reactions[existingIdx];
            if (existing) {
              const hasUser = existing.users.includes(actor);
              const nextUsers = hasUser
                ? existing.users.filter((u) => u !== actor)
                : [...existing.users, actor];
              if (nextUsers.length === 0) {
                reactions.splice(existingIdx, 1);
              } else {
                reactions[existingIdx] = { emoji, count: nextUsers.length, users: nextUsers };
              }
            }
          } else {
            reactions.push({ emoji, count: 1, users: [actor] });
          }
          return { ...msg, reactions };
        })
      );
      void realTimeService.broadcastMeetingChatReaction(meetingCode, { messageId, emoji, userName: actor });
    },
    [meetingCode, currentUserName]
  );

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

  const dismissReaction = useCallback((reactionId: string) => {
    setFloatingEmojis((prev) => prev.filter((r) => r.id !== reactionId));
  }, []);

  // Host Moderation Actions
  const muteParticipant = useCallback(
    async (targetUserId: string) => {
      if (!meeting) return;
      const [, err] = await safeAsync(
        meetService.executeAction({
          meetingCode: meeting.meetingCode,
          actionType: 'MuteParticipant',
          targetUserId,
        })
      );
      if (err !== null) pushNotice(err, 'error');
      else pushNotice('Participant muted.', 'success');
    },
    [meeting, pushNotice]
  );

  const muteAllParticipants = useCallback(async () => {
    if (!meeting) return;
    const [, err] = await safeAsync(
      meetService.executeAction({
        meetingCode: meeting.meetingCode,
        actionType: 'MuteParticipant',
        targetUserId: null,
      })
    );
    if (err !== null) pushNotice(err, 'error');
    else pushNotice('Muted all participants.', 'success');
  }, [meeting, pushNotice]);

  const spotlightParticipant = useCallback(
    async (targetUserId: string | null) => {
      if (!meeting) return;
      const [, err] = await safeAsync(
        meetService.executeAction({
          meetingCode: meeting.meetingCode,
          actionType: 'SpotlightParticipant',
          targetUserId,
        })
      );
      if (err !== null) pushNotice(err, 'error');
    },
    [meeting, pushNotice]
  );

  const kickParticipant = useCallback(
    async (targetUserId: string) => {
      if (!meeting) return;
      const [, err] = await safeAsync(
        meetService.executeAction({
          meetingCode: meeting.meetingCode,
          actionType: 'KickParticipant',
          targetUserId,
        })
      );
      if (err !== null) pushNotice(err, 'error');
      else pushNotice('Participant removed from call.', 'success');
    },
    [meeting, pushNotice]
  );

  const admitWaitingParticipant = useCallback(
    async (req: WaitingRoomRequestItem) => {
      if (!meeting) return;
      try {
        const sanitizedId = req.userId && req.userId.length > 0 ? req.userId : '00000000-0000-0000-0000-000000000000';
        await realTimeService.admitParticipant(meeting.meetingCode, req.connectionId, sanitizedId);
        setWaitingRequests((prev) => prev.filter((r) => r.connectionId !== req.connectionId));
        pushNotice(`Admitted ${req.userName}.`, 'success');
      } catch {
        pushNotice(`Failed to admit ${req.userName}.`, 'error');
      }
    },
    [meeting, pushNotice]
  );

  const admitAllWaitingParticipants = useCallback(async () => {
    if (!meeting || waitingRequests.length === 0) return;
    for (const req of [...waitingRequests]) {
      const sanitizedId = req.userId && req.userId.length > 0 ? req.userId : '00000000-0000-0000-0000-000000000000';
      await safeAsync(realTimeService.admitParticipant(meeting.meetingCode, req.connectionId, sanitizedId));
    }
    setWaitingRequests([]);
    pushNotice('Admitted all waiting participants.', 'success');
  }, [meeting, waitingRequests, pushNotice]);

  const denyWaitingParticipant = useCallback(
    async (req: WaitingRoomRequestItem) => {
      if (!meeting) return;
      try {
        const sanitizedId = req.userId && req.userId.length > 0 ? req.userId : '00000000-0000-0000-0000-000000000000';
        await realTimeService.denyParticipant(meeting.meetingCode, req.connectionId, sanitizedId);
        setWaitingRequests((prev) => prev.filter((r) => r.connectionId !== req.connectionId));
        pushNotice(`Declined ${req.userName}.`, 'error');
      } catch {
        pushNotice(`Failed to decline ${req.userName}.`, 'error');
      }
    },
    [meeting, pushNotice]
  );

  // Live Poll Actions
  const createPoll = useCallback(
    async (question: string, options: string[], isAnonymous: boolean): Promise<boolean> => {
      if (!meeting) return false;
      const [created, err] = await safeAsync(
        meetService.createPoll({
          meetingCode: meeting.meetingCode,
          question,
          options,
          isAnonymous,
        })
      );
      if (err !== null) {
        pushNotice(err, 'error');
        return false;
      }
      if (created !== null) {
        setPolls((prev) => (prev.some((p) => p.id === created.id) ? prev : [created, ...prev]));
        pushNotice('Live poll launched!', 'success');
      }
      return true;
    },
    [meeting, pushNotice]
  );

  const votePoll = useCallback(
    async (pollId: string, selectedOptionIndex: number) => {
      if (!meeting) return;
      const [updated, err] = await safeAsync(
        meetService.votePoll({
          meetingCode: meeting.meetingCode,
          pollId,
          selectedOptionIndex,
        })
      );
      if (err !== null) {
        pushNotice(err, 'error');
        return;
      }
      if (updated !== null) {
        setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
      }
    },
    [meeting, pushNotice]
  );

  const closePoll = useCallback(
    async (pollId: string) => {
      if (!meeting) return;
      const [closed, err] = await safeAsync(meetService.closePoll(meeting.meetingCode, pollId));
      if (err !== null) {
        pushNotice(err, 'error');
        return;
      }
      if (closed !== null) {
        setPolls((prev) => prev.map((p) => (p.id === pollId ? closed : p)));
        pushNotice('Poll closed.', 'success');
      }
    },
    [meeting, pushNotice]
  );

  const leaveAndResetRoom = useCallback(async () => {
    if (isLocalRecording) {
      stopLocalRecording();
    }
    if (meeting && isHost) {
      await safeAsync(
        meetService.executeAction({
          meetingCode: meeting.meetingCode,
          actionType: 'LeaveMeeting',
        })
      );
    }
    stopAllMediaTracks();
    clearMeetingSessionState(meetingCode);
  }, [isLocalRecording, stopLocalRecording, meeting, isHost, stopAllMediaTracks, meetingCode]);

  const endMeetingForEveryone = useCallback(async () => {
    if (isLocalRecording) {
      stopLocalRecording();
    }
    if (meeting) {
      await safeAsync(
        meetService.executeAction({
          meetingCode: meeting.meetingCode,
          actionType: 'EndMeeting',
        })
      );
    }
    stopAllMediaTracks();
    clearMeetingSessionState(meetingCode);
  }, [isLocalRecording, stopLocalRecording, meeting, stopAllMediaTracks, meetingCode]);

  const formattedCallDuration = useMemo(() => {
    const hrs = Math.floor(callDurationSeconds / 3600);
    const mins = Math.floor((callDurationSeconds % 3600) / 60);
    const secs = callDurationSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [callDurationSeconds]);

  const isAnyRecordingActive = isLocalRecording || remoteRecordingHost !== null;

  return {
    meeting,
    setMeeting,
    isHost,
    isHostOrAdmin,
    isMicMuted,
    isVideoMuted,
    isHandRaised,
    isScreenSharing: isScreenSharingActive,
    activeScreenShare,
    isRecordingSupported,
    isRecording: isLocalRecording,
    isAnyRecordingActive,
    remoteRecordingHost,
    formattedRecordingTime,
    toggleRecording: toggleLocalRecording,
    callDurationSeconds,
    formattedCallDuration,
    floatingEmojis,
    dismissReaction,
    localStream,
    screenStream,
    remoteStreams,
    remoteScreenStreams,
    peerMediaStates,
    connectedUserIds,
    speakingUserIds,
    isSpeaking,
    isLargeRoomEconomyMode,
    mediaError,
    activeConnectedParticipants,
    allKnownParticipants,
    waitingRequests,
    polls,
    chatMessages,
    unreadChatCount,
    isChatOpen,
    setIsChatOpen,
    toggleChat,
    sendChatMessage,
    editChatMessage,
    unsendChatMessage,
    reactToChatMessage,
    layoutMode,
    setLayoutMode,
    pinnedUserId,
    setPinnedUserId,
    spotlightedUserId,
    microphones,
    cameras,
    speakers,
    selectedMicId,
    selectedCameraId,
    selectedSpeakerId,
    setSelectedMicId,
    setSelectedCameraId,
    setSelectedSpeakerId,
    refreshDevices,
    showExistingSessionModal,
    setShowExistingSessionModal,
    roomNotice,
    pushNotice,
    clearNotice,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
    triggerReaction,
    muteParticipant,
    muteAllParticipants,
    spotlightParticipant,
    kickParticipant,
    admitWaitingParticipant,
    admitAllWaitingParticipants,
    denyWaitingParticipant,
    createPoll,
    votePoll,
    closePoll,
    leaveAndResetRoom,
    endMeetingForEveryone,
    stopAllMediaTracks,
  };
}
