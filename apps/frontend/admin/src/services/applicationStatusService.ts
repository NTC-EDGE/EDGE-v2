import { useApi } from './api';

export interface ApplicationStatusRef {
  id: string;
  statusCode: string;
  name: string;
  description: string;
  category: "Draft" | "Processing" | "Payment" | "Final";
  badgeColor: string;
  displayOrder: number;
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

export function useApplicationStatusService() {
  const { useQuery } = useApi();

  const useApplicationStatuses = (pageNumber = 1, pageSize = 50) => {
    return useQuery<PaginatedApiResponse<ApplicationStatusRef>>(`/api/v2/application-statuses?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  };

  return {
    useApplicationStatuses,
  };
}
