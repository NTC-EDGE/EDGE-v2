import { useApi } from './api';

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface PaginatedApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface CreateDocumentTypeRequest {
  code: string;
  name: string;
  description: string;
  category: string;
}

export function useDocumentTypeService() {
  const { useQuery, post } = useApi();

  const useDocumentTypes = (
    pageNumber = 1,
    pageSize = 50,
    searchTerm?: string,
    category?: string,
    activeOnly = false
  ) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    if (category !== undefined && category !== null && category !== 'ALL') {
      params.append('category', category.trim());
    }
    if (activeOnly) {
      params.append('activeOnly', 'true');
    }
    return useQuery<PaginatedApiResponse<DocumentType>>(`/api/v2/document-types?${params.toString()}`);
  };

  const createDocumentType = async (request: CreateDocumentTypeRequest): Promise<DocumentType> => {
    return post<DocumentType, CreateDocumentTypeRequest>('/api/v2/document-types', request);
  };

  return {
    useDocumentTypes,
    createDocumentType,
  };
}
