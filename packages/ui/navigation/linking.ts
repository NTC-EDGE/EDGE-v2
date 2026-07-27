import { getStateFromPath, getPathFromState, type LinkingOptions } from "@react-navigation/native";

/**
 * Dynamically resolves linking prefixes for Expo apps on Web (Vercel/Production) and Native.
 * Prioritizes dynamic browser window.location.origin, environment variables, app schemes, and dev ports.
 */
export const getPrefixes = (): string[] => {
  const prefixes: string[] = [];

  // 1. Dynamic Browser Origin (Web / Vercel deployment)
  if (typeof window !== "undefined" && window.location !== undefined && typeof window.location.origin === "string") {
    if (window.location.origin.length > 0 && !prefixes.includes(window.location.origin)) {
      prefixes.push(window.location.origin);
    }
  }

  // 2. Environment-Configured App Domain (if specified in EXPO_PUBLIC_APP_URL / NEXT_PUBLIC_APP_URL)
  const envAppUrl = process.env.EXPO_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (typeof envAppUrl === "string" && envAppUrl.length > 0 && !prefixes.includes(envAppUrl)) {
    prefixes.push(envAppUrl);
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
 * preserving deep link return URLs (?redirectUrl=... or ?redirect=...) post-authentication.
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
    getStateFromPath(path: string, opts?: Parameters<typeof getStateFromPath>[1]) {
      // Check for redirect query parameters (e.g. /login?redirect=/employees)
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const searchParams = new URLSearchParams(queryString);
      const redirectParam = searchParams.get("redirectUrl") ?? searchParams.get("redirect");

      const targetPath = (redirectParam !== null && redirectParam.length > 0) ? redirectParam : path;
      const cleanPath = targetPath.split("?")[0].replace(/^\//, "").replace(/\/$/, "");

      if (normalizedRedirects.has(cleanPath)) {
        return {
          routes: [{ name: defaultRoute }],
        };
      }
      return getStateFromPath(targetPath, opts);
    },
    getPathFromState(state: Parameters<typeof getPathFromState>[0], opts?: Parameters<typeof getPathFromState>[1]) {
      const generatedPath = getPathFromState(state, opts);
      if (generatedPath === "" || generatedPath === "/") {
        return defaultPath;
      }
      return generatedPath;
    },
  };
};
