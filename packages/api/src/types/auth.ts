import { ApiResponse } from "./region";

export interface VerifyStaffSessionRequest {
  selectedRegion: string;
}

export interface VerifyStaffSessionDto {
  userId: string;
  email: string;
  tenantId: string;
  tenantName: string;
  regionCode: string;
  regionName: string;
  isAuthorized: boolean;
  assignedRoles: string[];
  effectivePermissions: string[];
}

export type VerifyStaffSessionResponse = ApiResponse<VerifyStaffSessionDto>;
