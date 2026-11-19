import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface TokenProviderOptions {
  skipCache?: boolean;
}

export type TokenProvider = (options?: TokenProviderOptions) => Promise<string | null>;

let activeTokenProvider: TokenProvider | null = null;
let staticToken: string | null = null;
let activeTenantId: string | null = null;
const unauthorizedListeners = new Set<() => void>();
const retriedUnauthorizedConfigs = new WeakSet<object>();

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
 * Sets the active regional tenant ID for outgoing HTTP headers.
 */
export function setTenantId(tenantId: string | null): void {
  activeTenantId = tenantId;
}

/**
 * Gets the current active regional tenant ID.
 */
export function getTenantId(): string | null {
  return activeTenantId;
}

/**
 * Clears all in-memory token provider, static token, and tenant state on sign-out.
 */
export function clearTokenState(): void {
  activeTokenProvider = null;
  staticToken = null;
  activeTenantId = null;
}

/**
 * Subscribes to terminal 401 Unauthorized responses (after fresh-token retry fails or when no token exists).
 */
export function subscribeUnauthorized(listener: () => void): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch (err: unknown) {
      console.error('[TokenManager] Unauthorized listener error:', err);
    }
  });
}

/**
 * Retrieves the latest token directly from Clerk's SDK or static fallback.
 */
export async function getLatestToken(options?: TokenProviderOptions): Promise<string | null> {
  if (activeTokenProvider !== null) {
    try {
      let token = await activeTokenProvider(options);
      if ((token === null || token.length === 0) && !options?.skipCache) {
        // Brief pause to allow Clerk SDK hydration to complete on initial mount
        await new Promise((resolve) => setTimeout(resolve, 250));
        if (activeTokenProvider !== null) {
          token = await activeTokenProvider(options);
        }
      }
      if (token !== null && token.length > 0) {
        return token;
      }
    } catch (err: unknown) {
      console.warn('[TokenManager] Failed to retrieve dynamic auth token from provider:', err);
    }
  }
  return staticToken;
}

/**
 * Attaches request and response interceptors to Axios that attach fresh Clerk JWTs
 * and handle 401 token refresh / unauthorized session eviction.
 */
export function attachTokenInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const existingAuth = config.headers.Authorization;
      const hasExplicitAuth = typeof existingAuth === 'string' && existingAuth.trim().length > 0;

      if (!hasExplicitAuth) {
        const token = await getLatestToken();
        if (token !== null && token.length > 0) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          delete config.headers.Authorization;
        }
      }

      if (activeTenantId !== null && activeTenantId.length > 0) {
        config.headers['X-Tenant-Id'] = activeTenantId;
      } else {
        delete config.headers['X-Tenant-Id'];
      }

      return config;
    },
    (error: unknown) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const originalConfig = error.config;
        if (
          originalConfig !== undefined &&
          !retriedUnauthorizedConfigs.has(originalConfig) &&
          activeTokenProvider !== null
        ) {
          retriedUnauthorizedConfigs.add(originalConfig);
          const freshToken = await getLatestToken({ skipCache: true });
          if (freshToken !== null && freshToken.length > 0) {
            originalConfig.headers.Authorization = `Bearer ${freshToken}`;
            return axiosInstance.request(originalConfig);
          }
        }

        notifyUnauthorized();
      }

      return Promise.reject(error);
    }
  );
}
