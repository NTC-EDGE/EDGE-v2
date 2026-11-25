"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { safeAsync } from "@edge/api";
import { useSystemConfigService, SystemConfig } from "@/services/systemConfigService";
import {
  Sliders,
  Shield,
  Mail,
  UploadCloud,
  Power,
  Save,
  CheckCircle,
  Globe,
  Settings,
  Search,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Lock,
  Unlock,
  Check,
  X,
  Sparkles,
  Server,
  Clock,
  FileCheck,
} from "lucide-react";
import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

const CATEGORY_KEYS: Record<string, string[]> = {
  General: ["SYSTEM_NAME", "SUPPORT_EMAIL"],
  Renewal: ["Renewal:DaysBeforeExpiration", "Renewal:DefaultValidityYears"],
  Security: ["SESSION_TIMEOUT_MINS", "MAX_FAILED_LOGINS"],
  Email: [
    "EMAIL_ENABLED",
    "SMTP_SERVER",
    "SMTP_PORT",
    "SMTP_USE_SSL",
    "SMTP_USERNAME",
    "SMTP_PASSWORD",
    "SMTP_FROM_EMAIL",
    "SMTP_FROM_NAME",
    "CLIENT_PORTAL_BASE_URL",
    "INTERNAL_PORTAL_BASE_URL",
  ],
  Upload: ["MAX_UPLOAD_SIZE_MB", "ALLOWED_FILE_TYPES"],
  Maintenance: ["MAINTENANCE_MODE", "CLIENT_MAINTENANCE_MODE", "INTERNAL_MAINTENANCE_MODE"],
};

const KEY_TO_CATEGORY: Record<string, string> = Object.entries(CATEGORY_KEYS).reduce<Record<string, string>>(
  (acc, [category, keys]) => {
    for (const k of keys) {
      acc[k] = category;
    }
    return acc;
  },
  {}
);

const DEFAULT_CONFIG_VALUES: Record<string, string> = {
  SYSTEM_NAME: "NTC EDGE Portal",
  SUPPORT_EMAIL: "support@ntc.gov.ph",
  MAINTENANCE_MODE: "false",
  CLIENT_MAINTENANCE_MODE: "false",
  INTERNAL_MAINTENANCE_MODE: "false",
  MAX_UPLOAD_SIZE_MB: "25",
  ALLOWED_FILE_TYPES: ".pdf,.jpg,.jpeg,.png,.zip",
  EMAIL_ENABLED: "true",
  SMTP_SERVER: "smtp.ntc.gov.ph",
  SMTP_PORT: "587",
  SMTP_USE_SSL: "true",
  SMTP_USERNAME: "",
  SMTP_PASSWORD: "",
  SMTP_FROM_EMAIL: "no-reply@ntc.gov.ph",
  SMTP_FROM_NAME: "NTC EDGE Portal",
  CLIENT_PORTAL_BASE_URL: "http://localhost:8081",
  INTERNAL_PORTAL_BASE_URL: "http://localhost:8082",
  SESSION_TIMEOUT_MINS: "30",
  MAX_FAILED_LOGINS: "5",
  "Renewal:DaysBeforeExpiration": "60,30,15,1,0",
  "Renewal:DefaultValidityYears": "1",
};

const CONFIG_LABELS: Record<string, string> = {
  SYSTEM_NAME: "System Title / Portal Name",
  SUPPORT_EMAIL: "Support Helpdesk Email",
  "Renewal:DaysBeforeExpiration": "Renewal Reminder Milestones (Days)",
  "Renewal:DefaultValidityYears": "Default Renewal Validity (Years)",
  SESSION_TIMEOUT_MINS: "Idle Session Timeout (Minutes)",
  MAX_FAILED_LOGINS: "Max Failed Login Lockout Threshold",
  EMAIL_ENABLED: "Outbound Email Delivery",
  SMTP_SERVER: "SMTP Server Host",
  SMTP_PORT: "SMTP Server Port",
  SMTP_USE_SSL: "SMTP SSL / STARTTLS Encryption",
  SMTP_USERNAME: "SMTP Username",
  SMTP_PASSWORD: "SMTP Password",
  SMTP_FROM_EMAIL: "Sender From Email Address",
  SMTP_FROM_NAME: "Sender Display Name",
  CLIENT_PORTAL_BASE_URL: "Client Portal Base URL",
  INTERNAL_PORTAL_BASE_URL: "Internal Officer Portal Base URL",
  MAX_UPLOAD_SIZE_MB: "Maximum Upload File Size (MB)",
  ALLOWED_FILE_TYPES: "Allowed Attachment Extensions",
  MAINTENANCE_MODE: "Global Maintenance Mode (All Portals)",
  CLIENT_MAINTENANCE_MODE: "Client Portal Maintenance Mode",
  INTERNAL_MAINTENANCE_MODE: "Internal Officer Portal Maintenance Mode",
};

