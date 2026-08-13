import { useAuth } from '@clerk/nextjs';
import { apiClient, useAuthenticatedSWR } from '@edge/api';
import { SWRConfiguration, SWRResponse } from 'swr';
import axios from 'axios';

let isBackendUnavailable = false;
let lastAlertTime = 0;
let lastForbiddenTime = 0;
const ALERT_COOLDOWN = 15000; // 15 seconds
const FORBIDDEN_COOLDOWN = 3000; // 3 seconds — allow per-page toasts but avoid spam

if (typeof window !== 'undefined') {
  // Request Interceptor to short-circuit requests if backend is offline
  apiClient.interceptors.request.use(
    (config) => {
      if (isBackendUnavailable && Date.now() - lastAlertTime < ALERT_COOLDOWN) {
        const cancelTokenSource = axios.CancelToken.source();
        config.cancelToken = cancelTokenSource.token;
        cancelTokenSource.cancel("Server is currently unavailable.");
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor to detect offline state, 403 forbidden, and trigger events
  apiClient.interceptors.response.use(
    (response) => {
      if (isBackendUnavailable) {
        isBackendUnavailable = false;
        window.dispatchEvent(new CustomEvent('backend-online'));
      }
      return response;
    },
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        // 403 Forbidden — dispatch event so the UI can notify the user
        if (error.response?.status === 403) {
          const now = Date.now();
          if (now - lastForbiddenTime > FORBIDDEN_COOLDOWN) {
            lastForbiddenTime = now;
            const url = error.config?.url ?? '';
            const method = error.config?.method ?? '';
            const rawData = error.response?.data;
            const data = typeof rawData === 'object' && rawData !== null ? (rawData as Record<string, unknown>) : null;
            const detail = typeof data?.detail === 'string' ? data.detail : typeof data?.message === 'string' ? data.message : undefined;
            window.dispatchEvent(new CustomEvent('forbidden-access', { detail: { url, method, detail } }));
          }
        }

        const isNetworkError =
          !error.response ||
          error.code === 'ERR_NETWORK' ||
          error.message?.toLowerCase().includes('network error') ||
          (error.response?.status !== undefined && [502, 503, 504].includes(error.response.status));

        if (isNetworkError && !axios.isCancel(error)) {
          isBackendUnavailable = true;
          const now = Date.now();
          if (now - lastAlertTime > ALERT_COOLDOWN) {
            lastAlertTime = now;
            window.dispatchEvent(new CustomEvent('backend-offline'));
          }
        }
      }
      return Promise.reject(error);
    }
  );
}

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
