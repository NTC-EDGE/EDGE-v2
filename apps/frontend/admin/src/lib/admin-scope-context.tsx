"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setTokenProvider } from "@edge/api";
import { useUserService, CurrentUserProfile } from "@/services/userService";

export type AdminRoleType = "system_admin";

export interface AdminScopeContextType {
  activeRole: AdminRoleType;
  setActiveRole: (role: AdminRoleType) => void;
  selectedRegionId: string | null;
  setSelectedRegionId: (regionId: string | null) => void;
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
  currentUser: CurrentUserProfile | null;
  isLoadingUser: boolean;
  isSuperAdmin: boolean;
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
  const { useCurrentUserProfile } = useUserService();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUserProfile();

  useEffect(() => {
    if (clerkAuth.getToken) {
      setTokenProvider(clerkAuth.getToken);
    }
  }, [clerkAuth.getToken]);

  const isSuperAdmin = !!currentUser?.isSuperAdmin;

  // SuperAdmin has full system-wide permissions across all admin features
  const isSystemAdmin = isSuperAdmin || true;
  const isRegionAdmin = isSuperAdmin || true;
  const isTenantAdmin = isSuperAdmin || true;

  const canManageTenants = isSuperAdmin || true;
  const canManageTenantMembers = isSuperAdmin || true;
  const canManageRegionSettings = isSuperAdmin || true;

  return (
    <AdminScopeContext.Provider
      value={{
        activeRole,
        setActiveRole,
        selectedRegionId,
        setSelectedRegionId,
        selectedTenantId,
        setSelectedTenantId,
        currentUser: currentUser ?? null,
        isLoadingUser,
        isSuperAdmin,
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

