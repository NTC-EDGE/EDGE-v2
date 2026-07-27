import { apiClient } from "../index";
import {
  VerifyStaffSessionDto,
  VerifyStaffSessionResponse,
  TenantRegionMembershipDto,
  TenantRegionMembershipsResponse,
} from "../types/auth";

/**
 * Service Layer function to verify staff tenant and region membership with the C# .NET 10 Backend API.
 * Endpoint: POST /api/v2/tenants/verify-membership
 */
export const verifyStaffMembership = async (
  token: string | null | undefined,
  selectedRegion: string
): Promise<VerifyStaffSessionDto> => {
  const headers: Record<string, string> = {};
  if (token !== null && token !== undefined && token.trim().length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await apiClient.post<VerifyStaffSessionResponse>(
    "/api/v2/tenants/verify-membership",
    { selectedRegion },
    { headers }
  );

  const payload = response.data;
  if (payload.succeeded && payload.data) {
    return payload.data;
  }

  if (!payload.succeeded && payload.message) {
    throw new Error(payload.message);
  }

  throw new Error("Failed to verify staff tenant membership.");
};

/**
 * Service Layer function to fetch caller's active Regional Office tenant memberships.
 * Endpoint: GET /api/v2/tenants/my-memberships
 */
export const fetchMyTenantMemberships = async (
  token: string | null | undefined
): Promise<TenantRegionMembershipDto[]> => {
  const headers: Record<string, string> = {};
  if (token !== null && token !== undefined && token.trim().length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await apiClient.get<TenantRegionMembershipsResponse>(
    "/api/v2/tenants/my-memberships",
    { headers }
  );

  const payload = response.data;
  if (payload.succeeded && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};
