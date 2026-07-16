import axios from 'axios';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.length > 0) {
    return envUrl;
  }
  return 'http://localhost:5038';
};

export const apiClient = axios.create({
  baseURL: getApiUrl(),
});

export const setAuthToken = (token: string | null): void => {
  if (token !== null) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const fetcher = <T>(url: string): Promise<T> =>
  apiClient.get<T>(url).then((res) => res.data);

export function useAuthenticatedSWR<Data = any, Error = any>(
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

  return useSWR<Data, Error>(key, customFetcher, config);
}
