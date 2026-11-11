/**
 * Standard GUID / UUID regex validator (v1-v5 or general 8-4-4-4-12 hex format).
 */
const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Type guard to check whether an unknown value is a valid non-empty GUID string.
 */
export function isGuid(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  return GUID_REGEX.test(val.trim());
}

function hasEnvRecord(obj: unknown): obj is { __ENV__: Record<string, unknown> } {
  if (typeof obj !== 'object' || obj === null) return false;
  if (!('__ENV__' in obj)) return false;
  const envObj = Object.getOwnPropertyDescriptor(obj, '__ENV__')?.value;
  return typeof envObj === 'object' && envObj !== null;
}

/**
 * Safely retrieves environment-configured tenant ID across cross-platform environments
 * (Expo mobile, Next.js web, Vite/CRA, or browser window runtime).
 * Returns null if no valid environment override is provided.
 */
export function getEnvironmentTenantId(): string | null {
  // Check process.env (Node / Webpack / Metro bundler replacements)
  if (typeof process !== 'undefined' && process.env) {
    const candidates = [
      process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID,
      process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID,
      process.env.EXPO_PUBLIC_TENANT_ID,
      process.env.NEXT_PUBLIC_TENANT_ID,
      process.env.REACT_APP_DEFAULT_TENANT_ID,
    ];

    for (const envVal of candidates) {
      if (typeof envVal === 'string' && isGuid(envVal)) {
        return envVal.trim();
      }
    }
  }

  // Check window runtime environment (e.g. Docker container runtime injection)
  if (typeof window !== 'undefined' && hasEnvRecord(window)) {
    const envObj = window.__ENV__;
    const winTenant =
      envObj.DEFAULT_TENANT_ID ??
      envObj.EXPO_PUBLIC_DEFAULT_TENANT_ID ??
      envObj.NEXT_PUBLIC_DEFAULT_TENANT_ID;
    if (typeof winTenant === 'string' && isGuid(winTenant)) {
      return winTenant.trim();
    }
  }

  return null;
}

/**
 * Resolves an authentic tenant ID from primary or secondary candidate entities (e.g. app.tenantId, app.region),
 * falling back ONLY to an explicit environment override (if configured).
 * Returns null if no valid tenant context exists, avoiding silent fallback to phantom GUIDs.
 */
export function resolveEffectiveTenantId(
  candidate?: unknown,
  fallbackCandidate?: unknown
): string | null {
  if (isGuid(candidate)) {
    return candidate.trim();
  }
  if (isGuid(fallbackCandidate)) {
    return fallbackCandidate.trim();
  }
  return getEnvironmentTenantId();
}

/**
 * Validates and requires an authentic tenant ID, throwing an explicit descriptive error
 * instead of allowing unauthenticated or cross-tenant operations to silently execute.
 */
export function requireTenantId(
  candidate?: unknown,
  fallbackCandidate?: unknown,
  contextMessage?: string
): string {
  const resolved = resolveEffectiveTenantId(candidate, fallbackCandidate);
  if (resolved !== null) {
    return resolved;
  }
  throw new Error(
    contextMessage ||
      'Tenant ID is strictly required for this operation, but no valid tenant or regional context was provided.'
  );
}
