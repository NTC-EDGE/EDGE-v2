import { apiClient } from "../index";
import { RegionDto, ApiResponse } from "../types/region";

export const FALLBACK_PHILIPPINE_REGIONS: RegionDto[] = [
  { id: "reg-ncr", code: "NCR", name: "National Capital Region", isActive: true },
  { id: "reg-car", code: "CAR", name: "Cordillera Administrative Region", isActive: true },
  { id: "reg-r1", code: "Region I", name: "Ilocos Region", isActive: true },
  { id: "reg-r2", code: "Region II", name: "Cagayan Valley", isActive: true },
  { id: "reg-r3", code: "Region III", name: "Central Luzon", isActive: true },
  { id: "reg-r4a", code: "Region IV-A", name: "CALABARZON", isActive: true },
  { id: "reg-mimaropa", code: "MIMAROPA", name: "MIMAROPA Region", isActive: true },
  { id: "reg-r5", code: "Region V", name: "Bicol Region", isActive: true },
  { id: "reg-r6", code: "Region VI", name: "Western Visayas", isActive: true },
  { id: "reg-r7", code: "Region VII", name: "Central Visayas", isActive: true },
  { id: "reg-r8", code: "Region VIII", name: "Eastern Visayas", isActive: true },
  { id: "reg-r9", code: "Region IX", name: "Zamboanga Peninsula", isActive: true },
  { id: "reg-r10", code: "Region X", name: "Northern Mindanao", isActive: true },
  { id: "reg-r11", code: "Region XI", name: "Davao Region", isActive: true },
  { id: "reg-r12", code: "Region XII", name: "SOCCSKSARGEN", isActive: true },
  { id: "reg-r13", code: "Region XIII", name: "Caraga", isActive: true },
  { id: "reg-barmm", code: "BARMM", name: "Bangsamoro Autonomous Region in Muslim Mindanao", isActive: true },
];

/**
 * Network Layer API function to fetch region records from the C# .NET 10 Backend API.
 * Endpoint: GET /api/v2/regions or GET /regions
 */
export const fetchRegions = async (activeOnly = true): Promise<RegionDto[]> => {
  try {
    const response = await apiClient.get<ApiResponse<RegionDto[]> | RegionDto[]>(
      `/api/v2/regions?activeOnly=${activeOnly}`
    );

    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload !== null && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)) {
      return payload.data;
    }
    return FALLBACK_PHILIPPINE_REGIONS;
  } catch (error: unknown) {
    console.warn("Backend Region API unavailable, using fallback region list:", error);
    return FALLBACK_PHILIPPINE_REGIONS;
  }
};

/**
 * Network Layer API function to fetch a single region by ID from the C# .NET 10 Backend API.
 * Endpoint: GET /api/v2/regions/{id}
 */
export const fetchRegionById = async (id: string): Promise<RegionDto | null> => {
  try {
    const response = await apiClient.get<ApiResponse<RegionDto> | RegionDto>(
      `/api/v2/regions/${id}`
    );
    const payload = response.data;
    if (payload !== null && typeof payload === "object" && "data" in payload && payload.data) {
      return payload.data;
    }
    if (payload !== null && typeof payload === "object" && "id" in payload) {
      return payload as RegionDto;
    }
    return null;
  } catch (error: unknown) {
    console.warn(`Failed to fetch region with ID ${id}:`, error);
    return null;
  }
};

/**
 * Validates that a user's assigned Tenant Region matches the selected login Region.
 * Prevents unauthorized cross-tenant staff access.
 */
export const validateTenantRegionAccess = (
  userAssignedRegion: string | null | undefined,
  selectedLoginRegion: string
): { isAuthorized: boolean; errorReason?: string } => {
  if (userAssignedRegion === null || userAssignedRegion === undefined || userAssignedRegion.trim().length === 0) {
    return { isAuthorized: true };
  }

  const cleanUserRegion = userAssignedRegion.toLowerCase().trim();
  const cleanSelectedRegion = selectedLoginRegion.toLowerCase().trim();

  const isMatch =
    cleanSelectedRegion.includes(cleanUserRegion) ||
    cleanUserRegion.includes(cleanSelectedRegion);

  if (!isMatch) {
    return {
      isAuthorized: false,
      errorReason: `Access Denied: Your staff account is assigned to Regional Office "${userAssignedRegion}". You cannot log into "${selectedLoginRegion}".`,
    };
  }

  return { isAuthorized: true };
};
