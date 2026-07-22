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
import { MembersTab } from "./components/MembersTab";
import { ExternalUsersTab } from "./components/ExternalUsersTab";
import { FieldOfficesTab } from "./components/FieldOfficesTab";
import { SchedulesTab } from "./components/SchedulesTab";
import { RegionSettingsTab } from "./components/RegionSettingsTab";
import { RolesTab } from "./components/RolesTab";
import { TransactionsTab } from "./components/TransactionsTab";
import { getRegionalExternalUsers } from "@/components/tenants/mockData";

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tenantId = resolvedParams.id;
  const { useTenant } = useTenantService();
  const { data: tenantResponse, isLoading: loadingTenant } = useTenant(tenantId);

  if (loadingTenant || !tenantResponse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-slate-950 p-6">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <span className="text-sm font-semibold">Loading tenant details from live API...</span>
      </div>
    );
  }
  return <TenantDetailPageContent currentTenant={tenantResponse} />;
}

function TenantDetailPageContent({ currentTenant }: { currentTenant: Tenant }) {
  const tenantId = currentTenant.id;
  const { useRegions } = useRegionService();
  const { useFieldOffices } = useFieldOfficeService();
  const { useTenantMembers } = useTenantMemberService();

  const { data: regionsResponse } = useRegions();
  const { data: fetchedMembers } = useTenantMembers(tenantId);
  const { data: fetchedFieldOfficesResponse } = useFieldOffices(tenantId, currentTenant.regionId);

  const regions: Region[] = regionsResponse?.data ?? [
    { id: "4570bda0-8fee-4c79-993c-7d73cfa29a0d", code: "NCR", name: "National Capital Region", isActive: true },
    { id: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2", code: "R3", name: "Region III - Central Luzon", isActive: true },
    { id: "7037536b-59d8-4786-8f92-fee3e0c78413", code: "R7", name: "Region VII - Central Visayas", isActive: true },
  ];

  const getRegionName = (id: string) => regions.find((r) => r.id === id)?.name ?? "National Region";
  const getRegionCode = (id: string) => regions.find((r) => r.id === id)?.code ?? "REG";

  const [activeTab, setActiveTab] = useState<
    "members" | "external_users" | "field_offices" | "schedules" | "region_settings" | "roles_permissions" | "transactions"
  >("members");

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fieldOfficesList: FieldOffice[] = fetchedFieldOfficesResponse ?? [];
  const staffCount = fetchedMembers?.length ?? 0;
  const externalUsers = getRegionalExternalUsers(currentTenant.regionId, getRegionCode(currentTenant.regionId));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-white min-h-screen">
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
              <p className="text-lg font-extrabold text-sky-400">{staffCount}</p>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Clients</p>
              <p className="text-lg font-extrabold text-purple-400">{externalUsers.length.toLocaleString()}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Offices</p>
              <p className="text-lg font-extrabold text-emerald-400">{fieldOfficesList.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto">
        <button onClick={() => setActiveTab("members")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "members" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Users className="w-4 h-4 text-sky-400" /> Staff ({staffCount})
        </button>
        <button onClick={() => setActiveTab("external_users")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "external_users" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <UserCheck className="w-4 h-4 text-purple-400" /> Clients ({externalUsers.length.toLocaleString()})
        </button>
        <button onClick={() => setActiveTab("field_offices")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "field_offices" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Building2 className="w-4 h-4 text-emerald-400" /> Offices ({fieldOfficesList.length})
        </button>
        <button onClick={() => setActiveTab("schedules")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "schedules" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Calendar className="w-4 h-4 text-amber-400" /> Schedules
        </button>
        <button onClick={() => setActiveTab("region_settings")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "region_settings" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <Sliders className="w-4 h-4 text-amber-500" /> Settings
        </button>
        <button onClick={() => setActiveTab("roles_permissions")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "roles_permissions" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
          <KeyRound className="w-4 h-4 text-purple-400" /> Roles
        </button>
        <button onClick={() => setActiveTab("transactions")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${activeTab === "transactions" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
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
    </div>
  );
}
