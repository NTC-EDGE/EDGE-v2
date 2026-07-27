import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
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
import { PermissionProvider } from "./src/features/shell/context/PermissionContext";
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
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. Clerk will not initialize properly.",
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigationRef = useNavigationContainerRef<ParamListBase>();
  const [activeScreen, setActiveScreen] = useState("Dashboard");

  // Sync root URL '/' to '/internal/login' in browser address bar when unauthenticated and update document title based on auth state and active screen
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
    if (
      !isAuthenticated &&
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.location !== undefined
    ) {
      const hasClerkParam = window.location.search.includes("__clerk");
      if (
        !hasClerkParam &&
        (window.location.pathname === "/" || window.location.pathname === "")
      ) {
        window.history.replaceState(null, "", "/internal/login");
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
          <PermissionProvider>
            <AppContent />
            <StatusBar style="dark" />
          </PermissionProvider>
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
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.brand[700],
  },
});
