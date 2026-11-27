import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useAuth, useClerk, useUser, useSignIn, useSignUp } from "@clerk/expo";
import { Icon, TYPOGRAPHY } from "@edge/ui";
import {
  parseApiError,
  verifyStaffMembership,
  fetchMyTenantMemberships,
  usePublicSystemConfig,
  setTokenProvider,
  setAuthToken,
  setTenantId,
  clearTokenState,
  clearApiCache,
  subscribeUnauthorized,
  generateSafeUsername,
  isClerkUnknownParamError,
} from "@edge/api";
import { RegionSelectionModal } from "../../login/components/RegionSelectionModal";
import {
  MfaOtpVerificationModal,
  MfaStrategy,
  SupportedFactor,
} from "../../login/components/MfaOtpVerificationModal";

const SELECTED_REGION_STORAGE_KEY = "ntc_edge_selected_region_code";

async function getStoredRegionCode(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(SELECTED_REGION_STORAGE_KEY);
      }
      return null;
    }
    return await SecureStore.getItemAsync(SELECTED_REGION_STORAGE_KEY);
  } catch {
    return null;
  }
}

async function setStoredRegionCode(code: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(SELECTED_REGION_STORAGE_KEY, code);
      }
      return;
    }
    await SecureStore.setItemAsync(SELECTED_REGION_STORAGE_KEY, code);
  } catch {
    // Ignore storage write errors
  }
}

