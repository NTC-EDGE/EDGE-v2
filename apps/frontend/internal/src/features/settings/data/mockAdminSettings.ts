export interface RegionalConfigCard {
  id: string;
  category: string;
  subtitle: string;
  name: string;
  subLabel: string;
  badge?: {
    text: string;
    type: 'primary' | 'active' | 'commissioner';
  };
  icon: string;
  iconBg: string;
  iconColor: string;
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
  serviceType?: string;
  code: string;
  version: string;
  status: 'Published' | 'Draft';
  fieldsCount: number;
  lastUpdated?: string;
  description?: string;
}

export interface FeedbackItem {
  id: string;
  sender: string;
  email: string;
  subject: string;
  date: string;
  rating: number;
  status: 'Reviewed' | 'Pending';
  message: string;
  officeAgency?: string;
  contactNumber?: string;
  submittedBy?: string;
  region?: string;
}

export const INITIAL_REGIONAL_CONFIGS: RegionalConfigCard[] = [];
export const INITIAL_BRANCH_OFFICES: BranchOffice[] = [];
export const INITIAL_APP_REQUIREMENTS: ApplicationRequirementItem[] = [];
export const INITIAL_FEES_PAYMENTS: FeePaymentItem[] = [];
export const INITIAL_NOTES: NoteItem[] = [];
export const INITIAL_FORM_BUILDERS: FormBuilderItem[] = [];
export const INITIAL_FEEDBACK: FeedbackItem[] = [];
