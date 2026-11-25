import useSWR from "swr";
import { apiClient } from "../apiClient";
import {
  ApiResponse,
  FeedbackDto,
  PublicRegionalOfficeDto,
  SubmitFeedbackPayload,
} from "../types";
import { resolveEffectiveTenantId } from "../utils/tenantUtils";

export interface UseAdminFeedbackReturn {
  feedback: FeedbackDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<FeedbackDto[]> | undefined>;
}

export function useAdminFeedback(tenantId?: string | null): UseAdminFeedbackReturn {
  const effectiveTenantId = resolveEffectiveTenantId(tenantId);
  const queryUrl = effectiveTenantId
    ? `/api/v2/feedback?tenantId=${encodeURIComponent(effectiveTenantId)}`
    : "/api/v2/feedback";

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<FeedbackDto[]>>(
    queryUrl,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<FeedbackDto[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: true },
  );

  return {
    feedback: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}

export interface UsePublicRegionalOfficesReturn {
  regionalOffices: PublicRegionalOfficeDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<PublicRegionalOfficeDto[]> | undefined>;
}

export function usePublicRegionalOffices(
  enabled = true,
): UsePublicRegionalOfficesReturn {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<PublicRegionalOfficeDto[]>
  >(
    enabled ? "/api/v2/tenants/public-directory" : null,
    async (url: string) => {
      const res =
        await apiClient.get<ApiResponse<PublicRegionalOfficeDto[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false },
  );

  return {
    regionalOffices: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}

export async function submitClientFeedback(
  payload: SubmitFeedbackPayload,
): Promise<FeedbackDto> {
  const res = await apiClient.post<FeedbackDto>("/api/v2/feedback", payload);
  return res.data;
}

