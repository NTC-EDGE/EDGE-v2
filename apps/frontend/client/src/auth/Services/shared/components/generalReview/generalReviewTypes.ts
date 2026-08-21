import { Icon } from '@edge/ui';
import { NTCService } from '../../../data/servicesData';
import { TenantInfo, OfficeInfo, GeneralApplicantData, ServiceRequirementItem } from '../../hooks/useGeneralServiceWizard';

export interface GeneralReviewSubmitStepProps {
  service: NTCService;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  selectedRegionId: string | null;
  selectedOfficeId: string | null;
  activeApplicant: GeneralApplicantData;
  applicants?: GeneralApplicantData[];
  currentApplicantIndex?: number;
  appMode: 'SINGLE' | 'BULK' | '';
  variants?: Array<{ id: string; name?: string; description?: string; type?: string }>;
  variantRequirements?: Array<ServiceRequirementItem | string>;
  schedules?: Array<{ id: string; scheduledDate: string; startTime?: string; endTime?: string; venue?: string }>;
  selectedScheduleId?: string | null;
}

export interface PreviewFileObject {
  name: string;
  uri?: string;
}

export type PreviewFileTarget = PreviewFileObject | string | null;

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
