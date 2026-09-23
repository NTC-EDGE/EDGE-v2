export type EmployeeRole = string;

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Employee {
  id: string;
  memberId?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  middleName: string;
  suffix: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  region: string;
  level: string;
  title: string;
  division: string;
  position: string;
  designation: string;
  signatureDisplay: 'beside' | 'above';
  signatureUri: string;
  status: EmployeeStatus;
  avatarColor: string;
  dateJoined: string;
  location: string;
  fieldOffice?: string;
  provisioningMethod?: 'email' | 'manual';
  password?: string;
}

export const FIELD_OFFICES_LIST = [
  'Regional Main Office (Central Station)',
  'Field Operations Center - North',
  'Field Operations Center - South',
  'District Enforcement Office A',
  'District Enforcement Office B',
  'Spectrum Monitoring & Inspection Station',
  'Licensing & Public Customer Center',
];

export const REGIONS_LIST = [
  'Central Office (Headquarters)',
  'NCR - National Capital Region',
  'CAR - Cordillera Administrative Region',
  'Region I - Ilocos Region',
  'Region II - Cagayan Valley',
  'Region III - Central Luzon',
  'Region IV-A - CALABARZON',
  'Region V - Bicol Region',
  'Region VI - Western Visayas',
  'Region VII - Central Visayas',
  'Region VIII - Eastern Visayas',
  'Region IX - Zamboanga Peninsula',
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region XII - SOCCSKSARGEN',
  'Region XIII - Caraga',
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
