import { createContext, useContext, ReactNode, useState } from "react";
import { useAuth, useUser, useSignIn, useSignUp, isClerkAPIResponseError } from "@clerk/expo";
import { validateTenantRegionAccess } from "@edge/api";

export interface UserProfile {
  name: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  region?: string;
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

/**
 * Safely parses Clerk API error responses to preserve exact root causes (e.g. rate limits like too_many_requests)
 * while returning clear messaging for incorrect credentials or region mismatches.
 */
export const parseClerkAuthError = (err: unknown): string => {
  if (err === null || err === undefined) {
    return "Authentication failed. Please try again.";
  }

  if (isClerkAPIResponseError(err) && err.errors.length > 0) {
    const firstErr = err.errors[0];
    const code = firstErr.code ?? "";
    const message = firstErr.message ?? "";

    if (code === "too_many_requests" || code.includes("rate_limit")) {
      return message || "Too many requests. Please try again in a bit.";
    }
    if (code === "form_identifier_not_found" || code === "form_password_incorrect") {
      return "Authentication Failed: Invalid credentials, wrong password, or the wrong region selected.";
    }
    if (message.trim().length > 0) {
      return message;
    }
  }

  if (typeof err === "object" && err !== null) {
    const record = err as Record<string, unknown>;

    // Handle res.error payload from Clerk SDK methods
    if ("error" in record && record.error !== null && typeof record.error === "object") {
      const clerkErr = record.error as Record<string, unknown>;
      const code = typeof clerkErr.code === "string" ? clerkErr.code : "";
      const message = typeof clerkErr.message === "string" ? clerkErr.message : "";

      if (code === "too_many_requests" || code.includes("rate_limit")) {
        return message || "Too many requests. Please try again in a bit.";
      }
      if (code === "form_identifier_not_found" || code === "form_password_incorrect") {
        return "Authentication Failed: Invalid credentials, wrong password, or the wrong region selected.";
      }
      if (message.trim().length > 0) {
        return message;
      }
    }

    if ("message" in record && typeof record.message === "string" && record.message.trim().length > 0) {
      return record.message;
    }
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }

  return "Authentication Failed: Invalid credentials, wrong password, or the wrong region selected.";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClerkEnabled = typeof CLERK_PUBLISHABLE_KEY === "string" && CLERK_PUBLISHABLE_KEY.length > 0;
  const [selectedRegionState, setSelectedRegionState] = useState<string | undefined>(undefined);

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

    if (region !== undefined) {
      setSelectedRegionState(region);
    }

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

        // Validate Backend Tenant-Region Authorization after authentication
        if (clerkUser.user !== null && clerkUser.user !== undefined && region !== undefined) {
          const metadata = (clerkUser.user.publicMetadata ?? clerkUser.user.unsafeMetadata ?? {}) as Record<string, unknown>;
          const userAssignedRegion = typeof metadata.region === "string" ? metadata.region : undefined;

          const validation = validateTenantRegionAccess(userAssignedRegion, region);
          if (!validation.isAuthorized) {
            if (clerkAuth.signOut !== undefined) {
              await clerkAuth.signOut();
            }
            throw new Error(validation.errorReason ?? "Access Denied: Regional tenant mismatch.");
          }
        }
      } else {
        throw new Error(`Authentication incomplete: status is ${signIn.status}`);
      }
    } catch (err: unknown) {
      const parsedError = parseClerkAuthError(err);
      throw new Error(parsedError);
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
      const parsedError = parseClerkAuthError(err);
      throw new Error(parsedError);
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
      const parsedError = parseClerkAuthError(err);
      throw new Error(parsedError);
    }
  };

  const logout = async () => {
    if (isClerkEnabled && clerkAuth.signOut !== undefined) {
      await clerkAuth.signOut();
    }
  };

  // Derive User Profile from Clerk or Fallback for Development
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
    };
  } else if (!isClerkEnabled) {
    user = {
      name: "Staff User",
      email: "staff@ntc.gov.ph",
      region: selectedRegionState ?? "NCR",
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
