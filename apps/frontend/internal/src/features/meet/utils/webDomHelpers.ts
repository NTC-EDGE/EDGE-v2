import { Platform } from 'react-native';

export function isWebMediaSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices) &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

export function isScreenShareSupported(): boolean {
  return (
    isWebMediaSupported() &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
}

export function isLocalRecordingSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    'MediaRecorder' in window
  );
}

export function createBrowserAudioContext(): AudioContext | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }
  try {
    if ('AudioContext' in window && typeof window.AudioContext === 'function') {
      return new window.AudioContext();
    }
  } catch {
    // Ignore AudioContext restriction
  }
  return null;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback below
    }

    if (typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
      } catch {
        return false;
      }
    }
  }
  return false;
}

export function getMeetingJoinLink(meetingCode: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/meet?code=${encodeURIComponent(meetingCode)}`;
  }
  return `/meet?code=${encodeURIComponent(meetingCode)}`;
}

export async function applyAudioOutputSink(
  mediaEl: HTMLMediaElement | null,
  sinkId?: string
): Promise<void> {
  if (Platform.OS !== 'web' || mediaEl === null || !sinkId) return;
  try {
    const maybeSetSink = Reflect.get(mediaEl, 'setSinkId');
    if (typeof maybeSetSink === 'function') {
      await Reflect.apply(maybeSetSink, mediaEl, [sinkId]);
    }
  } catch {
    // Browser does not support setSinkId or device unavailable
  }
}

export function downloadBlobLocally(blob: Blob, filename: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof URL === 'undefined') {
    return;
  }
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  } catch (err) {
    console.warn('[Meet] Failed to trigger local recording download:', err);
  }
}
