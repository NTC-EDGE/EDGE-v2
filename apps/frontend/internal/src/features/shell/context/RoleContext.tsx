import { createContext, useContext, useState, ReactNode, ComponentProps } from 'react';
import { Icon } from '@edge/ui';

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
  | 'Communication'
  | 'Operations'
  | 'Compliance'
  | 'Administration';

export interface NavigationLink {
  name: string;
  screen: string;
  icon: ComponentProps<typeof Icon>['name'];
  group: NavGroup;
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
  'Communication',
  'Operations',
  'Compliance',
  'Administration',
] as const;

export const ROLE_NAVIGATION_LINKS = {
  Admin: [
    { name: 'Dashboard',            screen: 'Dashboard',        icon: 'grid',           group: 'Workspace' },
    { name: 'Announcements',        screen: 'Announcements',    icon: 'volume-2',       group: 'Communication' },
    { name: 'Feedback',             screen: 'Feedback',         icon: 'message-circle', group: 'Communication' },
    { name: 'Chat',                 screen: 'Chat',             icon: 'message-square', group: 'Communication' },
    { name: 'Meet',                 screen: 'Meet',             icon: 'video',          group: 'Communication' },
    { name: 'Activities',           screen: 'Activities',       icon: 'activity',       group: 'Operations' },
    { name: 'Form Builder',         screen: 'FormBuilder',      icon: 'layout',         group: 'Operations' },
    { name: 'Receipt Management',   screen: 'ReceiptManagement',icon: 'file',           group: 'Operations' },
    { name: 'Schedule',             screen: 'Schedule',         icon: 'calendar',       group: 'Operations' },
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
    { name: 'Chat',       screen: 'Chat',       icon: 'message-square', group: 'Communication' },
    { name: 'Meet',       screen: 'Meet',       icon: 'video',          group: 'Communication' },
  ],
  'Chief of EOD': [
    { name: 'Dashboard',  screen: 'Dashboard',  icon: 'grid',           group: 'Workspace' },
    { name: 'Activities', screen: 'Activities', icon: 'activity',       group: 'Operations' },
    { name: 'Chat',       screen: 'Chat',       icon: 'message-square', group: 'Communication' },
    { name: 'Meet',       screen: 'Meet',       icon: 'video',          group: 'Communication' },
  ],
  'Regional Director': [
    { name: 'Dashboard',  screen: 'Dashboard',  icon: 'grid',           group: 'Workspace' },
    { name: 'Activities', screen: 'Activities', icon: 'activity',       group: 'Operations' },
    { name: 'Reports',    screen: 'Reports',    icon: 'file-text',      group: 'Compliance' },
    { name: 'Chat',       screen: 'Chat',       icon: 'message-square', group: 'Communication' },
    { name: 'Meet',       screen: 'Meet',       icon: 'video',          group: 'Communication' },
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
    { name: 'Receipt Management', screen: 'ReceiptManagement',icon: 'file',           group: 'Operations' },
    { name: 'Chat',               screen: 'Chat',             icon: 'message-square', group: 'Communication' },
    { name: 'Meet',               screen: 'Meet',             icon: 'video',          group: 'Communication' },
  ],
  Cashier: [
    { name: 'Dashboard',          screen: 'Dashboard',        icon: 'grid',           group: 'Workspace' },
    { name: 'Activities',         screen: 'Activities',       icon: 'activity',       group: 'Operations' },
    { name: 'Receipt Management', screen: 'ReceiptManagement',icon: 'file',           group: 'Operations' },
    { name: 'Chat',               screen: 'Chat',             icon: 'message-square', group: 'Communication' },
    { name: 'Meet',               screen: 'Meet',             icon: 'video',          group: 'Communication' },
  ],
} as const satisfies Record<UserRole, readonly NavigationLink[]>;

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
