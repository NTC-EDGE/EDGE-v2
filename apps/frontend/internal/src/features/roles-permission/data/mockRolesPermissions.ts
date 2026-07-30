import { COLORS } from '@edge/ui';
export interface Role {
  id: string;
  name: string;
  isSystemRole?: boolean;
  avatarBgColor?: string;
  avatarInitials: string;
}

export interface PermissionOption {
  id: string;
  label: string;
}

export interface PermissionCategory {
  id: string;
  title: string;
  options: PermissionOption[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'main_modules',
    title: 'Main Modules',
    options: [
      { id: 'main_modules:chat', label: 'Chat' },
      { id: 'main_modules:meet', label: 'Meet' },
      { id: 'main_modules:activity', label: 'Activity' },
    ],
  },
  {
    id: 'activity_options',
    title: 'Activity Options',
    options: [
      { id: 'activity_options:approve', label: 'Approve' },
      { id: 'activity_options:decline', label: 'Decline' },
      { id: 'activity_options:endorse', label: 'Endorse' },
    ],
  },
  {
    id: 'user',
    title: 'User',
    options: [
      { id: 'user:create', label: 'Create' },
      { id: 'user:read', label: 'Read' },
      { id: 'user:update', label: 'Update' },
      { id: 'user:delete', label: 'Delete' },
    ],
  },
  {
    id: 'employee',
    title: 'Employee',
    options: [
      { id: 'employee:create', label: 'Create' },
      { id: 'employee:read', label: 'Read' },
      { id: 'employee:update', label: 'Update' },
      { id: 'employee:delete', label: 'Delete' },
    ],
  },
  {
    id: 'role_permission',
    title: 'Role and Permission',
    options: [
      { id: 'role_permission:create', label: 'Create' },
      { id: 'role_permission:read', label: 'Read' },
      { id: 'role_permission:update', label: 'Update' },
      { id: 'role_permission:delete', label: 'Delete' },
    ],
  },
  {
    id: 'tabs',
    title: 'Tabs',
    options: [
      { id: 'tabs:all', label: 'All' },
      { id: 'tabs:pending', label: 'Pending' },
      { id: 'tabs:history', label: 'History' },
    ],
  },
  {
    id: 'schedule',
    title: 'Schedule',
    options: [
      { id: 'schedule:create', label: 'Create' },
      { id: 'schedule:read', label: 'Read' },
      { id: 'schedule:update', label: 'Update' },
      { id: 'schedule:delete', label: 'Delete' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    options: [
      { id: 'reports:cashier', label: 'Cashier' },
      { id: 'reports:evaluator', label: 'Evaluator' },
    ],
  },
  {
    id: 'configuration',
    title: 'Configuration',
    options: [
      { id: 'configuration:create', label: 'Create' },
      { id: 'configuration:read', label: 'Read' },
      { id: 'configuration:update', label: 'Update' },
      { id: 'configuration:delete', label: 'Delete' },
    ],
  },
];

export const INITIAL_ROLES: Role[] = [
  {
    id: '3a02d1e8-49d9-41b7-8196-e433c0d57193',
    name: 'Evaluator',
    isSystemRole: false,
    avatarBgColor: COLORS.brand.blueLight,
    avatarInitials: 'E',
  },
  {
    id: 'f1b8a9d0-23e1-4c28-9f12-0012e84711aa',
    name: 'Admin',
    isSystemRole: true,
    avatarBgColor: COLORS.brand.indigoBorder,
    avatarInitials: 'A',
  },
  {
    id: '8b72e11d-65a4-47e2-a1b9-339d10e82c54',
    name: 'Staff User',
    isSystemRole: true,
    avatarBgColor: COLORS.brand.purpleLight,
    avatarInitials: 'S',
  },
  {
    id: 'd4e5f6a7-8901-2345-6789-0123456789ab',
    name: 'Cashier',
    isSystemRole: false,
    avatarBgColor: COLORS.semantic.warningBg,
    avatarInitials: 'C',
  },
  {
    id: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    name: 'Auditor',
    isSystemRole: false,
    avatarBgColor: COLORS.semantic.successBg,
    avatarInitials: 'AU',
  },
];

export const INITIAL_ROLE_PERMISSIONS: Record<string, string[]> = {
  '3a02d1e8-49d9-41b7-8196-e433c0d57193': [
    'main_modules:chat',
    'main_modules:meet',
    'main_modules:activity',
    'activity_options:approve',
    'activity_options:decline',
    'activity_options:endorse',
    'tabs:pending',
    'tabs:history',
    'schedule:read',
  ],
  'f1b8a9d0-23e1-4c28-9f12-0012e84711aa': PERMISSION_CATEGORIES.flatMap((cat) =>
    cat.options.map((opt) => opt.id)
  ),
  '8b72e11d-65a4-47e2-a1b9-339d10e82c54': [
    'main_modules:chat',
    'main_modules:meet',
    'main_modules:activity',
    'user:read',
    'employee:read',
    'tabs:all',
    'tabs:pending',
    'schedule:read',
  ],
  'd4e5f6a7-8901-2345-6789-0123456789ab': [
    'main_modules:activity',
    'reports:cashier',
    'schedule:read',
  ],
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d': [
    'user:read',
    'employee:read',
    'role_permission:read',
    'schedule:read',
    'reports:evaluator',
    'reports:cashier',
  ],
};
