import useSWR from "swr";
import { apiClient } from "../apiClient";

export interface PublicSystemConfigItemDto {
  id: string;
  category: string;
  key: string;
  value: string;
  description?: string;
  dataType?: string;
  isPublic?: boolean;
  lastModifiedAt?: string;
}

export interface PaginatedSystemConfigResponse {
  succeeded: boolean;
  message?: string;
  data: PublicSystemConfigItemDto[];
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
}

export interface PublicSystemConfigValues {
  systemName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  clientMaintenanceMode: boolean;
  internalMaintenanceMode: boolean;
  maxUploadSizeMb: number;
  allowedFileTypes: string;
  allowedFileExtensions: string[];
  sessionTimeoutMins: number;
  maxFailedLogins: number;
  renewalDaysBeforeExpirationRaw: string;
  renewalDaysMilestones: number[];
  renewalMaxDaysBeforeExpiration: number;
  renewalDefaultValidityYears: number;
  clientPortalBaseUrl: string;
  internalPortalBaseUrl: string;
}

export interface UsePublicSystemConfigOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateIfStale?: boolean;
}

export interface UsePublicSystemConfigReturn {
  config: PublicSystemConfigValues;
  rawConfigs: PublicSystemConfigItemDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<PaginatedSystemConfigResponse | undefined>;
}

const DEFAULT_PUBLIC_SYSTEM_CONFIG: PublicSystemConfigValues = {
  systemName: "NTC EDGE Portal",
  supportEmail: "support@ntc.gov.ph",
  maintenanceMode: false,
  clientMaintenanceMode: false,
  internalMaintenanceMode: false,
  maxUploadSizeMb: 25,
  allowedFileTypes: ".pdf,.jpg,.jpeg,.png,.zip",
  allowedFileExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".zip"],
  sessionTimeoutMins: 30,
  maxFailedLogins: 5,
  renewalDaysBeforeExpirationRaw: "60,30,15,1,0",
  renewalDaysMilestones: [60, 30, 15, 1, 0],
  renewalMaxDaysBeforeExpiration: 60,
  renewalDefaultValidityYears: 1,
  clientPortalBaseUrl: "http://localhost:8081",
  internalPortalBaseUrl: "http://localhost:8082",
};

