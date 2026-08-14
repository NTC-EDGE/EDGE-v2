"use client";

import Link from "next/link";
import {
  Building2,
  KeyRound,
  MapPin,
  Building,
  Home,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CircleDollarSign,
  Calendar,
  Megaphone,
  Layers,
  FileText,
  BookOpen,
  ClipboardList,
  Loader2,
  Settings,
  BellRing,
  HeadphonesIcon,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useRegionService } from "@/services/regionService";
import { useProvinceService } from "@/services/provinceService";
import { useMunicipalityService } from "@/services/municipalityService";
import { useBarangayService } from "@/services/barangayService";
import { useTenantService } from "@/services/tenantService";
import { useCatalogService } from "@/services/catalogService";
import { useRoleService } from "@/services/roleService";
import { useAnnouncementService } from "@/services/announcementService";
import { useScheduleService } from "@/services/scheduleService";
import { useSupportService } from "@/services/supportService";
import { useFeesService } from "@/services/feesService";
import { useRequirementsService } from "@/services/requirementsService";
import { useAdminScope } from "@/lib/admin-scope-context";

function StatSkeleton() {
  return (
    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
  );
}

function StatCard({
  name,
  count,
  loading,
  subtitle,
  icon: Icon,
  textColor,
  borderColor,
  bgGradient,
  href,
  badge,
}: {
  name: string;
  count: string | number;
  loading: boolean;
  subtitle: string;
  icon: React.ElementType;
  textColor: string;
  borderColor: string;
  bgGradient: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:${borderColor} bg-white dark:bg-slate-900/80 p-6 shadow-md dark:shadow-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group block`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${bgGradient} rounded-bl-full pointer-events-none opacity-40 dark:opacity-100`} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">{name}</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            {loading ? (
              <StatSkeleton />
            ) : (
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {typeof count === "number" ? count.toLocaleString() : count}
              </p>
            )}
            {badge !== undefined && badge !== null && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 uppercase">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${textColor} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">{subtitle}</span>
        <span className={`text-xs font-semibold flex items-center gap-1 ${textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{title}</h3>
    </div>
  );
}

export default function Dashboard() {
  const { activeRole } = useAdminScope();

  // Geographic data
  const { useRegions } = useRegionService();
  const { useProvinces } = useProvinceService();
  const { useMunicipalities } = useMunicipalityService();
  const { useBarangays } = useBarangayService();

  // Admin entities
  const { useTenants } = useTenantService();
  const { useServiceCategories, useServices } = useCatalogService();
  const { useRoles } = useRoleService();
  const { useAnnouncements } = useAnnouncementService();
  const { useSchedules } = useScheduleService();
  const { useGlobalUsers } = useSupportService();
  const { useFees, useNotes, useSoaNotes, useElements } = useFeesService();
  const { useRequirements } = useRequirementsService();

  // Fetch all
  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: municipalitiesData, isLoading: municipalitiesLoading } = useMunicipalityService().useMunicipalities();
  const { data: barangaysData, isLoading: barangaysLoading } = useBarangayService().useBarangays();
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants(1, 1);
  const { data: categoriesResp } = useServiceCategories();
  const { data: servicesResp, isLoading: servicesLoading } = useServices(undefined, 1, 1);
  const { data: rolesData, isLoading: rolesLoading } = useRoles(undefined, true);
  const { data: announcementsData, isLoading: announcementsLoading } = useAnnouncements(1, 1);
  const { data: schedulesData, isLoading: schedulesLoading } = useSchedules();
  const { data: supportUsersData, isLoading: supportUsersLoading } = useGlobalUsers();
  const feesResult = useFees(1, 1);
  const requirementsResult = useRequirements(1, 1);
  const notesResult = useNotes(1, 1, undefined, undefined, undefined, true);
  const soaNotesResult = useSoaNotes(1, 1, undefined, true);
  const elementsResult = useElements(1, 1);

  // Counts
  const tenantsCount = tenantsData?.totalCount ?? 0;
  const servicesCount = servicesResp?.totalCount ?? 0;
  const categoriesCount = Array.isArray(categoriesResp?.data) ? categoriesResp.data.length : 0;
  const rolesCount = Array.isArray(rolesData) ? rolesData.length : 0;
  const announcementsCount = announcementsData?.totalCount ?? 0;
  const schedulesCount = Array.isArray(schedulesData) ? schedulesData.length : 0;
  const publishedSchedules = Array.isArray(schedulesData) ? schedulesData.filter((s) => s.isPublished).length : 0;
  const supportUsersCount = Array.isArray(supportUsersData) ? supportUsersData.length : 0;
  const feesCount = feesResult.totalCount;
  const notesCount = notesResult.totalCount;
  const soaNotesCount = soaNotesResult.totalCount;
  const elementsCount = elementsResult.totalCount;
  const requirementsCount = requirementsResult.totalCount;
  const activeAnnouncements = announcementsData?.data?.filter !== undefined ? announcementsData.data.filter((a) => a.isActive).length : 0;

  const regionsCount = Array.isArray(regionsData?.data) ? regionsData.data.length : (typeof regionsData?.data === "number" ? regionsData.data : 0);
  const provincesCount = Array.isArray(provincesData?.data) ? provincesData.data.length : (typeof provincesData?.data === "number" ? provincesData.data : 0);
  const municipalitiesCount = Array.isArray(municipalitiesData?.data) ? municipalitiesData.data.length : 0;
  const barangaysCount = Array.isArray(barangaysData?.data) ? barangaysData.data.length : 0;

  const systemStats = [
    {
      name: "Tenants & Branches",
      count: tenantsCount,
      loading: tenantsLoading,
      subtitle: "Registered Organizations",
      icon: Building2,
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgGradient: "from-emerald-500/10 to-transparent",
      href: "/tenants",
    },
    {
      name: "Support Users",
      count: supportUsersCount,
      loading: supportUsersLoading,
      subtitle: "Global System Users",
      icon: HeadphonesIcon,
      textColor: "text-sky-600 dark:text-sky-400",
      borderColor: "border-sky-500/30",
      bgGradient: "from-sky-500/10 to-transparent",
      href: "/support-users",
    },
    {
      name: "Security Roles",
      count: rolesCount,
      loading: rolesLoading,
      subtitle: "System & Tenant Roles",
      icon: KeyRound,
      textColor: "text-violet-600 dark:text-violet-400",
      borderColor: "border-violet-500/30",
      bgGradient: "from-violet-500/10 to-transparent",
      href: "/roles-permissions",
    },
    {
      name: "Active Announcements",
      count: activeAnnouncements > 0 ? activeAnnouncements : announcementsCount,
      loading: announcementsLoading,
      subtitle: "System Broadcasts",
      icon: Megaphone,
      textColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-500/30",
      bgGradient: "from-amber-500/10 to-transparent",
      href: "/announcements",
      badge: activeAnnouncements > 0 ? "live" : undefined,
    },
  ];

  const serviceStats = [
    {
      name: "Service Categories",
      count: categoriesCount,
      loading: false,
      subtitle: "Certificate, Permit, Accreditation…",
      icon: Layers,
      textColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-500/30",
      bgGradient: "from-indigo-500/10 to-transparent",
      href: "/services",
    },
    {
      name: "Services Catalog",
      count: servicesCount,
      loading: servicesLoading,
      subtitle: "Across All Categories",
      icon: FileText,
      textColor: "text-cyan-600 dark:text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgGradient: "from-cyan-500/10 to-transparent",
      href: "/services",
    },
    {
      name: "Master Requirements",
      count: requirementsCount,
      loading: requirementsResult.isLoading,
      subtitle: "Documentary Requirements Pool",
      icon: ClipboardList,
      textColor: "text-rose-600 dark:text-rose-400",
      borderColor: "border-rose-500/30",
      bgGradient: "from-rose-500/10 to-transparent",
      href: "/services",
    },
    {
      name: "Fee Master Catalog",
      count: feesCount,
      loading: feesResult.isLoading,
      subtitle: "Regulatory Fee Definitions",
      icon: CircleDollarSign,
      textColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-500/30",
      bgGradient: "from-yellow-500/10 to-transparent",
      href: "/fees",
    },
    {
      name: "Exam Schedules",
      count: schedulesCount,
      loading: schedulesLoading,
      subtitle: `${publishedSchedules} Published`,
      icon: Calendar,
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-500/30",
      bgGradient: "from-purple-500/10 to-transparent",
      href: "/services",
      badge: publishedSchedules > 0 ? `${publishedSchedules} live` : undefined,
    },
    {
      name: "Service Notes",
      count: notesCount,
      loading: notesResult.isLoading,
      subtitle: "Regulatory Guideline Notes",
      icon: BookOpen,
      textColor: "text-teal-600 dark:text-teal-400",
      borderColor: "border-teal-500/30",
      bgGradient: "from-teal-500/10 to-transparent",
      href: "/services",
    },
    {
      name: "SOA Note Templates",
      count: soaNotesCount,
      loading: soaNotesResult.isLoading,
      subtitle: "Billing Terms & Templates",
      icon: FileText,
      textColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-500/30",
      bgGradient: "from-indigo-500/10 to-transparent",
      href: "/soa-notes",
    },
    {
      name: "Master Elements",
      count: elementsCount,
      loading: elementsResult.isLoading,
      subtitle: "Catalog Elements Pool",
      icon: Layers,
      textColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-500/30",
      bgGradient: "from-orange-500/10 to-transparent",
      href: "/services",
    },
  ];

  const geoStats = [
    { name: "Regions", count: regionsCount, loading: regionsLoading, icon: MapPin, textColor: "text-cyan-600 dark:text-cyan-400", href: "/regions" },
    { name: "Provinces", count: provincesCount, loading: provincesLoading, icon: Building, textColor: "text-blue-600 dark:text-blue-400", href: "/provinces" },
    { name: "Municipalities", count: municipalitiesCount, loading: municipalitiesLoading, icon: Building2, textColor: "text-indigo-600 dark:text-indigo-400", href: "/municipalities" },
    { name: "Barangays", count: barangaysCount, loading: barangaysLoading, icon: Home, textColor: "text-purple-600 dark:text-purple-400", href: "/barangays" },
  ];

  const quickLinks = [
    { label: "Manage Tenants", desc: "Register branches & assign region ownership", icon: Building2, color: "text-emerald-600 dark:text-emerald-400", hover: "hover:border-emerald-500/40", href: "/tenants" },
    { label: "Support Users", desc: "Unlock accounts, revoke sessions & diagnostics", icon: HeadphonesIcon, color: "text-sky-600 dark:text-sky-400", hover: "hover:border-sky-500/40", href: "/support-users" },
    { label: "Roles & Permissions", desc: "Manage access control policy and role matrices", icon: KeyRound, color: "text-violet-600 dark:text-violet-400", hover: "hover:border-violet-500/40", href: "/roles-permissions" },
    { label: "Services Catalog", desc: "Configure services, variants, checklists & fees", icon: FileText, color: "text-indigo-600 dark:text-indigo-400", hover: "hover:border-indigo-500/40", href: "/services" },
    { label: "Announcements", desc: "Broadcast system-wide messages and alerts", icon: BellRing, color: "text-amber-600 dark:text-amber-400", hover: "hover:border-amber-500/40", href: "/announcements" },
    { label: "System Config", desc: "Platform-wide settings and configuration values", icon: Settings, color: "text-slate-700 dark:text-slate-300", hover: "hover:border-slate-400 dark:hover:border-slate-600", href: "/system-config" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-10 transition-colors duration-200">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Admin Dashboard</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 ml-7">
            Real-time configuration overview for the NTC-EDGE ecosystem.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
          <UserCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Active Scope:</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            {activeRole.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* System & Access Stats */}
      <div>
        <SectionHeader icon={ShieldCheck} title="System & Access" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {systemStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>

      {/* Services & Catalog Stats */}
      <div>
        <SectionHeader icon={TrendingUp} title="Services & Catalog" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {serviceStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>

      {/* Bottom row: Quick Links + Geo Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-2">
          <SectionHeader icon={ArrowRight} title="Quick Actions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={`p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 ${link.hover} transition-colors group space-y-1.5 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${link.color}`}>
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </span>
                  <ArrowRight className={`w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:${link.color} transition-colors`} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Geographic Reference */}
        <div>
          <SectionHeader icon={MapPin} title="Geographic Reference" />
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm dark:shadow-xl space-y-3">
            {geoStats.map((stat, i) => (
              <Link
                key={i}
                href={stat.href}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 hover:border-slate-400 dark:hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{stat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {stat.loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                  ) : (
                    <span className={`font-mono text-sm font-bold ${stat.textColor}`}>
                      {stat.count.toLocaleString()}
                    </span>
                  )}
                  <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
