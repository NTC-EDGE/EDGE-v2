import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  attachTokenInterceptor,
  clearTokenState,
  getLatestToken,
  getTenantId,
  setAuthToken,
  setTenantId,
  setTokenProvider,
  subscribeUnauthorized,
  TokenProviderOptions,
} from '@edge/api';
import { createLinkingConfig } from '../../../../../../../packages/ui/navigation/linking';

describe('tokenManager & linking auth safeguards', () => {
  beforeEach(() => {
    clearTokenState();
  });

  afterEach(() => {
    clearTokenState();
  });

  it('preserves explicit per-request Authorization headers when dynamic provider is not yet set', async () => {
    const client = axios.create({
      adapter: async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => ({
        data: { authHeader: config.headers.Authorization },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
    });
    attachTokenInterceptor(client);

    const res = await client.post<{ authHeader?: string }>(
      '/api/v2/tenants/verify-membership',
      { selectedRegion: 'NCR' },
      { headers: { Authorization: 'Bearer explicit-jwt-token' } }
    );

    expect(res.data.authHeader).toBe('Bearer explicit-jwt-token');
  });

  it('retries token provider once during initial Clerk hydration', async () => {
    let attempts = 0;
    setTokenProvider(async () => {
      attempts += 1;
      return attempts === 1 ? null : 'hydrated-clerk-jwt';
    });

    const token = await getLatestToken();
    expect(token).toBe('hydrated-clerk-jwt');
    expect(attempts).toBe(2);
  });

  it('refreshes token with skipCache on 401 and succeeds without triggering unauthorized eviction', async () => {
    const seenSkipCache: Array<boolean | undefined> = [];
    setTokenProvider(async (opts?: TokenProviderOptions) => {
      seenSkipCache.push(opts?.skipCache);
      return opts?.skipCache ? 'fresh-jwt' : 'stale-jwt';
    });

    let unauthorizedCount = 0;
    const unsubscribe = subscribeUnauthorized(() => {
      unauthorizedCount += 1;
    });

    const client = axios.create({
      adapter: async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        if (config.headers.Authorization === 'Bearer fresh-jwt') {
          return {
            data: { ok: true },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        }
        const headers = new AxiosHeaders();
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
          data: {},
          status: 401,
          statusText: 'Unauthorized',
          headers,
          config,
        });
      },
    });
    attachTokenInterceptor(client);

    const res = await client.get<{ ok: boolean }>('/api/v2/applications');
    expect(res.data.ok).toBe(true);
    expect(seenSkipCache).toEqual([undefined, true]);
    expect(unauthorizedCount).toBe(0);

    unsubscribe();
  });

  it('notifies unauthorized subscribers on terminal 401 when no valid session exists', async () => {
    let unauthorizedCount = 0;
    const unsubscribe = subscribeUnauthorized(() => {
      unauthorizedCount += 1;
    });

    const client = axios.create({
      adapter: async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        const headers = new AxiosHeaders();
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
          data: {},
          status: 401,
          statusText: 'Unauthorized',
          headers,
          config,
        });
      },
    });
    attachTokenInterceptor(client);

    await expect(client.get('/api/v2/applications')).rejects.toThrow('Unauthorized');
    expect(unauthorizedCount).toBe(1);

    unsubscribe();
  });

  it('clears provider, static token, and tenant ID via clearTokenState', async () => {
    setTokenProvider(async () => 'dynamic-token');
    setAuthToken('static-token');
    setTenantId('aa0cd342-7265-4d9e-9242-948fc7e3d0a8');

    clearTokenState();

    expect(getTenantId()).toBeNull();
    expect(await getLatestToken()).toBeNull();
  });

  it('keeps InternalLogin active on unauthenticated stack when redirect points to /dashboard, then resolves target on authenticated stack', () => {
    const unauthLinking = createLinkingConfig({
      defaultRoute: 'InternalLogin',
      defaultPath: '/internal/login',
      redirectPaths: ['', '/', 'login'],
    });
    const authLinking = createLinkingConfig({
      defaultRoute: 'Dashboard',
      defaultPath: '/dashboard',
      redirectPaths: ['', '/', 'internal/login', 'internal/landing'],
    });

    const unauthScreens = {
      screens: {
        Landing: 'landing',
        Onboarding: 'onboarding',
        InternalLogin: 'internal/login',
      },
    };
    const authScreens = {
      screens: {
        Dashboard: 'dashboard',
        Employees: 'employees',
      },
    };

    const unauthState = unauthLinking.getStateFromPath?.(
      '/internal/login?redirect=%2Fdashboard',
      unauthScreens
    );
    expect(unauthState?.routes[0]?.name).toBe('InternalLogin');

    const authState = authLinking.getStateFromPath?.(
      '/internal/login?redirect=%2Femployees',
      authScreens
    );
    expect(authState?.routes[0]?.name).toBe('Employees');
  });
});
