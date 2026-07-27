import useSWR from "swr";
import { apiClient } from "../index";
import { ApiResponse } from "../types";

export interface ServiceItem {
  id: string;
  serviceCategoryId: string;
  serviceCategoryCode: string;
  serviceCategoryType: string;
  name: string;
  group?: string;
  code?: string;
  description?: string;
  tenantId?: string;
}

export interface UseAdminServicesReturn {
  services: ServiceItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
}

export function useAdminServices(): UseAdminServicesReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ServiceItem[]>>(
    "/api/v2/services",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ServiceItem[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    services: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
