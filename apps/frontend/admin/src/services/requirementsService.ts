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
    requirements: { requirementId: string; applicationTypeKey?: string | null; isRequired: boolean }[] 
  }): Promise<string[]> => {
    const response = await post<{ succeeded: boolean; data: string[] }, { 
      serviceVariantId: string; 
      requirements: { requirementId: string; applicationTypeKey?: string | null; isRequired: boolean }[] 
    }>('/api/v2/service-variant-requirements', data);
    return response.data;
  };

  const updateServiceVariantRequirement = async (id: string, data: {
    requirementId: string;
    serviceVariantId: string;
    applicationTypeKey?: string | null;
    isRequired: boolean;
  }): Promise<ServiceVariantRequirement> => {
    const response = await put<{ succeeded: boolean; data: ServiceVariantRequirement }, {
      id: string;
      requirementId: string;
      serviceVariantId: string;
      applicationTypeKey?: string | null;
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

  const useServiceVariants = (serviceId: string | null) => {
    const query = useQuery<{ succeeded: boolean; data: ServiceVariant[] }>(
      serviceId ? `/api/v2/services/${serviceId}/variants` : null
    );
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
    };
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
    useServiceVariants
  };
}
