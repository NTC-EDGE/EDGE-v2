import { createContext, useContext, useState, ReactNode, ComponentProps } from 'react';
import { Icon } from '@edge/ui';

export type UserRole =
  | 'Admin'
  | 'Evaluator'
  | 'Chief of EOD'
  | 'Regional Director'
  | 'Legal'
  | 'Account'
  | 'Cashier';

export interface NavigationLink {
  name: string;
  screen: string;
  icon: ComponentProps<typeof Icon>['name'];
}

export const ROLES: readonly UserRole[] = [
  'Admin',
  'Evaluator',
  'Chief of EOD',
  'Regional Director',
  'Legal',
  'Account',
  'Cashier',
] as const;

export const ROLE_NAVIGATION_LINKS = {
  Admin: [
    { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
    { name: 'Activities', screen: 'Activities', icon: 'bell' },
    { name: 'Chat', screen: 'Chat', icon: 'message-square' },
    { name: 'Meet', screen: 'Meet', icon: 'video' },
    { name: 'Reports', screen: 'Reports', icon: 'file-text' },
    { name: 'Receipt Management', screen: 'ReceiptManagement', icon: 'file' },
    { name: 'Roles & Permission', screen: 'RolesPermission', icon: 'shield' },
    { name: 'Schedule', screen: 'Schedule', icon: 'calendar' },
    { name: 'Employees', screen: 'Employees', icon: 'users' },
    { name: 'Users', screen: 'Users', icon: 'user' },
    { name: 'Settings', screen: 'Settings', icon: 'settings' },
  ],
  Evaluator: [
    { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
    { name: 'Activities', screen: 'Activities', icon: 'bell' },
    { name: 'Chat', screen: 'Chat', icon: 'message-square' },
    { name: 'Meet', screen: 'Meet', icon: 'video' },
  ],
  'Chief of EOD': [
    { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
    { name: 'Activities', screen: 'Activities', icon: 'bell' },
    { name: 'Chat', screen: 'Chat', icon: 'message-square' },
    { name: 'Meet', screen: 'Meet', icon: 'video' },
  ],
  'Regional Director': [
    { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
    { name: 'Activities', screen: 'Activities', icon: 'bell' },
    { name: 'Chat', screen: 'Chat', icon: 'message-square' },
    { name: 'Meet', screen: 'Meet', icon: 'video' },
  ],
  Legal: [
    { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
    { name: 'Activities', screen: 'Activities', icon: 'bell' },
    { name: 'Chat', screen: 'Chat', icon: 'message-square' },
    { name: 'Meet', screen: 'Meet', icon: 'video' },
  ],
  Account: [
    { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
    { name: 'Activities', screen: 'Activities', icon: 'bell' },
    { name: 'Schedule', screen: 'Schedule', icon: 'calendar' },
    { name: 'Employees', screen: 'Employees', icon: 'users' },
    { name: 'Settings', screen: 'Settings', icon: 'settings' },
  ],
  Cashier: [
    { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
    { name: 'Chat', screen: 'Chat', icon: 'message-square' },
    { name: 'Meet', screen: 'Meet', icon: 'video' },
    { name: 'Schedule', screen: 'Schedule', icon: 'calendar' },
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
