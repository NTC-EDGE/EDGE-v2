import { createContext, useContext, ReactNode, useState } from "react";
import { useAuth, useUser, useSignIn, useSignUp } from "@clerk/expo";
import { parseApiError, verifyStaffMembership } from "@edge/api";

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
  loginWithClerk: (email: string, password: string, region?: string) => Promise<void>;
  signUpWithClerk: (email: string, password: string) => Promise<boolean>;
  verifySignUp: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  clerkUser: ReturnType<typeof useUser>['user'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClerkEnabled = typeof CLERK_PUBLISHABLE_KEY === "string" && CLERK_PUBLISHABLE_KEY.length > 0;
  const [selectedRegionState, setSelectedRegionState] = useState<string | undefined>(undefined);
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

  const loginWithClerk = async (email: string, password: string, region?: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }

    if (signIn === null || signIn === undefined) {
      throw new Error("Authentication service is not loaded yet. Please try again.");
    }

    const targetRegion = region ?? selectedRegionState ?? "NCR";
    setSelectedRegionState(targetRegion);

    // Step 1: Perform Clerk Identity Authentication
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
      } else {
        throw new Error(`Authentication incomplete: status is ${signIn.status}`);
      }
    } catch (err: unknown) {
      const parsedMessage = parseApiError(err);
      throw new Error(parsedMessage);
    }

    // Step 2: Perform Backend C# .NET 10 Tenant & Regional Office Verification
    try {
      const token = clerkAuth.getToken ? await clerkAuth.getToken() : null;
      const verifiedClaims = await verifyStaffMembership(token, targetRegion);

      setBackendStaffClaims({
        tenantId: verifiedClaims.tenantId,
        tenantName: verifiedClaims.tenantName,
        roles: verifiedClaims.assignedRoles,
        permissions: verifiedClaims.effectivePermissions,
      });
    } catch (backendErr: unknown) {
      // Revoke Clerk session if backend tenant-region membership verification fails
      if (clerkAuth.signOut !== undefined) {
        await clerkAuth.signOut();
      }
      const parsedBackendMessage = parseApiError(backendErr);
      throw new Error(parsedBackendMessage);
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
    if (isClerkEnabled && clerkAuth.signOut !== undefined) {
      await clerkAuth.signOut();
    }
    setBackendStaffClaims({});
  };

  // Derive User Profile from Clerk & Backend Verified Claims
  let user: UserProfile | null = null;
  const isAuthenticated = isClerkEnabled ? Boolean(clerkAuth.isSignedIn) : true;

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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loginWithClerk,
        signUpWithClerk,
        verifySignUp,
        logout,
        isLoading,
        clerkUser: clerkUser.user,
      }}
    >
      {children}
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
