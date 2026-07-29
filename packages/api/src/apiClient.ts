import axios from 'axios';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { attachTokenInterceptor } from './services/tokenManager';

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.length > 0) {
    return envUrl;
  }
  return 'http://localhost:5038';
};

export const apiClient = axios.create({
  baseURL: getApiUrl(),
});

// Attach dynamic token interceptor to ensure all requests automatically include fresh JWT bearer tokens
attachTokenInterceptor(apiClient);

export const fetcher = <T>(url: string): Promise<T> =>
  apiClient.get<T>(url).then((res) => res.data);

export function useAuthenticatedSWR<Data = unknown, Error = unknown>(
  key: string | null,
  clerkGetToken: () => Promise<string | null>,
  config?: SWRConfiguration<Data, Error>
): SWRResponse<Data, Error> {
  const customFetcher = async (url: string): Promise<Data> => {
    const token = await clerkGetToken();
    const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiClient.get<Data>(url, { headers });
    return response.data;
  };

  const defaultConfig: SWRConfiguration<Data, Error> = {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    keepPreviousData: true,
    dedupingInterval: 10000,
    ...config,
  };

  return useSWR<Data, Error>(key, customFetcher, defaultConfig);
}
