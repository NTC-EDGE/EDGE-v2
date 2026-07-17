import React, { useState, useEffect } from "react";
import {
  createStaticNavigation,
  useNavigationContainerRef,
  ParamListBase,
  RouteProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "./tokenCache";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "./src/features/shared/theme/tokens";
import {
  AuthProvider,
  useAuthContext,
} from "./src/features/auth/context/AuthContext";
import { RoleProvider } from "./src/features/shell/context/RoleContext";
import { DashboardShell } from "./src/features/shell/components/DashboardShell";
import { DashboardScreen } from "./src/features/dashboard/screens/DashboardScreen";
import { QueueScreen } from "./src/features/queue/screens/QueueScreen";

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

// Fallback Placeholder screen for role specific navigation links
function PlaceholderScreen({
  route,
}: {
  route: RouteProp<ParamListBase, string>;
}) {
  const name = route.name;

  // Format the camelCase name into a user friendly title (e.g. AuditLogs -> Audit Logs)
  const formattedName = name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str: string) => str.toUpperCase())
    .trim();

  return (
    <View style={styles.placeholderContainer}>
      <View style={[styles.placeholderCard, SHADOWS.card]}>
        <Text style={styles.placeholderTitle}>{formattedName} Portal</Text>
        <Text style={styles.placeholderText}>
          This sub-module is currently undergoing staging and compliance
          verification. All interactions are simulated under the active role
          constraints.
        </Text>
      </View>
    </View>
  );
}

// React Navigation 8 Static configuration
const RootStack = createNativeStackNavigator({
  initialRouteName: "Dashboard",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
  },
  screens: {
    Dashboard: { screen: DashboardScreen },
    Activities: { screen: QueueScreen },
    Chat: { screen: PlaceholderScreen },
    Meet: { screen: PlaceholderScreen },
    Reports: { screen: PlaceholderScreen },
    ReceiptManagement: { screen: PlaceholderScreen },
    RolesPermission: { screen: PlaceholderScreen },
    Schedule: { screen: PlaceholderScreen },
    Employees: { screen: PlaceholderScreen },
    Users: { screen: PlaceholderScreen },
    Settings: { screen: PlaceholderScreen },
  },
});

const Navigation = createStaticNavigation(RootStack);

function AuthScreen() {
  const { loginWithBypass } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState("");

  return (
    <View style={styles.authBg}>
      <View style={[styles.authCard, SHADOWS.modal]}>
        <Text style={styles.authTitle}>NTC-EDGE Staff Portal</Text>
        <Text style={styles.authSubtitle}>Authentication Required</Text>

        <TextInput
          autoCapitalize="none"
          placeholder="Email Address"
          placeholderTextColor={COLORS.neutral[400]}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={COLORS.neutral[400]}
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {error.length > 0 ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity style={styles.authButton} onPress={() => {}}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Developer Bypass (active in dev mode) */}
        {__DEV__ ? (
          <TouchableOpacity
            style={[styles.authButton, styles.bypassButton]}
            onPress={loginWithBypass}
          >
            <Text style={styles.buttonText}>Developer Login Bypass</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigationRef = useNavigationContainerRef<ParamListBase>();
  const [activeScreen, setActiveScreen] = useState("Dashboard");

  // Track the current route inside the stack to sync the Sidebar highlights
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = navigationRef.addListener("state", () => {
      const route = navigationRef.getCurrentRoute();
      if (route !== null && route !== undefined) {
        setActiveScreen(route.name);
      }
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
    return <AuthScreen />;
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
      <Navigation ref={navigationRef} />
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
  authBg: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING[20],
  },
  authCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[40],
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
  },
  authTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  authSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    marginBottom: SPACING[32],
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 44,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    color: COLORS.neutral[900],
    borderRadius: RADIUS.input,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  authButton: {
    width: "100%",
    height: 44,
    backgroundColor: COLORS.brand[800],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.button,
    marginTop: 10,
  },
  bypassButton: {
    backgroundColor: COLORS.neutral[800],
    marginTop: 12,
  },
  buttonText: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  errorText: {
    color: COLORS.semantic.error,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[20],
  },
  placeholderCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[32],
    maxWidth: 600,
    alignItems: "center",
    textAlign: "center",
  },
  placeholderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[12],
  },
  placeholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: "center",
    lineHeight: 22,
  },
});
