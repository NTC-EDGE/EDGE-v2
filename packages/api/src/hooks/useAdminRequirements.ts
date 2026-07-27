import useSWR from "swr";
import { apiClient } from "../index";
import { ApiResponse, Requirement, ServiceVariantRequirement } from "../types";

export interface UseAdminRequirementsReturn {
  requirements: Requirement[];
  serviceVariantRequirements: ServiceVariantRequirement[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
}

export function useAdminRequirements(): UseAdminRequirementsReturn {
  const { data: reqData, error: reqErr, isLoading: reqLoading, mutate: reqMutate } = useSWR<ApiResponse<Requirement[]>>(
    "/api/v2/requirements",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<Requirement[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  const { data: svrData, error: svrErr, isLoading: svrLoading, mutate: svrMutate } = useSWR<ApiResponse<ServiceVariantRequirement[]>>(
    "/api/v2/service-variant-requirements",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ServiceVariantRequirement[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  const refetchAll = async () => {
    await Promise.all([reqMutate(), svrMutate()]);
  };

  return {
    requirements: reqData?.data ?? [],
    serviceVariantRequirements: svrData?.data ?? [],
    isLoading: reqLoading || svrLoading,
    isError: Boolean(reqErr || svrErr),
    refetch: refetchAll,
  };
}
