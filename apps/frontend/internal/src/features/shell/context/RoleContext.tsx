import { createContext, useContext, useState, useEffect, ReactNode, ComponentProps } from 'react';
import { Icon } from '@edge/ui';
import { useAuthContext } from '../../auth/context/AuthContext';

export type UserRole =
  | 'Admin'
  | 'Evaluator'
  | 'Chief of EOD'
  | 'Regional Director'
  | 'Legal'
  | 'Accountant'
  | 'Cashier';

/**
 * Navigation group labels — shown as OVERLINE section headers in the sidebar.
 */
export type NavGroup =
  | 'Workspace'
  | 'Operations'
  | 'Communication'
  | 'Compliance'
  | 'Administration';

export interface NavigationLink {
  name: string;
  screen: string;
  icon: ComponentProps<typeof Icon>['name'];
  group: NavGroup;
  badgeCount?: number;
}

export const ROLES: readonly UserRole[] = [
  'Admin',
  'Evaluator',
  'Chief of EOD',
  'Regional Director',
  'Legal',
  'Accountant',
  'Cashier',
] as const;

/**
 * Ordered group sequence — controls sidebar section order.
 */
export const NAV_GROUP_ORDER: readonly NavGroup[] = [
  'Workspace',
  'Operations',
  'Communication',
  'Compliance',
  'Administration',
] as const;

export const ROLE_NAVIGATION_LINKS = {
  Admin: [
    { name: 'Dashboard',            screen: 'Dashboard',        icon: 'grid',           group: 'Workspace' },
    { name: 'Activities',           screen: 'Activities',       icon: 'activity',       group: 'Operations' },
    { name: 'Form Builder',         screen: 'FormBuilder',      icon: 'layout',         group: 'Operations' },
    { name: 'Receipt Management',   screen: 'ReceiptManagement',icon: 'printer',        group: 'Operations' },
    { name: 'Schedule',             screen: 'Schedule',         icon: 'calendar',       group: 'Operations' },
    { name: 'Announcements',        screen: 'Announcements',    icon: 'volume-2',       group: 'Communication' },
    { name: 'Feedback',             screen: 'Feedback',         icon: 'message-circle', group: 'Communication' },
    { name: 'Chat',                 screen: 'Chat',             icon: 'message-square', group: 'Communication' },
    { name: 'Meet',                 screen: 'Meet',             icon: 'video',          group: 'Communication' },
    { name: 'Audit Logs',           screen: 'AuditLogs',        icon: 'shield',         group: 'Compliance' },
    { name: 'Reports',              screen: 'Reports',          icon: 'file-text',      group: 'Compliance' },
    { name: 'Roles & Permissions',  screen: 'RolesPermission',  icon: 'lock',           group: 'Administration' },
    { name: 'Employees',            screen: 'Employees',        icon: 'users',          group: 'Administration' },
    { name: 'Users',                screen: 'Users',            icon: 'user',           group: 'Administration' },
    { name: 'Settings',             screen: 'Settings',         icon: 'settings',       group: 'Administration' },
  ],
  Evaluator: [
    { name: 'Dashboard',  screen: 'Dashboard',  icon: 'grid',           group: 'Workspace' },
    { name: 'Activities', screen: 'Activities', icon: 'activity',       group: 'Operations' },
    { name: 'Schedule',   screen: 'Schedule',   icon: 'calendar',       group: 'Operations' },
    { name: 'Chat',       screen: 'Chat',       icon: 'message-square', group: 'Communication' },
    { name: 'Meet',       screen: 'Meet',       icon: 'video',          group: 'Communication' },
  ],
  'Chief of EOD': [
    { name: 'Dashboard',      screen: 'Dashboard',      icon: 'grid',           group: 'Workspace' },
    { name: 'Activities',     screen: 'Activities',     icon: 'activity',       group: 'Operations' },
    { name: 'Chat',           screen: 'Chat',           icon: 'message-square', group: 'Communication' },
    { name: 'Meet',           screen: 'Meet',           icon: 'video',          group: 'Communication' },
  ],
  'Regional Director': [
    { name: 'Dashboard',            screen: 'Dashboard',        icon: 'grid',           group: 'Workspace' },
    { name: 'Activities',           screen: 'Activities',       icon: 'activity',       group: 'Operations' },
    { name: 'Form Builder',         screen: 'FormBuilder',      icon: 'layout',         group: 'Operations' },
    { name: 'Receipt Management',   screen: 'ReceiptManagement',icon: 'printer',        group: 'Operations' },
    { name: 'Schedule',             screen: 'Schedule',         icon: 'calendar',       group: 'Operations' },
    { name: 'Announcements',        screen: 'Announcements',    icon: 'volume-2',       group: 'Communication' },
    { name: 'Feedback',             screen: 'Feedback',         icon: 'message-circle', group: 'Communication' },
    { name: 'Chat',                 screen: 'Chat',             icon: 'message-square', group: 'Communication' },
    { name: 'Meet',                 screen: 'Meet',             icon: 'video',          group: 'Communication' },
    { name: 'Audit Logs',           screen: 'AuditLogs',        icon: 'shield',         group: 'Compliance' },
    { name: 'Reports',              screen: 'Reports',          icon: 'file-text',      group: 'Compliance' },
    { name: 'Roles & Permissions',  screen: 'RolesPermission',  icon: 'lock',           group: 'Administration' },
    { name: 'Employees',            screen: 'Employees',        icon: 'users',          group: 'Administration' },
    { name: 'Users',                screen: 'Users',            icon: 'user',           group: 'Administration' },
    { name: 'Settings',             screen: 'Settings',         icon: 'settings',       group: 'Administration' },
  ],
  Legal: [
    { name: 'Dashboard',  screen: 'Dashboard',  icon: 'grid',           group: 'Workspace' },
    { name: 'Activities', screen: 'Activities', icon: 'activity',       group: 'Operations' },
    { name: 'Audit Logs', screen: 'AuditLogs',  icon: 'shield',         group: 'Compliance' },
    { name: 'Chat',       screen: 'Chat',       icon: 'message-square', group: 'Communication' },
    { name: 'Meet',       screen: 'Meet',       icon: 'video',          group: 'Communication' },
  ],
  Accountant: [
    { name: 'Dashboard',          screen: 'Dashboard',        icon: 'grid',           group: 'Workspace' },
    { name: 'Activities',         screen: 'Activities',       icon: 'activity',       group: 'Operations' },
    { name: 'Reports',            screen: 'Reports',          icon: 'file-text',      group: 'Compliance' },
    { name: 'Chat',               screen: 'Chat',             icon: 'message-square', group: 'Communication' },
    { name: 'Meet',               screen: 'Meet',             icon: 'video',          group: 'Communication' },
  ],
  Cashier: [
    { name: 'Dashboard',          screen: 'Dashboard',        icon: 'grid',           group: 'Workspace' },
    { name: 'Activities',         screen: 'Activities',       icon: 'activity',       group: 'Operations' },
    { name: 'Receipt Management', screen: 'ReceiptManagement',icon: 'printer',        group: 'Operations' },
    { name: 'Chat',               screen: 'Chat',             icon: 'message-square', group: 'Communication' },
    { name: 'Meet',               screen: 'Meet',             icon: 'video',          group: 'Communication' },
  ],
} as const satisfies Record<UserRole, readonly NavigationLink[]>;

