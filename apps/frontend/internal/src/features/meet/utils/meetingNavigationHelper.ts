export const ACTIVE_MEETING_STORAGE_KEY = 'edge_active_meeting_code';
export const JOIN_MEETING_EVENT_NAME = 'edge_join_meeting';

export interface JoinMeetingEventDetail {
  code: string;
  immediate?: boolean;
  audioOnly?: boolean;
}

export function isCustomEventWithCode(event: Event): event is CustomEvent<JoinMeetingEventDetail> {
  if ('detail' in event && typeof event.detail === 'object' && event.detail !== null) {
    const codeVal = Reflect.get(event.detail, 'code');
    return typeof codeVal === 'string';
  }
  return false;
}

export function acceptIncomingCall(
  code: string,
  onNavigate?: (screenName: string) => void,
  options?: { audioOnly?: boolean }
): void {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      if ('sessionStorage' in window && window.sessionStorage !== null && window.sessionStorage !== undefined) {
        window.sessionStorage.setItem(ACTIVE_MEETING_STORAGE_KEY, code);
      }

      if (window.location !== undefined && typeof window.location.href === 'string') {
        const url = new URL(window.location.href);
        url.searchParams.set('code', code);
        window.history.replaceState(null, '', url.toString());
      }

      if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        const detail: JoinMeetingEventDetail = {
          code,
          immediate: true,
          audioOnly: options?.audioOnly ?? false,
        };
        window.dispatchEvent(new CustomEvent(JOIN_MEETING_EVENT_NAME, { detail }));
      }
    } catch {
      // Gracefully handle browser storage/history restrictions
    }
  }

  if (onNavigate !== undefined) {
    onNavigate('Meet');
  }
}

export function extractMeetingCodeFromInput(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (trimmed.includes('code=')) {
    const idx = trimmed.indexOf('code=');
    const after = trimmed.slice(idx + 5);
    const ampIdx = after.indexOf('&');
    try {
      return decodeURIComponent(ampIdx >= 0 ? after.slice(0, ampIdx) : after).trim();
    } catch {
      return (ampIdx >= 0 ? after.slice(0, ampIdx) : after).trim();
    }
  }
  return trimmed;
}
