"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  MapPin,
  CircleDollarSign,
  Building,
  Save,
  CheckCircle2,
  ShieldCheck,
  Percent,
  Receipt,
  Clock,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useRegionService } from "@/services/regionService";
import { useRegionSettingsService } from "@/services/regionSettingsService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { Region, RegionSettings } from "@edge/api";
import { Button } from "@/components/ui/button";

export default function RegionSettingsPage() {
  const { canManageRegionSettings } = useAdminScope();
  const { useRegions } = useRegionService();
  const { useRegionSettings, updateRegionSettings } = useRegionSettingsService();

  const { data: regionsResponse } = useRegions();
  const regions: Region[] = regionsResponse?.data ?? [];

  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    regions.length > 0 ? regions[0].id : ""
  );

  const { data: fetchedSettings, isLoading: loadingSettings } = useRegionSettings(selectedRegionId);

  const currentSettings: RegionSettings = (fetchedSettings !== undefined && fetchedSettings !== null)
    ? fetchedSettings
    : {
        regionId: selectedRegionId,
        regionCode: regions.find((r) => r.id === selectedRegionId)?.code ?? "",
        regionName: regions.find((r) => r.id === selectedRegionId)?.name ?? "",
        regionalDirector: "",
        contactEmail: "",
        contactPhone: "",
        officeAddress: "",
        isActive: true,
        fees: {
          applicationFee: 0,
          inspectionFee: 0,
          permitRenewalFee: 0,
          lateSurchargeRatePercent: 0,
          maxProcessingFeeCap: 0,
          emergencyProcessingFee: 0,
        },
      };

  const [formData, setFormData] = useState<RegionSettings>(currentSettings);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData(currentSettings);
  }, [selectedRegionId, fetchedSettings]);

  const handleFeeChange = (key: keyof RegionSettings["fees"], value: number) => {
    setFormData((prev) => ({
      ...prev,
      fees: {
        ...prev.fees,
        [key]: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRegionSettings) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateRegionSettings(selectedRegionId, formData);
      setSuccessMsg(`Region settings and fee schedule for ${formData.regionName} successfully updated!`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update region settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sliders className="w-64 h-64 text-amber-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5">
                <CircleDollarSign className="w-3.5 h-3.5" /> Regional Configuration & Fee Rules
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Region Settings & Fee Schedules
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configure regulatory fee rates, application surcharges, inspection costs, and regional director contact details.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl shrink-0">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="bg-transparent text-sm text-white font-semibold focus:outline-none cursor-pointer pr-2"
            >
              {regions.map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-slate-900 text-white">
                  {reg.name} ({reg.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {successMsg !== null && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg !== null && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Fee Schedule Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Regulatory Fee Schedule</h2>
                <p className="text-xs text-slate-400">Configure application, inspection, and late penalty rates in PHP (₱)</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-950 text-slate-400 font-mono">
              Currency: PHP (₱)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CircleDollarSign className="w-4 h-4 text-emerald-400" />
                Application Processing Fee (₱)
              </label>
              <input
                type="number"
                step="50"
                min="0"
                value={formData.fees.applicationFee}
                onChange={(e) => handleFeeChange("applicationFee", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400">Standard filing & entry fee per permit application.</p>
            </div>

            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Inspection & Testing Fee (₱)
              </label>
              <input
                type="number"
                step="100"
                min="0"
                value={formData.fees.inspectionFee}
                onChange={(e) => handleFeeChange("inspectionFee", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400">On-site spectrum & equipment field verification fee.</p>
            </div>

            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                Permit Renewal Fee (₱)
              </label>
              <input
                type="number"
                step="50"
                min="0"
                value={formData.fees.permitRenewalFee}
                onChange={(e) => handleFeeChange("permitRenewalFee", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400">Annual or bi-annual permit license renewal fee.</p>
            </div>

            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-rose-400" />
                Late Payment Surcharge (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={formData.fees.lateSurchargeRatePercent}
                onChange={(e) => handleFeeChange("lateSurchargeRatePercent", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400">Monthly penalty percentage added to overdue payments.</p>
            </div>

            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CircleDollarSign className="w-4 h-4 text-amber-400" />
                Max Processing Fee Cap (₱)
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                value={formData.fees.maxProcessingFeeCap}
                onChange={(e) => handleFeeChange("maxProcessingFeeCap", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400">Upper limit ceiling for composite multi-year licenses.</p>
            </div>

            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-indigo-400" />
                Expedited Processing Surcharge (₱)
              </label>
              <input
                type="number"
                step="500"
                min="0"
                value={formData.fees.emergencyProcessingFee}
                onChange={(e) => handleFeeChange("emergencyProcessingFee", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400">Rush processing fee for urgent regional permits.</p>
            </div>
          </div>
        </div>

        {/* Regional Executive & Office Settings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Regional Office Details</h2>
                <p className="text-xs text-slate-400">Regional executive leadership, hotline, and address details</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Regional Director Name
              </label>
              <input
                type="text"
                value={formData.regionalDirector}
                onChange={(e) => setFormData({ ...formData, regionalDirector: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Official Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Official Telephone Hotline
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Office Physical Address
              </label>
              <input
                type="text"
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
          <span className="text-xs text-slate-400">
            Changes will immediately apply to fee calculations for {formData.regionName}.
          </span>
          <Button
            type="submit"
            disabled={saving || !canManageRegionSettings}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-600/25 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Region Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
