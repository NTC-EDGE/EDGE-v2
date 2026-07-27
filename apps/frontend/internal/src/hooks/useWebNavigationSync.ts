import { useEffect } from "react";
import { Platform } from "react-native";
import { type NavigationContainerRef, type ParamListBase } from "@edge/ui";

/**
 * Runtime Type Guard to safely extract title string without type assertions.
 */
function extractTitleString(target: unknown): string | null {
  if (target !== null && typeof target === "object" && "title" in target) {
    const value = Reflect.get(target, "title");
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return null;
}

/**
 * Custom Hook: Syncs browser tab titles directly using navigator screen titles on Web.
 */
export function useWebMetadata(isAuthenticated: boolean, screenTitle: string): void {
  useEffect(() => {
    if (Platform.OS !== "web") return;

    if (typeof document !== "undefined") {
      if (!isAuthenticated) {
        document.title = "Login | EDGE";
      } else {
        document.title = `${screenTitle} | EDGE`;
      }
    }

    // Preserve Target Deep Link when Unauthenticated
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
  }, [isAuthenticated, screenTitle]);
}

/**
 * Custom Hook: Tracks current React Navigation stack route and repurposes Navigator screen titles safely without type assertions.
 */
export function useRouteTracker(
  isAuthenticated: boolean,
  navigationRef: NavigationContainerRef<ParamListBase>,
  onRouteChanged: (routeName: string, title: string) => void
): void {
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncActiveScreen = () => {
      if (navigationRef.isReady()) {
        const route = navigationRef.getCurrentRoute();
        if (route?.name !== undefined && route.name !== null) {
          const currentOptions = navigationRef.getCurrentOptions();
          const optionsTitle = extractTitleString(currentOptions);
          const paramTitle = extractTitleString(route.params);
          const title = optionsTitle ?? paramTitle ?? route.name;
          onRouteChanged(route.name, title);
        }
      }
    };

    syncActiveScreen();

    const unsubscribe = navigationRef.addListener("state", syncActiveScreen);
    return unsubscribe;
  }, [isAuthenticated, navigationRef, onRouteChanged]);
}
