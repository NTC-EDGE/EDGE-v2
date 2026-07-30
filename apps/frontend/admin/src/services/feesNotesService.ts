import { useApi } from './api';
import { Fee, ServiceFee, Note, Element, ServiceVariant, ServiceVariantFee, ServiceVariantElementFee } from '@edge/api';

export interface ServiceCatalogItem {
  id: string;
  name: string;
}

export interface ServiceCategoryItem {
  id: string;
  name: string;
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


export function useFeesNotesService() {
  const { useQuery, post, put, patch, del } = useApi();

  // --- FEES CRUD ---
  const useFees = (enabled = true) => {
    const query = useQuery<Fee[]>(enabled ? '/api/v2/fees' : null);
    return {
      ...query,
      data: query.data !== undefined && query.data !== null ? query.data : []
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
  const useServiceFees = (enabled = true) => {
    const query = useQuery<ServiceFee[]>(enabled ? '/api/v2/service-fees' : null);
    return {
      ...query,
      data: query.data !== undefined && query.data !== null ? query.data : []
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
  const useElements = (enabled = true) => {
    const query = useQuery<Element[]>(enabled ? '/api/v2/elements' : null);
    return {
      ...query,
      data: query.data !== undefined && query.data !== null ? query.data : []
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
  const useServiceVariantFees = (serviceVariantId?: string, enabled = true) => {
    const url = enabled 
      ? (serviceVariantId ? `/api/v2/service-variant-fees?serviceVariantId=${serviceVariantId}` : '/api/v2/service-variant-fees')
      : null;
    const query = useQuery<ServiceVariantFee[]>(url);
    return {
      ...query,
      data: query.data !== undefined && query.data !== null ? query.data : []
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
  const useServiceVariantElementFees = (serviceVariantId?: string, enabled = true) => {
    const url = enabled
      ? (serviceVariantId ? `/api/v2/service-variant-element-fees?serviceVariantId=${serviceVariantId}` : '/api/v2/service-variant-element-fees')
      : null;
    const query = useQuery<ServiceVariantElementFee[]>(url);
    return {
      ...query,
      data: query.data !== undefined && query.data !== null ? query.data : []
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
  const useNotes = (pageNumber = 1, pageSize = 10, enabled = true) => {
    const query = useQuery<PaginatedApiResponse<Note>>(enabled ? `/api/v2/notes?pageNumber=${pageNumber}&pageSize=${pageSize}` : null);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : [],
      totalCount: query.data?.totalCount ?? 0
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
    useServices: (enabled = true) => {
      const query = useQuery<{ succeeded: boolean; data: ServiceCatalogItem[] }>(enabled ? '/api/v2/services' : null);
      return {
        ...query,
        data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
      };
    },
    useServiceVariants: (serviceId: string) => {
      const query = useQuery<{ succeeded: boolean; data: ServiceVariant[] }>(serviceId ? `/api/v2/services/${serviceId}/variants` : null);
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
