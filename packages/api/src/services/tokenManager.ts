import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export type TokenProvider = () => Promise<string | null>;

let activeTokenProvider: TokenProvider | null = null;
let staticToken: string | null = null;

/**
 * Registers Clerk's getToken callback.
 * Clerk's SDK automatically manages token lifecycle, caching, and background token refreshes.
 */
export function setTokenProvider(provider: TokenProvider | null): void {
  activeTokenProvider = provider;
}

/**
 * Sets or clears a static bearer token as a fallback.
 */
export function setAuthToken(token: string | null): void {
  staticToken = token;
}

/**
 * Retrieves the latest token directly from Clerk's SDK or static fallback.
 */
export async function getLatestToken(): Promise<string | null> {
  if (activeTokenProvider !== null) {
    try {
      const token = await activeTokenProvider();
      if (token !== null && token.length > 0) {
        return token;
      }
    } catch (err) {
      console.warn('[TokenManager] Failed to retrieve dynamic auth token from provider:', err);
    }
  }
  return staticToken;
}

/**
 * Attaches a request interceptor to Axios that retrieves the latest token from Clerk for outgoing HTTP requests.
 */
export function attachTokenInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getLatestToken();
      if (token !== null && token.length > 0) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error: unknown) => Promise.reject(error)
  );
}
