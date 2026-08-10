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
  Search
} from "lucide-react";
import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

export default function SystemConfigPage() {
  const { useSystemConfigs, updateSystemConfig } = useSystemConfigService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeTab, setActiveTab] = useState<string>("General");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [configsState, setConfigsState] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setConfigsState((prev) => (Object.keys(prev).length > 0 ? prev : stateMap));
    } else {
      setConfigsState((prev) => {
        if (Object.keys(prev).length > 0) return prev;
        return {
          SYSTEM_NAME: "NTC EDGE Portal",
          MAINTENANCE_MODE: "false",
          MAX_UPLOAD_SIZE_MB: "25",
          ALLOWED_FILE_TYPES: ".pdf,.jpg,.png,.zip",
          SMTP_SERVER: "smtp.ntc.gov.ph",
          SMTP_PORT: "587",
          SESSION_TIMEOUT_MINS: "30",
        };
      });
    }
  }, [responseData]);

  const handleChange = (key: string, val: string) => {
    setConfigsState((prev) => ({ ...prev, [key]: val }));
  };

  const handleInputChange = (key: string, val: string) => {
    setConfigsState((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveCategory = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const categoryConfigs = configs.filter((c) => c.category === activeTab);
    const keysToSave =
      categoryConfigs.length > 0
        ? categoryConfigs.map((c) => c.key)
        : Object.keys(configsState);

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
    if (hasError) {
      setToast({ message: lastErrorMsg, type: "error" });
    } else {
      setToast({ message: "System configuration settings updated successfully.", type: "success" });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const tabs = [
    { id: "General", label: "General Settings", icon: Settings },
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
          onClick={handleSaveCategory}
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
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Email Gateway / SMTP Settings
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SMTP Server Host</label>
                <input
                  type="text"
                  value={configsState["SMTP_SERVER"] ?? "smtp.ntc.gov.ph"}
                  onChange={(e) => handleChange("SMTP_SERVER", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SMTP Port</label>
                <input
                  type="text"
                  value={configsState["SMTP_PORT"] ?? "587"}
                  onChange={(e) => handleChange("SMTP_PORT", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
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

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
