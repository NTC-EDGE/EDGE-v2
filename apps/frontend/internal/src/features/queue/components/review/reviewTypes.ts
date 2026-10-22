import { DocumentPreviewFile } from "../../../../shared/components/DocumentPreviewModal";
import { ApplicationData, ApplicantItem, ApplicationFormAttachment } from "../../../../types/application";

export type InnerTab = "details" | "applicant-record" | "soa";

export interface ReviewTabItem {
  key: InnerTab;
  label: string;
  icon: "file-text" | "user" | "credit-card";
}

export const INNER_TABS: ReviewTabItem[] = [
  { key: "details", label: "Application Details", icon: "file-text" },
  { key: "applicant-record", label: "Applicant Records", icon: "user" },
  { key: "soa", label: "SOA & Payment", icon: "credit-card" },
];

export interface SectionHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export interface InfoRowProps {
  label: string;
  value: string;
  onEdit?: () => void;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (v: string) => void;
  onEditDone?: () => void;
  showRowSaveButton?: boolean;
}

export interface ApplicationDetailsTabProps {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
  selectedApplicantIndex?: number;
  onSelectApplicantIndex?: (index: number) => void;
  onInspectApplicant?: (index: number) => void;
  onPreviewFile?: (file: DocumentPreviewFile | string, label?: string) => void;
  onPrintAccountableForm?: (form?: ApplicationFormAttachment) => void;
}

export interface ApplicantRecordTabProps {
  app: ApplicationData;
  selectedApplicantIndex?: number;
  onSelectApplicantIndex?: (index: number) => void;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
  isEditable: boolean;
  onPreviewFile?: (file: DocumentPreviewFile | string, label?: string) => void;
}

export interface SoaPaymentTabProps {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
  onOpenGenerateSoa: () => void;
  onPrintSoa?: () => void;
  onPrintOp?: () => void;
  onPreviewReport: (docType: 'soa' | 'op' | 'or' | 'summary') => void;
}
