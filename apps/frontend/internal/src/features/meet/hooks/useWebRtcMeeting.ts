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

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const connectionToUserRef = useRef<Map<string, string>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  // Synchronize refs
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  // 1. Acquire Local Media Stream (Camera & Mic)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return;
    }

    let isMounted = true;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Apply initial mute state
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !isMicMuted;
        });
        stream.getVideoTracks().forEach((track) => {
          track.enabled = !isVideoMuted;
          cameraTrackRef.current = track;
        });

        setLocalStream(stream);
        localStreamRef.current = stream;
        setMediaError(null);

        // Setup Voice Activity Detection
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const vadInterval = setInterval(() => {
              if (!analyserRef.current) return;
              const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
              analyserRef.current.getByteFrequencyData(dataArray);

              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i] ?? 0;
              }
              const avg = sum / dataArray.length;
              const nowSpeaking = avg > 22 && !isMicMuted;
              setIsSpeaking((prev) => (prev !== nowSpeaking ? nowSpeaking : prev));
            }, 150);

            return () => {
              clearInterval(vadInterval);
            };
          }
        } catch {
          // AudioContext not allowed before user gesture, harmless fallback
        }
      } catch (err) {
        console.warn('[WebRTC] Could not capture audio/video devices:', err);
        // Fallback: try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!isMounted) {
            audioStream.getTracks().forEach((t) => t.stop());
            return;
          }
          audioStream.getAudioTracks().forEach((track) => {
            track.enabled = !isMicMuted;
          });
          setLocalStream(audioStream);
          localStreamRef.current = audioStream;
          setMediaError('Camera not available; joined with microphone only.');
        } catch (audioErr) {
          console.warn('[WebRTC] Microphone also unavailable:', audioErr);
          setMediaError('Camera and microphone permissions not granted.');
        }
      }
    }

    void initMedia();

    return () => {
      isMounted = false;
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 2. Control Audio & Video Tracks on Mute Toggle
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
    }
  }, [isMicMuted, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoMuted;
      });
    }
  }, [isVideoMuted, localStream]);

  // Helper: Create and configure RTCPeerConnection for a remote participant
  const getOrCreatePeerConnection = useCallback((targetConnectionId: string): RTCPeerConnection => {
    const existing = peerConnections.current.get(targetConnectionId);
    if (existing && existing.connectionState !== 'closed') {
      return existing;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && meetingCode) {
        void realTimeService.sendWebRtcSignal(
          targetConnectionId,
          'ice',
          JSON.stringify(event.candidate)
        );
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        const mappedUserId = connectionToUserRef.current.get(targetConnectionId);
        setRemoteStreams((prev) => {
          const next = { ...prev, [targetConnectionId]: stream };
          if (mappedUserId !== undefined && mappedUserId.length > 0) {
            next[mappedUserId] = stream;
          }
          return next;
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConnections.current.delete(targetConnectionId);
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

  // Synchronize local tracks to all active RTCPeerConnections when stream initializes or updates
  useEffect(() => {
    if (!localStream) return;
    const localTracks = localStream.getTracks();
    peerConnections.current.forEach((pc) => {
      const senders = pc.getSenders();
      localTracks.forEach((track) => {
        const sender = senders.find((s) => s.track !== null && s.track.kind === track.kind);
        if (sender !== undefined) {
          void sender.replaceTrack(track);
        } else {
          try {
            pc.addTrack(track, localStream);
          } catch {
            // Ignore duplicate track addition
          }
        }
      });
    });
  }, [localStream]);

  // 3. WebRTC Signaling Listeners (SignalR Bridge)
  useEffect(() => {
    if (!meetingCode || Platform.OS !== 'web') return;

    // A. When another participant joins, initiate an SDP Offer
    const unsubJoined = realTimeService.onParticipantJoined(async ({ connectionId, userId }) => {
      if (!connectionId) return;
      if (userId !== undefined && userId !== null && userId.length > 0) {
        connectionToUserRef.current.set(connectionId, userId);
      }
      try {
        const pc = getOrCreatePeerConnection(connectionId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (offer.sdp) {
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
      }
      try {
        const pc = getOrCreatePeerConnection(senderConnectionId);
        await pc.setRemoteDescription({ type: 'offer', sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (answer.sdp) {
          await realTimeService.sendWebRtcSignal(senderConnectionId, 'answer', answer.sdp);
        }
      } catch (err) {
        console.warn('[WebRTC] Failed to process offer and send answer:', err);
      }
    });

    // C. When an SDP Answer is received, set remote description
    const unsubAnswer = realTimeService.onReceiveWebRtcAnswer(async (senderConnectionId, senderUserId, sdp) => {
      if (senderUserId !== undefined && senderUserId !== null && senderUserId.length > 0) {
        connectionToUserRef.current.set(senderConnectionId, senderUserId);
      }
      try {
        const pc = peerConnections.current.get(senderConnectionId);
        if (pc) {
          await pc.setRemoteDescription({ type: 'answer', sdp });
        }
      } catch (err) {
        console.warn('[WebRTC] Failed to process answer:', err);
      }
    });

    // D. When an ICE Candidate is received, add candidate to peer connection
    const unsubIce = realTimeService.onReceiveIceCandidate(async (senderConnectionId, senderUserId, candidateJson) => {
      if (senderUserId !== undefined && senderUserId !== null && senderUserId.length > 0) {
        connectionToUserRef.current.set(senderConnectionId, senderUserId);
      }
      try {
        const pc = peerConnections.current.get(senderConnectionId);
        if (pc && candidateJson) {
          const candidateInit = JSON.parse(candidateJson) as RTCIceCandidateInit;
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
        }
      } catch (err) {
        console.warn('[WebRTC] Failed to add ICE candidate:', err);
      }
    });

    // E. When participant leaves, cleanup their peer connection
    const unsubLeft = realTimeService.onParticipantLeft((userId) => {
      if (userId !== undefined && userId !== null) {
        let connIdToRemove: string | null = null;
        connectionToUserRef.current.forEach((val, key) => {
          if (val === userId) {
            connIdToRemove = key;
          }
        });
        if (connIdToRemove !== null) {
          const pc = peerConnections.current.get(connIdToRemove);
          if (pc) {
            pc.close();
            peerConnections.current.delete(connIdToRemove);
          }
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
      connectionToUserRef.current.clear();
      setRemoteStreams({});
    };
  }, [meetingCode, getOrCreatePeerConnection]);

  // 4. Screen Sharing Action
  const toggleScreenShare = useCallback(async () => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices.getDisplayMedia) {
      return;
    }

    if (!isScreenSharingActive) {
      try {
        const sStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const screenTrack = sStream.getVideoTracks()[0];
        if (!screenTrack) return;

        setScreenStream(sStream);

        // Replace track on all active peer connections
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            void sender.replaceTrack(screenTrack);
          }
        });

        screenTrack.onended = () => {
          // Revert to camera track when user stops sharing via browser UI
          if (cameraTrackRef.current) {
            peerConnections.current.forEach((pc) => {
              const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
              if (sender && cameraTrackRef.current) {
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
      // Revert back to camera track
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
      setScreenStream(null);

      if (cameraTrackRef.current) {
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender && cameraTrackRef.current) {
            void sender.replaceTrack(cameraTrackRef.current);
          }
        });
      }
      setIsScreenSharingActive(false);
    }
  }, [isScreenSharingActive, screenStream]);

  const stopAllMediaTracks = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current) {
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
    isSpeaking,
    mediaError,
    isScreenSharingActive,
    toggleScreenShare,
    stopAllMediaTracks,
  };
}