async function removeStoredRegionCode(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(SELECTED_REGION_STORAGE_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(SELECTED_REGION_STORAGE_KEY);
  } catch {
    // Ignore storage delete errors
  }
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  region?: string;
  tenantId?: string;
  tenantName?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loginWithClerk: (email: string, password: string) => Promise<void>;
  signUpWithClerk: (email: string, password: string) => Promise<boolean>;
  verifySignUp: (code: string) => Promise<void>;
  verifyMfaOtp: (strategy: MfaStrategy, code: string) => Promise<void>;
  resendMfaOtp: (strategy: MfaStrategy) => Promise<void>;
  mfaFactors: SupportedFactor[] | null;
  cancelMfaVerification: () => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  clerkUser: ReturnType<typeof useUser>['user'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

function extractSafeIdentifier(factor: unknown): string | undefined {
  if (typeof factor === "object" && factor !== null) {
    const val = Reflect.get(factor, "safeIdentifier");
    if (typeof val === "string") return val;
  }
  return undefined;
}

function extractStrategy(factor: unknown): MfaStrategy | undefined {
  if (typeof factor === "object" && factor !== null) {
    const val = Reflect.get(factor, "strategy");
    if (val === "email_code" || val === "phone_code" || val === "totp") {
      return val;
    }
  }
  return undefined;
}

function isHttpStatusError(err: unknown, targetStatus: number): boolean {
  if (typeof err !== "object" || err === null) return false;
  const response = Reflect.get(err, "response");
  if (typeof response !== "object" || response === null) return false;
  return Reflect.get(response, "status") === targetStatus;
}

function isSuperAdminClerkUser(cu: ReturnType<typeof useUser>["user"]): boolean {
  if (cu === null || cu === undefined) return false;
  const primaryEmail = (cu.primaryEmailAddress?.emailAddress ?? cu.emailAddresses[0]?.emailAddress ?? "").toLowerCase();
  if (primaryEmail.includes("superadmin") || primaryEmail === "superadmin@ntcedge.com") {
    return true;
  }
  const pubMeta = cu.publicMetadata;
  if (typeof pubMeta === "object" && pubMeta !== null) {
    if (pubMeta["is_super_admin"] === true || pubMeta["role"] === "superadmin") {
      return true;
    }
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClerkEnabled = typeof CLERK_PUBLISHABLE_KEY === "string" && CLERK_PUBLISHABLE_KEY.trim().length > 0;
  const [selectedRegionState, setSelectedRegionState] = useState<string | undefined>(undefined);
  const [isMembershipVerified, setIsMembershipVerified] = useState<boolean>(false);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(true);
  const [mfaFactors, setMfaFactors] = useState<SupportedFactor[] | null>(null);

  const [backendStaffClaims, setBackendStaffClaims] = useState<{
    userId?: string;
    tenantId?: string;
    tenantName?: string;
    roles?: string[];
    permissions?: string[];
  }>({});

  // Clerk custom flow hooks (Clerk Expo SDK v3)
  const clerk = useClerk();
  const clerkAuth = useAuth();
  const clerkUser = useUser();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  // Complete same-tab Web SSO redirect callbacks cleanly inside the active window
  const ssoCallbackHandledRef = useRef(false);
  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      typeof window === "undefined" ||
      !isClerkEnabled ||
      !clerkAuth.isLoaded ||
      ssoCallbackHandledRef.current
    ) {
      return;
    }

    const search = window.location.search;
    const isSsoCallback =
      search.includes("sso_callback=1") ||
      search.includes("__clerk_status") ||
      search.includes("rotating_token_nonce");

    if (!isSsoCallback) {
      return;
    }

    ssoCallbackHandledRef.current = true;
    const handleCallbackFn =
      typeof clerk === "object" && clerk !== null
        ? Reflect.get(clerk, "handleRedirectCallback")
        : undefined;

    if (typeof handleCallbackFn === "function") {
      void Promise.resolve(
        Reflect.apply(handleCallbackFn, clerk, [
          {
            signInFallbackRedirectUrl: "/dashboard",
            signUpFallbackRedirectUrl: "/internal/login",
          },
        ])
      ).catch((err: unknown) => {
        console.error("[AuthContext] Clerk SSO redirect callback error:", err);
      });
    }
  }, [isClerkEnabled, clerkAuth.isLoaded, clerk]);

  const getTokenRef = useRef(clerkAuth.getToken);
  getTokenRef.current = clerkAuth.getToken;

  const signOutRef = useRef(clerkAuth.signOut);
  signOutRef.current = clerkAuth.signOut;

  const isMembershipVerifiedRef = useRef(isMembershipVerified);
  isMembershipVerifiedRef.current = isMembershipVerified;

  const isLoggingOutRef = useRef(false);

  // Register Clerk's getToken callback with the API tokenManager service
  useEffect(() => {
    if (isClerkEnabled && clerkAuth.isSignedIn && clerkAuth.getToken !== undefined) {
      setTokenProvider(clerkAuth.getToken);
    } else {
      setTokenProvider(null);
    }
  }, [isClerkEnabled, clerkAuth.isSignedIn, clerkAuth.getToken]);

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    if (Platform.OS === "web" && typeof window !== "undefined" && window.history !== undefined) {
      window.history.replaceState(null, "", "/internal/login");
    }

    clearTokenState();
    await removeStoredRegionCode();
    setIsMembershipVerified(false);
    setSelectedRegionState(undefined);
    setMfaFactors(null);
    setBackendStaffClaims({});

    try {
      await clearApiCache();
    } catch {
      // Ignore SWR cache clear errors
    }

    try {
      if (isClerkEnabled && signOutRef.current !== undefined) {
        await signOutRef.current();
      }
    } catch (err: unknown) {
      console.error("[AuthContext] Clerk signOut error:", err);
    } finally {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.history !== undefined) {
        window.history.replaceState(null, "", "/internal/login");
      }
      isLoggingOutRef.current = false;
    }
  }, [isClerkEnabled]);

  // Automatically evict stale/unauthorized sessions on terminal 401 while inside the portal
  useEffect(() => {
    return subscribeUnauthorized(() => {
      if (isMembershipVerifiedRef.current) {
        void logout();
      }
    });
  }, [logout]);

  // Public System Configuration (Security: SESSION_TIMEOUT_MINS, MAX_FAILED_LOGINS & Maintenance Lockout)
  const {
    config: publicConfig,
    isLoading: isCheckingConfig,
    refetch: refetchPublicConfig,
  } = usePublicSystemConfig({
    revalidateOnFocus: true,
    refreshInterval: 15000,
  });
  const [isRefreshingMaintenance, setIsRefreshingMaintenance] = useState(false);
  const failedLoginCountRef = useRef<number>(0);
  const lockoutUntilMsRef = useRef<number>(0);

  // Enforce configured SESSION_TIMEOUT_MINS idle session timeout for authenticated internal officers
  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      typeof window === "undefined" ||
      !isMembershipVerified ||
      publicConfig.sessionTimeoutMins <= 0
    ) {
      return;
    }

    const timeoutMs = publicConfig.sessionTimeoutMins * 60 * 1000;
    let idleTimerId: ReturnType<typeof setTimeout> | null = null;

    const resetIdleTimer = () => {
      if (idleTimerId !== null) {
        clearTimeout(idleTimerId);
      }
      idleTimerId = setTimeout(() => {
        if (isMembershipVerifiedRef.current) {
          void logout();
        }
      }, timeoutMs);
    };

    const activityEvents = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    for (const evt of activityEvents) {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    }
    resetIdleTimer();

    return () => {
      if (idleTimerId !== null) {
        clearTimeout(idleTimerId);
      }
      for (const evt of activityEvents) {
        window.removeEventListener(evt, resetIdleTimer);
      }
    };
  }, [isMembershipVerified, publicConfig.sessionTimeoutMins, logout]);

  // Restore stored region code on page reload and verify membership before mounting /dashboard
  useEffect(() => {
    let isMounted = true;

    async function restoreAndVerifyRegion() {
      if (!isClerkEnabled) {
        if (isMounted) setIsRestoringSession(false);
        return;
      }

      if (!clerkAuth.isLoaded || !clerkUser.isLoaded) {
        return;
      }

      if (!clerkAuth.isSignedIn) {
        clearTokenState();
        if (isMounted) {
          setIsMembershipVerified(false);
          setSelectedRegionState(undefined);
          setBackendStaffClaims({});
          setIsRestoringSession(false);
        }
        return;
      }

      if (isMembershipVerifiedRef.current) {
        if (isMounted) setIsRestoringSession(false);
        return;
      }

      if (isMounted) setIsRestoringSession(true);

      const storedRegion = await getStoredRegionCode();

      try {
        if (getTokenRef.current !== undefined) {
          setTokenProvider(getTokenRef.current);
        }
        const token = getTokenRef.current ? await getTokenRef.current() : null;
        if (token !== null && token.length > 0) {
          setAuthToken(token);
        }

        let targetRegionCode = storedRegion !== null && storedRegion.trim().length > 0 ? storedRegion.trim() : null;

        // If no stored region exists yet (e.g. fresh login), check if the user is a single-tenant non-SuperAdmin staff member
        if (targetRegionCode === null) {
          const isSuperAdmin = isSuperAdminClerkUser(clerkUser.user);
          if (!isSuperAdmin) {
            const memberships = await fetchMyTenantMemberships(token);
            const activeMemberships = memberships.filter((m) => m.isActive !== false);
            if (activeMemberships.length === 1) {
              targetRegionCode = activeMemberships[0].regionCode;
            }
          }
        }

        if (targetRegionCode === null) {
          if (isMounted) setIsRestoringSession(false);
          return;
        }

        const verifiedClaims = await verifyStaffMembership(token, targetRegionCode);
        const confirmedRegionCode = verifiedClaims.regionCode || targetRegionCode;
        if (isMounted) {
          setTenantId(verifiedClaims.tenantId ?? null);
          setBackendStaffClaims({
            userId: verifiedClaims.userId,
            tenantId: verifiedClaims.tenantId,
            tenantName: verifiedClaims.tenantName,
            roles: verifiedClaims.assignedRoles,
            permissions: verifiedClaims.effectivePermissions,
          });
          await setStoredRegionCode(confirmedRegionCode);
          setSelectedRegionState(confirmedRegionCode);
          setIsMembershipVerified(true);
          setIsRestoringSession(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setTenantId(null);
          setAuthToken(null);
          await removeStoredRegionCode();
          setIsMembershipVerified(false);
          setSelectedRegionState(undefined);
          setBackendStaffClaims({});

          if (isHttpStatusError(err, 401)) {
            try {
              if (signOutRef.current !== undefined) {
                await signOutRef.current();
              }
            } catch {
              // Ignore Clerk signOut error
            }
          }

          setIsRestoringSession(false);
        }
      }
    }

    void restoreAndVerifyRegion();

    return () => {
      isMounted = false;
    };
  }, [isClerkEnabled, clerkAuth.isLoaded, clerkAuth.isSignedIn, clerkUser.isLoaded, clerkUser.user]);

  const loginWithClerk = async (email: string, password: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }

    if (publicConfig.internalMaintenanceMode) {
      throw new Error(
        `${publicConfig.systemName} Internal Officer Portal is currently under scheduled maintenance. Officer account sign-in and portal interactions are temporarily disabled.`
      );
    }

    if (signIn === null || signIn === undefined) {
      throw new Error("Authentication service is not loaded yet. Please try again.");
    }

    if (lockoutUntilMsRef.current > Date.now()) {
      const remainingMins = Math.max(1, Math.ceil((lockoutUntilMsRef.current - Date.now()) / 60000));
      throw new Error(
        `Maximum failed sign-in attempts (${publicConfig.maxFailedLogins}) reached. Please wait ${remainingMins} minute(s) before trying again.`
      );
    }

    await removeStoredRegionCode();
    setIsMembershipVerified(false);
    setSelectedRegionState(undefined);
    setMfaFactors(null);

    // Step 1: Regular Clerk Credentials Authentication
    try {
      let res;
      try {
        res = await signIn.password({
          emailAddress: email,
          password,
        });

        if (res.error !== null && res.error !== undefined) {
          throw res.error;
        }
      } catch (pwErr: unknown) {
        const errMsg = pwErr instanceof Error ? pwErr.message : String(pwErr);
        const errCode = typeof pwErr === "object" && pwErr !== null ? Reflect.get(pwErr, "code") : undefined;
        const rawErrors = typeof pwErr === "object" && pwErr !== null ? Reflect.get(pwErr, "errors") : undefined;
        const hasStrategyInvalidEntry =
          Array.isArray(rawErrors) &&
          rawErrors.some(
            (entry: unknown) =>
              typeof entry === "object" &&
              entry !== null &&
              Reflect.get(entry, "code") === "strategy_for_user_invalid"
          );
        const isStrategyInvalid =
          errMsg.includes("strategy_for_user_invalid") ||
          errMsg.includes("verification strategy is not valid") ||
          errCode === "strategy_for_user_invalid" ||
          hasStrategyInvalidEntry;

        const createFn = typeof signIn === "object" && signIn !== null ? Reflect.get(signIn, "create") : undefined;
        if (isStrategyInvalid && typeof createFn === "function") {
          await Reflect.apply(createFn, signIn, [{ identifier: email }]);
        } else {
          throw pwErr;
        }
      }

      if (signIn.status === "complete") {
        failedLoginCountRef.current = 0;
        lockoutUntilMsRef.current = 0;
        await signIn.finalize();
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust" ||
        signIn.status === "needs_first_factor"
      ) {
        // Extract supported factors (email_code, phone_code, totp)
        const factors: SupportedFactor[] = [];
        const rawFactors = signIn.supportedSecondFactors ?? signIn.supportedFirstFactors ?? [];

        for (const f of rawFactors) {
          const strat = extractStrategy(f);
          if (strat !== undefined) {
            factors.push({
              strategy: strat,
              safeIdentifier: extractSafeIdentifier(f),
            });
          }
        }

        if (factors.length === 0) {
          factors.push({ strategy: "email_code", safeIdentifier: email });
        }

        // Trigger initial code dispatch for email/phone if applicable
        try {
          if (factors[0].strategy === "email_code") {
            await signIn.emailCode.sendCode();
          } else if (factors[0].strategy === "phone_code") {
            await signIn.phoneCode.sendCode();
          }
        } catch {
          // Code might already be dispatched automatically by Clerk
        }

        setMfaFactors(factors);
      } else {
        throw new Error(`Authentication incomplete: status is ${signIn.status}`);
      }
    } catch (err: unknown) {
      setIsMembershipVerified(false);
      setMfaFactors(null);
      failedLoginCountRef.current += 1;
      if (
        publicConfig.maxFailedLogins > 0 &&
        failedLoginCountRef.current >= publicConfig.maxFailedLogins
      ) {
        lockoutUntilMsRef.current = Date.now() + 5 * 60 * 1000;
        failedLoginCountRef.current = 0;
        throw new Error(
          `Maximum failed sign-in attempts (${publicConfig.maxFailedLogins}) reached. Account temporarily locked for 5 minutes.`
        );
      }
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }
  };

  const verifyMfaOtp = async (strategy: MfaStrategy, code: string) => {
    if (signIn === null || signIn === undefined) {
      throw new Error("Authentication service is not loaded yet.");
    }

    try {
      if (strategy === "email_code") {
        const res = await signIn.emailCode.verifyCode({ code });
        if (res.error) throw res.error;
      } else if (strategy === "phone_code") {
        const res = await signIn.phoneCode.verifyCode({ code });
        if (res.error) throw res.error;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        setMfaFactors(null);
      } else {
        throw new Error(`Verification incomplete: status is ${signIn.status}`);
      }
    } catch (err: unknown) {
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }
  };

  const resendMfaOtp = async (strategy: MfaStrategy) => {
    if (signIn === null || signIn === undefined) return;
    try {
      if (strategy === "email_code") {
        await signIn.emailCode.sendCode();
      } else if (strategy === "phone_code") {
        await signIn.phoneCode.sendCode();
      }
    } catch (err: unknown) {
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }
  };

  const cancelMfaVerification = () => {
    setMfaFactors(null);
  };

  const handleConfirmRegion = async (selectedRegionCode: string) => {
    try {
      if (clerkAuth.getToken !== undefined) {
        setTokenProvider(clerkAuth.getToken);
      }
      const token = clerkAuth.getToken ? await clerkAuth.getToken() : null;
      if (token !== null && token.length > 0) {
        setAuthToken(token);
      }
      const verifiedClaims = await verifyStaffMembership(token, selectedRegionCode);

      setTenantId(verifiedClaims.tenantId ?? null);
      setBackendStaffClaims({
        userId: verifiedClaims.userId,
        tenantId: verifiedClaims.tenantId,
        tenantName: verifiedClaims.tenantName,
        roles: verifiedClaims.assignedRoles,
        permissions: verifiedClaims.effectivePermissions,
      });

      await setStoredRegionCode(selectedRegionCode);
      setSelectedRegionState(selectedRegionCode);
      setIsMembershipVerified(true);
    } catch (err: unknown) {
      setTenantId(null);
      setIsMembershipVerified(false);
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }
  };

  const signUpWithClerk = async (email: string, password: string): Promise<boolean> => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }

    if (signUp === null || signUp === undefined) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    try {
      const safeUsername = generateSafeUsername(undefined, undefined, email);

      let res;
      try {
        res = await signUp.password({
          emailAddress: email,
          password,
          username: safeUsername,
        });
      } catch (firstErr: unknown) {
        if (isClerkUnknownParamError(firstErr)) {
          res = await signUp.password({
            emailAddress: email,
            password,
          });
        } else {
          throw firstErr;
        }
      }

      if (res.error !== null && res.error !== undefined) {
        throw res.error;
      }

      if (signUp.status === "complete") {
        await signUp.finalize();
        return true;
      }

      await signUp.verifications.sendEmailCode();
      return false;
    } catch (err: unknown) {
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }
  };

  const verifySignUp = async (code: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }

    if (signUp === null || signUp === undefined) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    try {
      await signUp.verifications.verifyEmailCode({ code });

      if (signUp.status === "complete") {
        await signUp.finalize();
      } else {
        throw new Error(`Sign up incomplete: status is ${signUp.status}`);
      }
    } catch (err: unknown) {
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }
  };

  // User profile derived strictly from verified Clerk & Backend claims (never mock-authenticated)
  let user: UserProfile | null = null;
  const isAuthenticated =
    isClerkEnabled &&
    Boolean(clerkAuth.isLoaded) &&
    Boolean(clerkAuth.isSignedIn) &&
    isMembershipVerified;

  if (isClerkEnabled && Boolean(clerkAuth.isSignedIn) && clerkUser.user !== null && clerkUser.user !== undefined) {
    const cu = clerkUser.user;
    const primaryEmail = cu.primaryEmailAddress?.emailAddress ?? cu.emailAddresses[0]?.emailAddress ?? "";
    const combinedFirstLast = [cu.firstName, cu.lastName].filter(Boolean).join(" ").trim();
    const resolvedDisplayName =
      (typeof cu.fullName === "string" && cu.fullName.trim().length > 0 ? cu.fullName.trim() : "") ||
      combinedFirstLast ||
      (typeof cu.username === "string" && cu.username.trim().length > 0 ? cu.username.trim() : "") ||
      primaryEmail ||
      "User";

    user = {
      id: backendStaffClaims.userId ?? cu.id,
      name: resolvedDisplayName,
      email: primaryEmail,
      username: cu.username ?? undefined,
      firstName: cu.firstName ?? undefined,
      lastName: cu.lastName ?? undefined,
      avatarUrl: cu.imageUrl ?? undefined,
      region: selectedRegionState,
      tenantId: backendStaffClaims.tenantId,
      tenantName: backendStaffClaims.tenantName,
      roles: backendStaffClaims.roles,
      permissions: backendStaffClaims.permissions,
    };
  }

  const isLoading = isClerkEnabled ? !clerkAuth.isLoaded || isRestoringSession : false;

  // Show Region Selection Modal when signed in with Clerk, session check completed, and region is not yet confirmed
  const showRegionModal =
    isClerkEnabled &&
    Boolean(clerkAuth.isLoaded) &&
    Boolean(clerkAuth.isSignedIn) &&
    !isRestoringSession &&
    !isMembershipVerified;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loginWithClerk,
        signUpWithClerk,
        verifySignUp,
        verifyMfaOtp,
        resendMfaOtp,
        mfaFactors,
        cancelMfaVerification,
        logout,
        isLoading,
        clerkUser: clerkUser.user,
      }}
    >
      {publicConfig.internalMaintenanceMode ? (
        <View style={internalMaintenanceStyles.overlayContainer}>
          <View style={internalMaintenanceStyles.card}>
            <View style={internalMaintenanceStyles.accentBar} />
            <View style={internalMaintenanceStyles.badgePill}>
              <Icon name="alert-triangle" size={14} color="#D97706" />
              <Text style={internalMaintenanceStyles.badgeText}>
                INTERNAL PORTAL • MAINTENANCE LOCKOUT
              </Text>
            </View>

            <View style={internalMaintenanceStyles.iconCircle}>
              <Icon name="lock" size={30} color="#D97706" />
            </View>

            <Text style={internalMaintenanceStyles.title}>
              {publicConfig.systemName} is Under Scheduled Maintenance
            </Text>

            <Text style={internalMaintenanceStyles.description}>
              The System Administrator has placed the portal in Maintenance Mode. All internal officer account interactions, application evaluations, Statement of Account / Order of Payment approvals, and cashier transactions are temporarily disabled until maintenance is turned off.
            </Text>

            <View style={internalMaintenanceStyles.infoBox}>
              <Icon name="info" size={16} color="#1E40AF" />
              <Text style={internalMaintenanceStyles.infoText}>
                If you are a System Administrator, use the Admin Portal System Configuration to disable Maintenance Mode. Support contact:{" "}
                <Text style={{ fontWeight: "700", color: "#0F2C59" }}>
                  {publicConfig.supportEmail}
                </Text>
              </Text>
            </View>

            <View style={internalMaintenanceStyles.buttonGroup}>
              <TouchableOpacity
                onPress={async () => {
                  setIsRefreshingMaintenance(true);
                  try {
                    await refetchPublicConfig();
                  } finally {
                    setIsRefreshingMaintenance(false);
                  }
                }}
                disabled={isRefreshingMaintenance || isCheckingConfig}
                style={internalMaintenanceStyles.primaryBtn}
                activeOpacity={0.85}
              >
                <Icon name="refresh-cw" size={15} color="#FFFFFF" />
                <Text style={internalMaintenanceStyles.primaryBtnText}>
                  {isRefreshingMaintenance ? "Checking Status..." : "Check System Status"}
                </Text>
              </TouchableOpacity>

              {Boolean(clerkAuth.isSignedIn) && (
                <TouchableOpacity
                  onPress={() => {
                    void logout();
                  }}
                  style={internalMaintenanceStyles.secondaryBtn}
                  activeOpacity={0.8}
                >
                  <Icon name="log-out" size={15} color="#475569" />
                  <Text style={internalMaintenanceStyles.secondaryBtnText}>
                    Sign Out of Officer Account
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : (
        <>
          {children}
          {mfaFactors !== null && mfaFactors.length > 0 ? (
            <MfaOtpVerificationModal
              visible={mfaFactors !== null && mfaFactors.length > 0}
              supportedFactors={mfaFactors}
              onVerifyOtp={verifyMfaOtp}
              onResendOtp={resendMfaOtp}
              onCancel={cancelMfaVerification}
            />
          ) : null}
          {showRegionModal ? (
            <RegionSelectionModal
              visible={showRegionModal}
              onConfirmRegion={handleConfirmRegion}
              onSignOut={logout}
            />
          ) : null}
        </>
      )}
    </AuthContext.Provider>
  );
}

const internalMaintenanceStyles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
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

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
