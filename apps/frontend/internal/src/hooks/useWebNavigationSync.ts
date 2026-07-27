import { useEffect } from "react";
import { Platform } from "react-native";
import { type NavigationContainerRef, type ParamListBase } from "@edge/ui";

/**
 * Custom Hook: Syncs browser tab titles and handles deep-link preservation on Web when unauthenticated.
 */
export function useWebMetadata(isAuthenticated: boolean, activeScreen: string): void {
  useEffect(() => {
    if (Platform.OS !== "web") return;

    // 1. Sync Document Title
    if (typeof document !== "undefined") {
      if (!isAuthenticated) {
        document.title = "Login";
      } else {
        const formattedTitle = activeScreen
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str: string) => str.toUpperCase())
          .trim();
        document.title = `${formattedTitle} | EDGE`;
      }
    }

    // 2. Preserve Target Deep Link when Unauthenticated
    if (!isAuthenticated && typeof window !== "undefined" && window.location !== undefined) {
      const hasClerkParam = window.location.search.includes("__clerk");
      if (!hasClerkParam) {
        const currentPath = window.location.pathname;
        if (currentPath === "/" || currentPath === "") {
          window.history.replaceState(null, "", "/internal/login");
        } else if (currentPath !== "/internal/login" && !currentPath.startsWith("/internal/login")) {
          const redirectUrl = encodeURIComponent(currentPath + window.location.search);
          window.history.replaceState(null, "", `/internal/login?redirect=${redirectUrl}`);
        }
      }
    }
  }, [isAuthenticated, activeScreen]);
}

/**
 * Custom Hook: Tracks current React Navigation stack route to synchronize Sidebar menu highlights.
 */
export function useRouteTracker(
  isAuthenticated: boolean,
  navigationRef: NavigationContainerRef<ParamListBase>,
  onRouteChanged: (routeName: string) => void
): void {
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncActiveScreen = () => {
      if (navigationRef.isReady()) {
        const route = navigationRef.getCurrentRoute();
        if (route?.name !== undefined && route.name !== null) {
          onRouteChanged(route.name);
        }
      }
    };

    syncActiveScreen();

    const unsubscribe = navigationRef.addListener("state", syncActiveScreen);
    return unsubscribe;
  }, [isAuthenticated, navigationRef, onRouteChanged]);
}
