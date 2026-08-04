"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  Building2, MapPin, Users, UserCheck, Calendar, ArrowLeft, Receipt, Sliders, KeyRound, Loader2
} from "lucide-react";
import { useTenantService } from "@/services/tenantService";
import { useRegionService } from "@/services/regionService";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useTenantMemberService } from "@/services/tenantMemberService";
import { Tenant, Region, FieldOffice } from "@edge/api";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { MembersTab } from "./components/MembersTab";
import { ExternalUsersTab } from "./components/ExternalUsersTab";
import { FieldOfficesTab } from "./components/FieldOfficesTab";
import { SchedulesTab } from "./components/SchedulesTab";
import { RegionSettingsTab } from "./components/RegionSettingsTab";
import { RolesTab } from "./components/RolesTab";
import { TransactionsTab } from "./components/TransactionsTab";

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tenantId = resolvedParams.id;
  const { useTenant, toggleTenantActive } = useTenantService();
  const { data: tenantResponse, isLoading: loadingTenant, mutate: mutateTenant } = useTenant(tenantId);

  if (loadingTenant || !tenantResponse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-slate-950 p-6">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <span className="text-sm font-semibold">Loading tenant details from live API...</span>
      </div>
    );
  }
  return (
    <TenantDetailPageContent
      currentTenant={tenantResponse}
      toggleTenantActive={toggleTenantActive}
      mutateTenant={mutateTenant}
    />
  );
}

interface TenantDetailPageContentProps {
  currentTenant: Tenant;
  toggleTenantActive: (id: string) => Promise<Tenant>;
  mutateTenant: (data?: Tenant) => Promise<Tenant | undefined>;
}

