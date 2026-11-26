import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';
import { ApiResponse } from '../types';
import { resolveEffectiveTenantId } from '../utils/tenantUtils';

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

export interface ReportFieldOfficeDto {
  id: string;
  name: string;
  code: string;
  category: string;
  isActive: boolean;
}

export interface OperationalReportStatisticsDto {
  tenantDisplayName: string;
  summary: KpiSummaryDto;
  categoryBreakdown: CategoryBreakdownDto[];
  periodicStatistics: PeriodicStatBucketDto[];
  statutoryReports: StatutoryReportSummaryDto[];
  fieldOffices?: ReportFieldOfficeDto[] | null;
}

export interface GetOperationalReportStatisticsParams {
  tenantId?: string | null;
  periodMode?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  quarter?: number;
  month?: number;
  category?: string;
  fieldOffices?: string;
}

export interface PrintStatutoryReportParams {
  code: string;
  tenantId?: string | null;
  period?: string;
  startDate?: string;
  endDate?: string;
  secondaryFilter?: string;
  fieldOffices?: string;
}

export const reportService = {
  getOperationalReportStatistics: async (
    params?: GetOperationalReportStatisticsParams
  ): Promise<ApiResponse<OperationalReportStatisticsDto>> => {
    const queryParams: Record<string, string> = {};
    const effectiveTenantId = resolveEffectiveTenantId(params?.tenantId);
    if (effectiveTenantId) queryParams.tenantId = effectiveTenantId;
    if (params?.periodMode) queryParams.periodMode = params.periodMode;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.year !== undefined) queryParams.year = params.year.toString();
    if (params?.quarter !== undefined) queryParams.quarter = params.quarter.toString();
    if (params?.month !== undefined) queryParams.month = params.month.toString();
    if (params?.category) queryParams.category = params.category;
    if (params?.fieldOffices) queryParams.fieldOffices = params.fieldOffices;

    const res = await apiClient.get<ApiResponse<OperationalReportStatisticsDto>>(
      '/api/v2/reports/statistics',
      { params: queryParams }
    );
    return res.data;
  },

  previewStatutoryReportPdf: async (params: PrintStatutoryReportParams) => {
    return safeAsync(async () => {
      const queryParams: Record<string, string> = {
        code: params.code,
      };
      const effectivePreviewTenantId = resolveEffectiveTenantId(params.tenantId);
      if (effectivePreviewTenantId) queryParams.tenantId = effectivePreviewTenantId;
      if (params.period) queryParams.period = params.period;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.secondaryFilter) queryParams.secondaryFilter = params.secondaryFilter;
      if (params.fieldOffices) queryParams.fieldOffices = params.fieldOffices;

      const response = await apiClient.get<Blob>('/api/v2/reports/statutory/print', {
        params: queryParams,
        responseType: 'blob',
      });
      return response.data;
    });
  },

  downloadStatutoryReportPdf: async (params: PrintStatutoryReportParams) => {
    return safeAsync(async () => {
      const queryParams: Record<string, string> = {
        code: params.code,
        download: 'true',
      };
      const effectiveDownloadTenantId = resolveEffectiveTenantId(params.tenantId);
      if (effectiveDownloadTenantId) queryParams.tenantId = effectiveDownloadTenantId;
      if (params.period) queryParams.period = params.period;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.secondaryFilter) queryParams.secondaryFilter = params.secondaryFilter;
      if (params.fieldOffices) queryParams.fieldOffices = params.fieldOffices;

      const response = await apiClient.get<Blob>('/api/v2/reports/statutory/print', {
        params: queryParams,
        responseType: 'blob',
      });
      return response.data;
    });
  },
};
