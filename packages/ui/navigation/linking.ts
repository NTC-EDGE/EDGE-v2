import { getStateFromPath, getPathFromState, type LinkingOptions } from "@react-navigation/native";

/**
 * Sanitizes an incoming redirect path to prevent Open Redirect vulnerabilities (OWASP Top 10).
 * Only relative internal paths (starting with / or alphanumeric route names) are permitted.
 * External protocols (http:, https:, javascript:, data:, //) are strictly rejected.
 */
export const sanitizeRedirectPath = (rawPath: string | null | undefined): string | null => {
  if (rawPath === null || rawPath === undefined || typeof rawPath !== "string") {
    return null;
  }
  const trimmed = rawPath.trim();
  if (trimmed.length === 0) {
    return null;
  }

  // Prevent protocol-relative URLs (e.g. //evil.com) and URI schemes (http://, https://, javascript:, data:)
  if (
    trimmed.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  ) {
    return null;
  }

  // Ensure it starts with / or is a clean relative route name
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

/**
 * Dynamically resolves linking prefixes for Expo apps on Web (Vercel/Production) and Native.
 * Prioritizes dynamic browser window.location.origin, environment variables, app schemes, and dev ports.
 */
export const getPrefixes = (): string[] => {
  const prefixes: string[] = [];

  // 1. Dynamic Browser Origin (Web / Vercel deployment)
  if (
    typeof window !== "undefined" &&
    window.location !== undefined &&
    typeof window.location.origin === "string"
  ) {
    const origin = window.location.origin.trim();
    if (
      origin.length > 0 &&
      (origin.startsWith("http://") || origin.startsWith("https://")) &&
      !prefixes.includes(origin)
    ) {
      prefixes.push(origin);
    }
  }

  // 2. Environment-Configured App Domain (if specified in EXPO_PUBLIC_APP_URL / NEXT_PUBLIC_APP_URL)
  const envAppUrl = process.env.EXPO_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (typeof envAppUrl === "string" && envAppUrl.trim().length > 0) {
    const cleanEnvUrl = envAppUrl.trim();
    if (!prefixes.includes(cleanEnvUrl)) {
      prefixes.push(cleanEnvUrl);
    }
  }

  // 3. Custom App Scheme for Native Deep Linking
  const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? "edge://";
  if (!prefixes.includes(appScheme)) {
    prefixes.push(appScheme);
  }

  // 4. Local Development Fallbacks (Metro Bundler ports)
  const defaultDevPorts = ["http://localhost:8081", "http://localhost:8082", "http://localhost:8083"];
  for (const devPort of defaultDevPorts) {
    if (!prefixes.includes(devPort)) {
      prefixes.push(devPort);
    }
  }

  return prefixes;
};

export interface CreateLinkingConfigOptions {
  defaultRoute?: string;
  defaultPath?: string;
  redirectPaths?: readonly string[];
  prefixes?: string[];
}

/**
 * Creates a dynamic React Navigation linking configuration with root & alias redirects,
 * preserving deep link return URLs (?redirectUrl=... or ?redirect=...) post-authentication
 * with strict OWASP Open Redirect security sanitization.
 */
export const createLinkingConfig = <T extends object>(
  options: CreateLinkingConfigOptions = {}
): LinkingOptions<T> => {
  const defaultRoute = options.defaultRoute ?? "Dashboard";
  const defaultPath = options.defaultPath ?? "/dashboard";
  const redirectPaths = options.redirectPaths ?? [];
  const prefixes = options.prefixes ?? getPrefixes();

  const normalizedRedirects = new Set(
    redirectPaths.map((path) => path.replace(/^\//, "").replace(/\/$/, "").split("?")[0])
  );
  normalizedRedirects.add("");

  return {
    prefixes,
    getStateFromPath(path, opts) {
      // Check for redirect query parameters (e.g. /login?redirect=/employees)
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const searchParams = new URLSearchParams(queryString);
      const rawRedirectParam = searchParams.get("redirectUrl") ?? searchParams.get("redirect");

      // Validate and sanitize the redirect path against Open Redirect attacks
      const sanitizedRedirect = sanitizeRedirectPath(rawRedirectParam);
      const targetPath = sanitizedRedirect !== null ? sanitizedRedirect : path;
      const cleanPath = targetPath.split("?")[0].replace(/^\//, "").replace(/\/$/, "");

      if (normalizedRedirects.has(cleanPath)) {
        return {
          routes: [{ name: defaultRoute }],
        };
      }
      return getStateFromPath(targetPath, opts);
    },
    getPathFromState(state, opts) {
      const generatedPath = getPathFromState(state, opts);
      if (generatedPath === "" || generatedPath === "/") {
        return defaultPath;
      }
      return generatedPath;
    },
  };
};
