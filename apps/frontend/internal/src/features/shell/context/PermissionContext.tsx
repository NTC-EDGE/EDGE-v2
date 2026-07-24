import { createContext, useContext, useState, ReactNode } from 'react';
import { useRole, UserRole } from './RoleContext';

export type QueueTab = 'activity' | 'pending' | 'history';

export interface RolePermissionConfig {
  visibleTabs: QueueTab[];
  canApprove: boolean;
  canDecline: boolean;
  canEndorse: boolean;
  canVerifyCashier: boolean;
}

type PermissionMap = Record<UserRole, RolePermissionConfig>;

const DEFAULT_PERMISSIONS: PermissionMap = {
  Admin: {
    visibleTabs: ['activity', 'pending', 'history'],
    canApprove: false,
    canDecline: false,
    canEndorse: false,
    canVerifyCashier: false,
  },
  Evaluator: {
    visibleTabs: ['activity', 'pending', 'history'],
    canApprove: true,
    canDecline: true,
    canEndorse: true,
    canVerifyCashier: false,
  },
  'Chief of EOD': {
    visibleTabs: ['activity', 'pending', 'history'],
    canApprove: true,
    canDecline: true,
    canEndorse: true,
    canVerifyCashier: false,
  },
  'Regional Director': {
    visibleTabs: ['activity', 'pending', 'history'],
    canApprove: true,
    canDecline: true,
    canEndorse: true,
    canVerifyCashier: false,
  },
  Legal: {
    visibleTabs: ['activity', 'pending', 'history'],
    canApprove: true,
    canDecline: true,
    canEndorse: true,
    canVerifyCashier: false,
  },
  Accountant: {
    visibleTabs: ['activity', 'pending', 'history'],
    canApprove: true,
    canDecline: true,
    canEndorse: true,
    canVerifyCashier: false,
  },
  Cashier: {
    visibleTabs: ['activity', 'pending', 'history'],
    canApprove: false,
    canDecline: false,
    canEndorse: false,
    canVerifyCashier: true,
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
