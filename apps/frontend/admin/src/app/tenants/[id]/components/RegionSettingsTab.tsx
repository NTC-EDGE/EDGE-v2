"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tenant, RegionSettings } from "@edge/api";
import { useRegionSettingsService } from "@/services/regionSettingsService";

interface RegionSettingsTabProps {
  currentTenant: Tenant;
  getRegionName: (regionId: string) => string;
  getRegionCode: (regionId: string) => string;
  showToast: (msg: string) => void;
}

export function RegionSettingsTab({ currentTenant, getRegionName, getRegionCode, showToast }: RegionSettingsTabProps) {
  const { useRegionSettings, updateRegionSettings } = useRegionSettingsService();
  const { data: fetchedSettings } = useRegionSettings(currentTenant.regionId);
  const [savingSettings, setSavingSettings] = useState(false);

  const [regionSettingsData, setRegionSettingsData] = useState<RegionSettings>({
    regionId: currentTenant.regionId,
    regionCode: getRegionCode(currentTenant.regionId),
    regionName: getRegionName(currentTenant.regionId),
    regionalDirector: "Engr. Regional Director",
    contactEmail: "regional.office@ntc.gov.ph",
    contactPhone: "+63 (02) 8000-0000",
    officeAddress: "Regional Government Center",
    isActive: true,
    fees: {
      applicationFee: 1500.0,
      inspectionFee: 3500.0,
      permitRenewalFee: 2000.0,
      lateSurchargeRatePercent: 10.0,
      maxProcessingFeeCap: 25000.0,
      emergencyProcessingFee: 4500.0,
    },
  });

  useEffect(() => {
    if (fetchedSettings) {
      setRegionSettingsData(fetchedSettings);
    }
  }, [fetchedSettings]);

  const handleSaveRegionSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateRegionSettings(currentTenant.regionId, regionSettingsData);
      showToast("Region settings & fee schedules saved!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save region settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <form onSubmit={handleSaveRegionSettings} className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Region Settings & Regulatory Fee Schedules</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Configure application processing fees, inspection rates, and regional director contacts.</p>
        </div>
        <Button
          type="submit"
          disabled={savingSettings}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20"
        >
          {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Region Settings</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Application Processing Fee (₱)</label>
          <input
            type="number"
            value={regionSettingsData.fees.applicationFee}
            onChange={(e) =>
              setRegionSettingsData({
                ...regionSettingsData,
                fees: { ...regionSettingsData.fees, applicationFee: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Inspection & Testing Fee (₱)</label>
          <input
            type="number"
            value={regionSettingsData.fees.inspectionFee}
            onChange={(e) =>
              setRegionSettingsData({
                ...regionSettingsData,
                fees: { ...regionSettingsData.fees, inspectionFee: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Permit Renewal Fee (₱)</label>
          <input
            type="number"
            value={regionSettingsData.fees.permitRenewalFee}
            onChange={(e) =>
              setRegionSettingsData({
                ...regionSettingsData,
                fees: { ...regionSettingsData.fees, permitRenewalFee: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Regional Director Name</label>
          <input
            type="text"
            value={regionSettingsData.regionalDirector}
            onChange={(e) => setRegionSettingsData({ ...regionSettingsData, regionalDirector: e.target.value })}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Official Contact Email</label>
          <input
            type="email"
            value={regionSettingsData.contactEmail}
            onChange={(e) => setRegionSettingsData({ ...regionSettingsData, contactEmail: e.target.value })}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>
    </form>
  );
}
