import { useApi } from './api';
import { Requirement, ServiceVariantRequirement, ServiceVariant } from '@edge/api';

export interface ServiceCatalogItem {
  id: string;
  name: string;
  code: string;
}

export function useRequirementsService() {
  const { useQuery, post, put, del } = useApi();

  // --- REQUIREMENTS CRUD ---
  const useRequirements = () => {
    const query = useQuery<{ succeeded: boolean; data: Requirement[] }>('/api/v2/requirements');
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
    };
  };

  const createRequirement = async (data: Omit<Requirement, 'id'>): Promise<Requirement> => {
    const response = await post<{ succeeded: boolean; data: Requirement }, Omit<Requirement, 'id'>>('/api/v2/requirements', data);
    return response.data;
  };

  const updateRequirement = async (id: string, data: Omit<Requirement, 'id'>): Promise<Requirement> => {
    const response = await put<{ succeeded: boolean; data: Requirement }, Omit<Requirement, 'id'> & { id: string }>(`/api/v2/requirements/${id}`, { ...data, id });
    return response.data;
  };

  const deleteRequirement = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/requirements/${id}`);
  };

  // --- SERVICE VARIANT REQUIREMENTS CRUD ---
  const useServiceVariantRequirements = (serviceVariantId?: string) => {
    const endpoint = serviceVariantId 
      ? `/api/v2/service-variant-requirements?serviceVariantId=${serviceVariantId}` 
      : '/api/v2/service-variant-requirements';
    
    const query = useQuery<{ succeeded: boolean; data: ServiceVariantRequirement[] }>(endpoint);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
    };
  };

  const createServiceVariantRequirement = async (data: { 
    serviceVariantId: string; 
    requirements: { requirementId: string; contextKey?: string | null; isRequired: boolean }[] 
  }): Promise<string[]> => {
    const response = await post<{ succeeded: boolean; data: string[] }, { 
      serviceVariantId: string; 
      requirements: { requirementId: string; contextKey?: string | null; isRequired: boolean }[] 
    }>('/api/v2/service-variant-requirements', data);
    return response.data;
  };

  const updateServiceVariantRequirement = async (id: string, data: {
    requirementId: string;
    serviceVariantId: string;
    contextKey?: string | null;
    isRequired: boolean;
  }): Promise<ServiceVariantRequirement> => {
    const response = await put<{ succeeded: boolean; data: ServiceVariantRequirement }, {
      id: string;
      requirementId: string;
      serviceVariantId: string;
      contextKey?: string | null;
      isRequired: boolean;
    }>(`/api/v2/service-variant-requirements/${id}`, { ...data, id });
    return response.data;
  };

  const deleteServiceVariantRequirement = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/service-variant-requirements/${id}`);
  };

  // --- SERVICES & VARIANTS QUERY ---
  const useServices = () => {
    const query = useQuery<{ succeeded: boolean; data: ServiceCatalogItem[] }>('/api/v2/services');
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
    };
  };

  const useServiceVariants = (serviceId?: string | null) => {
    const endpoint = serviceId 
      ? `/api/v2/service-variants?serviceId=${serviceId}` 
      : '/api/v2/service-variants';
    const query = useQuery<{ succeeded: boolean; data: ServiceVariant[] }>(endpoint);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
    };
  };

  const createServiceVariant = async (data: { serviceId: string; type: string; description?: string | null }): Promise<string> => {
    const response = await post<{ succeeded: boolean; data: string }, { serviceId: string; type: string; description?: string | null }>('/api/v2/service-variants', data);
    return response.data;
  };

  const updateServiceVariant = async (id: string, data: { serviceId: string; type: string; description?: string | null }): Promise<boolean> => {
    const response = await put<{ succeeded: boolean; data: boolean }, { serviceId: string; type: string; description?: string | null }>(`/api/v2/service-variants/${id}`, data);
    return response.data;
  };

  const deleteServiceVariant = async (id: string): Promise<boolean> => {
    const response = await del<{ succeeded: boolean; data: boolean }>(`/api/v2/service-variants/${id}`);
    return response.data;
  };

  // --- SERVICE REQUIREMENTS (citizen/dynamic mapping) ---
  const useServiceRequirements = (serviceId?: string, variantId?: string | null, contextKey?: string | null) => {
    let endpoint = `/api/v2/services/${serviceId}/requirements`;
    const params = [];
    if (variantId) params.push(`variantId=${variantId}`);
    if (contextKey) params.push(`contextKey=${encodeURIComponent(contextKey)}`);
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    const query = useQuery<{ succeeded: boolean; data: any[] }>(serviceId ? endpoint : null);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
    };
  };

  const attachServiceVariantRequirement = async (
    serviceId: string,
    variantId: string,
    data: { requirementId: string; contextKey?: string | null; isRequired: boolean }
  ): Promise<{ succeeded: boolean; data: string }> => {
    return await post<{ succeeded: boolean; data: string }, { requirementId: string; contextKey?: string | null; isRequired: boolean }>(
      `/api/v2/services/${serviceId}/variants/${variantId}/requirements`,
      data
    );
  };

  const unlinkServiceVariantRequirement = async (
    serviceId: string,
    variantId: string,
    id: string
  ): Promise<void> => {
    await del<void>(`/api/v2/services/${serviceId}/variants/${variantId}/requirements/${id}`);
  };

  return {
    useRequirements,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    useServiceVariantRequirements,
    createServiceVariantRequirement,
    updateServiceVariantRequirement,
    deleteServiceVariantRequirement,
    useServices,
    useServiceVariants,
    createServiceVariant,
    updateServiceVariant,
    deleteServiceVariant,
    useServiceRequirements,
    attachServiceVariantRequirement,
    unlinkServiceVariantRequirement
  };
}
