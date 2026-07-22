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

// Initial mock data
const INITIAL_FEES: Fee[] = [
  { id: "fee-1", code: "APP_FEE", name: "Application Filing Fee", description: "Basic filing and processing fee for new licenses." },
  { id: "fee-2", code: "INSP_FEE", name: "Physical Inspection Fee", description: "On-site physical inspection and verification of equipment." },
  { id: "fee-3", code: "REG_FEE", name: "Spectrum Registration Fee", description: "Annual registration fee for frequency spectrum allocation." },
  { id: "fee-4", code: "REN_FEE", name: "License Renewal Surcharge", description: "Renewal surcharge for expired permits." },
  { id: "fee-5", code: "EXAM_FEE", name: "Examination Entrance Fee", description: "Registration and permit entry fee for amateur and commercial radio exams." }
];

const INITIAL_SERVICE_FEES: ServiceFee[] = [
  { id: "sf-1", serviceId: "srv-1", feeId: "fee-1", amount: 500 },
  { id: "sf-2", serviceId: "srv-1", feeId: "fee-5", amount: 300 },
  { id: "sf-3", serviceId: "srv-2", feeId: "fee-1", amount: 2500 },
  { id: "sf-4", serviceId: "srv-2", feeId: "fee-2", amount: 4500 },
  { id: "sf-5", serviceId: "srv-3", feeId: "fee-1", amount: 1500 }
];

const INITIAL_NOTES: Note[] = [
  { id: "note-1", serviceCategoryId: "cat-1", notes: "Ensure all applicant details match their government-issued ID. A passing score of at least 70% is required on all elements of the amateur class exam." },
  { id: "note-2", serviceCategoryId: "cat-2", notes: "Maritime station installations require verification of safety compliance with international safety guidelines. Equipment must be type-approved." },
  { id: "note-3", serviceCategoryId: "cat-4", notes: "Spectrum allocation fees are computed based on the authorized bandwidth and geographical area of coverage." }
];

// Helper to get local storage data
const getLocalStorageData = <T>(key: string, initialData: T[]): T[] => {
  if (typeof window === 'undefined') return initialData;
  const stored = localStorage.getItem(key);
  if (stored !== null) {
    try {
      return JSON.parse(stored) as T[];
    } catch {
      return initialData;
    }
  }
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
};

