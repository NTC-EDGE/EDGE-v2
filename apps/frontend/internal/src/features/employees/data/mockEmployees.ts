export type EmployeeRole =
  | 'Admin'
  | 'Evaluator'
  | 'Manager'
  | 'Staff'
  | 'Chief of EOD'
  | 'Regional Director'
  | 'Legal'
  | 'Accountant'
  | 'Cashier';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  status: EmployeeStatus;
  avatarColor: string;
  dateJoined: string;
  location: string;
}

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-2026-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+63 917 123 4567',
    role: 'Manager',
    department: 'Licensing & Registration Division',
    status: 'Active',
    avatarColor: '#2563EB',
    dateJoined: 'Jan 15, 2024',
    location: 'Central Office - Quezon City',
  },
  {
    id: 'EMP-2026-002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+63 918 234 5678',
    role: 'Evaluator',
    department: 'Enforcement & Operations',
    status: 'Active',
    avatarColor: '#0284C7',
    dateJoined: 'Mar 10, 2024',
    location: 'Regional Office - NCR',
  },
  {
    id: 'EMP-2026-003',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.j@example.com',
    phone: '+63 919 345 6789',
    role: 'Staff',
    department: 'Records Management',
    status: 'Active',
    avatarColor: '#0D9488',
    dateJoined: 'May 04, 2024',
    location: 'Central Office - Quezon City',
  },
  {
    id: 'EMP-2026-004',
    firstName: 'Edissa Jolina',
    lastName: 'Labrada',
    email: 'edissa.jolina@example.com',
    phone: '+63 920 456 7890',
    role: 'Evaluator',
    department: 'Radio Spectrum Planning',
    status: 'Active',
    avatarColor: '#7C3AED',
    dateJoined: 'Aug 22, 2024',
    location: 'Regional Office - III (Pampanga)',
  },
  {
    id: 'EMP-2026-005',
    firstName: 'Ozone',
    lastName: 'Labrada',
    email: 'ozone.labrada@example.com',
    phone: '+63 921 567 8901',
    role: 'Evaluator',
    department: 'Broadcasting & Cable TV Services',
    status: 'Active',
    avatarColor: '#2563EB',
    dateJoined: 'Nov 12, 2024',
    location: 'Regional Office - VII (Cebu)',
  },
  {
    id: 'EMP-2026-006',
    firstName: 'Julieta',
    lastName: 'Amante',
    email: 'julieta.amante@example.com',
    phone: '+63 922 678 9012',
    role: 'Evaluator',
    department: 'Standards & Testing Division',
    status: 'Active',
    avatarColor: '#DB2777',
    dateJoined: 'Feb 01, 2025',
    location: 'Central Office - Quezon City',
  },
  {
    id: 'EMP-2026-007',
    firstName: 'Gabriel',
    lastName: 'Santos',
    email: 'gabriel.santos@example.com',
    phone: '+63 923 789 0123',
    role: 'Chief of EOD',
    department: 'Enforcement & Operations',
    status: 'Active',
    avatarColor: '#D97706',
    dateJoined: 'Jun 18, 2023',
    location: 'Central Office - Quezon City',
  },
  {
    id: 'EMP-2026-008',
    firstName: 'Maria Clara',
    lastName: 'Reyes',
    email: 'maria.reyes@example.com',
    phone: '+63 924 890 1234',
    role: 'Regional Director',
    department: 'Executive Office',
    status: 'On Leave',
    avatarColor: '#059669',
    dateJoined: 'Jan 10, 2022',
    location: 'Regional Office - XI (Davao)',
  },
  {
    id: 'EMP-2026-009',
    firstName: 'Antonio',
    lastName: 'Luna',
    email: 'antonio.luna@example.com',
    phone: '+63 925 901 2345',
    role: 'Legal',
    department: 'Legal Affairs Division',
    status: 'Active',
    avatarColor: '#4F46E5',
    dateJoined: 'Sep 05, 2023',
    location: 'Central Office - Quezon City',
  },
  {
    id: 'EMP-2026-010',
    firstName: 'Teresa',
    lastName: 'Magbanua',
    email: 'teresa.m@example.com',
    phone: '+63 926 012 3456',
    role: 'Accountant',
    department: 'Finance & Accounting',
    status: 'Inactive',
    avatarColor: '#E11D48',
    dateJoined: 'Apr 14, 2023',
    location: 'Central Office - Quezon City',
  },
];

export const DEPARTMENTS = [
  'Licensing & Registration Division',
  'Enforcement & Operations',
  'Radio Spectrum Planning',
  'Broadcasting & Cable TV Services',
  'Standards & Testing Division',
  'Records Management',
  'Legal Affairs Division',
  'Finance & Accounting',
  'Executive Office',
];

export const ROLES_LIST: EmployeeRole[] = [
  'Admin',
  'Evaluator',
  'Manager',
  'Staff',
  'Chief of EOD',
  'Regional Director',
  'Legal',
  'Accountant',
  'Cashier',
];
