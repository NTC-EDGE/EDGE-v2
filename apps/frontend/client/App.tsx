import { StatusBar } from "expo-status-bar";
import { useAuth } from "@clerk/expo";
import { ClerkProvider } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import { tokenCache } from "@clerk/expo/token-cache";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import { ThemeProvider } from "@edge/ui";
import { setTokenProvider } from "@edge/api";
import { UnauthNavigation, AuthNavigation, clientLinking } from "./src/routes";

WebBrowser.maybeCompleteAuthSession();

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
  const { isSignedIn, isLoaded, getToken } = useAuth();

  // Register Clerk's getToken with the API tokenManager so the Axios interceptor
  // can attach Bearer tokens on every outgoing request. Without this, the
  // interceptor's null-check deletes any manually-set Authorization headers → 401.
  useEffect(() => {
    if (isSignedIn && getToken) {
      setTokenProvider(getToken);
    } else {
      setTokenProvider(null);
    }
  }, [isSignedIn, getToken]);

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
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <AppContent />
        <StatusBar style="dark" />
      </ClerkProvider>
    </ThemeProvider>
  );
}
