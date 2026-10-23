import {
  getEnvironmentTenantId,
  isGuid,
  resolveEffectiveTenantId,
  requireTenantId,
} from '@edge/api';
import { Application } from '../../auth/MyApplications/data/applicationsData';

export {
  getEnvironmentTenantId,
  isGuid,
  resolveEffectiveTenantId,
  requireTenantId,
};

export interface TenantBearingEntity {
  tenantId?: string;
  region?: string;
}

/**
 * Resolves the authentic tenant ID for an Application object or filing state.
 * Priority:
 * 1. app.tenantId (if valid GUID)
 * 2. app.region (if valid GUID)
 * 3. Environment variable (EXPO_PUBLIC_DEFAULT_TENANT_ID / NEXT_PUBLIC_DEFAULT_TENANT_ID)
 *
 * Returns null if no valid regional tenant context exists, preventing silent cross-tenant data corruption.
 */
export function resolveApplicationTenantId(app?: TenantBearingEntity | Application | null): string | null {
  return resolveEffectiveTenantId(app?.tenantId, app?.region);
}
