import { useState, useRef, useEffect, useCallback } from 'react';
import { MeetingParticipant } from '@edge/api';
import {
  createBrowserAudioContext,
  downloadBlobLocally,
  isLocalRecordingSupported,
} from '../utils/webDomHelpers';

export interface RecorderTileSource {
  userId: string;
  fullName: string;
  stream: MediaStream | null;
  isVideoMuted: boolean;
}

export interface UseLocalMeetingRecorderOptions {
  meetingCode?: string;
  meetingTitle?: string;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  activeScreenStream: MediaStream | null;
  screenPresenterName?: string;
  participants: RecorderTileSource[];
  onRecordingStateBroadcast?: (isRecording: boolean) => void;
  onRecordingSaved?: (filename: string) => void;
}

function selectSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return '';
  }
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return '';
}

function buildRecordingFilename(meetingCode?: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  const safeCode = (meetingCode || 'session').replace(/[^a-zA-Z0-9_-]/g, '');
  return `edge-meet-${safeCode}-${yyyy}${mm}${dd}-${hh}${min}${sec}.webm`;
}

export function useLocalMeetingRecorder({
  meetingCode,
  meetingTitle,
  localStream,
  remoteStreams,
  activeScreenStream,
  screenPresenterName,
  participants,
  onRecordingStateBroadcast,
  onRecordingSaved,
}: UseLocalMeetingRecorderOptions) {
  const isSupported = isLocalRecordingSupported();
  const [isLocalRecording, setIsLocalRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const drawIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const attachedAudioStreamIdsRef = useRef<Map<string, MediaStreamAudioSourceNode>>(new Map());
  const hiddenVideoElsRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Live refs read by the background-safe 24fps canvas draw loop
  const participantsRef = useRef<RecorderTileSource[]>(participants);
  const activeScreenRef = useRef<MediaStream | null>(activeScreenStream);
  const presenterNameRef = useRef<string | undefined>(screenPresenterName);
  const titleRef = useRef<string | undefined>(meetingTitle);
  const codeRef = useRef<string | undefined>(meetingCode);

  participantsRef.current = participants;
  activeScreenRef.current = activeScreenStream;
  presenterNameRef.current = screenPresenterName;
  titleRef.current = meetingTitle;
  codeRef.current = meetingCode;

  const ensureHiddenVideoElement = useCallback((key: string, stream: MediaStream): HTMLVideoElement | null => {
    if (typeof document === 'undefined') return null;
    const existing = hiddenVideoElsRef.current.get(key);
    if (existing !== undefined) {
      if (existing.srcObject !== stream) {
        existing.srcObject = stream;
        void existing.play().catch(() => {});
      }
      return existing;
    }

    const vid = document.createElement('video');
    vid.muted = true;
    vid.playsInline = true;
    vid.autoplay = true;
    vid.srcObject = stream;
    void vid.play().catch(() => {});
    hiddenVideoElsRef.current.set(key, vid);
    return vid;
  }, []);

  // Dynamically mix new audio streams (including late-joining participants!) while recording is active
  useEffect(() => {
    if (!isLocalRecording || audioCtxRef.current === null || audioDestRef.current === null) {
      return;
    }

    const ctx = audioCtxRef.current;
    const dest = audioDestRef.current;

    const attachStreamAudio = (stream: MediaStream | null) => {
      if (stream === null || stream.getAudioTracks().length === 0) return;
      if (attachedAudioStreamIdsRef.current.has(stream.id)) return;
      try {
        const src = ctx.createMediaStreamSource(stream);
        src.connect(dest);
        attachedAudioStreamIdsRef.current.set(stream.id, src);
      } catch {
        // Ignore stream source error
      }
    };

    attachStreamAudio(localStream);
    attachStreamAudio(activeScreenStream);
    Object.values(remoteStreams).forEach((s) => attachStreamAudio(s));
  }, [isLocalRecording, localStream, remoteStreams, activeScreenStream]);

  const cleanupRecordingResources = useCallback(() => {
    if (drawIntervalRef.current !== null) {
      clearInterval(drawIntervalRef.current);
      drawIntervalRef.current = null;
    }
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    attachedAudioStreamIdsRef.current.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    });
    attachedAudioStreamIdsRef.current.clear();

    if (audioCtxRef.current !== null && audioCtxRef.current.state !== 'closed') {
      void audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    audioDestRef.current = null;

    hiddenVideoElsRef.current.forEach((vid) => {
      vid.pause();
      vid.srcObject = null;
    });
    hiddenVideoElsRef.current.clear();
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder !== null && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      cleanupRecordingResources();
      setIsLocalRecording(false);
      setRecordingSeconds(0);
    }
  }, [cleanupRecordingResources]);

  const startRecording = useCallback(() => {
    if (!isSupported || isLocalRecording || typeof document === 'undefined') {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (ctx === null || typeof canvas.captureStream !== 'function') {
      return;
    }

    const audioCtx = createBrowserAudioContext();
    let mixedAudioTrack: MediaStreamTrack | null = null;

    if (audioCtx !== null) {
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        void audioCtx.resume();
      }
      const dest = audioCtx.createMediaStreamDestination();
      audioDestRef.current = dest;

      // Silent keepalive oscillator keeps AudioContext clock active even when everyone is muted
      try {
        const osc = audioCtx.createOscillator();
        const zeroGain = audioCtx.createGain();
        zeroGain.gain.value = 0.00001;
        osc.connect(zeroGain);
        zeroGain.connect(dest);
        osc.start();
      } catch {
        // ignore
      }

      const attachInitial = (s: MediaStream | null) => {
        if (s === null || s.getAudioTracks().length === 0) return;
        if (attachedAudioStreamIdsRef.current.has(s.id)) return;
        try {
          const src = audioCtx.createMediaStreamSource(s);
          src.connect(dest);
          attachedAudioStreamIdsRef.current.set(s.id, src);
        } catch {
          // ignore
        }
      };

      attachInitial(localStream);
      attachInitial(activeScreenStream);
      Object.values(remoteStreams).forEach((s) => attachInitial(s));

      mixedAudioTrack = dest.stream.getAudioTracks()[0] ?? null;
    }

    // Background-safe 24fps interval compositor (requestAnimationFrame pauses when tab is hidden)
    const drawFrame = () => {
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, 1280, 720);

      // Header bar
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, 1280, 44);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(24, 22, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 14px sans-serif';
      const headerLabel = `${titleRef.current || 'NTC-EDGE Meeting'} (${codeRef.current || ''})`;
      ctx.fillText(headerLabel, 38, 27);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px sans-serif';
      ctx.fillText(new Date().toLocaleString(), 1060, 27);

      const screen = activeScreenRef.current;
      const tiles = participantsRef.current;

      const drawVideoContain = (vid: HTMLVideoElement, x: number, y: number, w: number, h: number) => {
        const vw = vid.videoWidth || 1280;
        const vh = vid.videoHeight || 720;
        const scale = Math.min(w / vw, h / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = x + (w - dw) / 2;
        const dy = y + (h - dh) / 2;
        ctx.drawImage(vid, dx, dy, dw, dh);
      };

      if (screen !== null && screen.getVideoTracks().length > 0) {
        const sVid = ensureHiddenVideoElement(`screen_${screen.id}`, screen);
        if (sVid !== null && sVid.readyState >= 2) {
          drawVideoContain(sVid, 16, 56, 1248, 648);
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(28, 68, 280, 28);
        ctx.fillStyle = '#60A5FA';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`Screen Share: ${presenterNameRef.current || 'Presenter'}`, 40, 86);
      } else {
        const count = Math.max(1, Math.min(tiles.length, 9));
        const cols = count === 1 ? 1 : count <= 4 ? 2 : 3;
        const rows = Math.ceil(count / cols);
        const pad = 14;
        const stageTop = 56;
        const stageW = 1280 - pad * 2;
        const stageH = 720 - stageTop - pad;
        const cellW = (stageW - pad * (cols - 1)) / cols;
        const cellH = (stageH - pad * (rows - 1)) / rows;

        tiles.slice(0, 9).forEach((tile, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = pad + col * (cellW + pad);
          const y = stageTop + row * (cellH + pad);

          ctx.fillStyle = '#1E293B';
          ctx.fillRect(x, y, cellW, cellH);

          const hasLiveVideo =
            tile.stream !== null &&
            tile.stream.getVideoTracks().length > 0 &&
            !tile.isVideoMuted;

          if (hasLiveVideo && tile.stream !== null) {
            const vid = ensureHiddenVideoElement(`cam_${tile.userId}_${tile.stream.id}`, tile.stream);
            if (vid !== null && vid.readyState >= 2) {
              drawVideoContain(vid, x, y, cellW, cellH);
            }
          } else {
            // Avatar initials fallback
            const cx = x + cellW / 2;
            const cy = y + cellH / 2;
            ctx.fillStyle = '#1E40AF';
            ctx.beginPath();
            ctx.arc(cx, cy, 36, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            const initials = (tile.fullName || 'U')
              .split(' ')
              .map((p) => p[0] ?? '')
              .join('')
              .slice(0, 2)
              .toUpperCase();
            ctx.fillText(initials || 'U', cx, cy + 8);
            ctx.textAlign = 'left';
          }

          // Nameplate
          ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
          ctx.fillRect(x + 10, y + cellH - 34, Math.min(cellW - 20, 220), 24);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText((tile.fullName || 'Participant').slice(0, 26), x + 18, y + cellH - 18);
        });
      }
    };

    drawFrame();
    drawIntervalRef.current = setInterval(drawFrame, 42);

    const canvasStream = canvas.captureStream(24);
    const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
    if (mixedAudioTrack !== null) {
      combinedTracks.push(mixedAudioTrack);
    }
    const combinedStream = new MediaStream(combinedTracks);

    const mimeType = selectSupportedMimeType();
    const recorder = mimeType
      ? new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 2_500_000 })
      : new MediaRecorder(combinedStream);

    chunksRef.current = [];

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        chunksRef.current.push(ev.data);
      }
    };

    recorder.onstop = () => {
      const recordedChunks = chunksRef.current;
      chunksRef.current = [];
      cleanupRecordingResources();
      setIsLocalRecording(false);
      setRecordingSeconds(0);
      onRecordingStateBroadcast?.(false);

      if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: mimeType || 'video/webm' });
        const filename = buildRecordingFilename(codeRef.current);
        downloadBlobLocally(blob, filename);
        onRecordingSaved?.(filename);
      }
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsLocalRecording(true);
    setRecordingSeconds(0);
    onRecordingStateBroadcast?.(true);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  }, [
    isSupported,
    isLocalRecording,
    localStream,
    remoteStreams,
    activeScreenStream,
    ensureHiddenVideoElement,
    cleanupRecordingResources,
    onRecordingStateBroadcast,
    onRecordingSaved,
  ]);

  const toggleLocalRecording = useCallback(() => {
    if (isLocalRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isLocalRecording, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current !== null && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        cleanupRecordingResources();
      }
    };
  }, [cleanupRecordingResources]);

  const formattedRecordingTime = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(
    recordingSeconds % 60
  ).padStart(2, '0')}`;

  return {
    isRecordingSupported: isSupported,
    isLocalRecording,
    recordingSeconds,
    formattedRecordingTime,
    startRecording,
    stopRecording,
    toggleLocalRecording,
  };
}
