import { createContext, useContext, ReactNode, useState } from "react";
import { useAuth, useUser, useSignIn, useSignUp } from "@clerk/expo";

export interface UserProfile {
  name: string;
  email: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClerkEnabled =
    typeof CLERK_PUBLISHABLE_KEY === "string" &&
    CLERK_PUBLISHABLE_KEY.length > 0;

  const [selectedRegionState, setSelectedRegionState] = useState<string | undefined>(undefined);

  const clerkAuth = useAuth();
  const clerkUser = useUser();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const loginWithClerk = async (email: string, password: string, region?: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }
    if (!isSignInLoaded || signIn === null || signIn === undefined) {
      throw new Error("Authentication service is not loaded yet. Please try again.");
    }

    if (region !== undefined) {
      setSelectedRegionState(region);
    }

    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === "complete") {
      if (setSignInActive !== undefined) {
        await setSignInActive({ session: result.createdSessionId });
      }
    } else {
      throw new Error(`Authentication incomplete: status is ${result.status}`);
    }
  };

  const signUpWithClerk = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }
    if (!isSignUpLoaded || signUp === null || signUp === undefined) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    const result = await signUp.create({
      emailAddress: email,
      password,
    });

    if (result.status === "complete") {
      if (setSignUpActive !== undefined) {
        await setSignUpActive({ session: result.createdSessionId });
      }
      return true;
    }

    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    return false;
  };

  const verifySignUp = async (code: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }
    if (!isSignUpLoaded || signUp === null || signUp === undefined) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    const result = await signUp.attemptEmailAddressVerification({
      code,
    });

    if (result.status === "complete") {
      if (setSignUpActive !== undefined) {
        await setSignUpActive({ session: result.createdSessionId });
      }
    } else {
      throw new Error(`Sign up incomplete: status is ${result.status}`);
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
    const name =
      clerkUser.user.fullName ?? clerkUser.user.firstName ?? "Staff User";
    const email =
      clerkUser.user.primaryEmailAddress?.emailAddress ?? "staff@edge.gov";
    const avatarUrl = clerkUser.user.imageUrl;
    activeUser = { name, email, avatarUrl, region: selectedRegionState };
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
