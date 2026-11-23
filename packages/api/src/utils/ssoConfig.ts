export interface GoogleSsoCheckOptions {
  clerkPublishableKey?: string;
  enableGoogleSso?: string;
  hostname?: string;
}

function isProductionHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return (
    normalized === 'edge.ntc.gov.ph' ||
    normalized.endsWith('.ntc.gov.ph') ||
    normalized === 'ntc-edge.gov.ph' ||
    normalized.endsWith('.ntc-edge.gov.ph')
  );
}

/**
 * Determines whether Google SSO ("Continue with Google") should be displayed.
 *
 * - Explicit override via `EXPO_PUBLIC_ENABLE_GOOGLE_SSO` / `NEXT_PUBLIC_ENABLE_GOOGLE_SSO`
 *   (`"true"` / `"1"` forces enabled; `"false"` / `"0"` forces disabled).
 * - Disabled by default in Production (`pk_live_*` Clerk publishable key or NTC production hostnames).
 * - Enabled by default in Development & Preview (`pk_test_*` on `localhost` / `*.vercel.app`).
 */
export function isGoogleSsoEnabled(options?: GoogleSsoCheckOptions): boolean {
  const explicitFlag =
    options?.enableGoogleSso ??
    (typeof process !== 'undefined' && process.env
      ? (process.env.EXPO_PUBLIC_ENABLE_GOOGLE_SSO ?? process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO)
      : undefined);

  if (typeof explicitFlag === 'string') {
    const normalizedFlag = explicitFlag.trim().toLowerCase();
    if (normalizedFlag === 'true' || normalizedFlag === '1') {
      return true;
    }
    if (normalizedFlag === 'false' || normalizedFlag === '0') {
      return false;
    }
  }

  const clerkKey =
    options?.clerkPublishableKey ??
    (typeof process !== 'undefined' && process.env
      ? (process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
      : undefined);

  if (typeof clerkKey === 'string' && clerkKey.trim().startsWith('pk_live_')) {
    return false;
  }

  const candidateHost =
    options?.hostname ??
    (typeof window !== 'undefined' && typeof window.location?.hostname === 'string'
      ? window.location.hostname
      : undefined);

  if (typeof candidateHost === 'string' && candidateHost.length > 0 && isProductionHostname(candidateHost)) {
    return false;
  }

  return true;
}
