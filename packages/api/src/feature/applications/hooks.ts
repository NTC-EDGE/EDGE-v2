import { SWRConfiguration, SWRResponse } from 'swr';
import { useAuthenticatedSWR } from '../../index';
import { ApiResponse, PaginatedApiResponse } from '../../types';
import { ApplicationDto, GetApplicationsParams } from './types';

export function useApplications(
  clerkGetToken: () => Promise<string | null>,
  params?: GetApplicationsParams,
  config?: SWRConfiguration<PaginatedApiResponse<ApplicationDto>>
): SWRResponse<PaginatedApiResponse<ApplicationDto>> {
  const queryParams = new URLSearchParams();
  if (params !== undefined) {
    if (params.tenantId !== undefined && params.tenantId !== null) {
      queryParams.append('tenantId', params.tenantId);
    }
    if (params.status !== undefined && params.status !== null) {
      queryParams.append('status', params.status);
    }
    if (params.search !== undefined && params.search !== null) {
      queryParams.append('search', params.search);
    }
    if (params.pageNumber !== undefined && params.pageNumber !== null) {
      queryParams.append('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
  }

  const queryString = queryParams.toString();
  const key = queryString !== '' ? `/applications?${queryString}` : '/applications';

  return useAuthenticatedSWR<PaginatedApiResponse<ApplicationDto>>(
    key,
    clerkGetToken,
    config
  );
}

export function useApplicationById(
  id: string | null,
  clerkGetToken: () => Promise<string | null>,
  config?: SWRConfiguration<ApiResponse<ApplicationDto>>
): SWRResponse<ApiResponse<ApplicationDto>> {
  const key = id !== null && id.length > 0 ? `/applications/${id}` : null;
  return useAuthenticatedSWR<ApiResponse<ApplicationDto>>(
    key,
    clerkGetToken,
    config
  );
}

export function useDraftApplications(
  clerkGetToken: () => Promise<string | null>,
  config?: SWRConfiguration<ApiResponse<ApplicationDto[]>>
): SWRResponse<ApiResponse<ApplicationDto[]>> {
  return useAuthenticatedSWR<ApiResponse<ApplicationDto[]>>(
    '/applications/drafts',
    clerkGetToken,
    config
  );
}
