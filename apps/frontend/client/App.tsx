import "./src/navigation";
import { createStaticNavigation } from "@react-navigation/native";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
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
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. Clerk will not initialize properly."
  );
}

const UnauthNavigation = createStaticNavigation(UnauthenticatedStack);
const AuthNavigation = createStaticNavigation(AuthenticatedStack);

function AppContent() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <AuthNavigation linking={clientLinking} />;
  }

  return <UnauthNavigation linking={clientLinking} />;
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AppContent />
    </ClerkProvider>
  );
}
