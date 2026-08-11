import { useApi } from './api';
import { Fee, ServiceFee, Note, Element, ServiceVariant, ServiceVariantFee, ServiceVariantElementFee } from '@edge/api';

export interface ServiceCatalogItem {
  id: string;
  name: string;
  serviceCategoryId?: string;
}

export interface ServiceCategoryItem {
  id: string;
  name: string;
}

export interface ServiceVariantElement {
  id: string;
  serviceVariantId: string;
  serviceVariantDescription?: string | null;
  code: string;
  description: string;
  createdAt?: string;
}

export interface PaginatedApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}


export function useFeesService() {
  const { useQuery, post, put, patch, del } = useApi();

  // --- FEES CRUD ---
  const useFees = (pageNumber?: number, pageSize?: number, searchTerm?: string, enabled = true) => {
    let url: string | null = null;
    if (enabled) {
      const params = new URLSearchParams();
      if (pageNumber !== undefined) params.append('pageNumber', pageNumber.toString());
      if (pageSize !== undefined) params.append('pageSize', pageSize.toString());
      if (searchTerm) params.append('searchTerm', searchTerm);
      url = `/api/v2/fees?${params.toString()}`;
    }
    const query = useQuery<PaginatedApiResponse<Fee>>(url);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : [],
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data?.totalPages ?? 0
    };
  };

  const createFee = async (data: Omit<Fee, 'id'>): Promise<Fee> => {
    return await post<Fee, Omit<Fee, 'id'>>('/api/v2/fees', data);
  };

  const updateFee = async (id: string, data: Omit<Fee, 'id'>): Promise<Fee> => {
    return await put<Fee, Omit<Fee, 'id'>>(`/api/v2/fees/${id}`, data);
  };

  const deleteFee = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/fees/${id}`);
  };

  const toggleFeeStatus = async (id: string, isActive: boolean): Promise<Fee> => {
    return await patch<Fee, { isActive: boolean }>(`/api/v2/fees/${id}/status`, { isActive });
  };

  // --- SERVICE FEES CRUD ---
  const useServiceFees = (pageNumber?: number, pageSize?: number, searchTerm?: string, enabled = true) => {
    let url: string | null = null;
    if (enabled) {
      const params = new URLSearchParams();
      if (pageNumber !== undefined) params.append('pageNumber', pageNumber.toString());
      if (pageSize !== undefined) params.append('pageSize', pageSize.toString());
      if (searchTerm) params.append('searchTerm', searchTerm);
      url = `/api/v2/service-fees?${params.toString()}`;
    }
    const query = useQuery<PaginatedApiResponse<ServiceFee>>(url);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : [],
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data?.totalPages ?? 0
    };
  };

  const createServiceFee = async (data: { serviceId: string; fees: { feeId: string; amount: number }[] }): Promise<ServiceFee[]> => {
    return await post<ServiceFee[], { serviceId: string; fees: { feeId: string; amount: number }[] }>('/api/v2/service-fees', data);
  };

  const updateServiceFee = async (id: string, data: Omit<ServiceFee, 'id'>): Promise<ServiceFee> => {
    return await put<ServiceFee, Omit<ServiceFee, 'id'>>(`/api/v2/service-fees/${id}`, data);
  };

  const deleteServiceFee = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/service-fees/${id}`);
  };

  // --- ELEMENTS CRUD ---
  const useElements = (pageNumber?: number, pageSize?: number, searchTerm?: string, enabled = true) => {
    let url: string | null = null;
    if (enabled) {
      const params = new URLSearchParams();
      if (pageNumber !== undefined) params.append('pageNumber', pageNumber.toString());
      if (pageSize !== undefined) params.append('pageSize', pageSize.toString());
      if (searchTerm) params.append('searchTerm', searchTerm);
      url = `/api/v2/elements?${params.toString()}`;
    }
    const query = useQuery<PaginatedApiResponse<Element>>(url);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : [],
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data?.totalPages ?? 0
    };
  };

  const createElement = async (data: Omit<Element, 'id'>): Promise<Element> => {
    return await post<Element, Omit<Element, 'id'>>('/api/v2/elements', data);
  };

  const updateElement = async (id: string, data: Omit<Element, 'id'>): Promise<Element> => {
    return await put<Element, Omit<Element, 'id'>>(`/api/v2/elements/${id}`, data);
  };

  const deleteElement = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/elements/${id}`);
  };

  // --- SERVICE VARIANT FEES CRUD ---
  const useServiceVariantFees = (serviceVariantId?: string, pageNumber?: number, pageSize?: number, searchTerm?: string, enabled = true) => {
    let url: string | null = null;
    if (enabled) {
      const params = new URLSearchParams();
      if (serviceVariantId) params.append('serviceVariantId', serviceVariantId);
      if (pageNumber !== undefined) params.append('pageNumber', pageNumber.toString());
      if (pageSize !== undefined) params.append('pageSize', pageSize.toString());
      if (searchTerm) params.append('searchTerm', searchTerm);
      url = `/api/v2/service-variant-fees?${params.toString()}`;
    }
    const query = useQuery<PaginatedApiResponse<ServiceVariantFee>>(url);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : [],
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data?.totalPages ?? 0
    };
  };

  const createServiceVariantFee = async (data: Omit<ServiceVariantFee, 'id'>): Promise<ServiceVariantFee> => {
    return await post<ServiceVariantFee, Omit<ServiceVariantFee, 'id'>>('/api/v2/service-variant-fees', data);
  };

  const updateServiceVariantFee = async (id: string, data: Omit<ServiceVariantFee, 'id'>): Promise<ServiceVariantFee> => {
    return await put<ServiceVariantFee, Omit<ServiceVariantFee, 'id'>>(`/api/v2/service-variant-fees/${id}`, data);
  };

  const deleteServiceVariantFee = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/service-variant-fees/${id}`);
  };

  // --- SERVICE VARIANT ELEMENT FEES CRUD ---
  const useServiceVariantElementFees = (serviceVariantId?: string, pageNumber?: number, pageSize?: number, searchTerm?: string, enabled = true) => {
    let url: string | null = null;
    if (enabled) {
      const params = new URLSearchParams();
      if (serviceVariantId) params.append('serviceVariantId', serviceVariantId);
      if (pageNumber !== undefined) params.append('pageNumber', pageNumber.toString());
      if (pageSize !== undefined) params.append('pageSize', pageSize.toString());
      if (searchTerm) params.append('searchTerm', searchTerm);
      url = `/api/v2/service-variant-element-fees?${params.toString()}`;
    }
    const query = useQuery<PaginatedApiResponse<ServiceVariantElementFee>>(url);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : [],
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data?.totalPages ?? 0
    };
  };

  const createServiceVariantElementFee = async (data: Omit<ServiceVariantElementFee, 'id'>): Promise<ServiceVariantElementFee> => {
    return await post<ServiceVariantElementFee, Omit<ServiceVariantElementFee, 'id'>>('/api/v2/service-variant-element-fees', data);
  };

  const updateServiceVariantElementFee = async (id: string, data: Omit<ServiceVariantElementFee, 'id'>): Promise<ServiceVariantElementFee> => {
    return await put<ServiceVariantElementFee, Omit<ServiceVariantElementFee, 'id'>>(`/api/v2/service-variant-element-fees/${id}`, data);
  };

  const deleteServiceVariantElementFee = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/service-variant-element-fees/${id}`);
  };

  // --- NOTES CRUD ---
  const useNotes = (
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    serviceId?: string,
    serviceVariantId?: string,
    enabled = true
  ) => {
    let url: string | null = null;
    if (enabled) {
      const params = new URLSearchParams();
      params.append('pageNumber', pageNumber.toString());
      params.append('pageSize', pageSize.toString());
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (serviceId) params.append('serviceId', serviceId);
      if (serviceVariantId) params.append('serviceVariantId', serviceVariantId);
      url = `/api/v2/notes?${params.toString()}`;
    }
    const query = useQuery<PaginatedApiResponse<Note>>(url);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : [],
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data?.totalPages ?? 0
    };
  };

  const createNote = async (data: Omit<Note, 'id'>): Promise<Note> => {
    return await post<Note, Omit<Note, 'id'>>('/api/v2/notes', data);
  };

  const updateNote = async (id: string, data: Omit<Note, 'id'>): Promise<Note> => {
    return await put<Note, Omit<Note, 'id'>>(`/api/v2/notes/${id}`, data);
  };

  const deleteNote = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/notes/${id}`);
  };

  // --- SERVICE VARIANT ELEMENTS CRUD ---
  const useServiceVariantElements = (
    serviceVariantId?: string | null,
    serviceId?: string | null,
    pageNumber = 1,
    pageSize = 50,
    searchTerm?: string,
    enabled = true
  ) => {
    let url: string | null = null;
    if (enabled) {
      const params = new URLSearchParams();
      if (serviceId) params.append('serviceId', serviceId);
      if (serviceVariantId) params.append('serviceVariantId', serviceVariantId);
      params.append('pageNumber', pageNumber.toString());
      params.append('pageSize', pageSize.toString());
      if (searchTerm) params.append('searchTerm', searchTerm);
      url = `/api/v2/service-variant-elements?${params.toString()}`;
    }
    const query = useQuery<PaginatedApiResponse<ServiceVariantElement>>(url);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : [],
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data?.totalPages ?? 0
    };
  };

  const createServiceVariantElement = async (data: { serviceVariantId: string; code: string; description: string }): Promise<ServiceVariantElement> => {
    return await post<ServiceVariantElement, { serviceVariantId: string; code: string; description: string }>('/api/v2/service-variant-elements', data);
  };

  const updateServiceVariantElement = async (id: string, data: { code: string; description: string }): Promise<ServiceVariantElement> => {
    return await put<ServiceVariantElement, { id: string; code: string; description: string }>(`/api/v2/service-variant-elements/${id}`, { id, ...data });
  };

  const deleteServiceVariantElement = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/service-variant-elements/${id}`);
  };

  return {
    useFees,
    createFee,
    updateFee,
    deleteFee,
    toggleFeeStatus,
    useServiceFees,
    createServiceFee,
    updateServiceFee,
    deleteServiceFee,
    useElements,
    createElement,
    updateElement,
    deleteElement,
    useServiceVariantFees,
    createServiceVariantFee,
    updateServiceVariantFee,
    deleteServiceVariantFee,
    useServiceVariantElementFees,
    createServiceVariantElementFee,
    updateServiceVariantElementFee,
    deleteServiceVariantElementFee,
    useNotes,
    createNote,
    updateNote,
    deleteNote,
    useServiceVariantElements,
    createServiceVariantElement,
    updateServiceVariantElement,
    deleteServiceVariantElement,
    useServices: (enabled = true) => {
      const query = useQuery<{ succeeded: boolean; data: ServiceCatalogItem[] }>(enabled ? '/api/v2/services?pageSize=9999' : null);
      return {
        ...query,
        data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
      };
    },
    useServiceVariants: (serviceId: string, enabled = true) => {
      const query = useQuery<{ succeeded: boolean; data: ServiceVariant[] }>((enabled && serviceId) ? `/api/v2/services/${serviceId}/variants` : null);
      return {
        ...query,
        data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
      };
    },
    useServiceCategories: (enabled = true) => {
      const query = useQuery<{ succeeded: boolean; data: ServiceCategoryItem[] }>(enabled ? '/api/v2/service-categories' : null);
      return {
        ...query,
        data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
      };
    }
  };
}
