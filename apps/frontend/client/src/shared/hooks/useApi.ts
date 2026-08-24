import { useAuth } from "@clerk/expo";
import { apiClient, useAuthenticatedSWR } from "@edge/api";
import { SWRConfiguration, SWRResponse } from "swr";
import { useCallback, useMemo } from "react";

export function useApi() {
  const { getToken } = useAuth();

  const getHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken();
    return token !== null && token !== undefined && token !== ""
      ? { Authorization: `Bearer ${token}` }
      : {};
  }, [getToken]);

  const get = useCallback(async <T>(url: string): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.get<T>(url, { headers });
    return response.data;
  }, [getHeaders]);

  const post = useCallback(async <T, D = unknown>(url: string, data: D): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.post<T>(url, data, { headers });
    return response.data;
  }, [getHeaders]);

  const put = useCallback(async <T, D = unknown>(url: string, data: D): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.put<T>(url, data, { headers });
    return response.data;
  }, [getHeaders]);

  const patch = useCallback(async <T, D = unknown>(url: string, data?: D): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.patch<T>(url, data, { headers });
    return response.data;
  }, [getHeaders]);

  const del = useCallback(async <T>(url: string): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.delete<T>(url, { headers });
    return response.data;
  }, [getHeaders]);

  function useQuery<Data = unknown, Error = unknown>(
    key: string | null,
    config?: SWRConfiguration<Data, Error>
  ): SWRResponse<Data, Error> {
    return useAuthenticatedSWR<Data, Error>(key, getToken, config);
  }

  return useMemo(
    () => ({ get, post, put, patch, del, useQuery }),
    [get, post, put, patch, del]
  );
}
