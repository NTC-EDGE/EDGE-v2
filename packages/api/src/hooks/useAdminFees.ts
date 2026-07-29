import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse, Fee, ServiceFee } from "../types";

export interface UseAdminFeesReturn {
  fees: Fee[];
  serviceFees: ServiceFee[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
}

export function useAdminFees(): UseAdminFeesReturn {
  const { data: feeData, error: feeErr, isLoading: feeLoading, mutate: feeMutate } = useSWR<ApiResponse<Fee[]>>(
    "/api/v2/fees",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<Fee[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  const { data: sfData, error: sfErr, isLoading: sfLoading, mutate: sfMutate } = useSWR<ApiResponse<ServiceFee[]>>(
    "/api/v2/service-fees",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ServiceFee[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  const refetchAll = async () => {
    await Promise.all([feeMutate(), sfMutate()]);
  };

  return {
    fees: feeData?.data ?? [],
    serviceFees: sfData?.data ?? [],
    isLoading: feeLoading || sfLoading,
    isError: Boolean(feeErr || sfErr),
    refetch: refetchAll,
  };
}
