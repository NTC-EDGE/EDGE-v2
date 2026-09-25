import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { realTimeService } from '@edge/api';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

function isIceCandidateInit(obj: unknown): obj is RTCIceCandidateInit {
  if (typeof obj !== 'object' || obj === null) return false;
  return 'candidate' in obj;
}

export interface UseWebRtcMeetingOptions {
  meetingCode?: string;
  currentUserId?: string;
  isMicMuted: boolean;
  isVideoMuted: boolean;
}

export function useWebRtcMeeting({
  meetingCode,
  currentUserId: _currentUserId,
  isMicMuted,
  isVideoMuted,
}: UseWebRtcMeetingOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isScreenSharingActive, setIsScreenSharingActive] = useState<boolean>(false);

  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const connectionToUserRef = useRef<Map<string, string>>(new Map());
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  // Synchronize refs
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  // 1. Hardware Media Capture (Camera and Microphone) on Room Entry
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function' || !meetingCode) {
      return;
    }

    let isCancelled = false;

    const startMediaCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        stream.getAudioTracks().forEach((t) => {
          t.enabled = !isMicMuted;
        });
        stream.getVideoTracks().forEach((t) => {
          t.enabled = !isVideoMuted;
          cameraTrackRef.current = t;
        });

        setLocalStream(stream);
        setMediaError(null);
      } catch (err) {
        const isPermissionDenied =
          (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) ||
          (typeof err === 'object' && err !== null && 'name' in err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'));

        if (isPermissionDenied) {
          if (!isCancelled) {
            setMediaError('Camera or microphone permission was denied. Please allow access in browser settings.');
          }
          return;
        }

        // Fallback to audio-only if camera access failed due to hardware/availability reasons
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });

          if (isCancelled) {
            audioStream.getTracks().forEach((t) => t.stop());
            return;
          }

          audioStream.getAudioTracks().forEach((t) => {
            t.enabled = !isMicMuted;
          });

          setLocalStream(audioStream);
          setMediaError('Camera is unavailable. Joined with audio only.');
        } catch (audioErr) {
          if (!isCancelled) {
            const isAudioDenied =
              (audioErr instanceof DOMException && (audioErr.name === 'NotAllowedError' || audioErr.name === 'PermissionDeniedError')) ||
              (typeof audioErr === 'object' && audioErr !== null && 'name' in audioErr && (audioErr.name === 'NotAllowedError' || audioErr.name === 'PermissionDeniedError'));

            setMediaError(
              isAudioDenied
                ? 'Microphone permission was denied. Please allow access in browser settings.'
                : 'Could not access microphone or camera. Please check browser permissions.'
            );
          }
        }
      }
    };

    void startMediaCapture();

    return () => {
      isCancelled = true;
      if (localStreamRef.current !== null) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [meetingCode]);

  // 2. Synchronize microphone and camera mute states to hardware tracks
  useEffect(() => {
    if (localStream !== null) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
    }
  }, [localStream, isMicMuted]);

  useEffect(() => {
    if (localStream !== null) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoMuted;
        cameraTrackRef.current = track;
      });
    }
  }, [localStream, isVideoMuted]);

  // 3. Audio Activity / Speaking Detection for Local User
  useEffect(() => {
    if (Platform.OS !== 'web' || localStream === null || isMicMuted || typeof window === 'undefined' || !('AudioContext' in window)) {
      setIsSpeaking(false);
      return;
    }

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      setIsSpeaking(false);
      return;
    }

    let animationFrameId: number | null = null;
    let audioCtx: AudioContext | null = null;

    try {
      audioCtx = new window.AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(localStream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudioActivity = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          if (val !== undefined) {
            sum += val;
          }
        }
        const average = sum / dataArray.length;
        setIsSpeaking(average > 18);
        animationFrameId = requestAnimationFrame(checkAudioActivity);
      };

      checkAudioActivity();
    } catch {
      setIsSpeaking(false);
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (audioCtx !== null && audioCtx.state !== 'closed') {
        void audioCtx.close();
      }
    };
  }, [localStream, isMicMuted]);

  // 4. Flush queued ICE candidates after remote description is set
  const flushPendingIceCandidates = useCallback(async (connId: string, pc: RTCPeerConnection) => {
    const queue = pendingIceCandidatesRef.current.get(connId);
    if (queue !== undefined && queue.length > 0) {
      for (const candidate of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTC] Error adding queued ICE candidate:', err);
        }
      }
      pendingIceCandidatesRef.current.delete(connId);
    }
  }, []);

  // 5. Helper: Create and configure RTCPeerConnection for a remote participant
  const getOrCreatePeerConnection = useCallback((targetConnectionId: string): RTCPeerConnection => {
    const existing = peerConnections.current.get(targetConnectionId);
    if (existing !== undefined && existing.connectionState !== 'closed') {
      return existing;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection immediately if present
    if (localStreamRef.current !== null) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (localStreamRef.current !== null) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    // Ensure transceivers exist to send and receive incoming media
    const currentTransceivers = pc.getTransceivers();
    const hasAudio = currentTransceivers.some((t) => t.receiver.track.kind === 'audio');
    const hasVideo = currentTransceivers.some((t) => t.receiver.track.kind === 'video');

    if (!hasAudio) {
      try {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
      } catch {
        // Ignore fallback
      }
    }
    if (!hasVideo) {
      try {
        pc.addTransceiver('video', { direction: 'sendrecv' });
      } catch {
        // Ignore fallback
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate !== null && meetingCode !== undefined && meetingCode !== '') {
        void realTimeService.sendWebRtcSignal(
          targetConnectionId,
          'ice',
          JSON.stringify(event.candidate)
        );
      }
    };

    pc.ontrack = (event) => {
      const mappedUserId = connectionToUserRef.current.get(targetConnectionId);

      setRemoteStreams((prev) => {
        const existing = prev[targetConnectionId];
        let nextStream: MediaStream;

        if (event.streams !== undefined && event.streams.length > 0 && event.streams[0] !== undefined) {
          nextStream = event.streams[0];
        } else if (existing !== undefined) {
          const trackAlreadyExists = existing.getTracks().some((t) => t.id === event.track.id);
          if (!trackAlreadyExists) {
            existing.addTrack(event.track);
          }
          nextStream = existing;
        } else {
          nextStream = new MediaStream([event.track]);
        }

        const next: Record<string, MediaStream> = {
          ...prev,
          [targetConnectionId]: nextStream,
        };

        if (mappedUserId !== undefined && mappedUserId.length > 0) {
          next[mappedUserId] = nextStream;
        }

        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConnections.current.delete(targetConnectionId);
        pendingIceCandidatesRef.current.delete(targetConnectionId);
        const mappedUserId = connectionToUserRef.current.get(targetConnectionId);
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[targetConnectionId];
          if (mappedUserId !== undefined) {
            delete copy[mappedUserId];
          }
          return copy;
        });
      }
    };

    peerConnections.current.set(targetConnectionId, pc);
    return pc;
  }, [meetingCode]);

  // 6. Synchronize local tracks to all active RTCPeerConnections when stream initializes or updates
  useEffect(() => {
    if (localStream === null) return;
    const localTracks = localStream.getTracks();

    peerConnections.current.forEach((pc, targetConnId) => {
      let requiresRenegotiation = false;

      localTracks.forEach((track) => {
        const transceivers = pc.getTransceivers();
        const matchingTransceiver = transceivers.find(
          (t) => (t.sender.track !== null && t.sender.track.kind === track.kind) ||
                 (t.sender.track === null && t.receiver.track.kind === track.kind)
        );

        if (matchingTransceiver !== undefined && matchingTransceiver.sender !== null) {
          void matchingTransceiver.sender.replaceTrack(track);
        } else {
          const senders = pc.getSenders();
          const matchingSender = senders.find((s) => s.track !== null && s.track.kind === track.kind);
          if (matchingSender !== undefined) {
            void matchingSender.replaceTrack(track);
          } else {
            try {
              pc.addTrack(track, localStream);
              requiresRenegotiation = true;
            } catch {
              // Ignore duplicate track
            }
          }
        }
      });

      if (requiresRenegotiation && pc.signalingState === 'stable') {
        void (async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            if (offer.sdp !== undefined && offer.sdp !== '') {
              await realTimeService.sendWebRtcSignal(targetConnId, 'offer', offer.sdp);
            }
          } catch (err) {
            console.warn('[WebRTC] Renegotiation offer failed:', err);
          }
        })();
      }
    });
  }, [localStream]);

  // 7. WebRTC Signaling Listeners (SignalR Bridge)
  useEffect(() => {
    if (!meetingCode || Platform.OS !== 'web') return;

    // A. When another participant joins, initiate an SDP Offer
    const unsubJoined = realTimeService.onParticipantJoined(async (payload) => {
      const connectionId = payload.connectionId;
      const userId = payload.userId;
      if (connectionId === undefined || connectionId === '') return;

      if (userId !== undefined && userId !== null && userId.length > 0) {
        connectionToUserRef.current.set(connectionId, userId);
        setConnectedUserIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
      }

      try {
        const pc = getOrCreatePeerConnection(connectionId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (offer.sdp !== undefined && offer.sdp !== '') {
          await realTimeService.sendWebRtcSignal(connectionId, 'offer', offer.sdp);
        }
      } catch (err) {
        console.warn('[WebRTC] Failed to create and send offer:', err);
      }
    });

    // B. When an SDP Offer is received, set remote description and send SDP Answer
    const unsubOffer = realTimeService.onReceiveWebRtcOffer(async (senderConnectionId, senderUserId, sdp) => {
      if (senderUserId !== undefined && senderUserId !== null && senderUserId.length > 0) {
        connectionToUserRef.current.set(senderConnectionId, senderUserId);
        setConnectedUserIds((prev) => (prev.includes(senderUserId) ? prev : [...prev, senderUserId]));

        setRemoteStreams((prev) => {
          const connStream = prev[senderConnectionId];
          if (connStream !== undefined && prev[senderUserId] === undefined) {
            return { ...prev, [senderUserId]: connStream };
          }
          return prev;
        });
      }

      try {
        const pc = getOrCreatePeerConnection(senderConnectionId);
        await pc.setRemoteDescription({ type: 'offer', sdp });
        await flushPendingIceCandidates(senderConnectionId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (answer.sdp !== undefined && answer.sdp !== '') {
          await realTimeService.sendWebRtcSignal(senderConnectionId, 'answer', answer.sdp);
        }
      } catch (err) {
        console.warn('[WebRTC] Failed to process offer and send answer:', err);
      }
    });

    // C. When an SDP Answer is received, set remote description and flush ICE
    const unsubAnswer = realTimeService.onReceiveWebRtcAnswer(async (senderConnectionId, senderUserId, sdp) => {
      if (senderUserId !== undefined && senderUserId !== null && senderUserId.length > 0) {
        connectionToUserRef.current.set(senderConnectionId, senderUserId);
        setConnectedUserIds((prev) => (prev.includes(senderUserId) ? prev : [...prev, senderUserId]));

        setRemoteStreams((prev) => {
          const connStream = prev[senderConnectionId];
          if (connStream !== undefined && prev[senderUserId] === undefined) {
            return { ...prev, [senderUserId]: connStream };
          }
          return prev;
        });
      }

      try {
        const pc = peerConnections.current.get(senderConnectionId);
        if (pc !== undefined) {
          await pc.setRemoteDescription({ type: 'answer', sdp });
          await flushPendingIceCandidates(senderConnectionId, pc);
        }
      } catch (err) {
        console.warn('[WebRTC] Failed to process answer:', err);
      }
    });

    // D. When an ICE Candidate is received, buffer if remote description isn't ready, otherwise add immediately
    const unsubIce = realTimeService.onReceiveIceCandidate(async (senderConnectionId, senderUserId, candidateJson) => {
      if (senderUserId !== undefined && senderUserId !== null && senderUserId.length > 0) {
        connectionToUserRef.current.set(senderConnectionId, senderUserId);
      }
      try {
        const pc = peerConnections.current.get(senderConnectionId);
        if (pc !== undefined && candidateJson !== undefined && candidateJson !== '') {
          const candidateInit: unknown = JSON.parse(candidateJson);
          if (isIceCandidateInit(candidateInit)) {
            if (pc.remoteDescription !== null && pc.remoteDescription.type !== undefined) {
              await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
            } else {
              const queue = pendingIceCandidatesRef.current.get(senderConnectionId) ?? [];
              queue.push(candidateInit);
              pendingIceCandidatesRef.current.set(senderConnectionId, queue);
            }
          }
        }
      } catch (err) {
        console.warn('[WebRTC] Failed to add ICE candidate:', err);
      }
    });

    // E. When participant leaves, cleanup their peer connection and remove from connectedUserIds
    const unsubLeft = realTimeService.onParticipantLeft((userId) => {
      if (userId !== undefined && userId !== null) {
        setConnectedUserIds((prev) => prev.filter((id) => id !== userId));
        let connIdToRemove: string | null = null;
        connectionToUserRef.current.forEach((val, key) => {
          if (val === userId) {
            connIdToRemove = key;
          }
        });
        if (connIdToRemove !== null) {
          const pc = peerConnections.current.get(connIdToRemove);
          if (pc !== undefined) {
            pc.close();
            peerConnections.current.delete(connIdToRemove);
          }
          pendingIceCandidatesRef.current.delete(connIdToRemove);
          connectionToUserRef.current.delete(connIdToRemove);
        }
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          if (connIdToRemove !== null) {
            delete copy[connIdToRemove];
          }
          return copy;
        });
      }
    });

    return () => {
      unsubJoined();
      unsubOffer();
      unsubAnswer();
      unsubIce();
      unsubLeft();

      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      pendingIceCandidatesRef.current.clear();
      connectionToUserRef.current.clear();
      setRemoteStreams({});
      setConnectedUserIds([]);
    };
  }, [meetingCode, getOrCreatePeerConnection, flushPendingIceCandidates]);

  // 8. Screen Sharing Action
  const toggleScreenShare = useCallback(async () => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
      return;
    }

    if (!isScreenSharingActive) {
      try {
        const sStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const screenTracks = sStream.getVideoTracks();
        const screenTrack = screenTracks.length > 0 ? screenTracks[0] : null;
        if (screenTrack === null || screenTrack === undefined) return;

        setScreenStream(sStream);

        // Replace track on all active peer connections
        peerConnections.current.forEach((pc) => {
          const senders = pc.getSenders();
          const sender = senders.find((s) => s.track !== null && s.track.kind === 'video');
          if (sender !== undefined) {
            void sender.replaceTrack(screenTrack);
          }
        });

        screenTrack.onended = () => {
          if (cameraTrackRef.current !== null) {
            peerConnections.current.forEach((pc) => {
              const senders = pc.getSenders();
              const sender = senders.find((s) => s.track !== null && s.track.kind === 'video');
              if (sender !== undefined && cameraTrackRef.current !== null) {
                void sender.replaceTrack(cameraTrackRef.current);
              }
            });
          }
          setScreenStream(null);
          setIsScreenSharingActive(false);
        };

        setIsScreenSharingActive(true);
      } catch (err) {
        console.warn('[WebRTC] Screen share cancelled or failed:', err);
      }
    } else {
      if (screenStream !== null) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
      setScreenStream(null);

      if (cameraTrackRef.current !== null) {
        peerConnections.current.forEach((pc) => {
          const senders = pc.getSenders();
          const sender = senders.find((s) => s.track !== null && s.track.kind === 'video');
          if (sender !== undefined && cameraTrackRef.current !== null) {
            void sender.replaceTrack(cameraTrackRef.current);
          }
        });
      }
      setIsScreenSharingActive(false);
    }
  }, [isScreenSharingActive, screenStream]);

  const stopAllMediaTracks = useCallback(() => {
    if (screenStreamRef.current !== null) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current !== null) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setScreenStream(null);
    setIsScreenSharingActive(false);
  }, []);

  return {
    localStream,
    screenStream,
    remoteStreams,
    connectedUserIds,
    isSpeaking,
    mediaError,
    isScreenSharingActive,
    toggleScreenShare,
    stopAllMediaTracks,
  };
}
