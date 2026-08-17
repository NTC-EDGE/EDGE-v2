"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Building2, MapPin, Users, UserCheck, Calendar, ArrowLeft, Receipt, KeyRound, Loader2
} from "lucide-react";
import { useTenantService } from "@/services/tenantService";
import { useRegionService } from "@/services/regionService";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useTenantMemberService } from "@/services/tenantMemberService";
import { Tenant, Region, FieldOffice } from "@edge/api";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast-notification";
import { MembersTab } from "./components/MembersTab";
import { ExternalUsersTab } from "./components/ExternalUsersTab";
import { FieldOfficesTab } from "./components/FieldOfficesTab";
import { SchedulesTab } from "./components/SchedulesTab";
import { RolesTab } from "./components/RolesTab";
import { TransactionsTab } from "./components/TransactionsTab";

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tenantId = resolvedParams.id;
  const { useTenant } = useTenantService();
  const { data: tenantResponse, isLoading: loadingTenant } = useTenant(tenantId);

  if (loadingTenant || !tenantResponse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-semibold">Loading tenant organization profile...</p>
      </div>
    );
  }

  return <TenantDetailContent currentTenant={tenantResponse} tenantId={tenantId} />;
}

interface TenantDetailContentProps {
  currentTenant: Tenant;
  tenantId: string;
}

function TenantDetailContent({ currentTenant, tenantId }: TenantDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "members";

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [visitedTabs, setVisitedTabs] = useState<string[]>([activeTab]);
  useEffect(() => {
    if (!visitedTabs.includes(activeTab)) {
      setVisitedTabs((prev) => [...prev, activeTab]);
    }
  }, [activeTab, visitedTabs]);

  const { useRegions } = useRegionService();
  const { useFieldOffices } = useFieldOfficeService();
  const { useTenantMembers } = useTenantMemberService();
  const { useTenantClients, useTenantTransactions } = useTenantService();

  const { data: regionsResponse } = useRegions();
  const regionsList: Region[] = Array.isArray(regionsResponse)
    ? regionsResponse
    : (regionsResponse as { data?: Region[] } | undefined)?.data ?? [];

  const getRegionName = (regionId: string): string => {
    const found = regionsList.find((r) => r.id === regionId);
    return found !== undefined && found !== null ? `${found.name} (${found.code})` : "Region Office";
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

  const { data: tenantClientsResponse } = useTenantClients(tenantId, 1, 1);
  const { data: tenantTransactionsResponse } = useTenantTransactions(tenantId, 1, 1);

  const fieldOfficesList: FieldOffice[] = fetchedFieldOfficesResponse ?? [];
  const staffCount = fetchedMembers !== undefined && fetchedMembers !== null ? fetchedMembers.length : (currentTenant.tenantMembersTotal ?? 0);
  const officesCount = fetchedFieldOfficesResponse !== undefined && fetchedFieldOfficesResponse !== null ? fetchedFieldOfficesResponse.length : (currentTenant.fieldOfficesCount ?? 0);
  const clientCount = tenantClientsResponse?.totalCount ?? currentTenant.clientTotal ?? 0;
  const transactionCount = tenantTransactionsResponse?.totalCount ?? 0;

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <Link href="/tenants" className="shrink-0 mt-0.5 sm:mt-0">
            <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl h-10 w-10 p-0 flex items-center justify-center shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
              <Link href="/tenants" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium shrink-0">Tenants</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold truncate">{currentTenant.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words min-w-0">
                {currentTenant.name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                currentTenant.isActive
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30"
              }`}>
                <span className={`h-2 w-2 rounded-full ${currentTenant.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                {currentTenant.isActive ? "Active Organization" : "Inactive Organization"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-200 min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 min-w-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
              <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-slate-800 font-semibold">{currentTenant.code}</span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="break-words">{getRegionName(currentTenant.regionId)}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed break-words">{currentTenant.description ?? "Regional organizational tenant branch."}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-3 sm:p-3.5 rounded-xl shrink-0 font-sans">
            <div className="text-center px-2 sm:px-3 border-r border-slate-200 dark:border-slate-800 min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 truncate">Staff</p>
              <p className="text-base sm:text-lg font-extrabold text-sky-600 dark:text-sky-400">{staffCount}</p>
            </div>
            <div className="text-center px-2 sm:px-3 border-r border-slate-200 dark:border-slate-800 min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 truncate">Clients</p>
              <p className="text-base sm:text-lg font-extrabold text-purple-600 dark:text-purple-400 truncate">{clientCount.toLocaleString()}</p>
            </div>
            <div className="text-center px-2 sm:px-3 min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 truncate">Offices</p>
              <p className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{officesCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto shadow-sm dark:shadow-xl scrollbar-thin transition-colors duration-200">
        <button onClick={() => handleTabChange("members")} className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${activeTab === "members" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"}`}>
          <Users className="w-4 h-4 text-sky-500 dark:text-sky-400" /> Staff ({staffCount})
        </button>
        <button onClick={() => handleTabChange("external_users")} className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${activeTab === "external_users" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"}`}>
          <UserCheck className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Clients ({clientCount.toLocaleString()})
        </button>
        <button onClick={() => handleTabChange("field_offices")} className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${activeTab === "field_offices" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"}`}>
          <Building2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Offices ({officesCount})
        </button>
        <button onClick={() => handleTabChange("schedules")} className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${activeTab === "schedules" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"}`}>
          <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Schedules
        </button>
        <button onClick={() => handleTabChange("roles_permissions")} className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${activeTab === "roles_permissions" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"}`}>
          <KeyRound className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Roles
        </button>
        <button onClick={() => handleTabChange("transactions")} className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${activeTab === "transactions" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"}`}>
          <Receipt className="w-4 h-4 text-teal-500 dark:text-teal-400" /> Transactions ({transactionCount.toLocaleString()})
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl transition-colors duration-200 min-w-0 overflow-hidden">
        {activeTab === "members" && <MembersTab currentTenant={currentTenant} fieldOfficesList={fieldOfficesList} showToast={(msg: string) => showToast.success(msg)} />}
        {activeTab === "external_users" && <ExternalUsersTab currentTenant={currentTenant} getRegionName={getRegionName} getRegionCode={getRegionCode} />}
        {activeTab === "field_offices" && <FieldOfficesTab currentTenant={currentTenant} getRegionCode={getRegionCode} />}
        {activeTab === "schedules" && <SchedulesTab currentTenant={currentTenant} showToast={(msg: string) => showToast.success(msg)} />}
        {activeTab === "roles_permissions" && <RolesTab currentTenant={currentTenant} showToast={(msg: string) => showToast.success(msg)} />}
        {activeTab === "transactions" && <TransactionsTab currentTenant={currentTenant} />}
      </div>
    </div>
  );
}
