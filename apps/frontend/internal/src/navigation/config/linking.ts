import { getStateFromPath, getPathFromState, type LinkingOptions } from "@edge/ui";

const getPrefixes = (): string[] => {
  const prefixes = ["edge://"];
  if (
    typeof window !== "undefined" &&
    window.location !== undefined &&
    typeof window.location.origin === "string"
  ) {
    if (!prefixes.includes(window.location.origin)) {
      prefixes.push(window.location.origin);
    }
  }
  return prefixes;
};

/**
 * Web & Native linking configuration for unauthenticated routes in Internal app.
 */
export const unauthLinking: LinkingOptions<object> = {
  prefixes: getPrefixes(),
  getStateFromPath(path: string, options?: Parameters<typeof getStateFromPath>[1]) {
    return {
      routes: [{ name: "InternalLogin" }],
    };
  },
  getPathFromState(state: Parameters<typeof getPathFromState>[0], options?: Parameters<typeof getPathFromState>[1]) {
    return "/internal/login";
  },
};

/**
 * Web & Native linking configuration for authenticated routes in Internal app.
 * Handles root redirects (/ -> /dashboard) and legacy route aliases.
 */
export const authLinking: LinkingOptions<object> = {
  prefixes: getPrefixes(),
  getStateFromPath(path: string, options?: Parameters<typeof getStateFromPath>[1]) {
    const cleanPath = path.split("?")[0].replace(/\/$/, "");
    if (
      cleanPath === "" ||
      cleanPath === "/" ||
      cleanPath === "internal/login" ||
      cleanPath === "/internal/login" ||
      cleanPath === "internal/landing" ||
      cleanPath === "/internal/landing"
    ) {
      return {
        routes: [{ name: "Dashboard" }],
      };
    }
    return getStateFromPath(path, options);
  },
  getPathFromState(state: Parameters<typeof getPathFromState>[0], options?: Parameters<typeof getPathFromState>[1]) {
    const generatedPath = getPathFromState(state, options);
    if (generatedPath === "" || generatedPath === "/") {
      return "/dashboard";
    }
    return generatedPath;
  },
};
