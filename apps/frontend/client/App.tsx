import React from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "./tokenCache";
import { UnauthenticatedStack, type UnauthParamList } from "./src/routes/public";
import { AuthenticatedStack, type AuthParamList } from "./src/routes/auth";

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

const UnauthNavigation = createStaticNavigation(UnauthenticatedStack);
const AuthNavigation = createStaticNavigation(AuthenticatedStack);

const unauthLinking = {
  prefixes: ["http://localhost:8082", "http://localhost:8081", "edge://"],
};

const authLinking = {
  prefixes: ["http://localhost:8082", "http://localhost:8081", "edge://"],
};

function AppContent() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <AuthNavigation linking={authLinking} />;
  }

  return <UnauthNavigation linking={unauthLinking} />;
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AppContent />
    </ClerkProvider>
  );
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends UnauthParamList, AuthParamList {}
  }
}