function TenantDetailPageContent({
  currentTenant,
  toggleTenantActive,
  mutateTenant,
}: TenantDetailPageContentProps) {
  const tenantId = currentTenant.id;
  const { useRegions } = useRegionService();
  const { useFieldOffices } = useFieldOfficeService();
  const { useTenantMembers } = useTenantMemberService();

  const [activeTab, setActiveTab] = useState<
    "members" | "external_users" | "field_offices" | "schedules" | "region_settings" | "roles_permissions" | "transactions"
  >("members");
  const [visitedTabs, setVisitedTabs] = useState<string[]>(["members"]);
  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleTabChange = (
    tab: "members" | "external_users" | "field_offices" | "schedules" | "region_settings" | "roles_permissions" | "transactions"
  ) => {
    setActiveTab(tab);
    if (!visitedTabs.includes(tab)) {
      setVisitedTabs((prev) => [...prev, tab]);
    }
  };

  const { data: regionsResponse } = useRegions();
  const regionsList: Region[] = Array.isArray(regionsResponse)
    ? regionsResponse
    : (regionsResponse as { data?: Region[] } | undefined)?.data ?? [];

  const getRegionName = (regionId: string): string => {
    const found = regionsList.find((r) => r.id === regionId);
    return found !== undefined && found !== null ? `${found.name} (${found.code})` : "Regional Office";
  };

  const getRegionCode = (regionId: string): string => {
    const found = regionsList.find((r) => r.id === regionId);
    return found !== undefined && found !== null ? found.code : "REG";
  };

  const { data: fetchedMembers } = useTenantMembers(
    visitedTabs.includes("members") ? tenantId : null
  );
  const { data: fetchedFieldOfficesResponse } = useFieldOffices(
    visitedTabs.includes("field_offices") ? tenantId : null,
    visitedTabs.includes("field_offices") ? currentTenant.regionId : null
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const updated = await toggleTenantActive(currentTenant.id);
      await mutateTenant(updated);
      showToast(`Tenant successfully ${updated.isActive ? "activated" : "deactivated"}.`);
      setIsConfirmToggleOpen(false);
    } catch (err: unknown) {
      showToast(`Failed to toggle tenant active status.`);
    } finally {
      setIsToggling(false);
    }
  };

  const fieldOfficesList: FieldOffice[] = fetchedFieldOfficesResponse ?? [];
  const staffCount = fetchedMembers !== undefined && fetchedMembers !== null ? fetchedMembers.length : (currentTenant.tenantMembersTotal ?? 0);
  const officesCount = fetchedFieldOfficesResponse !== undefined && fetchedFieldOfficesResponse !== null ? fetchedFieldOfficesResponse.length : (currentTenant.fieldOfficesCount ?? 0);
  const clientCount = currentTenant.clientTotal ?? 0;

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border-l-4 border-indigo-500 text-white px-5 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-3">
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link href="/tenants">
            <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white rounded-xl h-10 w-10 p-0 flex items-center justify-center shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/tenants" className="hover:text-indigo-400">Tenants</Link>
              <span>/</span>
              <span className="text-white font-semibold">{currentTenant.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-0.5 flex items-center gap-3">
              <span>{currentTenant.name}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentTenant.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                {currentTenant.isActive ? "Active" : "Inactive"}
              </span>
            </h1>
          </div>
        </div>

        <Button
          onClick={() => setIsConfirmToggleOpen(true)}
          disabled={isToggling}
          variant="outline"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-lg shrink-0 ${
            currentTenant.isActive
              ? "border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 shadow-rose-500/5"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 shadow-emerald-500/5"
          }`}
        >
          {isToggling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : currentTenant.isActive ? (
            "Deactivate Tenant"
          ) : (
            "Activate Tenant"
          )}
        </Button>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-indigo-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">{currentTenant.code}</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {getRegionName(currentTenant.regionId)}
                </span>
              </div>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed pt-1">{currentTenant.description ?? "Regional organizational tenant branch."}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl shrink-0 font-sans">
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Staff</p>
              <p className="text-lg font-extrabold text-sky-400">
                {staffCount}
              </p>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Clients</p>
              <p className="text-lg font-extrabold text-purple-400">
                {clientCount.toLocaleString()}
              </p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Offices</p>
              <p className="text-lg font-extrabold text-emerald-400">
                {officesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto">
        <button onClick={() => handleTabChange("members")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "members" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Users className="w-4 h-4 text-sky-400" /> Staff ({staffCount})
        </button>
        <button onClick={() => handleTabChange("external_users")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "external_users" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <UserCheck className="w-4 h-4 text-purple-400" /> Clients ({clientCount.toLocaleString()})
        </button>
        <button onClick={() => handleTabChange("field_offices")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "field_offices" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Building2 className="w-4 h-4 text-emerald-400" /> Offices ({officesCount})
        </button>
        <button onClick={() => handleTabChange("schedules")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "schedules" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Calendar className="w-4 h-4 text-amber-400" /> Schedules
        </button>
        <button onClick={() => handleTabChange("region_settings")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "region_settings" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Sliders className="w-4 h-4 text-amber-500" /> Settings
        </button>
        <button onClick={() => handleTabChange("roles_permissions")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "roles_permissions" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <KeyRound className="w-4 h-4 text-purple-400" /> Roles
        </button>
        <button onClick={() => handleTabChange("transactions")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "transactions" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Receipt className="w-4 h-4 text-teal-400" /> Transactions
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {activeTab === "members" && <MembersTab currentTenant={currentTenant} fieldOfficesList={fieldOfficesList} showToast={showToast} />}
        {activeTab === "external_users" && <ExternalUsersTab currentTenant={currentTenant} getRegionName={getRegionName} getRegionCode={getRegionCode} />}
        {activeTab === "field_offices" && <FieldOfficesTab currentTenant={currentTenant} getRegionName={getRegionName} getRegionCode={getRegionCode} showToast={showToast} />}
        {activeTab === "schedules" && <SchedulesTab currentTenant={currentTenant} showToast={showToast} />}
        {activeTab === "region_settings" && <RegionSettingsTab currentTenant={currentTenant} getRegionName={getRegionName} getRegionCode={getRegionCode} showToast={showToast} />}
        {activeTab === "roles_permissions" && <RolesTab currentTenant={currentTenant} showToast={showToast} />}
        {activeTab === "transactions" && <TransactionsTab currentTenant={currentTenant} />}
      </div>

      <ConfirmActionDialog
        isOpen={isConfirmToggleOpen}
        onClose={() => setIsConfirmToggleOpen(false)}
        onConfirm={handleToggleStatus}
        title={currentTenant.isActive ? "Deactivate Tenant Confirmation" : "Activate Tenant Confirmation"}
        description={
          currentTenant.isActive
            ? `Are you sure you want to deactivate "${currentTenant.name}"? Deactivating this tenant branch will restrict operational access for associated staff members and regional clients.`
            : `Are you sure you want to activate "${currentTenant.name}"? This will restore operational access for associated members and clients.`
        }
        confirmLabel={currentTenant.isActive ? "Deactivate Tenant" : "Activate Tenant"}
        cancelLabel="Cancel"
        loading={isToggling}
      />
    </div>
  );
}
