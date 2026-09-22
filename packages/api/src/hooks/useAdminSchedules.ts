import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { PaginatedApiResponse, ScheduleItemDto } from '../types';

export interface UseAdminSchedulesParams {
  tenantId?: string;
  serviceId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UseAdminSchedulesReturn {
  schedules: ScheduleItemDto[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<PaginatedApiResponse<ScheduleItemDto> | undefined>;
}

export function useAdminSchedules(params?: UseAdminSchedulesParams): UseAdminSchedulesReturn {
  const searchParams = new URLSearchParams();
  if (params?.tenantId !== undefined && params.tenantId !== null && params.tenantId.trim().length > 0) {
    searchParams.append('tenantId', params.tenantId.trim());
  }
  if (params?.serviceId !== undefined && params.serviceId !== null && params.serviceId.trim().length > 0) {
    searchParams.append('serviceId', params.serviceId.trim());
  }
  if (params?.pageNumber !== undefined && params.pageNumber !== null && params.pageNumber > 0) {
    searchParams.append('pageNumber', params.pageNumber.toString());
  }
  if (params?.pageSize !== undefined && params.pageSize !== null && params.pageSize > 0) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  const queryString = searchParams.toString();
  const endpoint = `/api/v2/schedules${queryString.length > 0 ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedApiResponse<ScheduleItemDto>>(
    endpoint,
    async (url: string) => {
      const res = await apiClient.get<PaginatedApiResponse<ScheduleItemDto>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    schedules: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    pageNumber: data?.pageNumber ?? (params?.pageNumber ?? 1),
    pageSize: data?.pageSize ?? (params?.pageSize ?? 10),
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
