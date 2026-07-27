import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "./tokenCache";
import {
  COLORS,
  useNavigationContainerRef,
  type ParamListBase,
} from "@edge/ui";
import {
  AuthProvider,
  useAuthContext,
} from "./src/features/auth/context/AuthContext";
import { RoleProvider } from "./src/features/shell/context/RoleContext";
import { DashboardShell } from "./src/features/shell/components/DashboardShell";
import {
  UnauthNavigation,
  AuthNavigation,
  unauthLinking,
  authLinking,
} from "./src/navigation";

const getClerkKey = (): string => {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (typeof key === "string" && key.length > 0) {
    return key;
  }
  return "";
};

const publishableKey = getClerkKey();

if (publishableKey.length === 0) {
  console.warn(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. Clerk will not initialize properly."
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigationRef = useNavigationContainerRef<ParamListBase>();
  const [activeScreen, setActiveScreen] = useState("Dashboard");

  // Sync root URL and preserve target deep link when unauthenticated; update document title on state change
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
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
    if (!isAuthenticated && Platform.OS === "web" && typeof window !== "undefined" && window.location !== undefined) {
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

  // Track the current route inside the stack to sync the Sidebar highlights
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncActiveScreen = () => {
      if (navigationRef.isReady()) {
        const route = navigationRef.getCurrentRoute();
        if (route !== null && route !== undefined) {
          setActiveScreen(route.name);
        }
      }
    };

    syncActiveScreen();

    const unsubscribe = navigationRef.addListener("state", () => {
      syncActiveScreen();
    });

    return unsubscribe;
  }, [isAuthenticated, navigationRef]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brand[800]} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <UnauthNavigation linking={unauthLinking} />;
  }

  return (
    <DashboardShell
      activeScreen={activeScreen}
      onNavigate={(screen) => {
        if (navigationRef.isReady()) {
          navigationRef.navigate(screen);
        }
      }}
    >
      <AuthNavigation ref={navigationRef} linking={authLinking} />
    </DashboardShell>
  );
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AuthProvider>
        <RoleProvider>
          <AppContent />
          <StatusBar style="dark" />
        </RoleProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
