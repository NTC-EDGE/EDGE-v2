import { apiClient } from '../../apiClient';
import { ApiResponse, PaginatedApiResponse, ServiceVariant } from '../../types';
import {
  Service,
  CreateServiceCommand,
  UpdateServiceCommand,
} from './types';

/**
 * GET /api/v2/services
 * Retrieves all catalog services, fetching subsequent pages automatically if paginated.
 */
export async function getServices(params?: {
  serviceCategoryId?: string;
  pageSize?: number;
}): Promise<ApiResponse<Service[]>> {
  const pageSize = params?.pageSize ?? 50;
  const firstRes = await apiClient.get<PaginatedApiResponse<Service>>(
    '/api/v2/services',
    {
      params: {
        ...params,
        pageNumber: 1,
        pageSize,
      },
    }
  );

  const initialData = firstRes.data?.data ?? [];
  const totalPages = firstRes.data?.totalPages ?? 1;

  if (totalPages > 1) {
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(
        apiClient.get<PaginatedApiResponse<Service>>('/api/v2/services', {
          params: {
            ...params,
            pageNumber: page,
            pageSize,
          },
        })
      );
    }

    const subsequentResponses = await Promise.all(pagePromises);
    const allServices = [...initialData];
    for (const res of subsequentResponses) {
      if (res.data?.data) {
        allServices.push(...res.data.data);
      }
    }
    return {
      succeeded: firstRes.data?.succeeded ?? true,
      message: firstRes.data?.message ?? null,
      data: allServices,
      errors: null,
    };
  }

  return {
    succeeded: firstRes.data?.succeeded ?? true,
    message: firstRes.data?.message ?? null,
    data: initialData,
    errors: null,
  };
}

/**
 * GET /api/v2/services/{id}
 * Retrieves service details by ID.
 */
export async function getServiceById(id: string): Promise<ApiResponse<Service>> {
  const response = await apiClient.get<ApiResponse<Service>>(`/api/v2/services/${id}`);
  return response.data;
}

/**
 * GET /api/v2/services/{id}/variants
 * Retrieves all service variants by service ID, fetching subsequent pages automatically if paginated.
 */
export async function getServiceVariants(
  id: string,
  params?: { pageSize?: number; searchTerm?: string }
): Promise<ApiResponse<ServiceVariant[]>> {
  const pageSize = params?.pageSize ?? 50;
  const firstRes = await apiClient.get<PaginatedApiResponse<ServiceVariant>>(
    `/api/v2/services/${id}/variants`,
    {
      params: {
        ...params,
        pageNumber: 1,
        pageSize,
      },
    }
  );

  const initialData = firstRes.data?.data ?? [];
  const totalPages = firstRes.data?.totalPages ?? 1;

  if (totalPages > 1) {
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(
        apiClient.get<PaginatedApiResponse<ServiceVariant>>(
          `/api/v2/services/${id}/variants`,
          {
            params: {
              ...params,
              pageNumber: page,
              pageSize,
            },
          }
        )
      );
    }

    const subsequentResponses = await Promise.all(pagePromises);
    const allVariants = [...initialData];
    for (const res of subsequentResponses) {
      if (res.data?.data) {
        allVariants.push(...res.data.data);
      }
    }
    return {
      succeeded: firstRes.data?.succeeded ?? true,
      message: firstRes.data?.message ?? null,
      data: allVariants,
      errors: null,
    };
  }

  return {
    succeeded: firstRes.data?.succeeded ?? true,
    message: firstRes.data?.message ?? null,
    data: initialData,
    errors: null,
  };
}

/**
 * GET /api/v2/services/{id}/contract
 * Retrieves contract schema configuration.
 */
export async function getServiceContract(id: string): Promise<ApiResponse<any>> {
  const response = await apiClient.get<ApiResponse<any>>(`/api/v2/services/${id}/contract`);
  return response.data;
}

/**
 * GET /api/v2/services/{id}/form
 * Retrieves the form builder layout for a service.
 */
export async function getServiceForm(id: string): Promise<ApiResponse<any>> {
  const response = await apiClient.get<ApiResponse<any>>(`/api/v2/services/${id}/form`);
  return response.data;
}

/**
 * GET /api/v2/tenants/{tenantId}/services
 * Retrieves all services scoped to a tenant, fetching subsequent pages automatically if paginated.
 */
export async function getTenantServices(
  tenantId: string,
  params?: { serviceCategoryId?: string; pageSize?: number }
): Promise<ApiResponse<Service[]>> {
  const pageSize = params?.pageSize ?? 50;
  const firstRes = await apiClient.get<PaginatedApiResponse<Service>>(
    `/api/v2/tenants/${tenantId}/services`,
    {
      params: {
        ...params,
        pageNumber: 1,
        pageSize,
      },
    }
  );

  const initialData = firstRes.data?.data ?? [];
  const totalPages = firstRes.data?.totalPages ?? 1;

  if (totalPages > 1) {
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(
        apiClient.get<PaginatedApiResponse<Service>>(
          `/api/v2/tenants/${tenantId}/services`,
          {
            params: {
              ...params,
              pageNumber: page,
              pageSize,
            },
          }
        )
      );
    }

    const subsequentResponses = await Promise.all(pagePromises);
    const allServices = [...initialData];
    for (const res of subsequentResponses) {
      if (res.data?.data) {
        allServices.push(...res.data.data);
      }
    }
    return {
      succeeded: firstRes.data?.succeeded ?? true,
      message: firstRes.data?.message ?? null,
      data: allServices,
      errors: null,
    };
  }

  return {
    succeeded: firstRes.data?.succeeded ?? true,
    message: firstRes.data?.message ?? null,
    data: initialData,
    errors: null,
  };
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
    `/api/v2/tenants/${tenantId}/services`,
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
    `/api/v2/tenants/${tenantId}/services/${id}`,
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
    `/api/v2/tenants/${tenantId}/services/${id}`
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
    `/api/v2/tenants/${tenantId}/services/${id}`,
    payload
  );
  return response.data;
}
