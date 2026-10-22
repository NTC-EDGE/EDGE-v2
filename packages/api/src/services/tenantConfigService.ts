import { apiClient } from '../apiClient';
import { ApiResponse } from '../types';
import { RegionalConfigDto } from '../types/region';

export const DEFAULT_TENANT_CONFIG: RegionalConfigDto = {
  tenantCode: '10',
  tenantName: 'Region X - Northern Mindanao',
  rcCodeSoa: '61',
  rcCodeOp: '61',
  fundCluster: '01',
  requestAndComplaintRouting: 'DirectToLegal',
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
    const url = tenantId !== undefined && tenantId !== null && tenantId.length > 0
      ? `/api/v2/tenants/${tenantId}/config`
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
  };
};
