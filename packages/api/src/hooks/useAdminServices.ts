import useSWR from "swr";
import { apiClient } from "../apiClient";
import { PaginatedApiResponse } from "../types";

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

export async function fetchAllServices(): Promise<ServiceItem[]> {
  const pageSize = 50;
  const firstRes = await apiClient.get<PaginatedApiResponse<ServiceItem>>(
    "/api/v2/services",
    {
      params: { pageNumber: 1, pageSize },
    }
  );

  const initialData = firstRes.data?.data ?? [];
  const totalPages = firstRes.data?.totalPages ?? 1;

  if (totalPages > 1) {
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(
        apiClient.get<PaginatedApiResponse<ServiceItem>>("/api/v2/services", {
          params: { pageNumber: page, pageSize },
        })
      );
    }

    const subsequentResponses = await Promise.all(pagePromises);
    const all = [...initialData];
    for (const res of subsequentResponses) {
      if (res.data?.data) {
        all.push(...res.data.data);
      }
    }
    return all;
  }

  return initialData;
}

export function useAdminServices(): UseAdminServicesReturn {
  const { data, error, isLoading, mutate } = useSWR<ServiceItem[]>(
    "/api/v2/services",
    fetchAllServices,
    { revalidateOnFocus: false }
  );

  return {
    services: data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
