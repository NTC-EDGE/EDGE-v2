"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  Sliders,
  KeyRound,
  MapPin,
  Building,
  Home,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CircleDollarSign,
  Calendar
} from "lucide-react";
import { useRegionService } from "@/services/regionService";
import { useProvinceService } from "@/services/provinceService";
import { useMunicipalityService } from "@/services/municipalityService";
import { useBarangayService } from "@/services/barangayService";
import { useTenantService } from "@/services/tenantService";
import { useAdminScope } from "@/lib/admin-scope-context";

export default function Dashboard() {
  const { activeRole, isSystemAdmin, isRegionAdmin, isTenantAdmin } = useAdminScope();

  const { useRegions } = useRegionService();
  const { useProvinces } = useProvinceService();
  const { useMunicipalities } = useMunicipalityService();
  const { useBarangays } = useBarangayService();
  const { useTenants } = useTenantService();

  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: municipalitiesData, isLoading: municipalitiesLoading } = useMunicipalities();
  const { data: barangaysData, isLoading: barangaysLoading } = useBarangays();
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants();

  const regionsCount = regionsData?.data?.length ?? 17;
  const provincesCount = provincesData?.data?.length ?? 81;
  const municipalitiesCount = municipalitiesData?.data?.length ?? 1488;
  const barangaysCount = barangaysData?.data?.length ?? 42027;
  const tenantsCount = tenantsData?.length ?? 3;

  const adminStats = [
    {
      name: "Tenants & Branches",
      count: tenantsCount,
      loading: tenantsLoading,
      subtitle: "System & Region Tenants",
      icon: Building2,
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgGradient: "from-emerald-500/10 to-transparent",
      href: "/tenants",
    },
    {
      name: "Tenant Members",
      count: "12",
      loading: false,
      subtitle: "Active Users & Roles",
      icon: Users,
      textColor: "text-sky-400",
      borderColor: "border-sky-500/30",
      bgGradient: "from-sky-500/10 to-transparent",
      href: "/tenant-members",
    },
    {
      name: "Exam Schedules",
      count: "Published",
      loading: false,
      subtitle: "Regional Examinations",
      icon: Calendar,
      textColor: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgGradient: "from-purple-500/10 to-transparent",
      href: "/schedules",
    },
    {
      name: "Region Fee Rules",
      count: "Active",
      loading: false,
      subtitle: "Regulatory Fee Schedules",
      icon: Sliders,
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgGradient: "from-amber-500/10 to-transparent",
      href: "/region-settings",
    },
    {
      name: "Security Roles",
      count: "5 Core",
      loading: false,
      subtitle: "Access Policies Defined",
      icon: KeyRound,
      textColor: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgGradient: "from-purple-500/10 to-transparent",
      href: "/roles-permissions",
    },
    {
      name: "Fees & Notes",
      count: "System-wide",
      loading: false,
      subtitle: "Regulatory Fees & Notes",
      icon: CircleDollarSign,
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgGradient: "from-amber-500/10 to-transparent",
      href: "/fees-notes",
    },
  ];

  const geoStats = [
    { name: "Regions", count: regionsCount, loading: regionsLoading, icon: MapPin, color: "text-cyan-400", href: "/regions" },
    { name: "Provinces", count: provincesCount, loading: provincesLoading, icon: Building, color: "text-blue-400", href: "/provinces" },
    { name: "Municipalities", count: municipalitiesCount, loading: municipalitiesLoading, icon: Building2, color: "text-indigo-400", href: "/municipalities" },
    { name: "Barangays", count: barangaysCount, loading: barangaysLoading, icon: Home, color: "text-purple-400", href: "/barangays" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin Configurations Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">
            System Admin and Region/Tenant Admin management portal for NTC-EDGE ecosystem.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-300 font-medium">Scope:</span>
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            {activeRole.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Admin Configurations Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Administrative Access Configurations</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl border ${stat.borderColor} bg-slate-900/80 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.bgGradient} rounded-bl-full pointer-events-none`} />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.name}</p>
                    <p className="text-2xl font-extrabold text-white mt-1 tracking-tight">{stat.count}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${stat.textColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{stat.subtitle}</span>
                  <Link
                    href={stat.href}
                    className="text-xs text-white font-semibold flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Pane: Quick Configuration Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-400" /> Admin Capabilities & Workflows
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/tenants"
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-colors group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> System Admin
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white">Add & Manage Tenants</h4>
                <p className="text-xs text-slate-400">
                  Register new organizational branches, assign region ownership, and toggle active status.
                </p>
              </Link>

              <Link
                href="/tenant-members"
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-colors group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Tenant / Region Admin
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white">Manage Members & Users</h4>
                <p className="text-xs text-slate-400">
                  Assign users to tenants, define division, position, level, and tenant roles.
                </p>
              </Link>

              <Link
                href="/region-settings"
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-colors group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CircleDollarSign className="w-4 h-4" /> Region Admin
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white">Region Settings & Fees</h4>
                <p className="text-xs text-slate-400">
                  Configure regional fee rules, application processing costs, inspection fees, and surcharges.
                </p>
              </Link>

              <Link
                href="/roles-permissions"
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition-colors group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" /> Security Policy
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white">Roles & Permissions Matrix</h4>
                <p className="text-xs text-slate-400">
                  Manage core system roles, tenant-level permission keys, and access policy rules.
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Pane: Geographic Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400" /> Geographic Reference System
            </h3>

            <div className="space-y-3">
              {geoStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs font-semibold text-slate-200">{stat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white">{stat.count}</span>
                    <Link href={stat.href} className="text-[11px] text-slate-400 hover:text-white">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
