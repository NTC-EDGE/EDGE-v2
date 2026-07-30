import { Icon as Lucide } from '@edge/ui';

export interface RegionalConfigCard {
  id: string;
  category: string;
  subtitle: string;
  name: string;
  subLabel?: string;
  rcCode?: string;
  officeCode?: string;
  commissionerName?: string;
  supportEmail?: string;
  supportPhone?: string;
  badge?: {
    text: string;
    type: 'primary' | 'active' | 'commissioner';
  };
  icon: keyof typeof Lucide.glyphMap;
  iconBg: string;
  iconColor: string;
}

export interface FeedbackItem {
  id: string;
  applicantName: string;
  applicantEmail: string;
  rating: number;
  category: string;
  comment: string;
  createdAt: string;
  isAnonymous?: boolean;
}

export interface ApplicationRequirementItem {
  id: string;
  title: string;
  statusText: string;
  mappedCount: number;
  requiredCount: number;
  optionalCount: number;
  mappedDocuments: {
    id: string;
    name: string;
    isRequired: boolean;
  }[];
}

export interface FeePaymentItem {
  id: string;
  title: string;
  statusText: string;
  configuredCount: number;
  totalAmount: number;
  feeBreakdown: {
    id: string;
    name: string;
    amount: number;
  }[];
}

export interface NoteItem {
  id: string;
  title: string;
  statusText: string;
  typeText: string;
  targetView: string;
  instructions: string;
}

export interface BranchOfficeStats {
  total: number;
  mainOffice: number;
  fieldOffice: number;
}

export interface BranchOffice {
  id: string;
  name: string;
  code: string;
  type: 'Main Office' | 'Field Office';
  address: string;
  contactNumber: string;
}

export interface FormBuilderItem {
  id: string;
  title: string;
  code: string;
  version: string;
  status: 'Published' | 'Draft';
  fieldsCount: number;
  lastUpdated?: string;
  serviceType?: string;
}
