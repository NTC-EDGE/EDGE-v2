import React, { useEffect } from "react";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ActivityIndicator, View } from "react-native";
import { UnauthNavigation, AuthNavigation, clientLinking } from "./src/routes/index";
import { setTokenProvider } from "@edge/api";

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
  const clerkAuth = useAuth();
  const { isSignedIn, isLoaded } = clerkAuth;

  // Register Clerk's getToken callback with the API tokenManager service to populate authorization headers
  useEffect(() => {
    if (isSignedIn && clerkAuth.getToken) {
      setTokenProvider(clerkAuth.getToken);
    } else {
      setTokenProvider(null);
    }
  }, [isSignedIn, clerkAuth.getToken]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <UnauthNavigation linking={clientLinking} />;
  }

  return <AuthNavigation linking={clientLinking} />;
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AppContent />
    </ClerkProvider>
  );
}
