import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse } from '../types';
import {
  OperationalReportStatisticsDto,
  GetOperationalReportStatisticsParams,
} from '../services/reportService';

export interface UseOperationalReportStatisticsReturn {
  data: OperationalReportStatisticsDto | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<ApiResponse<OperationalReportStatisticsDto> | undefined>;
}

export function useOperationalReportStatistics(
  params?: GetOperationalReportStatisticsParams
): UseOperationalReportStatisticsReturn {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.set('tenantId', params.tenantId);
  if (params?.periodMode) searchParams.set('periodMode', params.periodMode);
  if (params?.year !== undefined) searchParams.set('year', params.year.toString());
  if (params?.quarter !== undefined) searchParams.set('quarter', params.quarter.toString());
  if (params?.month !== undefined) searchParams.set('month', params.month.toString());
  if (params?.category) searchParams.set('category', params.category);

  const queryString = searchParams.toString();
  const endpoint = `/api/v2/reports/statistics${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<OperationalReportStatisticsDto>>(
    endpoint,
    (url: string) => apiClient.get<ApiResponse<OperationalReportStatisticsDto>>(url).then((res) => res.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    data: data?.data ?? null,
    isLoading,
    isError: Boolean(error) || (data !== undefined && !data.succeeded),
    error,
    refetch: mutate,
  };
}
