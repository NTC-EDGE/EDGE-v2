import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse } from "../types";

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

export function useAdminFieldOffices(tenantId?: string): UseAdminFieldOfficesReturn {
  const url = tenantId ? `/api/v2/field-offices?tenantId=${tenantId}` : "/api/v2/field-offices";
  const { data, error, isLoading, mutate } = useSWR<unknown>(
    url,
    async (endpoint: string) => {
      const res = await apiClient.get<unknown>(endpoint);
      return res.data;
    },
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  let fieldOffices: FieldOfficeDto[] = [];
  if (Array.isArray(data)) {
    fieldOffices = data as FieldOfficeDto[];
  } else if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
    fieldOffices = (data as { data: FieldOfficeDto[] }).data;
  }

  return {
    fieldOffices,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
