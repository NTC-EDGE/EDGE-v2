import "./src/navigation";
import { InitialState } from "@react-navigation/native";
import { Platform } from "react-native";
import React from "react";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import {
  UnauthNavigation,
  AuthNavigation,
  clientLinking,
} from "./src/routes";

const publishableKey =
  typeof process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 0
    ? process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
    : "";

if (publishableKey.length === 0) {
  console.warn(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. Clerk will not initialize properly.",
  );
}

const AUTH_STATE_KEY = "AUTH_NAVIGATION_STATE_V1";
const UNAUTH_STATE_KEY = "UNAUTH_NAVIGATION_STATE_V1";

function AppContent() {
  const { isSignedIn } = useAuth();

  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState<
    InitialState | undefined
  >(undefined);

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const key = isSignedIn ? AUTH_STATE_KEY : UNAUTH_STATE_KEY;
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
  }, [isSignedIn]);

  // Clear auth state when signing out
  React.useEffect(() => {
    if (!isSignedIn && Platform.OS === "web") {
      localStorage.removeItem(AUTH_STATE_KEY);
    }
  }, [isSignedIn]);

  if (!isReady) {
    return null;
  }

  if (isSignedIn) {
    return (
      <AuthNavigation
        initialState={initialState}
        onStateChange={(state) => {
          if (Platform.OS === "web" && state) {
            localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state));
          }
        }}
        linking={clientLinking}
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
      linking={clientLinking}
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
