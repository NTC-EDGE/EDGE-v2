import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse, ApplicationSummaryDto, PagedApplicationListDto } from '../types';

export interface UseAdminApplicationsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateIfStale?: boolean;
}

export function useAdminApplications(
  params?: {
    queueTab?: string;
    scope?: 'queue' | 'region';
    status?: string;
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    mode?: string;
  },
  options?: UseAdminApplicationsOptions
) {
  const searchParams = new URLSearchParams();
  if (params?.queueTab) searchParams.set('queueTab', params.queueTab);
  if (params?.scope) searchParams.set('scope', params.scope);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.pageNumber) searchParams.set('pageNumber', params.pageNumber.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params?.searchTerm) searchParams.set('searchTerm', params.searchTerm);
  if (params?.mode) searchParams.set('mode', params.mode);

  const queryString = searchParams.toString();
  const key = `/api/v2/applications${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<PagedApplicationListDto | ApplicationSummaryDto[]>
  >(
    key,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<PagedApplicationListDto | ApplicationSummaryDto[]>>(url);
      return res.data;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateIfStale: options?.revalidateIfStale,
      refreshInterval: options?.refreshInterval,
    }
  );

  const payloadData = data?.data;
  const applications: ApplicationSummaryDto[] = Array.isArray(payloadData)
    ? payloadData
    : Array.isArray(payloadData?.items)
    ? payloadData.items
    : [];

  const pagination = payloadData && !Array.isArray(payloadData)
    ? {
        pageNumber: payloadData.pageNumber ?? 1,
        pageSize: payloadData.pageSize ?? 10,
        totalCount: payloadData.totalCount ?? applications.length,
        totalPages: payloadData.totalPages ?? 1,
        hasPreviousPage: Boolean(payloadData.hasPreviousPage),
        hasNextPage: Boolean(payloadData.hasNextPage),
        statistics: payloadData.statistics,
      }
    : null;

  return {
    applications,
    pagination,
    statistics: pagination?.statistics,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
