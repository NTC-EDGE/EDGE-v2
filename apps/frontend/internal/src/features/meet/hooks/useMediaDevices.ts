import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { createBrowserAudioContext, isWebMediaSupported } from '../utils/webDomHelpers';

export interface MediaDeviceOption {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'videoinput' | 'audiooutput';
}

const STORAGE_AUDIO_IN = 'edge_meet_pref_audio_in';
const STORAGE_VIDEO_IN = 'edge_meet_pref_video_in';
const STORAGE_AUDIO_OUT = 'edge_meet_pref_audio_out';

function getStoredDevice(key: string): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.localStorage) {
    return '';
  }
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function saveStoredDevice(key: string, value: string): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage error
  }
}

export function useMediaDevices(enablePreviewCapture = false, isMicMuted = false, isVideoMuted = false) {
  const [microphones, setMicrophones] = useState<MediaDeviceOption[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceOption[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceOption[]>([]);

  const [selectedMicId, setSelectedMicIdState] = useState<string>(() => getStoredDevice(STORAGE_AUDIO_IN));
  const [selectedCameraId, setSelectedCameraIdState] = useState<string>(() => getStoredDevice(STORAGE_VIDEO_IN));
  const [selectedSpeakerId, setSelectedSpeakerIdState] = useState<string>(() => getStoredDevice(STORAGE_AUDIO_OUT));

  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [previewMicLevel, setPreviewMicLevel] = useState<number>(0);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    if (!isWebMediaSupported() || typeof navigator.mediaDevices.enumerateDevices !== 'function') {
      return;
    }
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const mics: MediaDeviceOption[] = [];
      const cams: MediaDeviceOption[] = [];
      const spks: MediaDeviceOption[] = [];

      list.forEach((d, idx) => {
        if (d.kind === 'audioinput') {
          mics.push({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${mics.length + 1}`,
            kind: 'audioinput',
          });
        } else if (d.kind === 'videoinput') {
          cams.push({
            deviceId: d.deviceId,
            label: d.label || `Camera ${cams.length + 1}`,
            kind: 'videoinput',
          });
        } else if (d.kind === 'audiooutput') {
          spks.push({
            deviceId: d.deviceId,
            label: d.label || `Speaker ${spks.length + 1} (${idx})`,
            kind: 'audiooutput',
          });
        }
      });

      setMicrophones(mics);
      setCameras(cams);
      setSpeakers(spks);

      setSelectedMicIdState((prev) => {
        if (prev && mics.some((m) => m.deviceId === prev)) return prev;
        return mics[0]?.deviceId ?? '';
      });
      setSelectedCameraIdState((prev) => {
        if (prev && cams.some((c) => c.deviceId === prev)) return prev;
        return cams[0]?.deviceId ?? '';
      });
      setSelectedSpeakerIdState((prev) => {
        if (prev && spks.some((s) => s.deviceId === prev)) return prev;
        return spks[0]?.deviceId ?? '';
      });
    } catch {
      // Ignore enumerate failure
    }
  }, []);

  useEffect(() => {
    if (!isWebMediaSupported()) return;
    void refreshDevices();

    const handleDeviceChange = () => {
      void refreshDevices();
    };
    navigator.mediaDevices.addEventListener?.('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener?.('devicechange', handleDeviceChange);
    };
  }, [refreshDevices]);

  // Optional Pre-Join Lobby camera & microphone preview stream
  useEffect(() => {
    if (!enablePreviewCapture || !isWebMediaSupported()) {
      setPreviewStream((prev) => {
        if (prev !== null) {
          prev.getTracks().forEach((t) => t.stop());
        }
        return null;
      });
      return;
    }

    let isCancelled = false;
    let capturedStream: MediaStream | null = null;

    const startPreview = async () => {
      try {
        const audioConstraint: MediaTrackConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(selectedMicId ? { deviceId: { ideal: selectedMicId } } : {}),
        };
        const videoConstraint: MediaTrackConstraints = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          ...(selectedCameraId ? { deviceId: { ideal: selectedCameraId } } : {}),
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraint,
          video: videoConstraint,
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        capturedStream = stream;
        stream.getAudioTracks().forEach((t) => {
          t.enabled = !isMicMuted;
        });
        stream.getVideoTracks().forEach((t) => {
          t.enabled = !isVideoMuted;
        });

        setPreviewStream((old) => {
          if (old !== null && old !== stream) {
            old.getTracks().forEach((t) => t.stop());
          }
          return stream;
        });
        setPreviewError(null);
        await refreshDevices();
      } catch {
        // Fallback to audio-only preview
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              ...(selectedMicId ? { deviceId: { ideal: selectedMicId } } : {}),
            },
            video: false,
          });
          if (isCancelled) {
            audioStream.getTracks().forEach((t) => t.stop());
            return;
          }
          capturedStream = audioStream;
          audioStream.getAudioTracks().forEach((t) => {
            t.enabled = !isMicMuted;
          });
          setPreviewStream((old) => {
            if (old !== null && old !== audioStream) {
              old.getTracks().forEach((t) => t.stop());
            }
            return audioStream;
          });
          setPreviewError('Camera unavailable — ready to join with audio.');
          await refreshDevices();
        } catch {
          if (!isCancelled) {
            setPreviewError('Camera and microphone permissions are blocked or unavailable.');
          }
        }
      }
    };

    void startPreview();

    return () => {
      isCancelled = true;
      if (capturedStream !== null) {
        capturedStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [enablePreviewCapture, selectedMicId, selectedCameraId, refreshDevices]);

  // Sync mute toggles onto live preview stream without re-opening hardware
  useEffect(() => {
    if (previewStream !== null) {
      previewStream.getAudioTracks().forEach((t) => {
        t.enabled = !isMicMuted;
      });
    }
  }, [previewStream, isMicMuted]);

  useEffect(() => {
    if (previewStream !== null) {
      previewStream.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoMuted;
      });
    }
  }, [previewStream, isVideoMuted]);

  // Live microphone audio meter for Pre-Join Lobby
  useEffect(() => {
    if (!enablePreviewCapture || previewStream === null || isMicMuted) {
      setPreviewMicLevel(0);
      return;
    }

    if (previewStream.getAudioTracks().length === 0) {
      setPreviewMicLevel(0);
      return;
    }

    const audioCtx = createBrowserAudioContext();
    if (audioCtx === null) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    try {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      const source = audioCtx.createMediaStreamSource(previewStream);
      source.connect(analyser);
      const bins = new Uint8Array(analyser.frequencyBinCount);

      timer = setInterval(() => {
        analyser.getByteFrequencyData(bins);
        let sum = 0;
        for (let i = 0; i < bins.length; i++) {
          sum += bins[i] ?? 0;
        }
        const avg = sum / bins.length;
        setPreviewMicLevel(Math.min(100, Math.round((avg / 65) * 100)));
      }, 100);
    } catch {
      setPreviewMicLevel(0);
    }

    return () => {
      if (timer !== null) clearInterval(timer);
      if (audioCtx.state !== 'closed') {
        void audioCtx.close();
      }
    };
  }, [enablePreviewCapture, previewStream, isMicMuted]);

  const setSelectedMicId = useCallback((id: string) => {
    setSelectedMicIdState(id);
    saveStoredDevice(STORAGE_AUDIO_IN, id);
  }, []);

  const setSelectedCameraId = useCallback((id: string) => {
    setSelectedCameraIdState(id);
    saveStoredDevice(STORAGE_VIDEO_IN, id);
  }, []);

  const setSelectedSpeakerId = useCallback((id: string) => {
    setSelectedSpeakerIdState(id);
    saveStoredDevice(STORAGE_AUDIO_OUT, id);
  }, []);

  return {
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
    previewStream,
    previewMicLevel,
    previewError,
  };
}
