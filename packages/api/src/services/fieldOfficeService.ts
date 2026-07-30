import { apiClient } from "../apiClient";
import { ApiResponse } from "../types";
import { FieldOfficeDto } from "../hooks/useAdminFieldOffices";

export interface CreateFieldOfficePayload {
  tenantId?: string;
  name: string;
  code: string;
  category: 'Main' | 'Extension' | string;
  description?: string;
  regionId?: string;
  provinceId?: string | null;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  officerInChargeId?: string;
  isActive?: boolean;
  allowSpectrumInspection?: boolean;
  allowPermitIssuance?: boolean;
  allowComplaintReception?: boolean;
}

export interface UpdateFieldOfficePayload extends CreateFieldOfficePayload {
  id: string;
}

/**
 * Service function to fetch field offices from backend API.
 */
export async function fetchFieldOffices(tenantId?: string): Promise<FieldOfficeDto[]> {
  const url = tenantId ? `/api/v2/tenants/${tenantId}/field-offices` : '/api/v2/field-offices';
  const response = await apiClient.get<ApiResponse<FieldOfficeDto[]> | FieldOfficeDto[]>(url);
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data !== null && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

/**
 * Service function to fetch a field office by ID.
 */
export async function fetchFieldOfficeById(id: string, tenantId?: string): Promise<FieldOfficeDto | null> {
  const url = `/api/v2/field-offices/${id}${tenantId ? `?tenantId=${tenantId}` : ''}`;
  const response = await apiClient.get<ApiResponse<FieldOfficeDto> | FieldOfficeDto>(url);
  const data = response.data;
  if (data !== null && typeof data === 'object' && 'data' in data && data.data) {
    return data.data;
  }
  if (data !== null && typeof data === 'object' && 'id' in data) {
    return data as FieldOfficeDto;
  }
  return null;
}

/**
 * Service function to create a new field office record.
 */
export async function createFieldOffice(payload: CreateFieldOfficePayload): Promise<FieldOfficeDto> {
  const response = await apiClient.post<FieldOfficeDto>('/api/v2/field-offices', payload);
  return response.data;
}

/**
 * Service function to update an existing field office record.
 */
export async function updateFieldOffice(id: string, payload: UpdateFieldOfficePayload): Promise<FieldOfficeDto> {
  const response = await apiClient.put<FieldOfficeDto>(`/api/v2/field-offices/${id}`, payload);
  return response.data;
}

/**
 * Service function to delete a field office record.
 */
export async function deleteFieldOffice(id: string, tenantId?: string): Promise<boolean> {
  const url = `/api/v2/field-offices/${id}${tenantId ? `?tenantId=${tenantId}` : ''}`;
  await apiClient.delete(url);
  return true;
}
