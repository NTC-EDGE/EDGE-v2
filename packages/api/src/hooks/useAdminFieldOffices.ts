import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse } from "../types";
import { resolveEffectiveTenantId } from "../utils/tenantUtils";

export interface FieldOfficeDto {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  category?: string;
  description?: string | null;
  regionId: string;
  provinceId?: string | null;
  address: string;
  contactPhone: string;
  contactEmail: string;
  officerInChargeId: string;
  officerName?: string;
  officerEmail?: string;
  isActive: boolean;
  allowSpectrumInspection: boolean;
  allowPermitIssuance: boolean;
  allowComplaintReception: boolean;
  regionName?: string;
  provinceName?: string | null;
}

export interface UseAdminFieldOfficesReturn {
  fieldOffices: FieldOfficeDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
}

function isFieldOfficeDto(item: unknown): item is FieldOfficeDto {
  if (typeof item !== "object" || item === null) return false;
  return (
    typeof Reflect.get(item, "id") === "string" &&
    typeof Reflect.get(item, "name") === "string"
  );
}

function extractFieldOffices(payload: unknown): FieldOfficeDto[] {
  if (Array.isArray(payload)) {
    return payload.filter(isFieldOfficeDto);
  }
  if (typeof payload === "object" && payload !== null) {
    const nested = Reflect.get(payload, "data");
    if (Array.isArray(nested)) {
      return nested.filter(isFieldOfficeDto);
    }
  }
  return [];
}

export function useAdminFieldOffices(tenantId?: string): UseAdminFieldOfficesReturn {
  const effectiveTenantId = resolveEffectiveTenantId(tenantId);
  const url = effectiveTenantId
    ? `/api/v2/field-offices?tenantId=${encodeURIComponent(effectiveTenantId)}`
    : "/api/v2/field-offices";
  const { data, error, isLoading, mutate } = useSWR<unknown>(
    url,
    async (endpoint: string) => {
      const res = await apiClient.get<unknown>(endpoint);
      return res.data;
    },
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  const fieldOffices = extractFieldOffices(data);

  return {
    fieldOffices,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
