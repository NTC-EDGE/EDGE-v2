import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth, useUser, useSignIn, useSignUp } from '@clerk/clerk-expo';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loginWithClerk: (email: string, password: string) => Promise<void>;
  signUpWithClerk: (email: string, password: string) => Promise<boolean>;
  verifySignUp: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClerkEnabled = typeof CLERK_PUBLISHABLE_KEY === 'string' && CLERK_PUBLISHABLE_KEY.length > 0;

  // Clerk hooks (safe to call even if key is empty, but they won't trigger authenticated states)
  const clerkAuth = useAuth();
  const clerkUser = useUser();
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const loginWithClerk = async (email: string, password: string) => {
    if (!isClerkEnabled) {
      throw new Error('Clerk publishable key is not configured.');
    }
    if (!isSignInLoaded) {
      throw new Error('Authentication service is not loaded yet. Please try again.');
    }

    const completeSignIn = await signIn.create({
      identifier: email,
      password,
    });

    if (completeSignIn.status === 'complete') {
      await setSignInActive({ session: completeSignIn.createdSessionId });
    } else {
      throw new Error(`Authentication incomplete: status is ${completeSignIn.status}`);
    }
  };

  const signUpWithClerk = async (email: string, password: string): Promise<boolean> => {
    if (!isClerkEnabled) {
      throw new Error('Clerk publishable key is not configured.');
    }
    if (!isSignUpLoaded) {
      throw new Error('Sign up service is not loaded yet. Please try again.');
    }

    const completeSignUp = await signUp.create({
      emailAddress: email,
      password,
    });

    if (completeSignUp.status === 'complete') {
      await setSignUpActive({ session: completeSignUp.createdSessionId });
      return true;
    }

    // Prepare email verification strategy by default
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    return false;
  };

  const verifySignUp = async (code: string) => {
    if (!isClerkEnabled) {
      throw new Error('Clerk publishable key is not configured.');
    }
    if (!isSignUpLoaded) {
      throw new Error('Sign up service is not loaded yet. Please try again.');
    }

    const completeSignUp = await signUp.attemptEmailAddressVerification({
      code,
    });

    if (completeSignUp.status === 'complete') {
      await setSignUpActive({ session: completeSignUp.createdSessionId });
    } else {
      throw new Error(`Sign up incomplete: status is ${completeSignUp.status}`);
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
  if (isClerkEnabled && clerkUser.user !== null && clerkUser.user !== undefined) {
    const name = clerkUser.user.fullName ?? clerkUser.user.firstName ?? 'Staff User';
    const email = clerkUser.user.primaryEmailAddress?.emailAddress ?? 'staff@edge.gov';
    const avatarUrl = clerkUser.user.imageUrl;
    activeUser = { name, email, avatarUrl };
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
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
