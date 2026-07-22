import { useAuth } from '@clerk/nextjs';
import { apiClient, useAuthenticatedSWR } from '@edge/api';
import { SWRConfiguration, SWRResponse } from 'swr';

export function useApi() {
  const { getToken } = useAuth();

  const getHeaders = async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const get = async <T>(url: string): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.get<T>(url, { headers });
    return response.data;
  };

  const post = async <T, D = unknown>(url: string, data: D): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.post<T>(url, data, { headers });
    return response.data;
  };

  const put = async <T, D = unknown>(url: string, data: D): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.put<T>(url, data, { headers });
    return response.data;
  };

  const patch = async <T, D = unknown>(url: string, data: D): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.patch<T>(url, data, { headers });
    return response.data;
  };

  const del = async <T>(url: string): Promise<T> => {
    const headers = await getHeaders();
    const response = await apiClient.delete<T>(url, { headers });
    return response.data;
  };

  function useQuery<Data = unknown, Error = unknown>(
    key: string | null,
    config?: SWRConfiguration<Data, Error>
  ): SWRResponse<Data, Error> {
    return useAuthenticatedSWR<Data, Error>(key, getToken, config);
  }

  return { get, post, put, patch, del, useQuery };
}
