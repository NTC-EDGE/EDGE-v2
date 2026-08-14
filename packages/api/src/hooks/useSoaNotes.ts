import useSWR from "swr";
import { apiClient } from "../apiClient";
import { PaginatedApiResponse, SoaNote } from "../types";

export interface UseSoaNotesParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  enabled?: boolean;
}

export interface UseSoaNotesReturn {
  notes: SoaNote[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  mutate: () => Promise<PaginatedApiResponse<SoaNote> | undefined>;
}

export function useSoaNotes(params?: UseSoaNotesParams): UseSoaNotesReturn {
  const { pageNumber = 1, pageSize = 20, searchTerm, enabled = true } = params ?? {};

  const queryParams = new URLSearchParams();
  queryParams.append("pageNumber", pageNumber.toString());
  queryParams.append("pageSize", pageSize.toString());
  if (searchTerm) queryParams.append("searchTerm", searchTerm);

  const url = enabled ? `/api/v2/soa-notes?${queryParams.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedApiResponse<SoaNote>>(
    url,
    async (fetchUrl: string) => {
      const res = await apiClient.get<PaginatedApiResponse<SoaNote>>(fetchUrl);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    notes: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    isError: Boolean(error),
    mutate,
  };
}
