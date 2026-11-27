import { ApiResponse } from "../types";

export interface RegionDto {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface RegionOption {
  label: string;
  value: string;
  code: string;
  id: string;
}

export type { ApiResponse };

export interface ReportSignatoriesDto {
  regionalDirectorName: string;
  regionalDirectorTitle: string;
  chiefEodName: string;
  chiefEodTitle: string;
  regionalAccountantName: string;
  regionalAccountantTitle: string;
  collectingOfficerName: string;
  collectingOfficerTitle: string;
  misOfficerName: string;
  misOfficerTitle: string;
  examProctorName: string;
  examProctorTitle: string;
}

export interface RegionalConfigDto {
  tenantId?: string;
  regionId?: string;
  tenantCode: string;
  tenantName: string;
  rcCodeSoa: string;
  rcCodeOp: string;
  fundCluster: string;
  mfoPapCode?: string;
  requestAndComplaintRouting: 'DirectToLegal' | 'DirectToEvaluator';
  supportEmail?: string;
  supportPhone?: string;
  allowManualSoaNumber?: boolean;
  allowManualOpNumber?: boolean;
  enableInternalEmailNotifications?: boolean;
  reportSignatories?: ReportSignatoriesDto;
}
