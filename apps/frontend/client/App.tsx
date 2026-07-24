import "./src/navigation";
import { createStaticNavigation } from "@react-navigation/native";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import {
  UnauthenticatedStack,
  AuthenticatedStack,
  clientLinking,
} from "./src/routes";

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

const UnauthNavigation = createStaticNavigation(UnauthenticatedStack);
const AuthNavigation = createStaticNavigation(AuthenticatedStack);

const unauthLinking = {
  prefixes: ["http://localhost:8082", "http://localhost:8081", "edge://"],
};

const authLinking = {
  prefixes: ["http://localhost:8082", "http://localhost:8081", "edge://"],
};

import { Platform } from "react-native";
import React from "react";

const AUTH_STATE_KEY = "AUTH_NAVIGATION_STATE_V1";
const UNAUTH_STATE_KEY = "UNAUTH_NAVIGATION_STATE_V1";

function AppContent() {
  const { isSignedIn } = useAuth();

  // Temporary bypass to proceed to the authenticated section without Clerk
  const FORCE_AUTH_BYPASS = true;
  const activeIsSignedIn = isSignedIn || FORCE_AUTH_BYPASS;

  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState<any>(undefined);

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const key = activeIsSignedIn ? AUTH_STATE_KEY : UNAUTH_STATE_KEY;
        if (Platform.OS === "web") {
          const savedStateString = localStorage.getItem(key);
          if (savedStateString) {
            setInitialState(JSON.parse(savedStateString));
          } else {
            setInitialState(undefined);
          }
        }
      } catch (e) {
        console.error("Failed to restore navigation state:", e);
      } finally {
        setIsReady(true);
      }
    };

    setIsReady(false);
    restoreState();
  }, [activeIsSignedIn]);

  // Clear auth state if signing out
  React.useEffect(() => {
    if (!activeIsSignedIn && Platform.OS === "web") {
      localStorage.removeItem(AUTH_STATE_KEY);
    }
  }, [activeIsSignedIn]);

  if (!isReady) {
    return null;
  }

  if (activeIsSignedIn) {
    return (
      <AuthNavigation
        initialState={initialState}
        onStateChange={(state) => {
          if (Platform.OS === "web" && state) {
            localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state));
          }
        }}
        linking={authLinking}
      />
    );
  }

  return (
    <UnauthNavigation
      initialState={initialState}
      onStateChange={(state) => {
        if (Platform.OS === "web" && state) {
          localStorage.setItem(UNAUTH_STATE_KEY, JSON.stringify(state));
        }
      }}
      linking={unauthLinking}
    />
  );
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AppContent />
    </ClerkProvider>
  );
}
