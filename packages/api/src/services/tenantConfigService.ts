import { apiClient } from '../apiClient';
import { ApiResponse } from '../types';
import { RegionalConfigDto, ReportSignatoriesDto } from '../types/region';
import { resolveEffectiveTenantId } from '../utils/tenantUtils';

export const DEFAULT_REPORT_SIGNATORIES: ReportSignatoriesDto = {
  regionalDirectorName: '',
  regionalDirectorTitle: 'Regional Director',
  chiefEodName: '',
  chiefEodTitle: 'Chief, Enforcement & Operations Division',
  regionalAccountantName: '',
  regionalAccountantTitle: 'Regional Accountant III',
  collectingOfficerName: '',
  collectingOfficerTitle: 'Collecting Officer / Regional Cashier III',
  misOfficerName: '',
  misOfficerTitle: 'MIS / Planning Officer',
  examProctorName: '',
  examProctorTitle: 'Authorized Examination Proctor',
};

export const DEFAULT_TENANT_CONFIG: RegionalConfigDto = {
  tenantCode: '10',
  tenantName: 'Region X - Northern Mindanao',
  rcCodeSoa: '61',
  rcCodeOp: '61',
  fundCluster: '01',
  requestAndComplaintRouting: 'DirectToLegal',
  allowManualSoaNumber: false,
  allowManualOpNumber: false,
  enableInternalEmailNotifications: true,
  reportSignatories: DEFAULT_REPORT_SIGNATORIES,
};

function isRegionalConfigDto(data: unknown): data is RegionalConfigDto {
  if (typeof data !== 'object' || data === null) return false;
  return (
    'tenantCode' in data &&
    typeof data.tenantCode === 'string' &&
    'rcCodeSoa' in data &&
    typeof data.rcCodeSoa === 'string' &&
    'rcCodeOp' in data &&
    typeof data.rcCodeOp === 'string'
  );
}

export const fetchTenantConfig = async (tenantId?: string): Promise<RegionalConfigDto> => {
  try {
    const effectiveTenantId = resolveEffectiveTenantId(tenantId);
    const url = effectiveTenantId !== null && effectiveTenantId.length > 0
      ? `/api/v2/tenants/${effectiveTenantId}/config`
      : '/api/v2/tenants/config';

    const response = await apiClient.get<ApiResponse<RegionalConfigDto> | RegionalConfigDto>(url);
    const payload = response.data;

    if (payload !== null && typeof payload === 'object') {
      if ('data' in payload && isRegionalConfigDto(payload.data)) {
        return payload.data;
      }
      if (isRegionalConfigDto(payload)) {
        return payload;
      }
    }
    return DEFAULT_TENANT_CONFIG;
  } catch (error: unknown) {
    console.warn('Failed to fetch tenant configuration, using defaults:', error);
    return DEFAULT_TENANT_CONFIG;
  }
};

export const updateTenantConfig = async (
  config: Partial<RegionalConfigDto> & { tenantId: string }
): Promise<RegionalConfigDto> => {
  const url = `/api/v2/tenants/${config.tenantId}/config`;
  const response = await apiClient.put<ApiResponse<RegionalConfigDto> | RegionalConfigDto>(url, config);
  const payload = response.data;

  if (payload !== null && typeof payload === 'object') {
    if ('data' in payload && isRegionalConfigDto(payload.data)) {
      return payload.data;
    }
    if (isRegionalConfigDto(payload)) {
      return payload;
    }
  }

  return {
    tenantId: config.tenantId,
    tenantCode: config.tenantCode ?? DEFAULT_TENANT_CONFIG.tenantCode,
    tenantName: config.tenantName ?? DEFAULT_TENANT_CONFIG.tenantName,
    rcCodeSoa: config.rcCodeSoa ?? DEFAULT_TENANT_CONFIG.rcCodeSoa,
    rcCodeOp: config.rcCodeOp ?? DEFAULT_TENANT_CONFIG.rcCodeOp,
    fundCluster: config.fundCluster ?? DEFAULT_TENANT_CONFIG.fundCluster,
    requestAndComplaintRouting: config.requestAndComplaintRouting ?? DEFAULT_TENANT_CONFIG.requestAndComplaintRouting,
    allowManualSoaNumber: config.allowManualSoaNumber ?? DEFAULT_TENANT_CONFIG.allowManualSoaNumber,
    allowManualOpNumber: config.allowManualOpNumber ?? DEFAULT_TENANT_CONFIG.allowManualOpNumber,
    enableInternalEmailNotifications:
      config.enableInternalEmailNotifications ?? DEFAULT_TENANT_CONFIG.enableInternalEmailNotifications,
    reportSignatories: config.reportSignatories ?? DEFAULT_REPORT_SIGNATORIES,
  };
};

export const updateTenantNumberingMode = async (params: {
  tenantId?: string;
  allowManualSoaNumber: boolean;
  allowManualOpNumber: boolean;
  rcCodeSoa?: string;
  rcCodeOp?: string;
}): Promise<RegionalConfigDto> => {
  const url = params.tenantId && params.tenantId.length > 0
    ? `/api/v2/tenants/${params.tenantId}/config/numbering-mode`
    : '/api/v2/tenants/config/numbering-mode';

  const response = await apiClient.patch<ApiResponse<RegionalConfigDto> | RegionalConfigDto>(url, params);
  const payload = response.data;

  if (payload !== null && typeof payload === 'object') {
    if ('data' in payload && isRegionalConfigDto(payload.data)) {
      return payload.data;
    }
    if (isRegionalConfigDto(payload)) {
      return payload;
    }
  }

  return {
    ...DEFAULT_TENANT_CONFIG,
    tenantId: params.tenantId,
    allowManualSoaNumber: params.allowManualSoaNumber,
    allowManualOpNumber: params.allowManualOpNumber,
    rcCodeSoa: params.rcCodeSoa ?? DEFAULT_TENANT_CONFIG.rcCodeSoa,
    rcCodeOp: params.rcCodeOp ?? DEFAULT_TENANT_CONFIG.rcCodeOp,
  };
};
