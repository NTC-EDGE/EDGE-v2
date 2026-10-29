import axios from 'axios';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { attachTokenInterceptor } from './services/tokenManager';

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return 'http://localhost:5000';
};

export const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function getErrorInfo(err: unknown): {
  status?: number;
  code?: string;
  hasResponse: boolean;
  message?: string;
} {
  if (!isRecord(err)) {
    return { hasResponse: false };
  }
  const response = isRecord(err['response']) ? err['response'] : undefined;
  const status = typeof response?.['status'] === 'number' ? response['status'] : undefined;
  const code = typeof err['code'] === 'string' ? err['code'] : undefined;
  const message = typeof err['message'] === 'string' ? err['message'] : undefined;
  return {
    status,
    code,
    hasResponse: response !== undefined,
    message,
  };
}

// Server Unreachable State Management (Circuit Breaker)
let isServerUnreachable = false;
let lastUnreachableTimestamp = 0;
const listeners = new Set<(unreachable: boolean) => void>();

export const getIsServerUnreachable = (): boolean => isServerUnreachable;

export const subscribeServerUnreachable = (listener: (unreachable: boolean) => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setServerUnreachable = (unreachable: boolean): void => {
  isServerUnreachable = unreachable;
  if (unreachable) {
    lastUnreachableTimestamp = Date.now();
  }
  listeners.forEach((l) => l(unreachable));
};

// Response Interceptor to detect network / server offline states
apiClient.interceptors.response.use(
  (response) => {
    if (isServerUnreachable) {
      setServerUnreachable(false);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const isNetworkErr =
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      !error.response ||
      (typeof status === 'number' && status >= 502 && status <= 504);

    if (isNetworkErr) {
      setServerUnreachable(true);
    }
    return Promise.reject(error);
  }
);

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
    // If server was recently flagged offline, check if 15 seconds have passed before allowing automated background refetch
    if (isServerUnreachable && Date.now() - lastUnreachableTimestamp < 15000) {
      throw new Error('[EDGE API] Server currently unreachable. Automated retries paused.');
    }

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
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };
    if (token !== null && token.length > 0) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await apiClient.get<Data>(url, { headers });
    return response.data;
  };

  const defaultConfig: SWRConfiguration<Data, Error> = {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    keepPreviousData: false,
    dedupingInterval: 2000,
    shouldRetryOnError: true,
    onErrorRetry: (error, _key, _config, revalidate, opts) => {
      const info = getErrorInfo(error);
      const status = info.status;
      const isNetworkErr =
        info.code === 'ERR_NETWORK' ||
        info.code === 'ECONNREFUSED' ||
        !info.hasResponse ||
        (typeof status === 'number' && status >= 502 && status <= 504) ||
        Boolean(info.message?.includes('Server currently unreachable'));

      // Circuit Breaker: Suppress rapid repeated retries when backend server is detected offline
      if (isNetworkErr) {
        if (opts.retryCount >= 1) return;
        setTimeout(() => revalidate({ retryCount: opts.retryCount }), 15000);
        return;
      }

      // Never retry on 403 Forbidden
      if (status === 403) return;

      // Retry up to 3 times for transient errors
      if (opts.retryCount < 3) {
        setTimeout(() => revalidate({ retryCount: opts.retryCount }), 1200);
      }
    },
    ...config,
  };

  const swrResponse = useSWR<Data, Error>(key, customFetcher, defaultConfig);

  // Never expose stale in-memory cached data when a request fails or the server is unreachable
  if (swrResponse.error || isServerUnreachable) {
    return {
      ...swrResponse,
      data: undefined,
    };
  }

  return swrResponse;
}
