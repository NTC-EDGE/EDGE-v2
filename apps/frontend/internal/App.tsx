import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { tokenCache } from "./tokenCache";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  ClerkProvider,
  createStaticNavigation,
  useNavigationContainerRef,
  ParamListBase,
  RouteProp,
  createNativeStackNavigator,
} from "@edge/ui";
import {
  AuthProvider,
  useAuthContext,
} from "./src/features/auth/context/AuthContext";
import { RoleProvider } from "./src/features/shell/context/RoleContext";
import { DashboardShell } from "./src/features/shell/components/DashboardShell";
import { DashboardScreen } from "./src/features/dashboard/screens/DashboardScreen";
import { QueueScreen } from "./src/features/queue/screens/QueueScreen";

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
    <View style={styles.placeholderContainer}>
      <View style={[styles.placeholderCard, SHADOWS.card]}>
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
const RootStack = createNativeStackNavigator({
  initialRouteName: "Dashboard",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    animation: "fade",
  },
  screens: {
    Dashboard: { screen: DashboardScreen },
    Activities: { screen: QueueScreen },
    Chat: { screen: PlaceholderScreen },
    Meet: { screen: PlaceholderScreen },
    Reports: { screen: PlaceholderScreen },
    ReceiptManagement: { screen: PlaceholderScreen },
    RolesPermission: { screen: PlaceholderScreen },
    Schedule: { screen: PlaceholderScreen },
    Employees: { screen: PlaceholderScreen },
    Users: { screen: PlaceholderScreen },
    Settings: { screen: PlaceholderScreen },
  },
});

const Navigation = createStaticNavigation(RootStack);

interface ClerkErrorItem {
  message: string;
}

interface ClerkErrorResponse {
  errors: ClerkErrorItem[];
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function isClerkError(err: unknown): err is ClerkErrorResponse {
  if (!isObject(err)) {
    return false;
  }
  const errors = err.errors;
  if (!Array.isArray(errors)) {
    return false;
  }
  return errors.every((item): boolean => {
    if (!isObject(item)) {
      return false;
    }
    return typeof item.message === "string";
  });
}

function AuthScreen() {
  const { loginWithClerk, signUpWithClerk, verifySignUp } = useAuthContext();
  const [mode, setMode] = useState<"signin" | "signup" | "verify">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthError = (err: unknown, defaultMsg: string) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (isClerkError(err)) {
      if (err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError(defaultMsg);
      }
    } else {
      setError(defaultMsg);
    }
  };

  const handleSignIn = async () => {
    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await loginWithClerk(email, password);
    } catch (err: unknown) {
      handleAuthError(err, "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const isComplete = await signUpWithClerk(email, password);
      if (isComplete) {
        // Handled by active session detection
      } else {
        setMode("verify");
      }
    } catch (err: unknown) {
      handleAuthError(err, "Failed to create account. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (code.trim() === "") {
      setError("Please enter the verification code.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await verifySignUp(code);
    } catch (err: unknown) {
      handleAuthError(err, "Incorrect verification code. Please check and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: "signin" | "signup" | "verify") => {
    setMode(newMode);
    setError("");
    setCode("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authBg}>
          <View style={[styles.authCard, SHADOWS.modal]}>
            <View style={styles.authLogo}>
              <Lucide name="shield" size={24} color={COLORS.brand[700]} />
            </View>
            <Text style={styles.authTitle}>NTC-EDGE Staff Portal</Text>

            {mode === "signin" && (
              <>
                <Text style={styles.authSubtitle}>Authentication Required</Text>
                <TextInput
                  autoCapitalize="none"
                  placeholder="Email Address"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  editable={!isSubmitting}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={COLORS.neutral[400]}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  editable={!isSubmitting}
                />

                {error.length > 0 ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.authButton, isSubmitting && styles.authButtonDisabled]}
                  onPress={handleSignIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.neutral.white} />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => switchMode("signup")} disabled={isSubmitting}>
                  <Text style={styles.authToggleText}>
                    Don't have an account? <Text style={styles.authToggleLink}>Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {mode === "signup" && (
              <>
                <Text style={styles.authSubtitle}>Create Your Account</Text>
                <TextInput
                  autoCapitalize="none"
                  placeholder="Email Address"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  editable={!isSubmitting}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={COLORS.neutral[400]}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  editable={!isSubmitting}
                />

                {error.length > 0 ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.authButton, isSubmitting && styles.authButtonDisabled]}
                  onPress={handleSignUp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.neutral.white} />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => switchMode("signin")} disabled={isSubmitting}>
                  <Text style={styles.authToggleText}>
                    Already have an account? <Text style={styles.authToggleLink}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {mode === "verify" && (
              <>
                <Text style={styles.authSubtitle}>Verify Your Email</Text>
                <Text style={styles.verifyDescription}>
                  We sent a verification code to {email}. Please enter it below to complete registration.
                </Text>

                <TextInput
                  autoCapitalize="none"
                  placeholder="Verification Code"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={code}
                  onChangeText={setCode}
                  style={styles.input}
                  editable={!isSubmitting}
                />

                {error.length > 0 ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.authButton, isSubmitting && styles.authButtonDisabled]}
                  onPress={handleVerify}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.neutral.white} />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Sign Up</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => switchMode("signup")} disabled={isSubmitting}>
                  <Text style={styles.authToggleText}>
                    Back to <Text style={styles.authToggleLink}>Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigationRef = useNavigationContainerRef<ParamListBase>();
  const [activeScreen, setActiveScreen] = useState("Dashboard");

  // Track the current route inside the stack to sync the Sidebar highlights
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = navigationRef.addListener("state", () => {
      const route = navigationRef.getCurrentRoute();
      if (route !== null && route !== undefined) {
        setActiveScreen(route.name);
      }
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
    return <AuthScreen />;
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
      <Navigation ref={navigationRef} />
    </DashboardShell>
  );
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AuthProvider>
        <RoleProvider>
          <AppContent />
          <StatusBar style="dark" />
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
  keyboardAvoid: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  authBg: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING[20],
  },
  authCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[40],
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  authLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[20],
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  authTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 6,
  },
  authSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
    marginBottom: SPACING[24],
    textAlign: "center",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    color: COLORS.neutral[900],
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    ...Platform.select({
      web: {
        outlineWidth: 0,
        transition: 'all 200ms ease-out',
      },
    }),
  },
  authButton: {
    width: "100%",
    height: 40,
    backgroundColor: COLORS.brand[700],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 8,
    ...Platform.select({
      web: {
        transition: 'background-color 200ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  bypassButton: {
    width: "100%",
    height: 40,
    backgroundColor: 'transparent',
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 12,
    ...Platform.select({
      web: {
        transition: 'all 200ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  bypassButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  bypassButtonText: {
    color: COLORS.neutral[600],
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  errorText: {
    color: COLORS.semantic.error,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  authToggleText: {
    color: COLORS.neutral[500],
    fontSize: 13,
    marginTop: SPACING[16],
    fontFamily: TYPOGRAPHY.fonts.primary,
    textAlign: "center",
  },
  authToggleLink: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  verifyDescription: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    textAlign: "center",
    marginBottom: SPACING[16],
    lineHeight: 18,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[20],
  },
  placeholderCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[32],
    maxWidth: 600,
    alignItems: "center",
    textAlign: "center",
  },
  placeholderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[12],
  },
  placeholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: "center",
    lineHeight: 22,
  },
});
