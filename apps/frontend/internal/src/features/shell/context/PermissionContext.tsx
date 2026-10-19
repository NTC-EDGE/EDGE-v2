import { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { useAuthContext, UserProfile } from '../../auth/context/AuthContext';
import { useRole, UserRole } from './RoleContext';

export type QueueTab = 'activity' | 'pending' | 'issuance' | 'history';

export interface RolePermissionConfig {
  visibleTabs: QueueTab[];
  /** Evaluator: forward to Accountant after evaluation is complete */
  canForwardToAccountant: boolean;
  /** Accountant: approve the SOA and forward to Cashier for payment */
  canApproveAsAccountant: boolean;
  /** Cashier: verify payment and mark as Completed */
  canVerifyCashier: boolean;
  /** Evaluator / Supervisor: issue finalized permit / license / certificate after payment */
  canIssueDocument: boolean;
  /** Legacy / fallback: direct approval (e.g. Admin bypassing the full cycle) */
  canApprove: boolean;
  canDecline: boolean;
  canEndorse: boolean;
  /** SuperAdmin & Admin checks */
  isSuperAdmin: boolean;
  isAdmin: boolean;
  /** Granular permission checks mapped directly to backend permission keys */
  hasPermission: (key: string) => boolean;
  hasAnyPermission: (...keys: string[]) => boolean;
  hasAllPermissions: (...keys: string[]) => boolean;
}

export interface BaseRoleCapabilities {
  visibleTabs: QueueTab[];
  canForwardToAccountant: boolean;
  canApproveAsAccountant: boolean;
  canVerifyCashier: boolean;
  canIssueDocument: boolean;
  canApprove: boolean;
  canDecline: boolean;
  canEndorse: boolean;
}

type PermissionMap = Record<UserRole, BaseRoleCapabilities>;

const DEFAULT_PERMISSIONS: PermissionMap = {
  Admin: {
    visibleTabs: ['activity', 'pending', 'history', 'issuance'],
    canForwardToAccountant: true,
    canApproveAsAccountant: true,
    canVerifyCashier: true,
    canIssueDocument: true,
    canApprove: true,
    canDecline: true,
    canEndorse: true,
  },
  Evaluator: {
    visibleTabs: ['activity', 'pending', 'history', 'issuance'],
    canForwardToAccountant: true,
    canApproveAsAccountant: false,
    canVerifyCashier: false,
    canIssueDocument: true,
    canApprove: false,
    canDecline: true,
    canEndorse: true,
  },
  'Chief of EOD': {
    visibleTabs: ['activity', 'pending', 'history', 'issuance'],
    canForwardToAccountant: true,
    canApproveAsAccountant: false,
    canVerifyCashier: false,
    canIssueDocument: true,
    canApprove: false,
    canDecline: true,
    canEndorse: true,
  },
  'Regional Director': {
    visibleTabs: ['activity', 'pending', 'history', 'issuance'],
    canForwardToAccountant: true,
    canApproveAsAccountant: false,
    canVerifyCashier: false,
    canIssueDocument: true,
    canApprove: true,
    canDecline: true,
    canEndorse: true,
  },
  Legal: {
    visibleTabs: ['activity', 'pending', 'history', 'issuance'],
    canForwardToAccountant: false,
    canApproveAsAccountant: false,
    canVerifyCashier: false,
    canIssueDocument: false,
    canApprove: false,
    canDecline: true,
    canEndorse: true,
  },
  Accountant: {
    visibleTabs: ['activity', 'pending', 'history', 'issuance'],
    canForwardToAccountant: false,
    canApproveAsAccountant: true,
    canVerifyCashier: false,
    canIssueDocument: false,
    canApprove: false,
    canDecline: true,
    canEndorse: false,
  },
  Cashier: {
    visibleTabs: ['activity', 'pending', 'history', 'issuance'],
    canForwardToAccountant: false,
    canApproveAsAccountant: false,
    canVerifyCashier: true,
    canIssueDocument: false,
    canApprove: false,
    canDecline: true,
    canEndorse: true,
  },
};

export function checkIsSuperAdmin(user?: UserProfile | null): boolean {
  if (user === null || user === undefined) return false;

  if (user.roles !== undefined && user.roles !== null && Array.isArray(user.roles)) {
    const hasSuperRole = user.roles.some((r) => {
      const lower = r.toLowerCase().trim();
      return (
        lower === 'superadmin' ||
        lower === 'super_admin' ||
        lower === 'super-admin' ||
        lower === 'super administrator' ||
        lower === 'superadministrator' ||
        lower.includes('super')
      );
    });
    if (hasSuperRole) return true;
  }

  if (typeof user.email === 'string' && user.email.trim().length > 0) {
    const lowerEmail = user.email.toLowerCase().trim();
    if (lowerEmail.startsWith('admin@') || lowerEmail.includes('superadmin')) {
      return true;
    }
  }

  if (user.permissions !== undefined && user.permissions !== null && Array.isArray(user.permissions)) {
    if (user.permissions.includes('*') || user.permissions.includes('system.admin')) {
      return true;
    }
  }

  return false;
}

export function checkIsAdmin(user?: UserProfile | null, currentRole?: UserRole): boolean {
  if (checkIsSuperAdmin(user)) return true;
  if (currentRole === 'Admin') return true;

  if (user?.roles !== undefined && user.roles !== null && Array.isArray(user.roles)) {
    const hasAdminRole = user.roles.some((r) => {
      const lower = r.toLowerCase().trim();
      return (
        lower === 'admin' ||
        lower === 'administrator' ||
        lower === 'tenant_admin' ||
        lower === 'tenant admin' ||
        lower === 'regional_admin' ||
        lower === 'regional admin' ||
        lower.includes('admin')
      );
    });
    if (hasAdminRole) return true;
  }

  return false;
}

interface PermissionContextType {
  permissionMap: PermissionMap;
  updateRolePermissions: (role: UserRole, config: Partial<BaseRoleCapabilities>) => void;
  getPermissionsForRole: (role: UserRole) => RolePermissionConfig;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasPermission: (key: string) => boolean;
  hasAnyPermission: (...keys: string[]) => boolean;
  hasAllPermissions: (...keys: string[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissionMap, setPermissionMap] = useState<PermissionMap>(DEFAULT_PERMISSIONS);
  const { user } = useAuthContext();
  const { currentRole } = useRole();

  const isSuperAdmin = useMemo(() => checkIsSuperAdmin(user), [user]);
  const isAdmin = useMemo(() => checkIsAdmin(user, currentRole), [user, currentRole]);

  const hasPermission = useCallback(
    (key: string): boolean => {
      if (isSuperAdmin) return true;

      if (user?.permissions !== undefined && user.permissions !== null && Array.isArray(user.permissions) && user.permissions.length > 0) {
        if (user.permissions.includes('*') || user.permissions.includes('system.admin')) {
          return true;
        }
        return user.permissions.includes(key);
      }

      // Fallback if user permissions array is not yet populated from backend:
      if (currentRole === 'Admin') return true;
      return false;
    },
    [isSuperAdmin, user?.permissions, currentRole]
  );

  const hasAnyPermission = useCallback(
    (...keys: string[]): boolean => {
      if (isSuperAdmin) return true;
      return keys.some((k) => hasPermission(k));
    },
    [isSuperAdmin, hasPermission]
  );

  const hasAllPermissions = useCallback(
    (...keys: string[]): boolean => {
      if (isSuperAdmin) return true;
      return keys.every((k) => hasPermission(k));
    },
    [isSuperAdmin, hasPermission]
  );

  const updateRolePermissions = (role: UserRole, config: Partial<BaseRoleCapabilities>) => {
    setPermissionMap((prev) => ({
      ...prev,
      [role]: { ...prev[role], ...config },
    }));
  };

  const getPermissionsForRole = useCallback(
    (role: UserRole): RolePermissionConfig => {
      const base = permissionMap[role] ?? DEFAULT_PERMISSIONS[role];

      const canForwardToAccountant =
        isSuperAdmin ||
        hasPermission('applications.evaluate') ||
        hasPermission('billing.create') ||
        base.canForwardToAccountant;

      const canApproveAsAccountant =
        isSuperAdmin ||
        hasPermission('billing.soa_approve') ||
        base.canApproveAsAccountant;

      const canVerifyCashier =
        isSuperAdmin ||
        hasPermission('billing.collect') ||
        hasPermission('receipts.issue') ||
        base.canVerifyCashier;

      const canIssueDocument =
        isSuperAdmin ||
        hasPermission('applications.issue') ||
        hasPermission('permits.issue') ||
        hasPermission('licenses.issue') ||
        base.canIssueDocument;

      const canApprove =
        isSuperAdmin ||
        hasPermission('applications.approve') ||
        base.canApprove;

      const canDecline =
        isSuperAdmin ||
        hasPermission('applications.approve') ||
        hasPermission('billing.soa_return') ||
        hasPermission('applications.evaluate') ||
        base.canDecline;

      const canEndorse =
        isSuperAdmin ||
        hasPermission('applications.evaluate') ||
        hasPermission('applications.approve') ||
        base.canEndorse;

      return {
        visibleTabs: base.visibleTabs,
        canForwardToAccountant,
        canApproveAsAccountant,
        canVerifyCashier,
        canIssueDocument,
        canApprove,
        canDecline,
        canEndorse,
        isSuperAdmin,
        isAdmin,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      };
    },
    [permissionMap, isSuperAdmin, isAdmin, hasPermission, hasAnyPermission, hasAllPermissions]
  );

  return (
    <PermissionContext.Provider
      value={{
        permissionMap,
        updateRolePermissions,
        getPermissionsForRole,
        isSuperAdmin,
        isAdmin,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
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

export function useHasPermission(key: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(key);
}

export function useHasAnyPermission(...keys: string[]): boolean {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(...keys);
}
