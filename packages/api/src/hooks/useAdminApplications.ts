import useSWR, { mutate as globalMutate } from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse, ApplicationSummaryDto, PagedApplicationListDto } from '../types';

/**
 * Revalidates all SWR caches matching the applications API (/api/v2/applications),
 * ensuring the queue list, activity feed, dashboard metrics, and detail views
 * immediately update when application status or review evaluation data changes.
 */
export async function mutateApplications(applicationId?: string): Promise<void> {
  await globalMutate(
    (key: unknown) => {
      if (typeof key !== 'string') return false;
      if (key.startsWith('/api/v2/applications')) return true;
      return false;
    },
    undefined,
    { revalidate: true }
  );

  if (applicationId) {
    await globalMutate(`/api/v2/applications/${applicationId}`, undefined, { revalidate: true });
  }
}

export interface UseAdminApplicationsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateIfStale?: boolean;
  dedupingInterval?: number;
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
    tenantId?: string;
    role?: string;
    assignedTo?: string;
    fieldOffice?: string;
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
  if (params?.tenantId) searchParams.set('tenantId', params.tenantId);
  if (params?.role) searchParams.set('role', params.role);
  if (params?.assignedTo) searchParams.set('assignedTo', params.assignedTo);
  if (params?.fieldOffice) searchParams.set('fieldOffice', params.fieldOffice);

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
      revalidateOnFocus: options?.revalidateOnFocus ?? true,
      revalidateIfStale: options?.revalidateIfStale ?? true,
      refreshInterval: options?.refreshInterval ?? 3000,
      dedupingInterval: options?.dedupingInterval ?? 1500,
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
