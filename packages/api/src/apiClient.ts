import axios from 'axios';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { attachTokenInterceptor } from './services/tokenManager';

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  throw new Error(
    '[EDGE API] No API base URL configured. ' +
    'Set NEXT_PUBLIC_API_URL (Next.js) or EXPO_PUBLIC_API_URL (Expo) in your .env file.'
  );
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
    let token: string | null = null;
    try {
      token = await clerkGetToken();
      if (!token) {
        // Short pause to allow Clerk SDK hydration to complete on initial mount
        await new Promise((res) => setTimeout(res, 300));
        token = await clerkGetToken();
      }
    } catch {
      token = null;
    }
    const headers: Record<string, string> = {};
    if (token !== null && token.length > 0) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await apiClient.get<Data>(url, { headers });
    return response.data;
  };

  const defaultConfig: SWRConfiguration<Data, Error> = {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    keepPreviousData: true,
    dedupingInterval: 5000,
    onErrorRetry: (error, _key, _config, revalidate, opts) => {
      // Never retry on 403 Forbidden — it is not a transient error
      if (
        typeof error === 'object' &&
        error !== null &&
        (error as { response?: { status?: number } }).response?.status === 403
      ) {
        return;
      }
      // Retry up to 3 times for 401 errors to allow Clerk authentication token to settle
      if (opts.retryCount < 3) {
        setTimeout(() => revalidate({ retryCount: opts.retryCount }), 1200);
      }
    },
    ...config,
  };

  return useSWR<Data, Error>(key, customFetcher, defaultConfig);
}
