/**
 * Meeting navigation & direct call session synchronization helpers.
 * Handles SSR safety and cross-platform session storage/URL updates.
 */

export const ACTIVE_MEETING_STORAGE_KEY = 'edge_active_meeting_code';
export const JOIN_MEETING_EVENT_NAME = 'edge_join_meeting';

/**
 * Type guard to check if a CustomEvent payload contains a valid meeting code.
 */
export function isCustomEventWithCode(event: Event): event is CustomEvent<{ code: string }> {
  if ('detail' in event && typeof event.detail === 'object' && event.detail !== null) {
    const detailObj = event.detail;
    return 'code' in detailObj && typeof Reflect.get(detailObj, 'code') === 'string';
  }
  return false;
}

/**
 * Handles accepting an incoming direct meeting call across web, desktop, and native.
 * Safely persists meeting code to session storage, updates URL query parameters if in browser,
 * dispatches the active join event, and triggers screen navigation.
 */
export function acceptIncomingCall(
  code: string,
  onNavigate?: (screenName: string) => void
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
        window.dispatchEvent(new CustomEvent(JOIN_MEETING_EVENT_NAME, { detail: { code } }));
      }
    } catch {
      // Gracefully handle any browser permission or storage restrictions
    }
  }

  if (onNavigate !== undefined) {
    onNavigate('Meet');
  }
}
