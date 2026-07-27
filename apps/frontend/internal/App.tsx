import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  ActivityIndicator,
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
import { useWebMetadata, useRouteTracker } from "./src/hooks/useWebNavigationSync";

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

  // Refactored Custom Hooks for Web Navigation, Tab Titles, Deep-Links & Sidebar Highlights
  useWebMetadata(isAuthenticated, activeScreen);
  useRouteTracker(isAuthenticated, navigationRef, setActiveScreen);

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