const saveLocalStorageData = <T>(key: string, data: T[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export function useFeesNotesService() {
  const { useQuery, post, put, del } = useApi();

  // --- FEES CRUD ---
  const useFees = () => {
    const query = useQuery<Fee[]>('/api/v2/fees');
    const localData = getLocalStorageData<Fee>('edge_admin_fees', INITIAL_FEES);
    return {
      ...query,
      data: query.data !== undefined && query.data !== null && query.data.length > 0 ? query.data : localData
    };
  };

  const createFee = async (data: Omit<Fee, 'id'>): Promise<Fee> => {
    try {
      return await post<Fee, Omit<Fee, 'id'>>('/api/v2/fees', data);
    } catch {
      const local = getLocalStorageData<Fee>('edge_admin_fees', INITIAL_FEES);
      const newFee: Fee = {
        id: `fee-${Date.now()}`,
        ...data
      };
      local.push(newFee);
      saveLocalStorageData('edge_admin_fees', local);
      return newFee;
    }
  };

  const updateFee = async (id: string, data: Omit<Fee, 'id'>): Promise<Fee> => {
    try {
      return await put<Fee, Omit<Fee, 'id'>>(`/api/v2/fees/${id}`, data);
    } catch {
      const local = getLocalStorageData<Fee>('edge_admin_fees', INITIAL_FEES);
      const idx = local.findIndex(f => f.id === id);
      if (idx !== -1) {
        local[idx] = { id, ...data };
        saveLocalStorageData('edge_admin_fees', local);
      }
      return { id, ...data };
    }
  };

  const deleteFee = async (id: string): Promise<void> => {
    try {
      await del<void>(`/api/v2/fees/${id}`);
    } catch {
      const local = getLocalStorageData<Fee>('edge_admin_fees', INITIAL_FEES);
      const filtered = local.filter(f => f.id !== id);
      saveLocalStorageData('edge_admin_fees', filtered);
      
      // Cascade delete service fees associated with this fee
      const sFees = getLocalStorageData<ServiceFee>('edge_admin_service_fees', INITIAL_SERVICE_FEES);
      const filteredSFees = sFees.filter(sf => sf.feeId !== id);
      saveLocalStorageData('edge_admin_service_fees', filteredSFees);
    }
  };

  // --- SERVICE FEES CRUD ---
  const useServiceFees = () => {
    const query = useQuery<ServiceFee[]>('/api/v2/service-fees');
    const localData = getLocalStorageData<ServiceFee>('edge_admin_service_fees', INITIAL_SERVICE_FEES);
    return {
      ...query,
      data: query.data !== undefined && query.data !== null && query.data.length > 0 ? query.data : localData
    };
  };

  const createServiceFee = async (data: Omit<ServiceFee, 'id'>): Promise<ServiceFee> => {
    try {
      return await post<ServiceFee, Omit<ServiceFee, 'id'>>('/api/v2/service-fees', data);
    } catch {
      const local = getLocalStorageData<ServiceFee>('edge_admin_service_fees', INITIAL_SERVICE_FEES);
      const newServiceFee: ServiceFee = {
        id: `sf-${Date.now()}`,
        ...data
      };
      local.push(newServiceFee);
      saveLocalStorageData('edge_admin_service_fees', local);
      return newServiceFee;
    }
  };

  const updateServiceFee = async (id: string, data: Omit<ServiceFee, 'id'>): Promise<ServiceFee> => {
    try {
      return await put<ServiceFee, Omit<ServiceFee, 'id'>>(`/api/v2/service-fees/${id}`, data);
    } catch {
      const local = getLocalStorageData<ServiceFee>('edge_admin_service_fees', INITIAL_SERVICE_FEES);
      const idx = local.findIndex(sf => sf.id === id);
      if (idx !== -1) {
        local[idx] = { id, ...data };
        saveLocalStorageData('edge_admin_service_fees', local);
      }
      return { id, ...data };
    }
  };

  const deleteServiceFee = async (id: string): Promise<void> => {
    try {
      await del<void>(`/api/v2/service-fees/${id}`);
    } catch {
      const local = getLocalStorageData<ServiceFee>('edge_admin_service_fees', INITIAL_SERVICE_FEES);
      const filtered = local.filter(sf => sf.id !== id);
      saveLocalStorageData('edge_admin_service_fees', filtered);
    }
  };

  // --- NOTES CRUD ---
  const useNotes = (pageNumber = 1, pageSize = 10) => {
    const query = useQuery<PaginatedApiResponse<Note>>(`/api/v2/notes?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    const localData = getLocalStorageData<Note>('edge_admin_notes', INITIAL_NOTES);
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : localData,
      totalCount: query.data?.totalCount ?? localData.length
    };
  };

  const createNote = async (data: Omit<Note, 'id'>): Promise<Note> => {
    try {
      return await post<Note, Omit<Note, 'id'>>('/api/v2/notes', data);
    } catch {
      const local = getLocalStorageData<Note>('edge_admin_notes', INITIAL_NOTES);
      const newNote: Note = {
        id: `note-${Date.now()}`,
        ...data
      };
      local.push(newNote);
      saveLocalStorageData('edge_admin_notes', local);
      return newNote;
    }
  };

  const updateNote = async (id: string, data: Omit<Note, 'id'>): Promise<Note> => {
    try {
      return await put<Note, Omit<Note, 'id'>>(`/api/v2/notes/${id}`, data);
    } catch {
      const local = getLocalStorageData<Note>('edge_admin_notes', INITIAL_NOTES);
      const idx = local.findIndex(n => n.id === id);
      if (idx !== -1) {
        local[idx] = { id, ...data };
        saveLocalStorageData('edge_admin_notes', local);
      }
      return { id, ...data };
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      await del<void>(`/api/v2/notes/${id}`);
    } catch {
      const local = getLocalStorageData<Note>('edge_admin_notes', INITIAL_NOTES);
      const filtered = local.filter(n => n.id !== id);
      saveLocalStorageData('edge_admin_notes', filtered);
    }
  };

  return {
    useFees,
    createFee,
    updateFee,
    deleteFee,
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
