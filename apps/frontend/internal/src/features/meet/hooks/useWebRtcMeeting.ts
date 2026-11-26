import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  realTimeService,
  meetService,
  safeAsync,
  ActiveRoomPeerSnapshot,
  ParticipantMediaStatePayload,
  RoomJoinedSnapshot,
} from '@edge/api';
import { createBrowserAudioContext, isScreenShareSupported, isWebMediaSupported } from '../utils/webDomHelpers';

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  { urls: 'stun:stun.cloudflare.com:3478' },
];

function isIceCandidateInit(obj: unknown): obj is RTCIceCandidateInit {
  return typeof obj === 'object' && obj !== null && 'candidate' in obj;
}

export interface PeerLiveMediaState {
  connectionId: string;
  userId: string;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  screenStreamId: string | null;
}

export interface UseWebRtcMeetingOptions {
  meetingCode?: string;
  currentUserId?: string;
  isHostOrAdmin?: boolean;
  isSpotlightedSelf?: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  selectedMicId?: string;
  selectedCameraId?: string;
  onRoomSnapshot?: (snapshot: RoomJoinedSnapshot) => void;
  onPeerJoined?: (peer: ActiveRoomPeerSnapshot) => void;
  onPeerLeft?: (userId: string) => void;
}

export function useWebRtcMeeting({
  meetingCode,
  currentUserId,
  isHostOrAdmin = false,
  isSpotlightedSelf = false,
  isMicMuted,
  isVideoMuted,
  selectedMicId,
  selectedCameraId,
  onRoomSnapshot,
  onPeerJoined,
  onPeerLeft,
}: UseWebRtcMeetingOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<Record<string, MediaStream>>({});
  const [peerMediaStates, setPeerMediaStates] = useState<Record<string, PeerLiveMediaState>>({});
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const [speakingUserIds, setSpeakingUserIds] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isScreenSharingActive, setIsScreenSharingActive] = useState<boolean>(false);
  const [isLargeRoomEconomyMode, setIsLargeRoomEconomyMode] = useState<boolean>(false);

  const iceServersRef = useRef<RTCIceServer[]>(DEFAULT_ICE_SERVERS);
  const selfConnectionIdRef = useRef<string>('');
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const connectionToUserRef = useRef<Map<string, string>>(new Map());
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const makingOfferRef = useRef<Map<string, boolean>>(new Map());
  const ignoreOfferRef = useRef<Map<string, boolean>>(new Map());
  const isSettingRemoteAnswerPendingRef = useRef<Map<string, boolean>>(new Map());
  const pendingNegotiationRef = useRef<Map<string, boolean>>(new Map());
  const disconnectTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraSenderMapRef = useRef<Map<string, RTCRtpSender>>(new Map());
  const audioSenderMapRef = useRef<Map<string, RTCRtpSender>>(new Map());
  const screenSendersMapRef = useRef<Map<string, RTCRtpSender[]>>(new Map());
  const peerReceivedStreamsRef = useRef<Map<string, Map<string, MediaStream>>>(new Map());
  const peerMediaStatesRef = useRef<Record<string, PeerLiveMediaState>>({});

  const isMicMutedRef = useRef<boolean>(isMicMuted);
  const isVideoMutedRef = useRef<boolean>(isVideoMuted);
  const isScreenSharingRef = useRef<boolean>(false);
  const onRoomSnapshotRef = useRef(onRoomSnapshot);
  const onPeerJoinedRef = useRef(onPeerJoined);
  const onPeerLeftRef = useRef(onPeerLeft);

  onRoomSnapshotRef.current = onRoomSnapshot;
  onPeerJoinedRef.current = onPeerJoined;
  onPeerLeftRef.current = onPeerLeft;

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    isVideoMutedRef.current = isVideoMuted;
  }, [isVideoMuted]);

  useEffect(() => {
    isScreenSharingRef.current = isScreenSharingActive;
  }, [isScreenSharingActive]);

  useEffect(() => {
    peerMediaStatesRef.current = peerMediaStates;
  }, [peerMediaStates]);

  // Fetch backend-configured STUN/TURN ICE servers
  useEffect(() => {
    if (!meetingCode || !isWebMediaSupported()) return;
    let active = true;
    void (async () => {
      const [servers] = await safeAsync(meetService.getIceServers());
      if (active && servers !== null && servers.length > 0) {
        iceServersRef.current = servers;
      }
    })();
    return () => {
      active = false;
    };
  }, [meetingCode]);

  // Reconcile remote camera streams vs remote screen-share streams for all peers
  const rebuildRemoteStreamMaps = useCallback(() => {
    const nextCameraMap: Record<string, MediaStream> = {};
    const nextScreenMap: Record<string, MediaStream> = {};
    const mediaStates = peerMediaStatesRef.current;

    peerReceivedStreamsRef.current.forEach((streamsMap, connId) => {
      const userId = connectionToUserRef.current.get(connId);
      const stateKey = userId && mediaStates[userId] ? userId : connId;
      const peerState = mediaStates[stateKey];
      const expectedScreenStreamId =
        peerState && peerState.isScreenSharing && peerState.screenStreamId
          ? peerState.screenStreamId
          : null;

      const streamEntries = Array.from(streamsMap.values()).filter(
        (s) => s.getTracks().some((t) => t.readyState !== 'ended')
      );

      let chosenScreen: MediaStream | null = null;
      let chosenCamera: MediaStream | null = null;

      if (expectedScreenStreamId !== null) {
        chosenScreen = streamsMap.get(expectedScreenStreamId) ?? null;
      }

      const candidates = streamEntries.filter((s) => chosenScreen === null || s.id !== chosenScreen.id);
      const videoCandidates = candidates.filter((s) =>
        s.getVideoTracks().some((t) => t.readyState !== 'ended')
      );

      if (videoCandidates.length > 0) {
        chosenCamera = videoCandidates[0] ?? null;
        if (videoCandidates.length > 1 && chosenScreen === null && peerState?.isScreenSharing) {
          chosenScreen = videoCandidates[1] ?? null;
        }
      } else if (candidates.length > 0) {
        chosenCamera = candidates[0] ?? null;
      }

      // Merge any separate live audio track from fallback/other streams onto chosenCamera so audio & video play together
      if (chosenCamera !== null && chosenCamera.getAudioTracks().length === 0) {
        for (const s of candidates) {
          if (s.id === chosenCamera.id) continue;
          const liveAudio = s.getAudioTracks().find((t) => t.readyState !== 'ended');
          if (liveAudio) {
            chosenCamera.addTrack(liveAudio);
            break;
          }
        }
      }

      if (chosenCamera !== null) {
        nextCameraMap[connId] = chosenCamera;
        if (userId) nextCameraMap[userId] = chosenCamera;
      }
      if (chosenScreen !== null) {
        nextScreenMap[connId] = chosenScreen;
        if (userId) nextScreenMap[userId] = chosenScreen;
      }
    });

    setRemoteStreams(nextCameraMap);
    setRemoteScreenStreams(nextScreenMap);
  }, []);

  // 1. Hardware Camera & Microphone Capture (supports hot-swapping selected device IDs)
  useEffect(() => {
    if (!isWebMediaSupported() || !meetingCode) {
      return;
    }

    let isCancelled = false;

    const captureHardwareMedia = async () => {
      try {
        const audioConstraints: MediaTrackConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(selectedMicId ? { deviceId: { ideal: selectedMicId } } : {}),
        };
        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24, max: 30 },
          facingMode: 'user',
          ...(selectedCameraId ? { deviceId: { ideal: selectedCameraId } } : {}),
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: videoConstraints,
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        stream.getAudioTracks().forEach((t) => {
          t.enabled = !isMicMutedRef.current;
        });
        stream.getVideoTracks().forEach((t) => {
          t.enabled = !isVideoMutedRef.current;
        });

        setLocalStream((prev) => {
          if (prev !== null && prev !== stream) {
            prev.getTracks().forEach((t) => t.stop());
          }
          return stream;
        });
        setMediaError(null);
      } catch (err) {
        const isPermissionDenied =
          err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');

        if (isPermissionDenied) {
          if (!isCancelled) {
            setMediaError('Camera or microphone permission was denied. Joining in listen/view mode.');
          }
          return;
        }

        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              ...(selectedMicId ? { deviceId: { ideal: selectedMicId } } : {}),
            },
            video: false,
          });

          if (isCancelled) {
            audioOnlyStream.getTracks().forEach((t) => t.stop());
            return;
          }

          audioOnlyStream.getAudioTracks().forEach((t) => {
            t.enabled = !isMicMutedRef.current;
          });

          setLocalStream((prev) => {
            if (prev !== null && prev !== audioOnlyStream) {
              prev.getTracks().forEach((t) => t.stop());
            }
            return audioOnlyStream;
          });
          setMediaError('Camera unavailable — joined with audio.');
        } catch {
          if (!isCancelled) {
            setMediaError('Microphone and camera unavailable — joined in view-only mode.');
          }
        }
      }
    };

    void captureHardwareMedia();

    return () => {
      isCancelled = true;
    };
  }, [meetingCode, selectedMicId, selectedCameraId]);

  // Cleanup local media tracks on unmount or meetingCode clear
  useEffect(() => {
    return () => {
      if (localStreamRef.current !== null) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (screenStreamRef.current !== null) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
    };
  }, []);

  // 2. Sync mic & camera mute states + broadcast live media state to room
  useEffect(() => {
    if (localStream !== null) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
    }
    if (meetingCode) {
      void realTimeService.updateMediaState(
        meetingCode,
        isMicMuted,
        isVideoMuted,
        isScreenSharingRef.current,
        screenStreamRef.current?.id ?? null
      );
    }
  }, [localStream, isMicMuted, isVideoMuted, meetingCode]);

  // 3. Adaptive Multi-User Mesh Bandwidth & Economy Scaling (2-8 full grid; 9+ Active Speaker mode)
  const peerCount = connectedUserIds.length + 1;
  useEffect(() => {
    const economy = peerCount >= 9;
    setIsLargeRoomEconomyMode(economy);

    const shouldTransmitSelfCamera =
      !isVideoMuted &&
      (!economy || isHostOrAdmin || isSpotlightedSelf || isScreenSharingActive || isSpeaking);

    if (localStream !== null) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = shouldTransmitSelfCamera;
      });
    }

    if (Platform.OS !== 'web') return;

    let maxBitrate = 1_200_000;
    let scaleResolutionDownBy = 1.0;
    if (peerCount >= 7) {
      maxBitrate = 320_000;
      scaleResolutionDownBy = 2.0;
    } else if (peerCount >= 4) {
      maxBitrate = 600_000;
      scaleResolutionDownBy = 1.5;
    }

    cameraSenderMapRef.current.forEach((sender) => {
      try {
        const params = sender.getParameters();
        if (params.encodings && params.encodings.length > 0 && params.encodings[0] !== undefined) {
          params.encodings[0].maxBitrate = maxBitrate;
          params.encodings[0].scaleResolutionDownBy = scaleResolutionDownBy;
          void sender.setParameters(params).catch(() => {
            // Ignore browser encoding parameter constraint error
          });
        }
      } catch {
        // Ignore unsupported getParameters
      }
    });
  }, [peerCount, localStream, isVideoMuted, isHostOrAdmin, isSpotlightedSelf, isScreenSharingActive, isSpeaking]);

  // 4. Multi-Peer Speaking Activity Detection (Local + All Remote Peers)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const audioCtx = createBrowserAudioContext();
    if (audioCtx === null) return;

    const analysers = new Map<string, { analyser: AnalyserNode; bins: Uint8Array<ArrayBuffer>; source: MediaStreamAudioSourceNode }>();

    const attachAnalyser = (key: string, stream: MediaStream | null) => {
      if (stream === null || stream.getAudioTracks().length === 0) return;
      try {
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        const bins = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        analysers.set(key, { analyser, bins, source });
      } catch {
        // Ignore stream source error
      }
    };

    if (!isMicMuted && localStream !== null) {
      attachAnalyser(currentUserId ?? 'self', localStream);
    }

    Object.entries(remoteStreams).forEach(([key, stream]) => {
      // Only attach per userId (skip duplicate connId keys when mapped)
      const isConnId = peerConnections.current.has(key);
      if (!isConnId) {
        attachAnalyser(key, stream);
      }
    });

    const interval = setInterval(() => {
      const activeSpeakers: string[] = [];
      analysers.forEach(({ analyser, bins }, userIdKey) => {
        const peerMuted = userIdKey !== (currentUserId ?? 'self') && peerMediaStatesRef.current[userIdKey]?.isMicMuted;
        if (peerMuted) return;

        analyser.getByteFrequencyData(bins);
        let sum = 0;
        for (let i = 0; i < bins.length; i++) {
          sum += bins[i] ?? 0;
        }
        const avg = sum / bins.length;
        if (avg > 16) {
          activeSpeakers.push(userIdKey);
        }
      });

      const selfKey = currentUserId ?? 'self';
      setIsSpeaking(activeSpeakers.includes(selfKey));
      setSpeakingUserIds(activeSpeakers);
    }, 220);

    return () => {
      clearInterval(interval);
      analysers.forEach(({ source }) => {
        try {
          source.disconnect();
        } catch {
          // ignore
        }
      });
      if (audioCtx.state !== 'closed') {
        void audioCtx.close();
      }
    };
  }, [localStream, remoteStreams, isMicMuted, currentUserId]);

  const flushPendingIceCandidates = useCallback(async (connId: string, pc: RTCPeerConnection) => {
    const queue = pendingIceCandidatesRef.current.get(connId);
    if (queue !== undefined && queue.length > 0) {
      pendingIceCandidatesRef.current.delete(connId);
      for (const candidate of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTC] Error adding queued ICE candidate:', err);
        }
      }
    }
  }, []);

  const negotiateWithPeer = useCallback(async (targetConnectionId: string, pc: RTCPeerConnection) => {
    if (makingOfferRef.current.get(targetConnectionId) === true || pc.signalingState !== 'stable') {
      pendingNegotiationRef.current.set(targetConnectionId, true);
      return;
    }

    try {
      makingOfferRef.current.set(targetConnectionId, true);
      pendingNegotiationRef.current.set(targetConnectionId, false);
      const offer = await pc.createOffer();
      if (pc.signalingState !== 'stable') {
        pendingNegotiationRef.current.set(targetConnectionId, true);
        return;
      }
      await pc.setLocalDescription(offer);
      const localDesc = pc.localDescription;
      if (localDesc && localDesc.sdp) {
        await realTimeService.sendWebRtcSignal(targetConnectionId, 'offer', localDesc.sdp);
      }
    } catch (err) {
      console.warn('[WebRTC] Negotiation offer failed:', err);
    } finally {
      makingOfferRef.current.set(targetConnectionId, false);
    }
  }, []);

  const attachLocalTracksToPeer = useCallback((targetConnectionId: string, pc: RTCPeerConnection): boolean => {
    let needsNegotiation = false;
    const stream = localStreamRef.current;

    // Ensure bidirectional audio + camera video transceivers exist from initial PeerConnection creation
    // so early offers (before getUserMedia finishes) still negotiate m=audio and m=video lines!
    let audioSender = audioSenderMapRef.current.get(targetConnectionId);
    if (!audioSender || !pc.getSenders().includes(audioSender)) {
      const existingAudioTransceiver = pc
        .getTransceivers()
        .find(
          (t) =>
            t.currentDirection !== 'stopped' &&
            t.direction !== 'stopped' &&
            (t.receiver.track.kind === 'audio' || t.sender.track?.kind === 'audio')
        );
      if (existingAudioTransceiver) {
        if (existingAudioTransceiver.direction === 'recvonly' || existingAudioTransceiver.direction === 'inactive') {
          existingAudioTransceiver.direction = 'sendrecv';
          needsNegotiation = true;
        }
        audioSender = existingAudioTransceiver.sender;
        audioSenderMapRef.current.set(targetConnectionId, audioSender);
      } else if (typeof pc.addTransceiver === 'function') {
        try {
          const tr = pc.addTransceiver('audio', {
            direction: 'sendrecv',
            streams: stream ? [stream] : [],
          });
          audioSender = tr.sender;
          audioSenderMapRef.current.set(targetConnectionId, audioSender);
          needsNegotiation = true;
        } catch {
          // Fallback to addTrack below
        }
      }
    }

    const screenSenders = screenSendersMapRef.current.get(targetConnectionId) ?? [];
    let camSender = cameraSenderMapRef.current.get(targetConnectionId);
    if (!camSender || !pc.getSenders().includes(camSender)) {
      const existingVideoTransceiver = pc
        .getTransceivers()
        .find(
          (t) =>
            t.currentDirection !== 'stopped' &&
            t.direction !== 'stopped' &&
            (t.receiver.track.kind === 'video' || t.sender.track?.kind === 'video') &&
            !screenSenders.includes(t.sender)
        );
      if (existingVideoTransceiver) {
        if (existingVideoTransceiver.direction === 'recvonly' || existingVideoTransceiver.direction === 'inactive') {
          existingVideoTransceiver.direction = 'sendrecv';
          needsNegotiation = true;
        }
        camSender = existingVideoTransceiver.sender;
        cameraSenderMapRef.current.set(targetConnectionId, camSender);
      } else if (typeof pc.addTransceiver === 'function') {
        try {
          const tr = pc.addTransceiver('video', {
            direction: 'sendrecv',
            streams: stream ? [stream] : [],
          });
          camSender = tr.sender;
          cameraSenderMapRef.current.set(targetConnectionId, camSender);
          needsNegotiation = true;
        } catch {
          // Fallback to addTrack below
        }
      }
    }

    if (stream !== null) {
      const audioTrack = stream.getAudioTracks()[0] ?? null;
      const videoTrack = stream.getVideoTracks()[0] ?? null;

      if (audioTrack !== null) {
        if (audioSender && pc.getSenders().includes(audioSender)) {
          if (audioSender.track !== audioTrack) {
            const hadNoTrack = audioSender.track === null;
            void audioSender.replaceTrack(audioTrack);
            if (hadNoTrack) needsNegotiation = true;
          }
        } else {
          try {
            const sender = pc.addTrack(audioTrack, stream);
            audioSenderMapRef.current.set(targetConnectionId, sender);
            needsNegotiation = true;
          } catch {
            // Track already added
          }
        }
      }

      if (videoTrack !== null) {
        if (camSender && pc.getSenders().includes(camSender)) {
          if (camSender.track !== videoTrack) {
            const hadNoTrack = camSender.track === null;
            void camSender.replaceTrack(videoTrack);
            if (hadNoTrack) needsNegotiation = true;
          }
        } else {
          try {
            const sender = pc.addTrack(videoTrack, stream);
            cameraSenderMapRef.current.set(targetConnectionId, sender);
            needsNegotiation = true;
          } catch {
            // Track already added
          }
        }
      }
    }

    // Also attach active screen-share stream if currently presenting
    const activeScreen = screenStreamRef.current;
    if (activeScreen !== null) {
      const existingScreenSenders = screenSendersMapRef.current.get(targetConnectionId) ?? [];
      if (existingScreenSenders.length === 0) {
        const added: RTCRtpSender[] = [];
        activeScreen.getTracks().forEach((sTrack) => {
          try {
            added.push(pc.addTrack(sTrack, activeScreen));
            needsNegotiation = true;
          } catch {
            // Ignore duplicate
          }
        });
        if (added.length > 0) {
          screenSendersMapRef.current.set(targetConnectionId, added);
        }
      }
    }

    return needsNegotiation;
  }, []);

  const cleanupPeerConnection = useCallback((targetConnectionId: string) => {
    const timer = disconnectTimersRef.current.get(targetConnectionId);
    if (timer !== undefined) {
      clearTimeout(timer);
      disconnectTimersRef.current.delete(targetConnectionId);
    }

    const pc = peerConnections.current.get(targetConnectionId);
    if (pc !== undefined) {
      pc.onnegotiationneeded = null;
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peerConnections.current.delete(targetConnectionId);
    }

    pendingIceCandidatesRef.current.delete(targetConnectionId);
    makingOfferRef.current.delete(targetConnectionId);
    pendingNegotiationRef.current.delete(targetConnectionId);
    ignoreOfferRef.current.delete(targetConnectionId);
    isSettingRemoteAnswerPendingRef.current.delete(targetConnectionId);
    cameraSenderMapRef.current.delete(targetConnectionId);
    audioSenderMapRef.current.delete(targetConnectionId);
    screenSendersMapRef.current.delete(targetConnectionId);
    peerReceivedStreamsRef.current.delete(targetConnectionId);

    rebuildRemoteStreamMaps();
  }, [rebuildRemoteStreamMaps]);

  const getOrCreatePeerConnection = useCallback((targetConnectionId: string): RTCPeerConnection => {
    const existing = peerConnections.current.get(targetConnectionId);
    if (existing !== undefined && existing.connectionState !== 'closed') {
      return existing;
    }

    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    attachLocalTracksToPeer(targetConnectionId, pc);

    pc.onnegotiationneeded = () => {
      void negotiateWithPeer(targetConnectionId, pc);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate !== null && meetingCode) {
        void realTimeService.sendWebRtcSignal(
          targetConnectionId,
          'ice',
          JSON.stringify(event.candidate)
        );
      }
    };

    pc.ontrack = (event) => {
      let targetStream = event.streams && event.streams[0] ? event.streams[0] : null;
      const connStreams = peerReceivedStreamsRef.current.get(targetConnectionId) ?? new Map<string, MediaStream>();

      if (targetStream === null) {
        const fallbackId = `fallback_${targetConnectionId}`;
        const existingFallback = connStreams.get(fallbackId);
        if (existingFallback) {
          if (!existingFallback.getTracks().some((t) => t.id === event.track.id)) {
            existingFallback.addTrack(event.track);
          }
          targetStream = existingFallback;
        } else {
          targetStream = new MediaStream([event.track]);
          connStreams.set(fallbackId, targetStream);
        }
      } else {
        if (!targetStream.getTracks().some((t) => t.id === event.track.id)) {
          targetStream.addTrack(event.track);
        }
        connStreams.set(targetStream.id, targetStream);
      }

      event.track.onunmute = () => {
        rebuildRemoteStreamMaps();
      };

      event.track.onended = () => {
        rebuildRemoteStreamMaps();
      };

      peerReceivedStreamsRef.current.set(targetConnectionId, connStreams);
      rebuildRemoteStreamMaps();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        const pendingTimer = disconnectTimersRef.current.get(targetConnectionId);
        if (pendingTimer !== undefined) {
          clearTimeout(pendingTimer);
          disconnectTimersRef.current.delete(targetConnectionId);
        }
      } else if (pc.connectionState === 'disconnected') {
        if (!disconnectTimersRef.current.has(targetConnectionId)) {
          const graceTimer = setTimeout(() => {
            disconnectTimersRef.current.delete(targetConnectionId);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
              try {
                pc.restartIce();
                void negotiateWithPeer(targetConnectionId, pc);
              } catch {
                cleanupPeerConnection(targetConnectionId);
              }
            }
          }, 3500);
          disconnectTimersRef.current.set(targetConnectionId, graceTimer);
        }
      } else if (pc.connectionState === 'failed') {
        try {
          pc.restartIce();
          void negotiateWithPeer(targetConnectionId, pc);
        } catch {
          cleanupPeerConnection(targetConnectionId);
        }
      } else if (pc.connectionState === 'closed') {
        cleanupPeerConnection(targetConnectionId);
      }
    };

    peerConnections.current.set(targetConnectionId, pc);
    return pc;
  }, [meetingCode, attachLocalTracksToPeer, negotiateWithPeer, cleanupPeerConnection, rebuildRemoteStreamMaps]);

  // 5. Whenever localStream initializes or changes, attach/replace tracks on all active PeerConnections & renegotiate if needed
  useEffect(() => {
    if (localStream === null) return;

    peerConnections.current.forEach((pc, targetConnId) => {
      const needsNegotiation = attachLocalTracksToPeer(targetConnId, pc);
      if (needsNegotiation && pc.signalingState === 'stable') {
        void negotiateWithPeer(targetConnId, pc);
      }
    });

    if (meetingCode) {
      void realTimeService.updateMediaState(
        meetingCode,
        isMicMutedRef.current,
        isVideoMutedRef.current,
        isScreenSharingRef.current,
        screenStreamRef.current?.id ?? null
      );
    }
  }, [localStream, meetingCode, attachLocalTracksToPeer, negotiateWithPeer]);

  // 6. SignalR Room Snapshot, Media State & Perfect Negotiation Listeners
  useEffect(() => {
    if (!meetingCode) return;

    const isPolitePeer = (remoteConnectionId: string): boolean => {
      const selfId = selfConnectionIdRef.current;
      if (selfId && remoteConnectionId) {
        return selfId.localeCompare(remoteConnectionId) < 0;
      }
      return true;
    };

    const registerPeerState = (peer: ActiveRoomPeerSnapshot) => {
      if (!peer.connectionId) return;
      if (peer.userId) {
        // Clean up any stale connectionId mapped to this same userId so old closed connections don't shadow the new one
        connectionToUserRef.current.forEach((uId, oldConnId) => {
          if (uId === peer.userId && oldConnId !== peer.connectionId) {
            cleanupPeerConnection(oldConnId);
            connectionToUserRef.current.delete(oldConnId);
          }
        });
        connectionToUserRef.current.set(peer.connectionId, peer.userId);
        setConnectedUserIds((prev) => (prev.includes(peer.userId) ? prev : [...prev, peer.userId]));
      }
      const key = peer.userId || peer.connectionId;
      setPeerMediaStates((prev) => {
        const next: Record<string, PeerLiveMediaState> = {
          ...prev,
          [key]: {
            connectionId: peer.connectionId,
            userId: peer.userId,
            isMicMuted: Boolean(peer.isMicMuted || peer.isMutedByHost),
            isVideoMuted: Boolean(peer.isVideoMuted),
            isScreenSharing: Boolean(peer.isScreenSharing),
            screenStreamId: peer.screenStreamId ?? null,
          },
        };
        peerMediaStatesRef.current = next;
        return next;
      });
    };

    const unsubSnapshot = realTimeService.onRoomJoinedSnapshot((snapshot) => {
      if (snapshot.meetingCode !== meetingCode) return;
      selfConnectionIdRef.current = snapshot.selfConnectionId;
      onRoomSnapshotRef.current?.(snapshot);

      if (Array.isArray(snapshot.activePeers)) {
        snapshot.activePeers.forEach((peer) => {
          registerPeerState(peer);
          if (Platform.OS === 'web' && peer.connectionId) {
            const pc = getOrCreatePeerConnection(peer.connectionId);
            // Only the impolite peer initiates the initial offer so simultaneous joiners never trigger double-offer glare
            if (!isPolitePeer(peer.connectionId)) {
              void negotiateWithPeer(peer.connectionId, pc);
            }
          }
        });
      }

      void realTimeService.updateMediaState(
        meetingCode,
        isMicMutedRef.current,
        isVideoMutedRef.current,
        isScreenSharingRef.current,
        screenStreamRef.current?.id ?? null
      );
    });

    const unsubJoined = realTimeService.onParticipantJoined(async (payload) => {
      const connectionId = payload.connectionId;
      if (!connectionId) return;

      registerPeerState(payload);
      onPeerJoinedRef.current?.(payload);

      if (Platform.OS !== 'web') return;

      const pc = getOrCreatePeerConnection(connectionId);
      // Only the impolite peer initiates the initial offer; if selfConnectionId isn't set yet, fall back to offering
      if (!selfConnectionIdRef.current || !isPolitePeer(connectionId)) {
        await negotiateWithPeer(connectionId, pc);
      }
    });

    const unsubMediaState = realTimeService.onParticipantMediaStateChanged((payload: ParticipantMediaStatePayload) => {
      if (payload.userId) {
        connectionToUserRef.current.set(payload.connectionId, payload.userId);
      }
      const key = payload.userId || payload.connectionId;
      setPeerMediaStates((prev) => {
        const next: Record<string, PeerLiveMediaState> = {
          ...prev,
          [key]: {
            connectionId: payload.connectionId,
            userId: payload.userId,
            isMicMuted: payload.isMicMuted,
            isVideoMuted: payload.isVideoMuted,
            isScreenSharing: payload.isScreenSharing,
            screenStreamId: payload.screenStreamId ?? null,
          },
        };
        peerMediaStatesRef.current = next;
        return next;
      });
      rebuildRemoteStreamMaps();
    });

    const unsubOffer = realTimeService.onReceiveWebRtcOffer(async (senderConnectionId, senderUserId, sdp) => {
      if (Platform.OS !== 'web') return;

      if (senderUserId) {
        connectionToUserRef.current.set(senderConnectionId, senderUserId);
        setConnectedUserIds((prev) => (prev.includes(senderUserId) ? prev : [...prev, senderUserId]));
      }

      const pc = getOrCreatePeerConnection(senderConnectionId);
      const polite = isPolitePeer(senderConnectionId);
      const makingOffer = makingOfferRef.current.get(senderConnectionId) === true;
      const isSettingAnswer = isSettingRemoteAnswerPendingRef.current.get(senderConnectionId) === true;
      const readyForOffer = !makingOffer && (pc.signalingState === 'stable' || isSettingAnswer);
      const offerCollision = !readyForOffer;

      ignoreOfferRef.current.set(senderConnectionId, !polite && offerCollision);
      if (!polite && offerCollision) {
        return;
      }

      try {
        if (offerCollision) {
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' }),
            pc.setRemoteDescription({ type: 'offer', sdp }),
          ]);
        } else {
          await pc.setRemoteDescription({ type: 'offer', sdp });
        }

        // Attach local tracks onto transceivers created by setRemoteDescription so Answer carries our media!
        const tracksNeededRenegotiation = attachLocalTracksToPeer(senderConnectionId, pc);
        await flushPendingIceCandidates(senderConnectionId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const localDesc = pc.localDescription;
        if (localDesc && localDesc.sdp) {
          await realTimeService.sendWebRtcSignal(senderConnectionId, 'answer', localDesc.sdp);
        }

        rebuildRemoteStreamMaps();

        // If additional tracks (e.g. second stream or newly promoted sendrecv transceiver) or queued changes require follow-up offer
        if (
          (tracksNeededRenegotiation || pendingNegotiationRef.current.get(senderConnectionId) === true) &&
          pc.signalingState === 'stable'
        ) {
          pendingNegotiationRef.current.set(senderConnectionId, false);
          await negotiateWithPeer(senderConnectionId, pc);
        }
      } catch (err) {
        console.warn('[WebRTC] Failed to process offer and send answer:', err);
      }
    });

    const unsubAnswer = realTimeService.onReceiveWebRtcAnswer(async (senderConnectionId, senderUserId, sdp) => {
      if (Platform.OS !== 'web') return;

      if (senderUserId) {
        connectionToUserRef.current.set(senderConnectionId, senderUserId);
        setConnectedUserIds((prev) => (prev.includes(senderUserId) ? prev : [...prev, senderUserId]));
      }

      const pc = peerConnections.current.get(senderConnectionId);
      if (pc === undefined) return;
      if (pc.signalingState !== 'have-local-offer') return;

      try {
        isSettingRemoteAnswerPendingRef.current.set(senderConnectionId, true);
        await pc.setRemoteDescription({ type: 'answer', sdp });
        isSettingRemoteAnswerPendingRef.current.set(senderConnectionId, false);
        await flushPendingIceCandidates(senderConnectionId, pc);
        rebuildRemoteStreamMaps();

        // If local tracks were attached while we were waiting for this answer, renegotiate now that state is stable
        if (pendingNegotiationRef.current.get(senderConnectionId) === true) {
          pendingNegotiationRef.current.set(senderConnectionId, false);
          await negotiateWithPeer(senderConnectionId, pc);
        }
      } catch (err) {
        isSettingRemoteAnswerPendingRef.current.set(senderConnectionId, false);
        console.warn('[WebRTC] Failed to apply remote answer:', err);
      }
    });

    const unsubIce = realTimeService.onReceiveIceCandidate(async (senderConnectionId, senderUserId, candidateJson) => {
      if (Platform.OS !== 'web') return;

      if (senderUserId) {
        connectionToUserRef.current.set(senderConnectionId, senderUserId);
      }
      if (ignoreOfferRef.current.get(senderConnectionId) === true) return;

      try {
        if (!candidateJson) return;
        const parsed: unknown = JSON.parse(candidateJson);
        if (!isIceCandidateInit(parsed)) return;

        const pc = peerConnections.current.get(senderConnectionId);
        if (pc !== undefined && pc.remoteDescription !== null && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(parsed));
        } else {
          const queue = pendingIceCandidatesRef.current.get(senderConnectionId) ?? [];
          queue.push(parsed);
          pendingIceCandidatesRef.current.set(senderConnectionId, queue);
        }
      } catch (err) {
        if (ignoreOfferRef.current.get(senderConnectionId) !== true) {
          console.warn('[WebRTC] Failed to add ICE candidate:', err);
        }
      }
    });

    const unsubLeft = realTimeService.onParticipantLeft((userId) => {
      if (!userId) return;
      setConnectedUserIds((prev) => prev.filter((id) => id !== userId));
      onPeerLeftRef.current?.(userId);

      const connIdsToClean: string[] = [];
      connectionToUserRef.current.forEach((mappedUser, connId) => {
        if (mappedUser === userId) {
          connIdsToClean.push(connId);
        }
      });

      connIdsToClean.forEach((connId) => {
        cleanupPeerConnection(connId);
        connectionToUserRef.current.delete(connId);
      });

      setPeerMediaStates((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        connIdsToClean.forEach((cid) => delete copy[cid]);
        peerMediaStatesRef.current = copy;
        return copy;
      });

      rebuildRemoteStreamMaps();
    });

    return () => {
      unsubSnapshot();
      unsubJoined();
      unsubMediaState();
      unsubOffer();
      unsubAnswer();
      unsubIce();
      unsubLeft();

      Array.from(peerConnections.current.keys()).forEach((cid) => cleanupPeerConnection(cid));
      connectionToUserRef.current.clear();
      setRemoteStreams({});
      setRemoteScreenStreams({});
      setPeerMediaStates({});
      peerMediaStatesRef.current = {};
      setConnectedUserIds([]);
      setSpeakingUserIds([]);
    };
  }, [
    meetingCode,
    getOrCreatePeerConnection,
    attachLocalTracksToPeer,
    negotiateWithPeer,
    flushPendingIceCandidates,
    cleanupPeerConnection,
    rebuildRemoteStreamMaps,
  ]);

  // 7. Dual-Stream Screen Sharing (keeps presenter webcam alive + notifies all remote viewers)
  const stopScreenShareInternal = useCallback(() => {
    const activeScreen = screenStreamRef.current;
    if (activeScreen !== null) {
      activeScreen.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    screenSendersMapRef.current.forEach((senders, connId) => {
      const pc = peerConnections.current.get(connId);
      if (pc !== undefined && pc.connectionState !== 'closed') {
        senders.forEach((s) => {
          try {
            pc.removeTrack(s);
          } catch {
            // ignore
          }
        });
        void negotiateWithPeer(connId, pc);
      }
    });
    screenSendersMapRef.current.clear();

    setScreenStream(null);
    setIsScreenSharingActive(false);
    isScreenSharingRef.current = false;

    if (meetingCode) {
      void realTimeService.updateMediaState(
        meetingCode,
        isMicMutedRef.current,
        isVideoMutedRef.current,
        false,
        null
      );
    }
  }, [meetingCode, negotiateWithPeer]);

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenShareSupported()) return;

    if (!isScreenSharingActive) {
      try {
        const sStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 15, max: 30 },
          },
          audio: true,
        });

        const screenVideoTrack = sStream.getVideoTracks()[0] ?? null;
        if (screenVideoTrack === null) {
          sStream.getTracks().forEach((t) => t.stop());
          return;
        }

        screenStreamRef.current = sStream;
        setScreenStream(sStream);
        setIsScreenSharingActive(true);
        isScreenSharingRef.current = true;

        if (meetingCode) {
          await realTimeService.updateMediaState(
            meetingCode,
            isMicMutedRef.current,
            isVideoMutedRef.current,
            true,
            sStream.id
          );
        }

        peerConnections.current.forEach((pc, connId) => {
          const addedSenders: RTCRtpSender[] = [];
          sStream.getTracks().forEach((track) => {
            try {
              addedSenders.push(pc.addTrack(track, sStream));
            } catch {
              // ignore
            }
          });
          screenSendersMapRef.current.set(connId, addedSenders);
          void negotiateWithPeer(connId, pc);
        });

        screenVideoTrack.onended = () => {
          stopScreenShareInternal();
        };
      } catch (err) {
        console.warn('[WebRTC] Screen share cancelled or failed:', err);
      }
    } else {
      stopScreenShareInternal();
    }
  }, [isScreenSharingActive, meetingCode, negotiateWithPeer, stopScreenShareInternal]);

  const stopAllMediaTracks = useCallback(() => {
    stopScreenShareInternal();
    if (localStreamRef.current !== null) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
  }, [stopScreenShareInternal]);

  return {
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
  };
}
