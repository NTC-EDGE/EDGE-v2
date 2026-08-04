"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setTokenProvider } from "@edge/api";

export type AdminRoleType = "system_admin";

export interface AdminScopeContextType {
  activeRole: AdminRoleType;
  setActiveRole: (role: AdminRoleType) => void;
  selectedRegionId: string | null;
  setSelectedRegionId: (regionId: string | null) => void;
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
  isSystemAdmin: boolean;
  isRegionAdmin: boolean;
  isTenantAdmin: boolean;
  canManageTenants: boolean;
  canManageTenantMembers: boolean;
  canManageRegionSettings: boolean;
}

const AdminScopeContext = createContext<AdminScopeContextType | undefined>(undefined);

export function AdminScopeProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<AdminRoleType>("system_admin");
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const clerkAuth = useAuth();

  // Register Clerk's getToken callback with the API tokenManager service so that
  // all outgoing apiClient requests automatically receive the correct Bearer token in headers.
  // NOTE: We always register getToken regardless of isSignedIn state. Clerk's own SDK returns
  // null from getToken when there is no active session, so we let it handle that gracefully.
  // Clearing the provider when isSignedIn is false/undefined causes a race condition where
  // the first API calls (which SWR fires immediately on mount) go out without auth headers
  // while Clerk is still hydrating the session from its cookie — resulting in spurious 401s.
  useEffect(() => {
    if (clerkAuth.getToken) {
      setTokenProvider(clerkAuth.getToken);
    }
  }, [clerkAuth.getToken]);

  const isSystemAdmin = true;
  const isRegionAdmin = true;
  const isTenantAdmin = true;

  const canManageTenants = true;
  const canManageTenantMembers = true;
  const canManageRegionSettings = true;

  return (
    <AdminScopeContext.Provider
      value={{
        activeRole,
        setActiveRole,
        selectedRegionId,
        setSelectedRegionId,
        selectedTenantId,
        setSelectedTenantId,
        isSystemAdmin,
        isRegionAdmin,
        isTenantAdmin,
        canManageTenants,
        canManageTenantMembers,
        canManageRegionSettings,
      }}
    >
      {children}
    </AdminScopeContext.Provider>
  );
}

export function useAdminScope() {
  const context = useContext(AdminScopeContext);
  if (context === undefined) {
    throw new Error("useAdminScope must be used within an AdminScopeProvider");
  }
  return context;
}
