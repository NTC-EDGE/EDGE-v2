import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { ClerkProvider } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import { tokenCache } from "./tokenCache";

WebBrowser.maybeCompleteAuthSession();
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, ThemeProvider } from "@edge/ui";
import { AuthProvider } from "./src/features/auth/context/AuthContext";
import { RoleProvider } from "./src/features/shell/context/RoleContext";
import { PermissionProvider } from "./src/features/shell/context/PermissionContext";
import { ForbiddenToastProvider } from "./src/features/shell/context/ForbiddenToastProvider";
import { RootNavigator } from "./src/navigation";

const getClerkKey = (): string => {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (typeof key === "string" && key.trim().length > 0) {
    return key.trim();
  }
  return "";
};

const publishableKey = getClerkKey();

if (publishableKey.length === 0) {
  console.error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. Clerk authentication cannot initialize.",
  );
}

export default function App() {
  if (publishableKey.length === 0) {
    return (
      <ThemeProvider>
        <View style={styles.configErrorContainer}>
          <View style={styles.configErrorCard}>
            <Text style={styles.configErrorTitle}>Authentication Configuration Missing</Text>
            <Text style={styles.configErrorBody}>
              EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not configured for this build. Please verify the environment variables and redeploy.
            </Text>
          </View>
          <StatusBar style="dark" />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ForbiddenToastProvider>
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
      </ForbiddenToastProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  configErrorContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[24],
  },
  configErrorCard: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.semantic.errorBorder,
    padding: SPACING[24],
    gap: SPACING[12],
  },
  configErrorTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.semantic.errorText,
    textAlign: "center",
  },
  configErrorBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.neutral[600],
    textAlign: "center",
  },
});
