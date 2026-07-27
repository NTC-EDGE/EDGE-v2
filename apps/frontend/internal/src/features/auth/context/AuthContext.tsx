import { createContext, useContext, ReactNode, useState } from "react";
import { useAuth, useUser, useSignIn, useSignUp } from "@clerk/expo";

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

    const res = await signIn.password({
      emailAddress: email,
      password,
    });

    if (res.error !== null && res.error !== undefined) {
      throw new Error(res.error.message || "Invalid email or password.");
    }

    if (signIn.status === "complete") {
      await signIn.finalize();
    } else {
      throw new Error(`Authentication incomplete: status is ${signIn.status}`);
    }
  };

  const signUpWithClerk = async (email: string, password: string): Promise<boolean> => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }

    if (signUp === null || signUp === undefined) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    const res = await signUp.password({
      emailAddress: email,
      password,
    });

    if (res.error !== null && res.error !== undefined) {
      throw new Error(res.error.message || "Sign up failed.");
    }

    if (signUp.status === "complete") {
      await signUp.finalize();
      return true;
    }

    await signUp.verifications.sendEmailCode();
    return false;
  };

  const verifySignUp = async (code: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }

    if (signUp === null || signUp === undefined) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize();
    } else {
      throw new Error(`Sign up incomplete: status is ${signUp.status}`);
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