const CONFIG_DESCRIPTIONS: Record<string, string> = {
  SYSTEM_NAME: "The global title displayed across headers, browser tabs, and system emails.",
  SUPPORT_EMAIL: "Primary helpdesk email address shown to external applicants for inquiries.",
  "Renewal:DaysBeforeExpiration": "Comma-separated days before expiration to notify clients for renewal and enable renewal button.",
  "Renewal:DefaultValidityYears": "Default statutory validity duration in years added to original expiration date upon renewal.",
  SESSION_TIMEOUT_MINS: "Automatically logs out inactive users after the specified duration in minutes.",
  MAX_FAILED_LOGINS: "Number of consecutive failed sign-in attempts before temporary account lockout.",
  EMAIL_ENABLED: "Master switch to enable or disable outbound SMTP email delivery across the portal.",
  SMTP_SERVER: "Outbound SMTP server hostname (e.g. smtp.ntc.gov.ph or smtp.gmail.com).",
  SMTP_PORT: "Outbound SMTP server port (typically 587 for STARTTLS or 465 for SSL).",
  SMTP_USE_SSL: "Enable SSL/TLS encryption for SMTP connections.",
  SMTP_USERNAME: "SMTP authentication username or account email address.",
  SMTP_PASSWORD: "SMTP authentication password or App Password.",
  SMTP_FROM_EMAIL: "Default sender From email address for automated notifications.",
  SMTP_FROM_NAME: "Default sender display name for automated notifications.",
  CLIENT_PORTAL_BASE_URL: "Base URL of the Client Portal used in email notification links.",
  INTERNAL_PORTAL_BASE_URL: "Base URL of the Internal Officer Portal used in internal queue assignment email links.",
  MAX_UPLOAD_SIZE_MB: "Maximum file size in megabytes allowed per document attachment upload.",
  ALLOWED_FILE_TYPES: "Comma-separated list of permitted file extensions for applicant requirement uploads.",
  MAINTENANCE_MODE: "Global Master Switch: When active, both the Client Portal and Internal Officer Portal are locked in Maintenance Mode and all user account interactions are disabled.",
  CLIENT_MAINTENANCE_MODE: "Client Portal Only: When active, locks the Client Portal and disables external applicant account interactions while allowing Internal Officers to continue working.",
  INTERNAL_MAINTENANCE_MODE: "Internal Officer Portal Only: When active, locks the Internal Officer Portal and disables staff evaluations, accounting, and cashier actions while keeping the Client Portal open.",
};

interface ConfigSliderSwitchProps {
  enabled: boolean;
  onChange: (nextEnabled: boolean) => void;
  disabled?: boolean;
  /**
   * "feature" = Green when enabled, Orange/Red when disabled (e.g. Email Delivery, SSL).
   * "maintenance" = Orange/Red warning when maintenance lock is enabled, Green when disabled/normal operation.
   */
  variant?: "feature" | "maintenance";
  enabledLabel?: string;
  disabledLabel?: string;
  lockedByGlobal?: boolean;
}

