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

  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const connectionToUserRef = useRef<Map<string, string>>(new Map());
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
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

  // Flush queued ICE candidates after remote description is set
  const flushPendingIceCandidates = useCallback(async (connId: string, pc: RTCPeerConnection) => {
    const queue = pendingIceCandidatesRef.current.get(connId);
    if (queue && queue.length > 0) {
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
    } else {
      // Ensure transceivers exist to receive incoming media before local tracks are ready
      try {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
        pc.addTransceiver('video', { direction: 'sendrecv' });
      } catch {
        // Fallback for environments where addTransceiver is not supported
      }
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
    const unsubJoined = realTimeService.onParticipantJoined(async (payload) => {
      const { connectionId, userId } = payload as { connectionId?: string; userId?: string };
      if (!connectionId) return;
      if (userId !== undefined && userId !== null && userId.length > 0) {
        connectionToUserRef.current.set(connectionId, userId);
        setConnectedUserIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
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
        setConnectedUserIds((prev) => (prev.includes(senderUserId) ? prev : [...prev, senderUserId]));
      }
      try {
        const pc = getOrCreatePeerConnection(senderConnectionId);
        await pc.setRemoteDescription({ type: 'offer', sdp });
        await flushPendingIceCandidates(senderConnectionId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (answer.sdp) {
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
      }
      try {
        const pc = peerConnections.current.get(senderConnectionId);
        if (pc) {
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
        if (pc && candidateJson) {
          const candidateInit = JSON.parse(candidateJson) as RTCIceCandidateInit;
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
          } else {
            // Buffer pending candidate until setRemoteDescription completes
            const queue = pendingIceCandidatesRef.current.get(senderConnectionId) ?? [];
            queue.push(candidateInit);
            pendingIceCandidatesRef.current.set(senderConnectionId, queue);
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
          if (pc) {
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
    connectedUserIds,
    isSpeaking,
    mediaError,
    isScreenSharingActive,
    toggleScreenShare,
    stopAllMediaTracks,
  };
}
