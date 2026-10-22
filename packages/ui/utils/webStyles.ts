import { Platform } from 'react-native';

const PASSWORD_REVEAL_STYLE_ID = 'edge-hide-native-password-reveal';

const PASSWORD_REVEAL_CSS = `
  input::-ms-reveal,
  input::-ms-clear {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  input::-webkit-contacts-auto-fill-button,
  input::-webkit-credentials-auto-fill-button {
    visibility: hidden !important;
    display: none !important;
    pointer-events: none !important;
    height: 0 !important;
    width: 0 !important;
    margin: 0 !important;
  }
`;

/**
 * Injects CSS to suppress browser-native password reveal icons (e.g. Edge ::-ms-reveal)
 * on Web to prevent duplicate eye icons from appearing alongside custom application toggles.
 */
export function injectPasswordRevealStyles(): void {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    if (!document.getElementById(PASSWORD_REVEAL_STYLE_ID)) {
      const styleEl = document.createElement('style');
      styleEl.id = PASSWORD_REVEAL_STYLE_ID;
      styleEl.innerHTML = PASSWORD_REVEAL_CSS;
      document.head.appendChild(styleEl);
    }
  }
}
