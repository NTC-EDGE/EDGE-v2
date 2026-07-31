"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  MapPin,
  Building,
  Building2,
  Home,
  ShieldCheck,
  Building2 as TenantIcon,
  Menu,
  X,
  LifeBuoy,
  CircleDollarSign,
  ClipboardList,
  Megaphone,
  Sliders,
  Mail,
  Activity,
  AlertCircle,
  FileCheck,
  Layers
} from "lucide-react";
import { useAdminScope, AdminRoleType } from "@/lib/admin-scope-context";

export function SidebarNav() {
  const pathname = usePathname();
  const { activeRole, isSystemAdmin, isRegionAdmin } = useAdminScope();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  const roleLabel: Record<AdminRoleType, string> = {
    system_admin: "System Admin Settings",
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold text-white text-sm">NTC EDGE Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-72 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col flex-shrink-0 ${
          mobileOpen ? "block" : "hidden md:flex"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-emerald-400 p-2 rounded-xl text-slate-950 shadow-md">
              <ShieldCheck className="h-6 w-6 font-bold" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-sm">NTC EDGE</h1>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Admin Configurations</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-3 space-y-6 overflow-y-auto">
          {/* Main Group */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/") && pathname === "/"
                  ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-indigo-400" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Tech Support & Helpdesk Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tech Support & Diagnostics</p>
            </div>

            <Link
              href="/support-users"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/support-users")
                  ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-4 w-4 text-cyan-400" />
                <span>Global User Directory</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">Support</span>
            </Link>

            <Link
              href="/audit-logs"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/audit-logs")
                  ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Audit Logs</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">Logs</span>
            </Link>

            <Link
              href="/error-logs"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/error-logs")
                  ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span>Error Logs</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">Errors</span>
            </Link>
          </div>

          {/* System Admin Configurations Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Configurations</p>
            </div>

            {isRegionAdmin && (
              <Link
                href="/tenants"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/tenants")
                    ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <TenantIcon className="h-4 w-4 text-emerald-400" />
                  <span>Tenants & Branches</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">System/Region</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/announcements"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/announcements")
                    ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Megaphone className="h-4 w-4 text-purple-400" />
                  <span>Announcements</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/system-config"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/system-config")
                    ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  <span>System Configuration</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/notification-templates"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/notification-templates")
                    ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span>Email Templates</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/fees-notes"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/fees-notes")
                    ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CircleDollarSign className="h-4 w-4 text-amber-400" />
                  <span>Fees & Notes</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/requirements"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/requirements")
                    ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-sky-400" />
                  <span>Requirements</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/document-types"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/document-types")
                    ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  <span>Document Types</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/application-statuses"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/application-statuses")
                    ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span>Application Statuses</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">System</span>
              </Link>
            )}
          </div>

          {/* Geographics Reference Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Geographic References</p>
            </div>

            <Link
              href="/regions"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/regions")
                  ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>Regions</span>
            </Link>

            <Link
              href="/provinces"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/provinces")
                  ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Building className="h-4 w-4 text-slate-400" />
              <span>Provinces</span>
            </Link>

            <Link
              href="/municipalities"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/municipalities")
                  ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>Municipalities</span>
            </Link>

            <Link
              href="/barangays"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/barangays")
                  ? "bg-gradient-to-r from-indigo-600/30 to-slate-800 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Home className="h-4 w-4 text-slate-400" />
              <span>Barangays</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserButton />
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{roleLabel[activeRole]}</p>
              <p className="text-[10px] text-emerald-400 font-mono truncate">NTC EDGE Portal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