export const ROLE_HIERARCHY_PRIORITY: readonly UserRole[] = [
  'Admin',
  'Regional Director',
  'Chief of EOD',
  'Legal',
  'Evaluator',
  'Accountant',
  'Cashier',
] as const;

const EXACT_ROLE_MAP: Readonly<Record<string, UserRole>> = {
  admin: 'Admin',
  administrator: 'Admin',
  tenant_admin: 'Admin',
  'tenant admin': 'Admin',
  tenantadmin: 'Admin',
  regional_admin: 'Admin',
  'regional admin': 'Admin',
  regionaladmin: 'Admin',
  system_admin: 'Admin',
  'system admin': 'Admin',
  super_admin: 'Admin',
  'super admin': 'Admin',
  superadmin: 'Admin',
  superadministrator: 'Admin',
  'super administrator': 'Admin',
  evaluator: 'Evaluator',
  standard_user: 'Evaluator',
  'standard user': 'Evaluator',
  approver: 'Regional Director',
  'chief of eod': 'Chief of EOD',
  chief_of_eod: 'Chief of EOD',
  'chief-of-eod': 'Chief of EOD',
  chiefeod: 'Chief of EOD',
  'regional director': 'Regional Director',
  regional_director: 'Regional Director',
  'regional-director': 'Regional Director',
  director: 'Regional Director',
  legal: 'Legal',
  legal_officer: 'Legal',
  'legal officer': 'Legal',
  accountant: 'Accountant',
  cashier: 'Cashier',
};

export function mapToUserRole(roleStr?: string | null): UserRole | null {
  if (typeof roleStr !== 'string' || roleStr.trim().length === 0) return null;
  const clean = roleStr.trim().toLowerCase();

  // 1. Direct dictionary match for standardized slugs and names
  if (clean in EXACT_ROLE_MAP) {
    return EXACT_ROLE_MAP[clean];
  }

  // 2. Normalized space-delimited match
  const normalized = clean.replace(/[_-]+/g, ' ').trim();
  if (normalized in EXACT_ROLE_MAP) {
    return EXACT_ROLE_MAP[normalized];
  }

  // 3. Token-based priority matching (high-specificity compound roles first)
  const tokens = normalized.split(/\s+/);

  if (tokens.includes('chief') || tokens.includes('eod')) return 'Chief of EOD';
  if (tokens.includes('director')) return 'Regional Director';
  if (tokens.includes('evaluator')) return 'Evaluator';
  if (tokens.includes('accountant')) return 'Accountant';
  if (tokens.includes('cashier')) return 'Cashier';
  if (tokens.includes('legal')) return 'Legal';
  if (tokens.includes('admin') || tokens.includes('administrator')) return 'Admin';

  return null;
}

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      <RoleStateSynchronizer currentRole={currentRole} setCurrentRole={setCurrentRole}>
        {children}
      </RoleStateSynchronizer>
    </RoleContext.Provider>
  );
}

function RoleStateSynchronizer({
  children,
  currentRole,
  setCurrentRole,
}: {
  children: ReactNode;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}) {
  const { user } = useAuthContext();

  useEffect(() => {
    if (user?.roles !== undefined && user.roles !== null && Array.isArray(user.roles) && user.roles.length > 0) {
      const matchedRoles = user.roles
        .map((r) => mapToUserRole(r))
        .filter((r): r is UserRole => r !== null);

      if (matchedRoles.length > 0) {
        matchedRoles.sort((a, b) => {
          const indexA = ROLE_HIERARCHY_PRIORITY.indexOf(a);
          const indexB = ROLE_HIERARCHY_PRIORITY.indexOf(b);
          const rankA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
          const rankB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
          return rankA - rankB;
        });

        const primaryRole = matchedRoles[0];
        if (primaryRole !== undefined && currentRole !== primaryRole) {
          setCurrentRole(primaryRole);
        }
      }
    }
  }, [user?.roles, currentRole, setCurrentRole]);

  return <>{children}</>;
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
