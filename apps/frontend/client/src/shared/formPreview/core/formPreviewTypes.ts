import { Icon } from '@edge/ui';

// ─── Field Value ─────────────────────────────────────────────────────────────

export interface FormFieldValue {
  fieldId: string;
  fieldLabel: string;
  value: string;
}

// ─── Section Group ────────────────────────────────────────────────────────────

export interface DynamicSectionField {
  fieldId: string;
  label: string;
  value: string;
}

export interface DynamicSectionGroup {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  accentColor: string;
  fields: DynamicSectionField[];
}

// ─── Preview File ─────────────────────────────────────────────────────────────

export interface PreviewFileObject {
  name: string;
  uri?: string;
}

export type PreviewFileTarget = PreviewFileObject | string | null;

// ─── Extension System ─────────────────────────────────────────────────────────

export interface ServiceIdentifier {
  id?: string;
  title?: string;
  name?: string;
  category?: string;
}

export interface PreviewSectionConfig {
  /** Whether to inject this card before or after the dynamic form sections */
  position: 'before' | 'after';
  render: (props: PreviewExtensionRenderProps) => React.ReactNode | null;
}

export interface PreviewExtension {
  /** Function that returns true when this extension applies to the given service */
  matchService: (service: ServiceIdentifier) => boolean;
  /** Field IDs to suppress from the generic section builder for this service */
  skipFieldIds?: string[];
  /** Field labels (lowercased) to suppress from the generic section builder */
  skipFieldLabels?: string[];
  /** Extra cards to inject before or after the dynamic sections */
  sections?: PreviewSectionConfig[];
}

export interface PreviewExtensionRenderProps {
  service: ServiceIdentifier;
  formFieldValues: FormFieldValue[];
  /** Available in wizard mode */
  activeApplicant?: ActiveApplicantSnapshot;
  /** Available in My Application mode */
  app?: ApplicationSnapshot;
  onPreviewFile?: (uri: string, label: string) => void;
}

// ─── Applicant Snapshots (flexible surface shared between wizard & My App) ───

export interface ActiveApplicantSnapshot {
  applicantType?: string;
  companyName?: string | null;
  representativeName?: string | null;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  email?: string;
  contactNo?: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  birthDate?: string | null;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  sex?: string | null;
  civilStatus?: string | null;
  nationality?: string | null;
  notes?: string | null;
  signatureUrl?: string;
  dtiSecRegistration?: string;
  radioCertData?: unknown;
  deviceRegData?: unknown;
  tvroRegData?: unknown;
  vasData?: unknown;
  copyOfCertData?: unknown;
  amateurLicenseData?: unknown;
  lifetimeLicenseData?: unknown;
  permitData?: unknown;
}

export interface ApplicationSnapshot {
  serviceId?: string;
  serviceName?: string;
  serviceCategory?: string;
  serviceVariantId?: string | null;
  applicantName?: string;
  companyName?: string | null;
  mode?: string;
}

// ─── Build Options ─────────────────────────────────────────────────────────────

export interface BuildDynamicSectionsOptions {
  isAmateurCertService?: boolean;
  isVasCertService?: boolean;
  skipFieldIds?: string[];
  skipFieldLabels?: string[];
}

export interface BuildDynamicSectionsResult {
  dynamicSectionsToRender: DynamicSectionGroup[];
  remainingFields: FormFieldValue[];
}
