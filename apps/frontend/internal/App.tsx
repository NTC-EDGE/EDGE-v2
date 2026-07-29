import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "./tokenCache";
import { AuthProvider } from "./src/features/auth/context/AuthContext";
import { RoleProvider } from "./src/features/shell/context/RoleContext";
import { PermissionProvider } from "./src/features/shell/context/PermissionContext";
import { RootNavigator } from "./src/navigation";

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

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AuthProvider>
        <RoleProvider>
          <PermissionProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </PermissionProvider>
        </RoleProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}