export function parsePublicSystemConfig(
  items: PublicSystemConfigItemDto[] | undefined
): PublicSystemConfigValues {
  if (!Array.isArray(items) || items.length === 0) {
    return DEFAULT_PUBLIC_SYSTEM_CONFIG;
  }

  const map = new Map<string, string>();
  for (const item of items) {
    if (typeof item.key === "string" && typeof item.value === "string") {
      map.set(item.key, item.value.trim());
    }
  }

  const systemNameRaw = map.get("SYSTEM_NAME");
  const systemName =
    systemNameRaw !== undefined && systemNameRaw.length > 0
      ? systemNameRaw
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.systemName;

  const supportEmailRaw = map.get("SUPPORT_EMAIL");
  const supportEmail =
    supportEmailRaw !== undefined && supportEmailRaw.length > 0
      ? supportEmailRaw
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.supportEmail;

  const maintenanceRaw = map.get("MAINTENANCE_MODE");
  const maintenanceMode =
    maintenanceRaw !== undefined &&
    maintenanceRaw.toLowerCase() === "true";

  const clientMaintenanceRaw = map.get("CLIENT_MAINTENANCE_MODE");
  const clientSpecificMaintenance =
    clientMaintenanceRaw !== undefined &&
    clientMaintenanceRaw.toLowerCase() === "true";

  const internalMaintenanceRaw = map.get("INTERNAL_MAINTENANCE_MODE");
  const internalSpecificMaintenance =
    internalMaintenanceRaw !== undefined &&
    internalMaintenanceRaw.toLowerCase() === "true";

  const clientMaintenanceMode = maintenanceMode || clientSpecificMaintenance;
  const internalMaintenanceMode = maintenanceMode || internalSpecificMaintenance;

  const maxUploadRaw = map.get("MAX_UPLOAD_SIZE_MB");
  const parsedMaxUpload =
    maxUploadRaw !== undefined ? Number.parseInt(maxUploadRaw, 10) : Number.NaN;
  const maxUploadSizeMb =
    !Number.isNaN(parsedMaxUpload) && parsedMaxUpload > 0
      ? parsedMaxUpload
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.maxUploadSizeMb;

  const allowedTypesRaw = map.get("ALLOWED_FILE_TYPES");
  const allowedFileTypes =
    allowedTypesRaw !== undefined && allowedTypesRaw.length > 0
      ? allowedTypesRaw
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.allowedFileTypes;

  const allowedFileExtensions = allowedFileTypes
    .split(/[,;]/)
    .map((ext) => ext.trim().toLowerCase())
    .filter((ext) => ext.length > 0)
    .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

  const sessionTimeoutRaw = map.get("SESSION_TIMEOUT_MINS");
  const parsedSessionTimeout =
    sessionTimeoutRaw !== undefined
      ? Number.parseInt(sessionTimeoutRaw, 10)
      : Number.NaN;
  const sessionTimeoutMins =
    !Number.isNaN(parsedSessionTimeout) && parsedSessionTimeout > 0
      ? parsedSessionTimeout
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.sessionTimeoutMins;

  const maxFailedLoginsRaw = map.get("MAX_FAILED_LOGINS");
  const parsedMaxFailedLogins =
    maxFailedLoginsRaw !== undefined
      ? Number.parseInt(maxFailedLoginsRaw, 10)
      : Number.NaN;
  const maxFailedLogins =
    !Number.isNaN(parsedMaxFailedLogins) && parsedMaxFailedLogins > 0
      ? parsedMaxFailedLogins
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.maxFailedLogins;

  const renewalDaysRaw = map.get("Renewal:DaysBeforeExpiration");
  const renewalDaysBeforeExpirationRaw =
    renewalDaysRaw !== undefined && renewalDaysRaw.length > 0
      ? renewalDaysRaw
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.renewalDaysBeforeExpirationRaw;

  const parsedMilestones = renewalDaysBeforeExpirationRaw
    .split(/[,;]/)
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n >= 0)
    .sort((a, b) => b - a);

  const renewalDaysMilestones =
    parsedMilestones.length > 0
      ? parsedMilestones
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.renewalDaysMilestones;

  const renewalMaxDaysBeforeExpiration =
    renewalDaysMilestones.length > 0
      ? renewalDaysMilestones[0]
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.renewalMaxDaysBeforeExpiration;

  const validityYearsRaw = map.get("Renewal:DefaultValidityYears");
  const parsedValidityYears =
    validityYearsRaw !== undefined
      ? Number.parseInt(validityYearsRaw, 10)
      : Number.NaN;
  const renewalDefaultValidityYears =
    !Number.isNaN(parsedValidityYears) && parsedValidityYears > 0
      ? parsedValidityYears
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.renewalDefaultValidityYears;

  const clientPortalUrlRaw = map.get("CLIENT_PORTAL_BASE_URL");
  const clientPortalBaseUrl =
    clientPortalUrlRaw !== undefined && clientPortalUrlRaw.length > 0
      ? clientPortalUrlRaw
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.clientPortalBaseUrl;

  const internalPortalUrlRaw = map.get("INTERNAL_PORTAL_BASE_URL");
  const internalPortalBaseUrl =
    internalPortalUrlRaw !== undefined && internalPortalUrlRaw.length > 0
      ? internalPortalUrlRaw
      : DEFAULT_PUBLIC_SYSTEM_CONFIG.internalPortalBaseUrl;

  return {
    systemName,
    supportEmail,
    maintenanceMode,
    clientMaintenanceMode,
    internalMaintenanceMode,
    maxUploadSizeMb,
    allowedFileTypes,
    allowedFileExtensions:
      allowedFileExtensions.length > 0
        ? allowedFileExtensions
        : DEFAULT_PUBLIC_SYSTEM_CONFIG.allowedFileExtensions,
    sessionTimeoutMins,
    maxFailedLogins,
    renewalDaysBeforeExpirationRaw,
    renewalDaysMilestones,
    renewalMaxDaysBeforeExpiration,
    renewalDefaultValidityYears,
    clientPortalBaseUrl,
    internalPortalBaseUrl,
  };
}

export function usePublicSystemConfig(
  options?: UsePublicSystemConfigOptions
): UsePublicSystemConfigReturn {
  const endpoint = "/api/v2/system-config/public?pageSize=100";

  const { data, error, isLoading, mutate } = useSWR<PaginatedSystemConfigResponse>(
    endpoint,
    async (url: string) => {
      const res = await apiClient.get<PaginatedSystemConfigResponse>(url);
      return res.data;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? true,
      revalidateIfStale: options?.revalidateIfStale ?? true,
      refreshInterval: options?.refreshInterval ?? 60000,
    }
  );

  const rawConfigs = Array.isArray(data?.data) ? data.data : [];
  const config = parsePublicSystemConfig(rawConfigs);

  return {
    config,
    rawConfigs,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
