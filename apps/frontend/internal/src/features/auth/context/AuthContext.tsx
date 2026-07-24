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

const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClerkEnabled =
    typeof CLERK_PUBLISHABLE_KEY === "string" &&
    CLERK_PUBLISHABLE_KEY.length > 0;

  const [selectedRegionState, setSelectedRegionState] = useState<string | undefined>(undefined);

  // Clerk hooks (safe to call even if key is empty, but they won't trigger authenticated states)
  const clerkAuth = useAuth();
  const clerkUser = useUser();
  const signInResult = useSignIn();
  const signUpResult = useSignUp();

  const loginWithClerk = async (email: string, password: string, region?: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }
    const { signIn } = signInResult;
    if (signIn === null) {
      throw new Error(
        "Authentication service is not loaded yet. Please try again.",
      );
    }

    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message || "Invalid email or password.");
    }

    if (signIn.status === "complete") {
      const finalizeResult = await signIn.finalize();
      if (finalizeResult.error) {
        throw new Error(finalizeResult.error.message || "Sign-in finalization failed.");
      }
    } else {
      throw new Error(
        `Authentication incomplete: status is ${signIn.status}`,
      );
    }
  };

  const signUpWithClerk = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }
    const { signUp } = signUpResult;
    if (signUp === null) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    const result = await signUp.create({
      emailAddress: email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message || "Sign up failed.");
    }

    if (signUp.status === "complete") {
      const finalizeResult = await signUp.finalize();
      if (finalizeResult.error) {
        throw new Error(finalizeResult.error.message || "Sign up finalization failed.");
      }
      return true;
    }

    // Prepare email verification strategy by default
    const prepareResult = await signUp.verifications.sendEmailCode();
    if (prepareResult.error) {
      throw new Error(prepareResult.error.message || "Sending verification code failed.");
    }
    return false;
  };

  const verifySignUp = async (code: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }
    const { signUp } = signUpResult;
    if (signUp === null) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    const result = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (result.error) {
      throw new Error(result.error.message || "Verification code is incorrect.");
    }

    if (signUp.status === "complete") {
      const finalizeResult = await signUp.finalize();
      if (finalizeResult.error) {
        throw new Error(finalizeResult.error.message || "Sign up finalization failed.");
      }
    } else {
      throw new Error(`Sign up incomplete: status is ${signUp.status}`);
    }
  };

  const logout = async () => {
    if (isClerkEnabled && clerkAuth.signOut !== undefined) {
      await clerkAuth.signOut();
    }
  };

  const isAuthenticated = isClerkEnabled && (clerkAuth.isSignedIn ?? false);
  const isLoading = isClerkEnabled ? !clerkAuth.isLoaded : false;

  let activeUser: UserProfile | null = null;
  if (
    isClerkEnabled &&
    clerkUser.user !== null &&
    clerkUser.user !== undefined
  ) {
    const firstName = clerkUser.user.firstName ?? "";
    const lastName = clerkUser.user.lastName ?? "";
    const username = clerkUser.user.username ?? "";
    const name =
      clerkUser.user.fullName ?? (firstName || lastName ? `${firstName} ${lastName}`.trim() : "Staff User");
    const email =
      clerkUser.user.primaryEmailAddress?.emailAddress ?? "staff@edge.gov";
    const avatarUrl = clerkUser.user.imageUrl;
    activeUser = { name, email, username, firstName, lastName, avatarUrl, region: selectedRegionState };
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: activeUser,
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

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
