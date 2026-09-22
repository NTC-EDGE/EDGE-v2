import { createContext, useContext, useState, ReactNode } from 'react';
import { useRole, UserRole } from './RoleContext';

export type QueueTab = 'activity' | 'pending' | 'history';

export interface RolePermissionConfig {
  visibleTabs: QueueTab[];
  /** Evaluator: forward to Accountant after evaluation is complete */
  canForwardToAccountant: boolean;
  /** Accountant: approve the SOA and forward to Cashier for payment */
  canApproveAsAccountant: boolean;
  /** Cashier: verify payment and mark as Completed */
  canVerifyCashier: boolean;
  /** Legacy / fallback: direct approval (e.g. Admin bypassing the full cycle) */
  canApprove: boolean;
  canDecline: boolean;
  canEndorse: boolean;
}

type PermissionMap = Record<UserRole, RolePermissionConfig>;

const DEFAULT_PERMISSIONS: PermissionMap = {
  Admin: {
    visibleTabs: ['activity', 'pending', 'history'],
    canForwardToAccountant: true,
    canApproveAsAccountant: true,
    canVerifyCashier: true,
    canApprove: true,
    canDecline: true,
    canEndorse: true,
  },
  Evaluator: {
    visibleTabs: ['activity', 'pending', 'history'],
    canForwardToAccountant: true,
    canApproveAsAccountant: false,
    canVerifyCashier: false,
    canApprove: false,
    canDecline: true,
    canEndorse: true,
  },
  'Chief of EOD': {
    visibleTabs: ['activity', 'pending', 'history'],
    canForwardToAccountant: true,
    canApproveAsAccountant: false,
    canVerifyCashier: false,
    canApprove: false,
    canDecline: true,
    canEndorse: true,
  },
  'Regional Director': {
    visibleTabs: ['activity', 'pending', 'history'],
    canForwardToAccountant: true,
    canApproveAsAccountant: false,
    canVerifyCashier: false,
    canApprove: true,
    canDecline: true,
    canEndorse: true,
  },
  Legal: {
    visibleTabs: ['activity', 'pending', 'history'],
    canForwardToAccountant: false,
    canApproveAsAccountant: false,
    canVerifyCashier: false,
    canApprove: false,
    canDecline: true,
    canEndorse: true,
  },
  Accountant: {
    visibleTabs: ['activity', 'pending', 'history'],
    canForwardToAccountant: false,
    canApproveAsAccountant: true,
    canVerifyCashier: false,
    canApprove: false,
    canDecline: true,
    canEndorse: false,
  },
  Cashier: {
    visibleTabs: ['activity', 'pending', 'history'],
    canForwardToAccountant: false,
    canApproveAsAccountant: false,
    canVerifyCashier: true,
    canApprove: false,
    canDecline: false,
    canEndorse: false,
  },
};

interface PermissionContextType {
  permissionMap: PermissionMap;
  updateRolePermissions: (role: UserRole, config: Partial<RolePermissionConfig>) => void;
  getPermissionsForRole: (role: UserRole) => RolePermissionConfig;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissionMap, setPermissionMap] = useState<PermissionMap>(DEFAULT_PERMISSIONS);

  const updateRolePermissions = (role: UserRole, config: Partial<RolePermissionConfig>) => {
    setPermissionMap((prev) => ({
      ...prev,
      [role]: { ...prev[role], ...config },
    }));
  };

  const getPermissionsForRole = (role: UserRole): RolePermissionConfig => {
    return permissionMap[role];
  };

  return (
    <PermissionContext.Provider value={{ permissionMap, updateRolePermissions, getPermissionsForRole }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): RolePermissionConfig {
  const context = useContext(PermissionContext);
  const { currentRole } = useRole();

  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  return context.getPermissionsForRole(currentRole);
}

export function usePermissionContext(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
}
