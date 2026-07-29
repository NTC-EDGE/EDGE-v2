import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse } from "../types";

export interface AdminFormDto {
  formId: string;
  serviceId: string;
  version: string;
  sections: Array<{
    key: string;
    title: string;
    required: boolean;
    orderIndex: number;
    fields: Array<{
      fieldId: string;
      label: string;
      type: string;
      isRequired: boolean;
      orderIndex: number;
      validationRules?: string | null;
      visibilityCondition?: string | null;
    }>;
  }>;
}

export interface UseAdminFormsReturn {
  forms: AdminFormDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<AdminFormDto[]> | undefined>;
}

export function useAdminForms(): UseAdminFormsReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AdminFormDto[]>>(
    "/api/v2/forms",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<AdminFormDto[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    forms: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
