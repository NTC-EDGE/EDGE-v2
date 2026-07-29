import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse } from "../types";

export interface FieldOfficeDto {
  id: string;
  tenantId: string;
  name: string;
  code: string;
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
  refetch: () => Promise<ApiResponse<FieldOfficeDto[]> | undefined>;
}

export function useAdminFieldOffices(): UseAdminFieldOfficesReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<FieldOfficeDto[]>>(
    "/api/v2/field-offices",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<FieldOfficeDto[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    fieldOffices: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
