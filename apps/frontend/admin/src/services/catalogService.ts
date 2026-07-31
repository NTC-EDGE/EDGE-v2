import { useApi } from './api';

export interface ServiceCategory {
  id: string;
  name: string;
  code?: string;
  type: string;
}

export interface ServiceItem {
  id: string;
  serviceCategoryId: string;
  serviceCategoryCode: string;
  serviceCategoryType: string;
  name: string;
  group?: string;
  code?: string;
  description?: string;
  tenantId?: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface CreateServiceCategoryRequest {
  name: string;
  code?: string;
  type: string;
}

export interface UpdateServiceCategoryRequest {
  id: string;
  name: string;
  code?: string;
  type: string;
}

export interface CreateServiceRequest {
  serviceCategoryId: string;
  tenantId?: string | null;
  name: string;
  group?: string;
  code?: string;
  description?: string;
  contract?: string;
}

export interface UpdateServiceRequest {
  id: string;
  serviceCategoryId: string;
  tenantId?: string | null;
  name: string;
  group?: string;
  code?: string;
  description?: string;
  contract?: string;
}

export function useCatalogService() {
  const { useQuery, post, put, del } = useApi();

  const useServiceCategories = () => {
    return useQuery<ApiResponse<ServiceCategory[]>>('/api/v2/service-categories');
  };

  const createServiceCategory = async (request: CreateServiceCategoryRequest): Promise<ApiResponse<string>> => {
    return post<ApiResponse<string>, CreateServiceCategoryRequest>('/api/v2/service-categories', request);
  };

  const updateServiceCategory = async (id: string, request: UpdateServiceCategoryRequest): Promise<ApiResponse<string>> => {
    return put<ApiResponse<string>, UpdateServiceCategoryRequest>(`/api/v2/service-categories/${id}`, request);
  };

  const deleteServiceCategory = async (id: string): Promise<ApiResponse<string>> => {
    return del<ApiResponse<string>>(`/api/v2/service-categories/${id}`);
  };

  const useServices = (serviceCategoryId?: string) => {
    const query = serviceCategoryId ? `?serviceCategoryId=${serviceCategoryId}` : '';
    return useQuery<ApiResponse<ServiceItem[]>>(`/api/v2/services${query}`);
  };

  const useTenantServices = (tenantId: string, serviceCategoryId?: string) => {
    const query = serviceCategoryId ? `?serviceCategoryId=${serviceCategoryId}` : '';
    return useQuery<ApiResponse<ServiceItem[]>>(`/api/v2/tenants/${tenantId}/services${query}`);
  };

  const createService = async (tenantId: string | undefined | null, request: CreateServiceRequest): Promise<ApiResponse<string>> => {
    if (tenantId && tenantId.trim().length > 0) {
      return post<ApiResponse<string>, CreateServiceRequest>(`/api/v2/tenants/${tenantId}/services`, request);
    }
    return post<ApiResponse<string>, CreateServiceRequest>('/api/v2/services', request);
  };

  const updateService = async (tenantId: string | undefined | null, id: string, request: UpdateServiceRequest): Promise<ApiResponse<string>> => {
    if (tenantId && tenantId.trim().length > 0) {
      return put<ApiResponse<string>, UpdateServiceRequest>(`/api/v2/tenants/${tenantId}/services/${id}`, request);
    }
    return put<ApiResponse<string>, UpdateServiceRequest>(`/api/v2/services/${id}`, request);
  };

  const deleteService = async (tenantId: string | undefined | null, id: string): Promise<ApiResponse<string>> => {
    if (tenantId && tenantId.trim().length > 0) {
      return del<ApiResponse<string>>(`/api/v2/tenants/${tenantId}/services/${id}`);
    }
    return del<ApiResponse<string>>(`/api/v2/services/${id}`);
  };

  return {
    useServiceCategories,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    useServices,
    useTenantServices,
    createService,
    updateService,
    deleteService,
  };
}
