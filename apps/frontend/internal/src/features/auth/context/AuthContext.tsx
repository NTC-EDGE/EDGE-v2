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

  // Clerk hooks
  const clerkAuth = useAuth();
  const clerkUser = useUser();
  const signInHook = useSignIn();
  const signUpHook = useSignUp();

  const signInRecord = signInHook as unknown as Record<string, unknown>;
  const signUpRecord = signUpHook as unknown as Record<string, unknown>;

  const isSignInLoaded = Boolean(signInRecord.isLoaded);
  const isSignUpLoaded = Boolean(signUpRecord.isLoaded);

  const loginWithClerk = async (email: string, password: string, region?: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }
    const signInObj = signInRecord.signIn as {
      create: (params: { identifier: string; password: string }) => Promise<{ status: string; createdSessionId: string }>;
    } | undefined;

    if (!isSignInLoaded || signInObj === null || signInObj === undefined) {
      throw new Error("Authentication service is not loaded yet. Please try again.");
    }

    if (region !== undefined) {
      setSelectedRegionState(region);
    }

    const result = await signInObj.create({
      identifier: email,
      password,
    });

    const setActiveFn = signInRecord.setActive as ((params: { session: string }) => Promise<void>) | undefined;

    if (result.status === "complete") {
      if (setActiveFn !== undefined) {
        await setActiveFn({ session: result.createdSessionId });
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
    const signUpObj = signUpRecord.signUp as {
      create: (params: { emailAddress: string; password: string }) => Promise<{ status: string; createdSessionId: string }>;
      prepareEmailAddressVerification: (params: { strategy: string }) => Promise<void>;
    } | undefined;

    if (!isSignUpLoaded || signUpObj === null || signUpObj === undefined) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    const result = await signUpObj.create({
      emailAddress: email,
      password,
    });

    const setActiveFn = signUpRecord.setActive as ((params: { session: string }) => Promise<void>) | undefined;

    if (result.status === "complete") {
      if (setActiveFn !== undefined) {
        await setActiveFn({ session: result.createdSessionId });
      }
      return true;
    }

    await signUpObj.prepareEmailAddressVerification({ strategy: "email_code" });
    return false;
  };

  const verifySignUp = async (code: string) => {
    if (!isClerkEnabled) {
      throw new Error("Clerk publishable key is not configured.");
    }
    const signUpObj = signUpRecord.signUp as {
      attemptEmailAddressVerification: (params: { code: string }) => Promise<{ status: string; createdSessionId: string }>;
    } | undefined;

    if (!isSignUpLoaded || signUpObj === null || signUpObj === undefined) {
      throw new Error("Sign up service is not loaded yet. Please try again.");
    }

    const result = await signUpObj.attemptEmailAddressVerification({
      code,
    });

    const setActiveFn = signUpRecord.setActive as ((params: { session: string }) => Promise<void>) | undefined;

    if (result.status === "complete") {
      if (setActiveFn !== undefined) {
        await setActiveFn({ session: result.createdSessionId });
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

  // Derive User Profile from Clerk or Fallback
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
    // Simulated User for Development when Clerk key is absent
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
