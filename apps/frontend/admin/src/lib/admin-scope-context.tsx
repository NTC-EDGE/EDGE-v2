"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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
