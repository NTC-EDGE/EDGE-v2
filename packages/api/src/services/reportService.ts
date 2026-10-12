import { apiClient } from '../apiClient';
import { ApiResponse } from '../types';

export interface KpiSummaryDto {
  totalApps: number;
  approvedCount: number;
  evaluatingCount: number;
  returnedCount: number;
  approvalRate: number;
  totalCollected: number;
  totalInvoiced: number;
  avgCsat: string;
  csatTotal: number;
}

export interface CategoryBreakdownDto {
  category: string;
  count: number;
  percentage: number;
}

export interface PeriodicStatBucketDto {
  id: string;
  label: string;
  shortLabel: string;
  totalApplications: number;
  approvedCount: number;
  evaluatingCount: number;
  returnedCount: number;
  approvalRate: number;
  totalRevenue: number;
  feedbackCount: number;
  avgCsat: string;
}

export interface StatutoryReportSummaryDto {
  code: string;
  title: string;
  agency: string;
  frequency: string;
  legalBasis: string;
  badgeColor: string;
  recordCount: number;
  complianceRate: number;
  totalAmount?: number | null;
}

export interface OperationalReportStatisticsDto {
  tenantDisplayName: string;
  summary: KpiSummaryDto;
  categoryBreakdown: CategoryBreakdownDto[];
  periodicStatistics: PeriodicStatBucketDto[];
  statutoryReports: StatutoryReportSummaryDto[];
}

export interface GetOperationalReportStatisticsParams {
  tenantId?: string | null;
  periodMode?: string;
  year?: number;
  quarter?: number;
  month?: number;
  category?: string;
}

export const reportService = {
  getOperationalReportStatistics: async (
    params?: GetOperationalReportStatisticsParams
  ): Promise<ApiResponse<OperationalReportStatisticsDto>> => {
    const queryParams: Record<string, string> = {};
    if (params?.tenantId) queryParams.tenantId = params.tenantId;
    if (params?.periodMode) queryParams.periodMode = params.periodMode;
    if (params?.year !== undefined) queryParams.year = params.year.toString();
    if (params?.quarter !== undefined) queryParams.quarter = params.quarter.toString();
    if (params?.month !== undefined) queryParams.month = params.month.toString();
    if (params?.category) queryParams.category = params.category;

    const res = await apiClient.get<ApiResponse<OperationalReportStatisticsDto>>(
      '/api/v2/reports/statistics',
      { params: queryParams }
    );
    return res.data;
  },
};
