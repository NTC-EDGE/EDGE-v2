import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse } from "../types";

export interface FormVersionSummaryDto {
  formId: string;
  version: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  sectionsCount: number;
  fieldsCount: number;
}

export interface AdminFormFieldDto {
  fieldId: string;
  label: string;
  type: string;
  isRequired: boolean;
  orderIndex: number;
  validationRules?: string | null;
  visibilityCondition?: string | null;
}

export interface AdminFormSectionDto {
  key: string;
  title: string;
  required: boolean;
  orderIndex: number;
  fields: AdminFormFieldDto[];
}

export interface AdminFormDto {
  formId: string;
  serviceId: string;
  serviceName?: string;
  serviceCode?: string;
  name?: string;
  version: string;
  isActive: boolean;
  categorySelectionRequired?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sections: AdminFormSectionDto[];
  availableVersions?: FormVersionSummaryDto[];
}

export interface UseAdminFormsReturn {
  forms: AdminFormDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<AdminFormDto[]> | undefined>;
  activateForm: (formId: string) => Promise<ApiResponse<AdminFormDto>>;
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

  const activateForm = async (formId: string): Promise<ApiResponse<AdminFormDto>> => {
    const res = await apiClient.post<ApiResponse<AdminFormDto>>(`/api/v2/forms/${formId}/activate`);
    await mutate();
    return res.data;
  };

  return {
    forms: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
    activateForm,
  };
}
