import { apiClient } from '../../index';
import { ApiResponse, ServiceVariant } from '../../types';
import {
  Service,
  CreateServiceCommand,
  UpdateServiceCommand,
} from './types';

/**
 * GET /api/v2/services
 * Retrieves catalog services.
 */
export async function getServices(params?: {
  serviceCategoryId?: string;
}): Promise<ApiResponse<Service[]>> {
  const response = await apiClient.get<ApiResponse<Service[]>>('/services', {
    params,
  });
  return response.data;
}

/**
 * GET /api/v2/services/{id}
 * Retrieves service details by ID.
 */
export async function getServiceById(id: string): Promise<ApiResponse<Service>> {
  const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
  return response.data;
}

/**
 * GET /api/v2/services/{id}/variants
 * Retrieves service variants by service ID.
 */
export async function getServiceVariants(
  id: string
): Promise<ApiResponse<ServiceVariant[]>> {
  const response = await apiClient.get<ApiResponse<ServiceVariant[]>>(
    `/services/${id}/variants`
  );
  return response.data;
}

/**
 * GET /api/v2/services/{id}/contract
 * Retrieves contract schema configuration.
 */
export async function getServiceContract(id: string): Promise<ApiResponse<any>> {
  const response = await apiClient.get<ApiResponse<any>>(`/services/${id}/contract`);
  return response.data;
}

/**
 * GET /api/v2/services/{id}/form
 * Retrieves the form builder layout for a service.
 */
export async function getServiceForm(id: string): Promise<ApiResponse<any>> {
  const response = await apiClient.get<ApiResponse<any>>(`/services/${id}/form`);
  return response.data;
}

/**
 * GET /api/v2/tenants/{tenantId}/services
 * Retrieves services scoped to a tenant.
 */
export async function getTenantServices(
  tenantId: string,
  params?: { serviceCategoryId?: string }
): Promise<ApiResponse<Service[]>> {
  const response = await apiClient.get<ApiResponse<Service[]>>(
    `/tenants/${tenantId}/services`,
    { params }
  );
  return response.data;
}

/**
 * POST /api/v2/tenants/{tenantId}/services
 * Creates a new service under a tenant.
 */
export async function createTenantService(
  tenantId: string,
  payload: Omit<CreateServiceCommand, 'tenantId'>
): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>(
    `/tenants/${tenantId}/services`,
    payload
  );
  return response.data;
}

/**
 * PUT /api/v2/tenants/{tenantId}/services/{id}
 * Updates an existing service under a tenant.
 */
export async function updateTenantService(
  tenantId: string,
  id: string,
  payload: Omit<UpdateServiceCommand, 'tenantId' | 'id'>
): Promise<ApiResponse<string>> {
  const response = await apiClient.put<ApiResponse<string>>(
    `/tenants/${tenantId}/services/${id}`,
    payload
  );
  return response.data;
}

/**
 * DELETE /api/v2/tenants/{tenantId}/services/{id}
 * Deletes a service under a tenant.
 */
export async function deleteTenantService(
  tenantId: string,
  id: string
): Promise<ApiResponse<string>> {
  const response = await apiClient.delete<ApiResponse<string>>(
    `/tenants/${tenantId}/services/${id}`
  );
  return response.data;
}

/**
 * PATCH /api/v2/tenants/{tenantId}/services/{id}
 * Partially updates an existing service under a tenant.
 */
export async function patchTenantService(
  tenantId: string,
  id: string,
  payload: Partial<Omit<UpdateServiceCommand, 'tenantId' | 'id'>>
): Promise<ApiResponse<string>> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/tenants/${tenantId}/services/${id}`,
    payload
  );
  return response.data;
}
