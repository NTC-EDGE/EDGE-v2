import { getStateFromPath, getPathFromState, type LinkingOptions } from "@react-navigation/native";

/**
 * Resolves standard web and native deep linking prefixes for Expo apps (internal and client).
 * Supports localhost dev ports (8081, 8082, 8083), edge:// scheme, and dynamic window.location.origin on Web.
 */
export const getPrefixes = (): string[] => {
  const prefixes = [
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:8083",
    "edge://",
  ];
  if (typeof window !== "undefined" && window.location !== undefined && typeof window.location.origin === "string") {
    if (!prefixes.includes(window.location.origin)) {
      prefixes.push(window.location.origin);
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
 * Creates a clean React Navigation linking configuration with dynamic root & alias redirects,
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