function ConfigSliderSwitch({
  enabled,
  onChange,
  disabled = false,
  variant = "feature",
  enabledLabel = "ENABLED",
  disabledLabel = "DISABLED",
  lockedByGlobal = false,
}: ConfigSliderSwitchProps) {
  const effectiveEnabled = enabled || lockedByGlobal;

  // Color semantics:
  // For "feature": Enabled = Emerald Green, Disabled = Amber/Rose
  // For "maintenance": Enabled (Locked) = Rose/Amber Alert, Disabled (Operational) = Emerald Green
  const isGreenState = variant === "feature" ? effectiveEnabled : !effectiveEnabled;

  const badgeClasses = isGreenState
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    : variant === "maintenance"
    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";

  const dotClasses = isGreenState
    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.75)]"
    : variant === "maintenance"
    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.75)] animate-pulse"
    : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.75)]";

  const sliderTrackClasses = effectiveEnabled
    ? variant === "maintenance"
      ? "bg-gradient-to-r from-amber-500 to-rose-600 border-rose-500/50 shadow-md shadow-rose-500/20"
      : "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-500/50 shadow-md shadow-emerald-500/20"
    : variant === "maintenance"
    ? "bg-emerald-600/20 dark:bg-emerald-500/20 border-emerald-500/40"
    : "bg-amber-500/20 dark:bg-rose-500/20 border-amber-500/40 dark:border-rose-500/40";

  const statusText = lockedByGlobal
    ? "LOCKED BY GLOBAL"
    : effectiveEnabled
    ? enabledLabel
    : disabledLabel;

  return (
    <div className="flex items-center gap-3 shrink-0">
      {/* Live Color Status Pill (Green vs Orange/Red) */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${badgeClasses}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${dotClasses}`} />
        <span>{statusText}</span>
      </div>

      {/* Animated Slider Toggle Control */}
      <button
        type="button"
        role="switch"
        aria-checked={effectiveEnabled}
        disabled={disabled || lockedByGlobal}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed ${sliderTrackClasses}`}
        title={effectiveEnabled ? "Click to Disable" : "Click to Enable"}
      >
        <span
          className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
            effectiveEnabled ? "translate-x-8" : "translate-x-0"
          }`}
        >
          {effectiveEnabled ? (
            <Check
              className={`h-3.5 w-3.5 stroke-[3] ${
                variant === "maintenance" ? "text-rose-600" : "text-emerald-600"
              }`}
            />
          ) : (
            <X
              className={`h-3.5 w-3.5 stroke-[3] ${
                variant === "maintenance" ? "text-emerald-600" : "text-amber-600"
              }`}
            />
          )}
        </span>
      </button>
    </div>
  );
}

type PendingNavigationTarget =
  | { type: "tab"; tabId: string }
  | { type: "route"; href: string }
  | null;

export default function SystemConfigPage() {
  const router = useRouter();
  const { useSystemConfigs, updateSystemConfig } = useSystemConfigService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeTab, setActiveTab] = useState<string>("General");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Baseline saved state vs currently edited state
  const [savedConfigsState, setSavedConfigsState] = useState<Record<string, string>>(DEFAULT_CONFIG_VALUES);
  const [configsState, setConfigsState] = useState<Record<string, string>>(DEFAULT_CONFIG_VALUES);
  const [hasInitializedFromApi, setHasInitializedFromApi] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  // Unsaved changes navigation guard modal state
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigationTarget>(null);

  // Fetch all system configuration records at once so dirty tracking works across all tabs
  const { data: responseData, mutate, error } = useSystemConfigs(1, 100);

  const configs: SystemConfig[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray(responseData.data)) return responseData.data;
    return [];
  }, [responseData]);

  useEffect(() => {
    if (configs.length > 0) {
      const stateMap: Record<string, string> = {};
      for (const c of configs) {
        stateMap[c.key] = c.value;
      }
      const merged: Record<string, string> = {
        ...DEFAULT_CONFIG_VALUES,
        ...stateMap,
      };
      setSavedConfigsState(merged);
      if (!hasInitializedFromApi) {
        setConfigsState(merged);
        setHasInitializedFromApi(true);
      }
    }
  }, [configs, hasInitializedFromApi]);

  // Compute all modified keys compared to savedConfigsState
  const dirtyKeys = useMemo(() => {
    const allKeys = Object.keys(DEFAULT_CONFIG_VALUES);
    return allKeys.filter(
      (key) => (configsState[key] ?? DEFAULT_CONFIG_VALUES[key] ?? "") !== (savedConfigsState[key] ?? DEFAULT_CONFIG_VALUES[key] ?? "")
    );
  }, [configsState, savedConfigsState]);

  const hasUnsavedChanges = dirtyKeys.length > 0;

  const dirtyCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      General: 0,
      Renewal: 0,
      Security: 0,
      Email: 0,
      Upload: 0,
      Maintenance: 0,
    };
    for (const key of dirtyKeys) {
      const cat = KEY_TO_CATEGORY[key] ?? "General";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }, [dirtyKeys]);

  const isKeyDirty = useCallback(
    (key: string): boolean => {
      return (configsState[key] ?? DEFAULT_CONFIG_VALUES[key] ?? "") !== (savedConfigsState[key] ?? DEFAULT_CONFIG_VALUES[key] ?? "");
    },
    [configsState, savedConfigsState]
  );

  // Browser tab close / refresh protection when there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercept sidebar / navbar anchor link clicks when there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || href === "/system-config") {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setPendingNavigation({ type: "route", href });
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [hasUnsavedChanges]);

  const handleChange = (key: string, val: string) => {
    setConfigsState((prev) => ({ ...prev, [key]: val }));
  };

  const handleDiscardAllChanges = () => {
    setConfigsState({ ...savedConfigsState });
    setToast({
      message: "Unsaved configuration edits have been discarded.",
      type: "info",
    });
  };

  const handleTabSelect = (targetTabId: string) => {
    if (targetTabId === activeTab) return;
    const currentTabDirtyCount = dirtyCountByCategory[activeTab] ?? 0;
    if (currentTabDirtyCount > 0) {
      setPendingNavigation({ type: "tab", tabId: targetTabId });
      return;
    }
    setActiveTab(targetTabId);
  };

  // Search filter auto-switches tab if searching for a specific key in another category
  const matchingCategoriesForSearch = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return null;
    const matched = new Set<string>();
    for (const [cat, keys] of Object.entries(CATEGORY_KEYS)) {
      for (const k of keys) {
        const label = (CONFIG_LABELS[k] ?? k).toLowerCase();
        const desc = (CONFIG_DESCRIPTIONS[k] ?? "").toLowerCase();
        if (k.toLowerCase().includes(q) || label.includes(q) || desc.includes(q)) {
          matched.add(cat);
        }
      }
    }
    return matched;
  }, [searchTerm]);

  const executeSaveDirtyConfigs = async (afterSaveNavigation?: PendingNavigationTarget) => {
    const keysToPersist = dirtyKeys.length > 0 ? dirtyKeys : (CATEGORY_KEYS[activeTab] ?? []);
    if (keysToPersist.length === 0) {
      setIsConfirmSaveOpen(false);
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    let hasError = false;
    let lastErrorMsg = "";

    for (const key of keysToPersist) {
      const valueToSave = configsState[key] ?? DEFAULT_CONFIG_VALUES[key];
      const categoryForKey = KEY_TO_CATEGORY[key] ?? activeTab;
      if (valueToSave !== undefined) {
        const existingItem = configs.find((c) => c.key === key);
        const [, err] = await safeAsync(
          updateSystemConfig({
            key,
            value: valueToSave,
            category: categoryForKey,
            description:
              CONFIG_DESCRIPTIONS[key] ??
              existingItem?.description ??
              `Global ${categoryForKey} configuration`,
          })
        );
        if (err) {
          hasError = true;
          lastErrorMsg = getErrorMessage(err, "Failed to update configuration setting.");
        }
      }
    }

    await mutate();
    setIsSaving(false);
    setIsConfirmSaveOpen(false);

    if (hasError) {
      setToast({ message: lastErrorMsg, type: "error" });
      return;
    }

    setSavedConfigsState({ ...configsState });
    setToast({
      message: `Confirmed: ${keysToPersist.length} system configuration setting(s) saved successfully.`,
      type: "success",
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);

    if (afterSaveNavigation) {
      setPendingNavigation(null);
      if (afterSaveNavigation.type === "tab") {
        setActiveTab(afterSaveNavigation.tabId);
      } else if (afterSaveNavigation.type === "route") {
        router.push(afterSaveNavigation.href);
      }
    }
  };

  const handleSkipAndLeave = () => {
    const target = pendingNavigation;
    setConfigsState({ ...savedConfigsState });
    setPendingNavigation(null);
    if (!target) return;
    if (target.type === "tab") {
      setActiveTab(target.tabId);
    } else if (target.type === "route") {
      router.push(target.href);
    }
  };

  const tabs = [
    { id: "General", label: "General Settings", icon: Settings },
    { id: "Renewal", label: "License & Renewal", icon: RefreshCw },
    { id: "Security", label: "Security & Policies", icon: Shield },
    { id: "Email", label: "Email / SMTP", icon: Mail },
    { id: "Upload", label: "File Upload Limits", icon: UploadCloud },
    { id: "Maintenance", label: "Maintenance Mode", icon: Power },
  ];

  const isGlobalMaint = configsState["MAINTENANCE_MODE"] === "true";
  const isClientMaint = isGlobalMaint || configsState["CLIENT_MAINTENANCE_MODE"] === "true";
  const isInternalMaint = isGlobalMaint || configsState["INTERNAL_MAINTENANCE_MODE"] === "true";
  const isEmailEnabled = (configsState["EMAIL_ENABLED"] ?? "true") === "true";
  const isSmtpSslEnabled = (configsState["SMTP_USE_SSL"] ?? "true") === "true";

  // Build human-readable confirmation summary of modified fields
  const confirmationSummaryDescription = useMemo(() => {
    if (dirtyKeys.length === 0) {
      return `Are you sure you want to save the ${activeTab} system configuration settings?`;
    }
    const previewLines = dirtyKeys.slice(0, 5).map((key) => {
      const label = CONFIG_LABELS[key] ?? key;
      const oldVal = key === "SMTP_PASSWORD" ? "••••••" : (savedConfigsState[key] || "(empty)");
      const newVal = key === "SMTP_PASSWORD" ? "••••••" : (configsState[key] || "(empty)");
      return `${label}: "${oldVal}" → "${newVal}"`;
    });
    const moreSuffix = dirtyKeys.length > 5 ? ` (+${dirtyKeys.length - 5} more)` : "";
    return `Please confirm applying ${dirtyKeys.length} configuration change(s): ${previewLines.join(" | ")}${moreSuffix}. These updates will take effect immediately across the NTC EDGE portals.`;
  }, [dirtyKeys, activeTab, savedConfigsState, configsState]);

  const renderModifiedBadge = (key: string) => {
    if (!isKeyDirty(key)) return null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Unsaved Change
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 pb-28 space-y-6 max-w-[1400px] mx-auto transition-colors duration-200">
      {/* ── 1. Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-br from-white via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-6 md:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/25 shrink-0">
            <Sliders className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                System Configuration Center
              </h1>
              {hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  {dirtyKeys.length} Unsaved {dirtyKeys.length === 1 ? "Change" : "Changes"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  All Changes Saved
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage global portal identity, statutory renewal milestones, security lockout thresholds, SMTP delivery, upload rules, and portal maintenance lockouts.
            </p>
          </div>
        </div>

        {/* Save Changes & Discard Buttons — Only visible when changes are made */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          {hasUnsavedChanges ? (
            <>
              <button
                type="button"
                onClick={handleDiscardAllChanges}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Discard</span>
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmSaveOpen(true)}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : `Save Changes (${dirtyKeys.length})`}</span>
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Modify any setting below to enable Save Changes</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Live System Health & Status Strip ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Client Portal Status */}
        <div
          onClick={() => handleTabSelect("Maintenance")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
            isClientMaint
              ? "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
          }`}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Client Applicant Portal
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isClientMaint
                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"
                    : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                }`}
              />
              <p
                className={`text-sm font-bold ${
                  isClientMaint ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isClientMaint ? "Locked (Maintenance)" : "Enabled & Operational"}
              </p>
            </div>
          </div>
          <div
            className={`p-2.5 rounded-xl ${
              isClientMaint
                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isClientMaint ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
          </div>
        </div>

        {/* Card 2: Internal Officer Portal Status */}
        <div
          onClick={() => handleTabSelect("Maintenance")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
            isInternalMaint
              ? "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
          }`}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Internal Officer Portal
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isInternalMaint
                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"
                    : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                }`}
              />
              <p
                className={`text-sm font-bold ${
                  isInternalMaint ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isInternalMaint ? "Locked (Maintenance)" : "Enabled & Operational"}
              </p>
            </div>
          </div>
          <div
            className={`p-2.5 rounded-xl ${
              isInternalMaint
                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isInternalMaint ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
          </div>
        </div>

        {/* Card 3: Outbound Email / SMTP Status */}
        <div
          onClick={() => handleTabSelect("Email")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
            !isEmailEnabled
              ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
          }`}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Outbound Email Gateway
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isEmailEnabled
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                }`}
              />
              <p
                className={`text-sm font-bold ${
                  isEmailEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {isEmailEnabled
                  ? `Enabled (${configsState["SMTP_SERVER"] || "smtp.ntc.gov.ph"})`
                  : "Disabled (Paused)"}
              </p>
            </div>
          </div>
          <div
            className={`p-2.5 rounded-xl ${
              isEmailEnabled
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
            }`}
          >
            <Mail className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Security & Upload Policy Summary */}
        <div
          onClick={() => handleTabSelect("Security")}
          className="cursor-pointer p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all duration-200 flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Session &amp; Upload Limits
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {configsState["SESSION_TIMEOUT_MINS"] || "30"}m Timeout • {configsState["MAX_UPLOAD_SIZE_MB"] || "25"} MB Max
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>System configuration settings have been confirmed and applied across all portals.</span>
        </div>
      )}

      {/* ── 3. Search Bar & Category Navigation Tabs ───────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-0.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            const tabDirtyCount = dirtyCountByCategory[t.id] ?? 0;
            const matchesSearch =
              matchingCategoriesForSearch === null || matchingCategoriesForSearch.has(t.id);

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabSelect(t.id)}
                className={`relative flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap rounded-t-xl ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-white bg-indigo-50/70 dark:bg-slate-900/70"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                } ${!matchesSearch ? "opacity-45" : ""}`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                <span>{t.label}</span>

                {/* Live status dot on Maintenance & Email tabs */}
                {t.id === "Maintenance" && (isClientMaint || isInternalMaint) && (
                  <span
                    className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"
                    title="Maintenance Mode Active"
                  />
                )}
                {t.id === "Email" && (
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isEmailEnabled ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    title={isEmailEnabled ? "Email Enabled" : "Email Disabled"}
                  />
                )}

                {/* Unsaved changes badge per tab */}
                {tabDirtyCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500 text-white shadow-sm">
                    {tabDirtyCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter configuration settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Settings Form Content ───────────────────────────────────────── */}
      {!!error && isForbiddenError(error) && <PageForbiddenState />}
      {!!error && !isForbiddenError(error) && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
          <p className="text-rose-500 font-medium text-base">Failed to load system configuration</p>
          <button
            type="button"
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          {/* ── TAB 1: GENERAL ─────────────────────────────────────────────── */}
          {activeTab === "General" && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> General Portal Identity &amp; Helpdesk
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure the official agency system title and helpdesk contact displayed across headers, footers, maintenance notices, and outbound email templates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isKeyDirty("SYSTEM_NAME")
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                      : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      System Title / Portal Name
                    </label>
                    {renderModifiedBadge("SYSTEM_NAME")}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    {CONFIG_DESCRIPTIONS["SYSTEM_NAME"]}
                  </p>
                  <input
                    type="text"
                    value={configsState["SYSTEM_NAME"] ?? "NTC EDGE Portal"}
                    onChange={(e) => handleChange("SYSTEM_NAME", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isKeyDirty("SUPPORT_EMAIL")
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                      : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Support Email Address
                    </label>
                    {renderModifiedBadge("SUPPORT_EMAIL")}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    {CONFIG_DESCRIPTIONS["SUPPORT_EMAIL"]}
                  </p>
                  <input
                    type="email"
                    value={configsState["SUPPORT_EMAIL"] ?? "support@ntc.gov.ph"}
                    onChange={(e) => handleChange("SUPPORT_EMAIL", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: RENEWAL ─────────────────────────────────────────────── */}
          {activeTab === "Renewal" && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Statutory Renewal &amp; Expiration Reminders
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Control when permits and licenses become eligible for renewal in the Client Portal and when automated expiration reminders are dispatched.
                </p>
              </div>

              <div className="space-y-4">
                <div
                  className={`p-5 rounded-2xl border space-y-3 transition-all ${
                    isKeyDirty("Renewal:DaysBeforeExpiration")
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                      : "bg-indigo-50/40 dark:bg-slate-950 border-indigo-100 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Notification Milestones (Days Before Expiration)
                    </label>
                    {renderModifiedBadge("Renewal:DaysBeforeExpiration")}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comma-separated milestones before expiration when reminder notifications will be triggered and the &quot;Renew Application&quot; button becomes active for clients.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 pb-1">
                    {(configsState["Renewal:DaysBeforeExpiration"] ?? "60,30,15,1,0")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25"
                        >
                          <Clock className="h-3 w-3" />
                          {d === "0" ? "On Day of Expiry" : `${d} Days Prior`}
                        </span>
                      ))}
                  </div>
                  <input
                    type="text"
                    value={configsState["Renewal:DaysBeforeExpiration"] ?? "60,30,15,1,0"}
                    onChange={(e) => handleChange("Renewal:DaysBeforeExpiration", e.target.value)}
                    placeholder="e.g. 60,30,15,1,0"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div
                  className={`p-5 rounded-2xl border space-y-3 transition-all ${
                    isKeyDirty("Renewal:DefaultValidityYears")
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                      : "bg-indigo-50/40 dark:bg-slate-950 border-indigo-100 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Default Renewal Validity Duration (Years)
                    </label>
                    {renderModifiedBadge("Renewal:DefaultValidityYears")}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Default number of years added to the previous expiration date upon renewal issuance when an explicit expiry date is not overridden.
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={configsState["Renewal:DefaultValidityYears"] ?? "1"}
                    onChange={(e) => handleChange("Renewal:DefaultValidityYears", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: SECURITY ────────────────────────────────────────────── */}
          {activeTab === "Security" && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Security &amp; Account Lockout Policies
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enforce automatic idle session sign-out and brute-force login lockout thresholds across Client and Internal Officer sessions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isKeyDirty("SESSION_TIMEOUT_MINS")
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                      : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Idle Session Timeout (Minutes)
                    </label>
                    {renderModifiedBadge("SESSION_TIMEOUT_MINS")}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    {CONFIG_DESCRIPTIONS["SESSION_TIMEOUT_MINS"]}
                  </p>
                  <input
                    type="number"
                    min="1"
                    value={configsState["SESSION_TIMEOUT_MINS"] ?? "30"}
                    onChange={(e) => handleChange("SESSION_TIMEOUT_MINS", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isKeyDirty("MAX_FAILED_LOGINS")
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                      : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Max Failed Login Lockout Threshold
                    </label>
                    {renderModifiedBadge("MAX_FAILED_LOGINS")}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    {CONFIG_DESCRIPTIONS["MAX_FAILED_LOGINS"]}
                  </p>
                  <input
                    type="number"
                    min="1"
                    value={configsState["MAX_FAILED_LOGINS"] ?? "5"}
                    onChange={(e) => handleChange("MAX_FAILED_LOGINS", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: EMAIL / SMTP ────────────────────────────────────────── */}
          {activeTab === "Email" && (
            <div className="space-y-6 max-w-4xl">
              {/* Master Email Delivery Slider Card */}
              <div
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isKeyDirty("EMAIL_ENABLED")
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                    : isEmailEnabled
                    ? "bg-emerald-500/5 border-emerald-500/25"
                    : "bg-amber-500/10 border-amber-500/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Mail
                      className={`h-5 w-5 ${
                        isEmailEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Outbound Email Notification Delivery
                    </h2>
                    {renderModifiedBadge("EMAIL_ENABLED")}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Master switch controlling whether automated SMTP emails are dispatched to clients and internal regional officers.
                  </p>
                </div>

                <ConfigSliderSwitch
                  enabled={isEmailEnabled}
                  variant="feature"
                  enabledLabel="ENABLED"
                  disabledLabel="DISABLED"
                  onChange={(next) => handleChange("EMAIL_ENABLED", next ? "true" : "false")}
                />
              </div>

              {/* SMTP Connection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: "SMTP_SERVER",
                    label: "SMTP Server Host",
                    placeholder: "e.g. smtp.ntc.gov.ph or smtp.gmail.com",
                    type: "text",
                  },
                  {
                    key: "SMTP_PORT",
                    label: "SMTP Port",
                    placeholder: "587",
                    type: "text",
                  },
                  {
                    key: "SMTP_USERNAME",
                    label: "SMTP Username / Account Email",
                    placeholder: "e.g. notifications@ntc.gov.ph",
                    type: "text",
                  },
                  {
                    key: "SMTP_PASSWORD",
                    label: "SMTP Password / App Password",
                    placeholder: "Enter SMTP password or app password",
                    type: "password",
                  },
                  {
                    key: "SMTP_FROM_EMAIL",
                    label: "Sender From Email Address",
                    placeholder: "no-reply@ntc.gov.ph",
                    type: "email",
                  },
                  {
                    key: "SMTP_FROM_NAME",
                    label: "Sender Display Name",
                    placeholder: "NTC EDGE Portal",
                    type: "text",
                  },
                  {
                    key: "CLIENT_PORTAL_BASE_URL",
                    label: "Client Portal Base URL (Email Action Links)",
                    placeholder: "https://client.edge.ntc.gov.ph",
                    type: "text",
                  },
                  {
                    key: "INTERNAL_PORTAL_BASE_URL",
                    label: "Internal Officer Portal Base URL",
                    placeholder: "https://internal.edge.ntc.gov.ph",
                    type: "text",
                  },
                ].map((field) => (
                  <div
                    key={field.key}
                    className={`p-4 rounded-xl border transition-all ${
                      isKeyDirty(field.key)
                        ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                        : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        {field.label}
                      </label>
                      {renderModifiedBadge(field.key)}
                    </div>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={configsState[field.key] ?? DEFAULT_CONFIG_VALUES[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* SSL / STARTTLS Slider Switch Card */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                  isKeyDirty("SMTP_USE_SSL")
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Use SSL / STARTTLS Transport Encryption
                    </p>
                    {renderModifiedBadge("SMTP_USE_SSL")}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Encrypts outbound SMTP traffic using TLS (Recommended for port 587 STARTTLS and port 465 SSL).
                  </p>
                </div>

                <ConfigSliderSwitch
                  enabled={isSmtpSslEnabled}
                  variant="feature"
                  enabledLabel="ENABLED"
                  disabledLabel="DISABLED"
                  onChange={(next) => handleChange("SMTP_USE_SSL", next ? "true" : "false")}
                />
              </div>
            </div>
          )}

          {/* ── TAB 5: UPLOAD ──────────────────────────────────────────────── */}
          {activeTab === "Upload" && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> File Storage &amp; Attachment Constraints
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enforce server-side and client-side file size limits and permitted extensions for all document uploads.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isKeyDirty("MAX_UPLOAD_SIZE_MB")
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                      : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Maximum Upload File Size (MB)
                    </label>
                    {renderModifiedBadge("MAX_UPLOAD_SIZE_MB")}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    {CONFIG_DESCRIPTIONS["MAX_UPLOAD_SIZE_MB"]}
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={configsState["MAX_UPLOAD_SIZE_MB"] ?? "25"}
                    onChange={(e) => handleChange("MAX_UPLOAD_SIZE_MB", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isKeyDirty("ALLOWED_FILE_TYPES")
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60"
                      : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Allowed Attachment Extensions
                    </label>
                    {renderModifiedBadge("ALLOWED_FILE_TYPES")}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    {CONFIG_DESCRIPTIONS["ALLOWED_FILE_TYPES"]}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(configsState["ALLOWED_FILE_TYPES"] ?? ".pdf,.jpg,.jpeg,.png,.zip")
                      .split(",")
                      .map((ext) => ext.trim())
                      .filter(Boolean)
                      .map((ext) => (
                        <span
                          key={ext}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                        >
                          <FileCheck className="h-3 w-3" />
                          {ext}
                        </span>
                      ))}
                  </div>
                  <input
                    type="text"
                    value={configsState["ALLOWED_FILE_TYPES"] ?? ".pdf,.jpg,.jpeg,.png,.zip"}
                    onChange={(e) => handleChange("ALLOWED_FILE_TYPES", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 6: MAINTENANCE MODE ────────────────────────────────────── */}
          {activeTab === "Maintenance" && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Power className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Portal Maintenance Mode &amp; Account Lockout Controls
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Use the sliders below to enable or disable Maintenance Mode globally or separately for the Client Portal and Internal Officer Portal. Green indicates the portal is open and operational; Red/Orange indicates Maintenance Mode is enabled and user account interactions are locked.
                </p>
              </div>

              {/* 1. Global Master Maintenance Switch */}
              <div
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isKeyDirty("MAINTENANCE_MODE")
                    ? "bg-amber-50/50 dark:bg-amber-950/25 border-amber-400/70"
                    : isGlobalMaint
                    ? "bg-rose-500/10 border-rose-500/35"
                    : "bg-emerald-500/5 border-emerald-500/25"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Global Maintenance Mode (Client &amp; Internal Portals)
                    </p>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Master Switch
                    </span>
                    {renderModifiedBadge("MAINTENANCE_MODE")}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    When enabled, locks <strong>both</strong> the Client Portal and Internal Officer Portal simultaneously and blocks all user account interactions.
                  </p>
                </div>

                <ConfigSliderSwitch
                  enabled={isGlobalMaint}
                  variant="maintenance"
                  enabledLabel="ENABLED (ALL LOCKED)"
                  disabledLabel="DISABLED (OPEN)"
                  onChange={(next) => handleChange("MAINTENANCE_MODE", next ? "true" : "false")}
                />
              </div>

              {/* 2. Client Portal Only Maintenance Switch */}
              <div
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isKeyDirty("CLIENT_MAINTENANCE_MODE")
                    ? "bg-amber-50/50 dark:bg-amber-950/25 border-amber-400/70"
                    : isClientMaint
                    ? "bg-rose-500/10 border-rose-500/35"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Client Portal Maintenance Mode
                    </p>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25">
                      Applicants Only
                    </span>
                    {renderModifiedBadge("CLIENT_MAINTENANCE_MODE")}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    When enabled, locks <strong>only the Client Portal</strong> (disabling applicant account interactions, new filings, and payments) while allowing Internal Officers to continue working.
                  </p>
                </div>

                <ConfigSliderSwitch
                  enabled={configsState["CLIENT_MAINTENANCE_MODE"] === "true"}
                  lockedByGlobal={isGlobalMaint}
                  variant="maintenance"
                  enabledLabel="ENABLED (CLIENT LOCKED)"
                  disabledLabel="DISABLED (CLIENT OPEN)"
                  onChange={(next) => handleChange("CLIENT_MAINTENANCE_MODE", next ? "true" : "false")}
                />
              </div>

              {/* 3. Internal Officer Portal Only Maintenance Switch */}
              <div
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isKeyDirty("INTERNAL_MAINTENANCE_MODE")
                    ? "bg-amber-50/50 dark:bg-amber-950/25 border-amber-400/70"
                    : isInternalMaint
                    ? "bg-rose-500/10 border-rose-500/35"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Internal Officer Portal Maintenance Mode
                    </p>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                      Internal Staff Only
                    </span>
                    {renderModifiedBadge("INTERNAL_MAINTENANCE_MODE")}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    When enabled, locks <strong>only the Internal Officer Portal</strong> (disabling staff evaluations, SOA/OP approvals, cashiering, and issuance) while keeping the Client Portal open.
                  </p>
                </div>

                <ConfigSliderSwitch
                  enabled={configsState["INTERNAL_MAINTENANCE_MODE"] === "true"}
                  lockedByGlobal={isGlobalMaint}
                  variant="maintenance"
                  enabledLabel="ENABLED (INTERNAL LOCKED)"
                  disabledLabel="DISABLED (INTERNAL OPEN)"
                  onChange={(next) => handleChange("INTERNAL_MAINTENANCE_MODE", next ? "true" : "false")}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. Sticky Bottom Unsaved Changes Bar (Only visible when changes exist) ─ */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-amber-500/40 rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                You have {dirtyKeys.length} unsaved configuration {dirtyKeys.length === 1 ? "change" : "changes"}
              </p>
              <p className="text-xs text-slate-300">
                Review and save your changes to apply them across the NTC EDGE portals, or discard to revert.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleDiscardAllChanges}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmSaveOpen(true)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 6. Save Confirmation Modal ─────────────────────────────────────── */}
      <ConfirmActionDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => !isSaving && setIsConfirmSaveOpen(false)}
        onConfirm={() => executeSaveDirtyConfigs()}
        title="Confirm System Configuration Changes"
        description={confirmationSummaryDescription}
        confirmLabel="Confirm & Save Changes"
        cancelLabel="Cancel"
        loading={isSaving}
      />

      {/* ── 7. Unsaved Changes Navigation Guard Modal (Save vs Skip/Discard) ─ */}
      {pendingNavigation !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isSaving && setPendingNavigation(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Unsaved Configuration Changes
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    You have <strong>{dirtyKeys.length}</strong> unsaved configuration{" "}
                    {dirtyKeys.length === 1 ? "change" : "changes"}. Would you like to save your changes before leaving, or skip and discard them?
                  </p>

                  {/* List of modified settings */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto space-y-1.5">
                    {dirtyKeys.map((k) => (
                      <div key={k} className="flex items-center justify-between text-xs gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {CONFIG_LABELS[k] ?? k}
                        </span>
                        <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                          {k === "SMTP_PASSWORD"
                            ? "Updated"
                            : `${savedConfigsState[k] || "(empty)"} → ${configsState[k] || "(empty)"}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setPendingNavigation(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Stay on Page
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSkipAndLeave}
                  className="px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition-colors"
                >
                  Skip &amp; Discard Changes
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => executeSaveDirtyConfigs(pendingNavigation)}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? "Saving..." : "Save & Continue"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
