import { useApi } from './api';
import { Fee, ServiceFee, Note } from '@edge/api';

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

export const MOCK_SERVICES: ServiceCatalogItem[] = [
  { id: "srv-1", name: "Amateur Radio Operator License" },
  { id: "srv-2", name: "Commercial Radio Station Permit" },
  { id: "srv-3", name: "Ship Radio Station License" },
  { id: "srv-4", name: "Aircraft Radio Station License" },
  { id: "srv-5", name: "Dealer Representative Permit" }
];

export const MOCK_CATEGORIES: ServiceCategoryItem[] = [
  { id: "cat-1", name: "Amateur Radio Services" },
  { id: "cat-2", name: "Maritime Radio Services" },
  { id: "cat-3", name: "Aeronautical Radio Services" },
  { id: "cat-4", name: "Commercial Radio & Carrier Services" },
  { id: "cat-5", name: "Dealer & Manufacturer Services" }
];

export function useFeesNotesService() {
  const { useQuery, post, put, patch, del } = useApi();

  // --- FEES CRUD ---
  const useFees = () => {
    const query = useQuery<Fee[]>('/api/v2/fees');
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
  const useServiceFees = () => {
    const query = useQuery<ServiceFee[]>('/api/v2/service-fees');
    return {
      ...query,
      data: query.data !== undefined && query.data !== null ? query.data : []
    };
  };

  const createServiceFee = async (data: Omit<ServiceFee, 'id'>): Promise<ServiceFee> => {
    return await post<ServiceFee, Omit<ServiceFee, 'id'>>('/api/v2/service-fees', data);
  };

  const updateServiceFee = async (id: string, data: Omit<ServiceFee, 'id'>): Promise<ServiceFee> => {
    return await put<ServiceFee, Omit<ServiceFee, 'id'>>(`/api/v2/service-fees/${id}`, data);
  };

  const deleteServiceFee = async (id: string): Promise<void> => {
    await del<void>(`/api/v2/service-fees/${id}`);
  };

  // --- NOTES CRUD ---
  const useNotes = (pageNumber = 1, pageSize = 10) => {
    const query = useQuery<PaginatedApiResponse<Note>>(`/api/v2/notes?pageNumber=${pageNumber}&pageSize=${pageSize}`);
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
    useNotes,
    createNote,
    updateNote,
    deleteNote
  };
}
