"use client";

import { useState, useEffect } from "react";
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
  RefreshCw
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
  Maintenance: ["MAINTENANCE_MODE"],
};

const DEFAULT_CONFIG_VALUES: Record<string, string> = {
  SYSTEM_NAME: "NTC EDGE Portal",
  SUPPORT_EMAIL: "support@ntc.gov.ph",
  MAINTENANCE_MODE: "false",
  MAX_UPLOAD_SIZE_MB: "25",
  ALLOWED_FILE_TYPES: ".pdf,.jpg,.png,.zip",
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

export default function SystemConfigPage() {
  const { useSystemConfigs, updateSystemConfig } = useSystemConfigService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeTab, setActiveTab] = useState<string>("General");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [configsState, setConfigsState] = useState<Record<string, string>>(DEFAULT_CONFIG_VALUES);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  const { data: responseData, mutate, isLoading, error } = useSystemConfigs(1, 50, searchTerm, activeTab);

  const configs: SystemConfig[] = Array.isArray(responseData)
    ? responseData
    : responseData && Array.isArray(responseData.data)
    ? responseData.data
    : [];

  useEffect(() => {
    const list: SystemConfig[] = Array.isArray(responseData)
      ? responseData
      : responseData && Array.isArray(responseData.data)
      ? responseData.data
      : [];

    if (list.length > 0) {
      const stateMap: Record<string, string> = {};
      list.forEach((c) => {
        stateMap[c.key] = c.value;
      });
      setConfigsState((prev) => ({
        ...DEFAULT_CONFIG_VALUES,
        ...prev,
        ...stateMap,
      }));
    }
  }, [responseData]);

  const handleChange = (key: string, val: string) => {
    setConfigsState((prev) => ({ ...prev, [key]: val }));
  };

  const handleInputChange = (key: string, val: string) => {
    setConfigsState((prev) => ({ ...prev, [key]: val }));
  };

  const handleRequestSaveCategory = () => {
    setIsConfirmSaveOpen(true);
  };

  const handleSaveCategory = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const categoryConfigs = configs.filter((c) => c.category === activeTab);
    const defaultCategoryKeys = CATEGORY_KEYS[activeTab] ?? [];
    const keysToSave = Array.from(
      new Set([
        ...defaultCategoryKeys,
        ...categoryConfigs.map((c) => c.key),
      ])
    );

    let hasError = false;
    let lastErrorMsg = "";

    for (const key of keysToSave) {
      if (configsState[key] !== undefined) {
        const [res, err] = await safeAsync(
          updateSystemConfig({
            key,
            value: configsState[key],
            category: activeTab,
            description: `Global ${activeTab} configuration`,
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
    } else {
      setToast({ message: `Confirmed: ${activeTab} system configuration settings updated successfully.`, type: "success" });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto transition-colors duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
            <Sliders className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Configuration</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure global application parameters, security lockout policies, file upload limits, and maintenance mode.
            </p>
          </div>
        </div>
        <button
          onClick={handleRequestSaveCategory}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {isSaving ? (
            <span className="text-sm font-mono">Saving...</span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>System configuration settings updated successfully.</span>
        </div>
      )}

      {/* Search Bar & Tabs Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search configuration parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "border-indigo-500 text-indigo-600 dark:text-white bg-indigo-50/50 dark:bg-slate-900/40"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Content */}
      {!!error && isForbiddenError(error) && <PageForbiddenState />}
      {!!error && !isForbiddenError(error) && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
          <p className="text-rose-500 font-medium text-base">Failed to load system config</p>
          <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 font-medium">Retry</button>
        </div>
      )}
      {!error && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          {activeTab === "General" && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> General Application Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">System Title / Portal Name</label>
                <input
                  type="text"
                  value={configsState["SYSTEM_NAME"] ?? "NTC EDGE Portal"}
                  onChange={(e) => handleChange("SYSTEM_NAME", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Support Email Address</label>
                <input
                  type="email"
                  value={configsState["SUPPORT_EMAIL"] ?? "support@ntc.gov.ph"}
                  onChange={(e) => handleChange("SUPPORT_EMAIL", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Renewal" && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Statutory Renewal & Expiration Reminders
            </h2>
            <div className="space-y-4">
              <div className="p-5 bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 rounded-2xl space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notification Milestones (Days Before Expiration)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comma-separated milestones before expiration when reminder notifications will be triggered and the &quot;Renew Application&quot; button becomes visible to clients.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 pb-1">
                  {(configsState["Renewal:DaysBeforeExpiration"] ?? "60,30,15,1,0")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      >
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

              <div className="p-5 bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 rounded-2xl space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Default Renewal Validity Duration (Years)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Default number of years added to the original expiration date upon renewal approval (e.g. 1 year default, unless evaluator chooses 2 years).
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

        {activeTab === "Security" && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Security & Lockout Policies
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={configsState["SESSION_TIMEOUT_MINS"] ?? "30"}
                  onChange={(e) => handleChange("SESSION_TIMEOUT_MINS", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Max Failed Login Lockout Threshold</label>
                <input
                  type="number"
                  value={configsState["MAX_FAILED_LOGINS"] ?? "5"}
                  onChange={(e) => handleChange("MAX_FAILED_LOGINS", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Email" && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Email Gateway / SMTP Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure the outbound SMTP server, sender identity, and portal base URLs for automated client and internal officer email notifications.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange(
                    "EMAIL_ENABLED",
                    (configsState["EMAIL_ENABLED"] ?? "true") === "true" ? "false" : "true"
                  )
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  (configsState["EMAIL_ENABLED"] ?? "true") === "true"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
                }`}
              >
                {(configsState["EMAIL_ENABLED"] ?? "true") === "true"
                  ? "EMAIL DELIVERY: ENABLED"
                  : "EMAIL DELIVERY: DISABLED"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SMTP Server Host
                </label>
                <input
                  type="text"
                  placeholder="e.g. smtp.ntc.gov.ph or smtp.gmail.com"
                  value={configsState["SMTP_SERVER"] ?? "smtp.ntc.gov.ph"}
                  onChange={(e) => handleChange("SMTP_SERVER", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SMTP Port
                </label>
                <input
                  type="text"
                  placeholder="587"
                  value={configsState["SMTP_PORT"] ?? "587"}
                  onChange={(e) => handleChange("SMTP_PORT", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SMTP Username / Account Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. notifications@ntc.gov.ph"
                  value={configsState["SMTP_USERNAME"] ?? ""}
                  onChange={(e) => handleChange("SMTP_USERNAME", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SMTP Password / App Password
                </label>
                <input
                  type="password"
                  placeholder="Enter SMTP password or app password"
                  value={configsState["SMTP_PASSWORD"] ?? ""}
                  onChange={(e) => handleChange("SMTP_PASSWORD", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Sender From Email Address
                </label>
                <input
                  type="email"
                  placeholder="no-reply@ntc.gov.ph"
                  value={configsState["SMTP_FROM_EMAIL"] ?? "no-reply@ntc.gov.ph"}
                  onChange={(e) => handleChange("SMTP_FROM_EMAIL", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  placeholder="NTC EDGE Portal"
                  value={configsState["SMTP_FROM_NAME"] ?? "NTC EDGE Portal"}
                  onChange={(e) => handleChange("SMTP_FROM_NAME", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client Portal Base URL (For Email Action Links)
                </label>
                <input
                  type="text"
                  placeholder="https://client.edge.ntc.gov.ph"
                  value={configsState["CLIENT_PORTAL_BASE_URL"] ?? "http://localhost:8081"}
                  onChange={(e) => handleChange("CLIENT_PORTAL_BASE_URL", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Internal Officer Portal Base URL
                </label>
                <input
                  type="text"
                  placeholder="https://internal.edge.ntc.gov.ph"
                  value={configsState["INTERNAL_PORTAL_BASE_URL"] ?? "http://localhost:8082"}
                  onChange={(e) => handleChange("INTERNAL_PORTAL_BASE_URL", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Use SSL / STARTTLS Encryption</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Encrypts outbound SMTP traffic using TLS (Recommended for port 587 and 465).
                </p>
              </div>
              <input
                type="checkbox"
                checked={(configsState["SMTP_USE_SSL"] ?? "true") === "true"}
                onChange={(e) => handleChange("SMTP_USE_SSL", e.target.checked ? "true" : "false")}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === "Upload" && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> File Storage & Attachment Constraints
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Maximum Upload File Size (MB)</label>
                <input
                  type="number"
                  value={configsState["MAX_UPLOAD_SIZE_MB"] ?? "25"}
                  onChange={(e) => handleChange("MAX_UPLOAD_SIZE_MB", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Allowed Attachment Extensions</label>
                <input
                  type="text"
                  value={configsState["ALLOWED_FILE_TYPES"] ?? ".pdf,.jpg,.png,.zip"}
                  onChange={(e) => handleChange("ALLOWED_FILE_TYPES", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Maintenance" && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Power className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Maintenance Mode Controls
            </h2>
            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Enable Portal Maintenance Mode</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  When active, non-admin applicants will see a maintenance notice banner upon login.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleInputChange(
                    "MAINTENANCE_MODE",
                    configsState["MAINTENANCE_MODE"] === "true" ? "false" : "true"
                  )
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  configsState["MAINTENANCE_MODE"] === "true"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {configsState["MAINTENANCE_MODE"] === "true" ? "ACTIVE (MAINTENANCE)" : "INACTIVE (NORMAL)"}
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      <ConfirmActionDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => !isSaving && setIsConfirmSaveOpen(false)}
        onConfirm={handleSaveCategory}
        title={`Confirm ${activeTab} Configuration Changes`}
        description={
          activeTab === "Email"
            ? `Are you sure you want to update the Email Gateway / SMTP configuration (${configsState["SMTP_SERVER"] || "smtp.ntc.gov.ph"}:${configsState["SMTP_PORT"] || "587"}, Delivery: ${(configsState["EMAIL_ENABLED"] ?? "true") === "true" ? "ENABLED" : "DISABLED"})? These changes will immediately affect outbound email notifications for clients and regional officers.`
            : `Are you sure you want to apply and save your changes to the ${activeTab} system configuration settings?`
        }
        confirmLabel="Confirm & Save Changes"
        cancelLabel="Cancel"
        loading={isSaving}
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
