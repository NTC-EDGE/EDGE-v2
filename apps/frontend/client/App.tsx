import { StatusBar } from "expo-status-bar";
import { useAuth } from "@clerk/expo";
import { ClerkProvider } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import { tokenCache } from "@clerk/expo/token-cache";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Icon, TYPOGRAPHY, ThemeProvider } from "@edge/ui";
import { setTokenProvider, usePublicSystemConfig } from "@edge/api";
import { UnauthNavigation, AuthNavigation, clientLinking } from "./src/routes";
import { ToastProvider } from "./src/shared/components/Toast";

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
  const { isSignedIn, isLoaded, getToken, signOut } = useAuth();
  const {
    config: publicConfig,
    isLoading: isCheckingConfig,
    refetch: refetchPublicConfig,
  } = usePublicSystemConfig({
    revalidateOnFocus: true,
    refreshInterval: 15000,
  });
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

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

  // Prevent browser default behavior on web (navigating or opening files dropped on window)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const preventDefaultWindowDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("dragover", preventDefaultWindowDrop);
    window.addEventListener("drop", preventDefaultWindowDrop);

    return () => {
      window.removeEventListener("dragover", preventDefaultWindowDrop);
      window.removeEventListener("drop", preventDefaultWindowDrop);
    };
  }, []);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  // Full Maintenance Mode Lockout: disable all account and portal interactions for Client users
  if (publicConfig.clientMaintenanceMode) {
    const handleCheckStatus = async () => {
      setIsRefreshingStatus(true);
      try {
        await refetchPublicConfig();
      } finally {
        setIsRefreshingStatus(false);
      }
    };

    return (
      <View style={maintenanceStyles.overlayContainer}>
        <View style={maintenanceStyles.card}>
          <View style={maintenanceStyles.accentBar} />
          <View style={maintenanceStyles.badgePill}>
            <Icon name="alert-triangle" size={14} color="#D97706" />
            <Text style={maintenanceStyles.badgeText}>
              SCHEDULED SYSTEM MAINTENANCE
            </Text>
          </View>

          <View style={maintenanceStyles.iconCircle}>
            <Icon name="tool" size={32} color="#D97706" />
          </View>

          <Text style={maintenanceStyles.title}>
            {publicConfig.systemName} is Under Maintenance
          </Text>

          <Text style={maintenanceStyles.description}>
            The portal is currently undergoing scheduled maintenance initiated by the System Administrator. To protect your applications and account records, all client account interactions, application submissions, and payment transactions are temporarily disabled.
          </Text>

          <View style={maintenanceStyles.infoBox}>
            <Icon name="info" size={16} color="#1E40AF" />
            <Text style={maintenanceStyles.infoText}>
              Please try again shortly. For urgent regulatory assistance, contact{" "}
              <Text style={{ fontWeight: "700", color: "#0F2C59" }}>
                {publicConfig.supportEmail}
              </Text>
              .
            </Text>
          </View>

          <View style={maintenanceStyles.buttonGroup}>
            <TouchableOpacity
              onPress={handleCheckStatus}
              disabled={isRefreshingStatus || isCheckingConfig}
              style={maintenanceStyles.primaryBtn}
              activeOpacity={0.85}
            >
              <Icon name="refresh-cw" size={15} color="#FFFFFF" />
              <Text style={maintenanceStyles.primaryBtnText}>
                {isRefreshingStatus ? "Checking Status..." : "Check System Status"}
              </Text>
            </TouchableOpacity>

            {isSignedIn && (
              <TouchableOpacity
                onPress={() => {
                  void signOut();
                }}
                style={maintenanceStyles.secondaryBtn}
                activeOpacity={0.8}
              >
                <Icon name="log-out" size={15} color="#475569" />
                <Text style={maintenanceStyles.secondaryBtnText}>Sign Out of Account</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return <UnauthNavigation linking={clientLinking} />;
  }

  return <AuthNavigation linking={clientLinking} />;
}

const maintenanceStyles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: "#0F2C59",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "#D97706",
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 18,
    marginTop: 6,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.6,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
    textAlign: "center",
    marginBottom: 18,
  },
  infoBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 22,
  },
  infoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 18,
    color: "#1E3A8A",
    flex: 1,
  },
  buttonGroup: {
    width: "100%",
    gap: 10,
  },
  primaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F2C59",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  secondaryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
          <ToastProvider>
            <AppContent />
            <StatusBar style="dark" />
          </ToastProvider>
        </ClerkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
