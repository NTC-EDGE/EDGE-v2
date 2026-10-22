export type AccountType = 'Individual' | 'Company';
export type UserStatus =
  | 'Active License'
  | 'Under Review'
  | 'Returned for Correction'
  | 'Draft'
  | 'Active'
  | 'Pending'
  | 'Inactive';

export interface UserTransaction {
  id: string;
  refNo: string;
  type: string;
  serviceType: string;
  applicationNumber?: string;
  amount: number;
  status: string;
  date: string;
}

export interface User {
  id: string;
  userId?: string | null;
  accountType: AccountType;
  avatarType: 'icon' | 'initials';
  avatarInitials?: string;
  avatarBgColor?: string;
  name: string;
  email: string;
  region: string;
  tenantId?: string;
  tenantName?: string;
  organization: string;
  licenseCategory: string;
  applicationsCount: number;
  status: UserStatus;
  phone: string;
  address: string;
  createdDate: string;
  description?: string;
  password?: string;
  totalBilledAmount?: number;
  totalPaidAmount?: number;
  lastTransactionDate?: string;
  transactions?: UserTransaction[];
  companyRegistrationNumber?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyContactNumber?: string;
  taxIdentificationNumber?: string;
  authorizedRepresentative?: string;
  stationCallSign?: string;
  nationality?: string;
  birthDate?: string;
  sex?: string;
}

export const ACCOUNT_TYPES: AccountType[] = ['Individual', 'Company'];
export const STATUS_LIST: UserStatus[] = [
  'Active License',
  'Under Review',
  'Returned for Correction',
  'Draft',
];

export const CATEGORIES_LIST = [
  'All',
  'Commercial Broadcast & TVRO Service',
  'Fixed & Land Mobile Radio Network',
  'Aeronautical Radio Communications',
  'Maritime Mobile Radio Service',
  'Amateur Radio Station Service',
  'Customer Premises Equipment (CPE) & Dealer Accreditation',
  'Value Added Services (VAS) & Telecommunications',
];
