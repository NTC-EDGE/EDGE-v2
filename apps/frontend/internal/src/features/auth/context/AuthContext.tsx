import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useAuth, useUser, useSignIn, useSignUp } from "@clerk/expo";
import {
  parseApiError,
  verifyStaffMembership,
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
  const clerkAuth = useAuth();
  const clerkUser = useUser();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

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

  // Restore stored region code on page reload and verify membership before mounting /dashboard
  useEffect(() => {
    let isMounted = true;

    async function restoreAndVerifyRegion() {
      if (!isClerkEnabled) {
        if (isMounted) setIsRestoringSession(false);
        return;
      }

      if (!clerkAuth.isLoaded) {
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
      if (storedRegion === null || storedRegion.trim().length === 0) {
        if (isMounted) setIsRestoringSession(false);
        return;
      }

      try {
        if (getTokenRef.current !== undefined) {
          setTokenProvider(getTokenRef.current);
        }
        const token = getTokenRef.current ? await getTokenRef.current() : null;
        if (token !== null && token.length > 0) {
          setAuthToken(token);
        }

        const verifiedClaims = await verifyStaffMembership(token, storedRegion);
        if (isMounted) {
          setTenantId(verifiedClaims.tenantId ?? null);
          setBackendStaffClaims({
            userId: verifiedClaims.userId,
            tenantId: verifiedClaims.tenantId,
            tenantName: verifiedClaims.tenantName,
            roles: verifiedClaims.assignedRoles,
            permissions: verifiedClaims.effectivePermissions,
          });
          setSelectedRegionState(storedRegion);
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
  }, [isClerkEnabled, clerkAuth.isLoaded, clerkAuth.isSignedIn]);

  const loginWithClerk = async (email: string, password: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }

    if (signIn === null || signIn === undefined) {
      throw new Error("Authentication service is not loaded yet. Please try again.");
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
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
