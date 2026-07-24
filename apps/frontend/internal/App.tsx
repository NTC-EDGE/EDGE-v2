import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  Text,
} from "react-native";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import {
  COLORS,
  createNativeStackNavigator,
  createStaticNavigation,
  getPathFromState,
  getStateFromPath,
  RouteProp,
  SHADOWS,
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

import { EmployeesScreen } from "./src/features/employees/screens/EmployeesScreen";
import { UsersScreen } from "./src/features/users/screens/UsersScreen";
import { InternalLoginPage } from "./src/features/login/components/InternalLoginPage";
import { DashboardScreen } from "./src/features/dashboard/screens/DashboardScreen";
import { ActivitiesScreen } from "./src/features/queue/screens/ActivitiesScreen";

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
    <View style={styles.loadingContainer}>
      <View style={[SHADOWS.card]}>
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
const UnauthStack = createNativeStackNavigator({
  initialRouteName: "InternalLogin",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    animation: "fade",
  },
  screens: {
    InternalLogin: {
      screen: InternalLoginPage,
      path: "internal/login",
      options: {
        title: "Login",
      },
    },
  },
});

const AuthStack = createNativeStackNavigator({
  initialRouteName: "Dashboard",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    animation: "fade",
  },
  screens: {
    Dashboard: { screen: DashboardScreen, path: "dashboard" },
    Activities: { screen: ActivitiesScreen, path: "activities" },
    Chat: { screen: PlaceholderScreen, path: "chat" },
    Meet: { screen: PlaceholderScreen, path: "meet" },
    Reports: { screen: PlaceholderScreen, path: "reports" },
    ReceiptManagement: {
      screen: PlaceholderScreen,
      path: "receipt-management",
    },
    RolesPermission: { screen: PlaceholderScreen, path: "roles-permissions" },
    Schedule: { screen: PlaceholderScreen, path: "schedule" },
    Employees: { screen: EmployeesScreen, path: "employees" },
    Users: { screen: UsersScreen, path: "users" },
    Settings: { screen: PlaceholderScreen, path: "settings" },
  },
});

const UnauthNavigation = createStaticNavigation(UnauthStack);
const AuthNavigation = createStaticNavigation(AuthStack);

const getPrefixes = (): string[] => {
  const prefixes = [
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:8083",
    "edge://",
  ];
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

const unauthLinking = {
  prefixes: getPrefixes(),
  getStateFromPath(
    path: string,
    options?: Parameters<typeof getStateFromPath>[1],
  ) {
    return {
      routes: [{ name: "InternalLogin" }],
    };
  },
  getPathFromState(
    state: Parameters<typeof getPathFromState>[0],
    options?: Parameters<typeof getPathFromState>[1],
  ) {
    return "/internal/login";
  },
};

const authLinking = {
  prefixes: getPrefixes(),
  getStateFromPath(
    path: string,
    options?: Parameters<typeof getStateFromPath>[1],
  ) {
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
  getPathFromState(
    state: Parameters<typeof getPathFromState>[0],
    options?: Parameters<typeof getPathFromState>[1],
  ) {
    const generatedPath = getPathFromState(state, options);
    if (generatedPath === "" || generatedPath === "/") {
      return "/dashboard";
    }
    return generatedPath;
  },
};

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
