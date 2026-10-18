import { Application, SoaLineItem } from '../../../data/applicationsData';

export type ClientReportTab = 'soa' | 'op' | 'or';
export type PreviewViewFormat = 'pdf' | 'grid';

export interface ClientSoaOpPreviewModalProps {
  visible: boolean;
  app: Application;
  initialTab?: ClientReportTab;
  onClose: () => void;
  onProceedToPayment?: () => void;
}

export interface ClientSoaOpHeaderProps {
  activeTab: ClientReportTab;
  refNum: string;
  applicantName: string;
  viewFormat: PreviewViewFormat;
  showActionMenu: boolean;
  onToggleActionMenu: () => void;
  onCloseActionMenu: () => void;
  onSelectViewFormat: (format: PreviewViewFormat) => void;
  onPrint: () => void;
  onClose: () => void;
}

export interface ClientSoaOpDropdownMenuProps {
  visible: boolean;
  isPaid: boolean;
  soaNum: string;
  opNum: string;
  orNum: string | null;
  orList: string[];
  onDownloadDoc: (targetDoc: ClientReportTab, targetOrNumber?: string) => void;
  onReloadTemplate: () => void;
  onClose: () => void;
}

export interface ClientSoaOpTabsProps {
  activeTab: ClientReportTab;
  onSelectTab: (tab: ClientReportTab) => void;
  soaNum: string;
  opNum: string;
  orNum: string | null;
  isPaid: boolean;
  orList: string[];
  effectiveSelectedOr: string | null;
  onSelectOrNumber: (token: string) => void;
}

export interface ClientSoaOpPdfViewerProps {
  activeTab: ClientReportTab;
  isLoadingPdf: boolean;
  pdfError: string | null;
  pdfBlobUrl: string | null;
  onRetry: () => void;
  onSwitchToGrid: () => void;
}

export interface ClientSoaDataViewProps {
  app: Application;
  soaNum: string;
  applicantName: string;
  applicantType: string;
  contactNum: string;
  emailAddr: string;
  formattedAddr: string;
  serviceName: string;
  categoryName: string;
  refNum: string;
  filingMode: string;
  dueDateFormatted: string;
  lineItems: SoaLineItem[];
  totalAmount: number;
  wordsTotal: string;
  isDesktop: boolean;
}

export interface ClientOpDataViewProps {
  app: Application;
  opNum: string;
  applicantName: string;
  formattedAddr: string;
  serviceName: string;
  refNum: string;
  lineItems: SoaLineItem[];
  totalAmount: number;
  wordsTotal: string;
  orNum: string | null;
  orList: string[];
  isDesktop: boolean;
}

export interface ClientOrDataViewProps {
  app: Application;
  refNum: string;
  opNum: string;
  orNum: string | null;
  effectiveSelectedOr: string | null;
  applicantName: string;
  formattedAddr: string;
  officeName: string;
  paidAmount: number;
  paidDateFormatted: string;
  wordsPaid: string;
  lineItems: SoaLineItem[];
  isDesktop: boolean;
}

export interface ClientSoaOpFooterProps {
  isPaid: boolean;
  onClose: () => void;
  onProceedToPayment?: () => void;
}
