import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GuestAuthContextType {
  isGuest: boolean;
  loginAsGuest: () => void;
  logoutGuest: () => void;
}

const GuestAuthContext = createContext<GuestAuthContextType | undefined>(undefined);

export function GuestAuthProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);

  const loginAsGuest = () => {
    setIsGuest(true);
  };

  const logoutGuest = () => {
    setIsGuest(false);
  };

  return (
    <GuestAuthContext.Provider value={{ isGuest, loginAsGuest, logoutGuest }}>
      {children}
    </GuestAuthContext.Provider>
  );
}

export function useGuestAuth(): GuestAuthContextType {
  const context = useContext(GuestAuthContext);
  if (context === undefined) {
    throw new Error('useGuestAuth must be used within a GuestAuthProvider');
  }
  return context;
}
