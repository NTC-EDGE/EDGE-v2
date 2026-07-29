import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import {
  createStaticNavigation,
  useNavigationContainerRef,
  type ParamListBase,
  COLORS,
} from "@edge/ui";
import { UnauthStack } from "./stacks/UnauthStack";
import { AuthStack } from "./stacks/AuthStack";
import { unauthLinking, authLinking } from "./config/linking";
import { useAuthContext } from "../features/auth/context/AuthContext";
import { AppLayout } from "../features/shell/components/AppLayout";
import {
  useWebMetadata,
  useRouteTracker,
} from "../hooks/useWebNavigationSync";

const UnauthNavigation = createStaticNavigation(UnauthStack);
const AuthNavigation = createStaticNavigation(AuthStack);

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigationRef = useNavigationContainerRef<ParamListBase>();
  const [activeScreen, setActiveScreen] = useState(
    isAuthenticated ? "Dashboard" : "Landing"
  );
  const [screenTitle, setScreenTitle] = useState(
    isAuthenticated ? "Dashboard" : "Welcome"
  );

  useWebMetadata(isAuthenticated, screenTitle);
  useRouteTracker(isAuthenticated, navigationRef, (routeName, title) => {
    setActiveScreen(routeName);
    setScreenTitle(title);
  });

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
    <AppLayout
      activeScreen={activeScreen}
      onNavigate={(screen) => {
        if (navigationRef.isReady()) {
          navigationRef.navigate(screen);
        }
      }}
    >
      <AuthNavigation ref={navigationRef} linking={authLinking} />
    </AppLayout>
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
