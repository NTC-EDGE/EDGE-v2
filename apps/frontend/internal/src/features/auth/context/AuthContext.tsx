import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isBypassed: boolean;
  loginWithBypass: () => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClerkEnabled = typeof CLERK_PUBLISHABLE_KEY === 'string' && CLERK_PUBLISHABLE_KEY.length > 0;

  // Local state for developer mock bypass
  const [isBypassed, setIsBypassed] = useState<boolean>(false);
  const [mockUser, setMockUser] = useState<UserProfile | null>(null);

  // Clerk hooks (safe to call even if key is empty, but they won't trigger authenticated states)
  const clerkAuth = useAuth();
  const clerkUser = useUser();

  const loginWithBypass = () => {
    setIsBypassed(true);
    setMockUser({
      name: 'Developer Admin',
      email: 'admin@edge-v2.dev',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    });
  };

  const logout = async () => {
    if (isBypassed) {
      setIsBypassed(false);
      setMockUser(null);
    } else if (isClerkEnabled && clerkAuth.signOut !== undefined) {
      await clerkAuth.signOut();
    }
  };

  const isAuthenticated = isBypassed || (isClerkEnabled && (clerkAuth.isSignedIn ?? false));
  const isLoading = isClerkEnabled ? !clerkAuth.isLoaded : false;

  let activeUser: UserProfile | null = null;
  if (isBypassed) {
    activeUser = mockUser;
  } else if (isClerkEnabled && clerkUser.user !== null && clerkUser.user !== undefined) {
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
        isBypassed,
        loginWithBypass,
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
