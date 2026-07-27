import { SWRConfiguration, SWRResponse } from "swr";
import { useAuthenticatedSWR } from "../../index";
import { ApiResponse, PaginatedApiResponse } from "../../types";
import { ApplicationDto, GetApplicationsParams } from "./types";

export function useApplications(
  clerkGetToken: () => Promise<string | null>,
  params?: GetApplicationsParams | null,
  config?: SWRConfiguration<PaginatedApiResponse<ApplicationDto>>,
): SWRResponse<PaginatedApiResponse<ApplicationDto>> {
  // When params is explicitly null, pass null as the SWR key → fetch is skipped
  let key: string | null = null;
  if (params !== null) {
    const queryParams = new URLSearchParams();
    if (params !== undefined) {
      if (params.tenantId !== undefined && params.tenantId !== null) {
        queryParams.append("tenantId", params.tenantId);
      }
      if (params.status !== undefined && params.status !== null) {
        queryParams.append("status", params.status);
      }
      if (params.search !== undefined && params.search !== null) {
        queryParams.append("search", params.search);
      }
      if (params.pageNumber !== undefined && params.pageNumber !== null) {
        queryParams.append("pageNumber", params.pageNumber.toString());
      }
      if (params.pageSize !== undefined && params.pageSize !== null) {
        queryParams.append("pageSize", params.pageSize.toString());
      }
    }
    const queryString = queryParams.toString();
    key =
      queryString !== ""
        ? `/api/v2/applications?${queryString}`
        : "/api/v2/applications";
  }

  return useAuthenticatedSWR<PaginatedApiResponse<ApplicationDto>>(
    key,
    clerkGetToken,
    config,
  );
}

export function useApplicationById(
  id: string | null,
  clerkGetToken: () => Promise<string | null>,
  config?: SWRConfiguration<ApiResponse<ApplicationDto>>,
): SWRResponse<ApiResponse<ApplicationDto>> {
  const key =
    id !== null && id.length > 0 ? `/api/v2/applications/${id}` : null;
  return useAuthenticatedSWR<ApiResponse<ApplicationDto>>(
    key,
    clerkGetToken,
    config,
  );
}

export function useDraftApplications(
  clerkGetToken: () => Promise<string | null>,
  enabled: boolean = true,
  config?: SWRConfiguration<ApiResponse<ApplicationDto[]>>,
): SWRResponse<ApiResponse<ApplicationDto[]>> {
  // When not enabled, pass null key → SWR skips the fetch
  const key = enabled ? "/api/v2/applications/drafts" : null;
  return useAuthenticatedSWR<ApiResponse<ApplicationDto[]>>(
    key,
    clerkGetToken,
    config,
  );
}
