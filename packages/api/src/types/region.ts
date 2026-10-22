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

export interface RegionalConfigDto {
  tenantId?: string;
  regionId?: string;
  tenantCode: string;
  tenantName: string;
  rcCodeSoa: string;
  rcCodeOp: string;
  fundCluster: string;
  requestAndComplaintRouting: 'DirectToLegal' | 'DirectToEvaluator';
  supportEmail?: string;
  supportPhone?: string;
}
