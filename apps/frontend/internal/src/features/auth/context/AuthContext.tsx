import { createContext, useContext, ReactNode, useState } from "react";
import { useAuth, useUser, useSignIn, useSignUp } from "@clerk/expo";
import { parseApiError, verifyStaffMembership } from "@edge/api";
import { RegionSelectionModal } from "../../login/components/RegionSelectionModal";
import { EmailVerificationModal } from "../../login/components/EmailVerificationModal";

export interface UserProfile {
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
  verifySignInCode: (code: string) => Promise<void>;
  pendingVerificationEmail: string | null;
  cancelSignInVerification: () => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  clerkUser: ReturnType<typeof useUser>['user'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClerkEnabled = typeof CLERK_PUBLISHABLE_KEY === "string" && CLERK_PUBLISHABLE_KEY.length > 0;
  const [selectedRegionState, setSelectedRegionState] = useState<string | undefined>(undefined);
  const [isMembershipVerified, setIsMembershipVerified] = useState<boolean>(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const [backendStaffClaims, setBackendStaffClaims] = useState<{
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

  const loginWithClerk = async (email: string, password: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }

    if (signIn === null || signIn === undefined) {
      throw new Error("Authentication service is not loaded yet. Please try again.");
    }

    setIsMembershipVerified(false);
    setSelectedRegionState(undefined);
    setPendingVerificationEmail(null);

    // Step 1: Regular Clerk Credentials Authentication
    try {
      const res = await signIn.password({
        emailAddress: email,
        password,
      });

      if (res.error !== null && res.error !== undefined) {
        throw res.error;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust" ||
        signIn.status === "needs_first_factor"
      ) {
        try {
          await signIn.emailCode.sendCode();
        } catch {
          // Code might already be dispatched automatically by Clerk
        }
        setPendingVerificationEmail(email);
      } else {
        throw new Error(`Authentication incomplete: status is ${signIn.status}`);
      }
    } catch (err: unknown) {
      setIsMembershipVerified(false);
      setPendingVerificationEmail(null);
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }
  };

  const verifySignInCode = async (code: string) => {
    if (signIn === null || signIn === undefined) {
      throw new Error("Authentication service is not loaded yet.");
    }

    try {
      const res = await signIn.emailCode.verifyCode({ code });
      if (res.error !== null && res.error !== undefined) {
        throw res.error;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        setPendingVerificationEmail(null);
      } else {
        throw new Error(`Verification incomplete: status is ${signIn.status}`);
      }
    } catch (err: unknown) {
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }
  };

  const cancelSignInVerification = () => {
    setPendingVerificationEmail(null);
  };

  const handleConfirmRegion = async (selectedRegionCode: string) => {
    try {
      const token = clerkAuth.getToken ? await clerkAuth.getToken() : null;
      const verifiedClaims = await verifyStaffMembership(token, selectedRegionCode);

      setBackendStaffClaims({
        tenantId: verifiedClaims.tenantId,
        tenantName: verifiedClaims.tenantName,
        roles: verifiedClaims.assignedRoles,
        permissions: verifiedClaims.effectivePermissions,
      });

      setSelectedRegionState(selectedRegionCode);
      setIsMembershipVerified(true);
    } catch (err: unknown) {
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
      const res = await signUp.password({
        emailAddress: email,
        password,
      });

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

  const logout = async () => {
    setIsMembershipVerified(false);
    setSelectedRegionState(undefined);
    setPendingVerificationEmail(null);
    if (isClerkEnabled && clerkAuth.signOut !== undefined) {
      await clerkAuth.signOut();
    }
    setBackendStaffClaims({});
  };

  // User profile derived from Clerk & Backend verified claims
  let user: UserProfile | null = null;
  const isAuthenticated = isClerkEnabled
    ? Boolean(clerkAuth.isSignedIn) && isMembershipVerified
    : true;

  if (isClerkEnabled && clerkUser.user !== null && clerkUser.user !== undefined) {
    const cu = clerkUser.user;
    const primaryEmail = cu.primaryEmailAddress?.emailAddress ?? cu.emailAddresses[0]?.emailAddress ?? "";

    user = {
      name: cu.fullName ?? cu.firstName ?? "User",
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
  } else if (!isClerkEnabled) {
    user = {
      name: "Staff User",
      email: "staff@ntc.gov.ph",
      region: selectedRegionState ?? "NCR",
      tenantName: "NTC Regional Office - NCR",
      roles: ["RegionalStaff"],
      permissions: ["ViewQueues"],
    };
  }

  const isLoading = isClerkEnabled ? !clerkAuth.isLoaded : false;

  // Show Region Selection Modal when signed in with Clerk but region is not yet confirmed
  const showRegionModal = isClerkEnabled && Boolean(clerkAuth.isSignedIn) && !isMembershipVerified;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loginWithClerk,
        signUpWithClerk,
        verifySignUp,
        verifySignInCode,
        pendingVerificationEmail,
        cancelSignInVerification,
        logout,
        isLoading,
        clerkUser: clerkUser.user,
      }}
    >
      {children}
      {pendingVerificationEmail !== null ? (
        <EmailVerificationModal
          visible={pendingVerificationEmail !== null}
          email={pendingVerificationEmail}
          onVerify={verifySignInCode}
          onCancel={cancelSignInVerification}
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
