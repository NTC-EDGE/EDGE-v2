import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { isGoogleSsoEnabled } from './ssoConfig';

describe('ssoConfig - isGoogleSsoEnabled', () => {
  const origExpoClerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const origNextClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const origExpoEnable = process.env.EXPO_PUBLIC_ENABLE_GOOGLE_SSO;
  const origNextEnable = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO;

  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.EXPO_PUBLIC_ENABLE_GOOGLE_SSO;
    delete process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO;
  });

  afterEach(() => {
    if (origExpoClerkKey !== undefined) {
      process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = origExpoClerkKey;
    } else {
      delete process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    }

    if (origNextClerkKey !== undefined) {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = origNextClerkKey;
    } else {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    }

    if (origExpoEnable !== undefined) {
      process.env.EXPO_PUBLIC_ENABLE_GOOGLE_SSO = origExpoEnable;
    } else {
      delete process.env.EXPO_PUBLIC_ENABLE_GOOGLE_SSO;
    }

    if (origNextEnable !== undefined) {
      process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO = origNextEnable;
    } else {
      delete process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO;
    }
  });

  it('returns true in development and preview environments (pk_test_*)', () => {
    expect(
      isGoogleSsoEnabled({
        clerkPublishableKey: 'pk_test_ZWFzeS1zbmlwZS0zNi5jbGVyay5hY2NvdW50cy5kZXYk',
        hostname: 'localhost',
      })
    ).toBe(true);

    expect(
      isGoogleSsoEnabled({
        clerkPublishableKey: 'pk_test_ZWFzeS1zbmlwZS0zNi5jbGVyay5hY2NvdW50cy5kZXYk',
        hostname: 'client-edge-v2.vercel.app',
      })
    ).toBe(true);
  });

  it('returns false in production when Clerk key is pk_live_*', () => {
    expect(
      isGoogleSsoEnabled({
        clerkPublishableKey: 'pk_live_Y2xlcmsuZWRnZS5udGMuZ292LnBoJA',
        hostname: 'localhost',
      })
    ).toBe(false);
  });

  it('returns false on NTC production domains even if key is not passed directly', () => {
    expect(isGoogleSsoEnabled({ hostname: 'edge.ntc.gov.ph' })).toBe(false);
    expect(isGoogleSsoEnabled({ hostname: 'client.edge.ntc.gov.ph' })).toBe(false);
    expect(isGoogleSsoEnabled({ hostname: 'internal.edge.ntc.gov.ph' })).toBe(false);
    expect(isGoogleSsoEnabled({ hostname: 'admin.edge.ntc.gov.ph' })).toBe(false);
  });

  it('allows explicit EXPO_PUBLIC_ENABLE_GOOGLE_SSO override in either direction', () => {
    expect(
      isGoogleSsoEnabled({
        clerkPublishableKey: 'pk_live_Y2xlcmsuZWRnZS5udGMuZ292LnBoJA',
        enableGoogleSso: 'true',
        hostname: 'client.edge.ntc.gov.ph',
      })
    ).toBe(true);

    expect(
      isGoogleSsoEnabled({
        clerkPublishableKey: 'pk_test_ZWFzeS1zbmlwZS0zNi5jbGVyay5hY2NvdW50cy5kZXYk',
        enableGoogleSso: 'false',
        hostname: 'localhost',
      })
    ).toBe(false);
  });
});
