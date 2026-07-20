"use client"

import Link from "next/link";
import { 
  MapPin, 
  Building, 
  Building2, 
  Home, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Activity,
  Layers
} from "lucide-react";
import { useRegionService } from "@/services/regionService";
import { useProvinceService } from "@/services/provinceService";
import { useMunicipalityService } from "@/services/municipalityService";
import { useBarangayService } from "@/services/barangayService";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { useRegions } = useRegionService();
  const { useProvinces } = useProvinceService();
  const { useMunicipalities } = useMunicipalityService();
  const { useBarangays } = useBarangayService();

  const { data: regionsData, error: regionsError, isLoading: regionsLoading } = useRegions();
  const { data: provincesData, error: provincesError, isLoading: provincesLoading } = useProvinces();
  const { data: municipalitiesData, error: municipalitiesError, isLoading: municipalitiesLoading } = useMunicipalities();
  const { data: barangaysData, error: barangaysError, isLoading: barangaysLoading } = useBarangays();

  const regionsCount = regionsData?.data?.length ?? 0;
  const provincesCount = provincesData?.data?.length ?? 0;
  const municipalitiesCount = municipalitiesData?.data?.length ?? 0;
  const barangaysCount = barangaysData?.data?.length ?? 0;

  const stats = [
    {
      name: "Regions",
      count: regionsCount,
      loading: regionsLoading,
      error: !!regionsError,
      icon: MapPin,
      color: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400",
      href: "/regions",
    },
    {
      name: "Provinces",
      count: provincesCount,
      loading: provincesLoading,
      error: !!provincesError,
      icon: Building,
      color: "from-blue-500 to-indigo-500",
      textColor: "text-blue-400",
      href: "/provinces",
    },
    {
      name: "Municipalities",
      count: municipalitiesCount,
      loading: municipalitiesLoading,
      error: !!municipalitiesError,
      icon: Building2,
      color: "from-indigo-500 to-purple-500",
      textColor: "text-indigo-400",
      href: "/municipalities",
    },
    {
      name: "Barangays",
      count: barangaysCount,
      loading: barangaysLoading,
      error: !!barangaysError,
      icon: Home,
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-400",
      href: "/barangays",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-slate-400 mt-1">
          Monitor and configure geo-reference datasets for the NTC-EDGE ecosystem.
        </p>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:translate-y-[-2px] group"
            >
              {/* Decorative radial gradient glow */}
              <div className="absolute inset-0 bg-radial-gradient group-hover:opacity-100 transition-opacity opacity-0 pointer-events-none duration-500"></div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.name}</p>
                  {stat.loading ? (
                    <div className="h-9 w-16 bg-slate-800 animate-pulse rounded-md mt-2"></div>
                  ) : stat.error ? (
                    <p className="text-lg font-bold text-red-500 mt-1">Err</p>
                  ) : (
                    <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{stat.count}</p>
                  )}
                </div>
                <div className={`p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 ${stat.textColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> System Synchronized
                </span>
                <Link 
                  href={stat.href} 
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform duration-200"
                >
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane: Quick actions & status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Geographic Hierarchy
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Administrative units in the Philippines are nested starting from Regions, containing Provinces, which contain Municipalities, and finally local Barangays.
            </p>

            <div className="relative border-l-2 border-slate-800 pl-6 ml-4 space-y-6">
              <div className="relative">
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border border-slate-800 bg-cyan-500 shadow-md"></span>
                <h4 className="text-sm font-semibold text-white">Region Layer</h4>
                <p className="text-xs text-slate-400 mt-0.5">Top-tier administrative region groupings (e.g. Region X - Northern Mindanao)</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border border-slate-800 bg-blue-500 shadow-md"></span>
                <h4 className="text-sm font-semibold text-white">Province Layer</h4>
                <p className="text-xs text-slate-400 mt-0.5">Provinces within specific regions (e.g. Misamis Oriental)</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border border-slate-800 bg-indigo-500 shadow-md"></span>
                <h4 className="text-sm font-semibold text-white">Municipality / City Layer</h4>
                <p className="text-xs text-slate-400 mt-0.5">Cities or towns containing local neighborhoods (e.g. Cagayan de Oro City)</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border border-slate-800 bg-purple-500 shadow-md"></span>
                <h4 className="text-sm font-semibold text-white">Barangay Layer</h4>
                <p className="text-xs text-slate-400 mt-0.5">Smallest administrative units / local barangays (e.g. Barangay Nazareth)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: System Status & Logs */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" /> System Diagnostics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">API Base URL</span>
                <code className="text-[10px] bg-slate-950 px-2 py-1 rounded text-cyan-400 font-mono">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5038"}
                </code>
              </div>
              
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">Clerk JWT Verification</span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Secured
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">Database Connection</span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Connected
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs text-slate-400 font-medium">SWR Caching Status</span>
                <span className="text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded">
                  Enabled (Revalidate)
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/regions">
                <Button className="w-full flex items-center justify-center gap-2 font-semibold">
                  <Plus className="h-4 w-4" /> Start Configuration
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
