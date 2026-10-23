import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  isGuid,
  getEnvironmentTenantId,
  resolveEffectiveTenantId,
  requireTenantId,
} from "./tenantUtils";

describe("tenantUtils - Multi-Tenant Resolution & Safety Net", () => {
  const originalEnv = process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID;

  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID;
    delete process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID;
    delete process.env.EXPO_PUBLIC_TENANT_ID;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID = originalEnv;
    } else {
      delete process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID;
    }
  });

  describe("isGuid", () => {
    it("returns true for valid GUID formats", () => {
      expect(isGuid("aa0cd342-7265-4d9e-9242-948fc7e3d0a8")).toBe(true);
      expect(isGuid("00000000-0000-0000-0000-000000000001")).toBe(true);
      expect(isGuid("12345678-1234-1234-1234-123456789abc")).toBe(true);
    });

    it("returns false for invalid GUID strings or non-strings", () => {
      expect(isGuid("")).toBe(false);
      expect(isGuid("invalid-id")).toBe(false);
      expect(isGuid("12345")).toBe(false);
      expect(isGuid(null)).toBe(false);
      expect(isGuid(undefined)).toBe(false);
      expect(isGuid(12345)).toBe(false);
      expect(isGuid({})).toBe(false);
    });
  });

  describe("resolveEffectiveTenantId - NO hardcoded fallback", () => {
    it("returns candidate when candidate is a valid GUID", () => {
      const candidate = "bb2de653-8376-4e0f-9353-059fd8e4e1b9";
      expect(resolveEffectiveTenantId(candidate)).toBe(candidate);
    });

    it("returns fallbackCandidate when candidate is invalid or null", () => {
      const fallback = "cc3ef764-9487-5f1a-a464-160ae9f5f2ca";
      expect(resolveEffectiveTenantId(null, fallback)).toBe(fallback);
      expect(resolveEffectiveTenantId(undefined, fallback)).toBe(fallback);
      expect(resolveEffectiveTenantId("not-a-guid", fallback)).toBe(fallback);
    });

    it("returns null when no candidate and no environment variable is provided (no phantom hardcoded GUID)", () => {
      expect(resolveEffectiveTenantId(null, null)).toBeNull();
      expect(resolveEffectiveTenantId(undefined, undefined)).toBeNull();
      expect(resolveEffectiveTenantId("", "")).toBeNull();
    });

    it("returns environment variable when explicitly set in deployment environment", () => {
      const envTenant = "dd4fa875-0598-6a2b-b575-271bf0a6a3db";
      process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID = envTenant;

      expect(resolveEffectiveTenantId(null, null)).toBe(envTenant);
    });
  });

  describe("requireTenantId", () => {
    it("returns the resolved tenant ID when present", () => {
      const valid = "ee5ab986-1609-7b3c-c686-382ca1b7b4ec";
      expect(requireTenantId(valid)).toBe(valid);
    });

    it("throws a descriptive error when no tenant context is provided", () => {
      expect(() => requireTenantId(null, null, "Custom missing error")).toThrow("Custom missing error");
      expect(() => requireTenantId(undefined)).toThrow("Tenant ID is strictly required");
    });
  });
});
