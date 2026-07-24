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
  ChevronDown,
  UserCheck,
  Menu,
  X,
  LifeBuoy,
  CircleDollarSign,
  ClipboardList
} from "lucide-react";
import { useAdminScope, AdminRoleType } from "@/lib/admin-scope-context";

export function SidebarNav() {
  const pathname = usePathname();
  const { activeRole, setActiveRole, isSystemAdmin, isRegionAdmin, isTenantAdmin } = useAdminScope();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  const roleLabel: Record<AdminRoleType, string> = {
    system_admin: "System Admin",
    region_admin: "Region Admin",
    tenant_admin: "Tenant Admin",
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

        {/* Role Scope Switcher Widget */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
              Active Admin Scope
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
              Demo Mode
            </span>
          </div>
          <div className="relative">
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as AdminRoleType)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none cursor-pointer pr-8"
            >
              <option value="system_admin">👑 System Admin (Full Access)</option>
              <option value="region_admin">🌐 Region Admin Scope</option>
              <option value="tenant_admin">🏢 Tenant / Organization Admin Scope</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-tight">
            {activeRole === "system_admin" && "Access all tenants, members, system access control, and region fee rules."}
            {activeRole === "region_admin" && "Manage regional tenants, members, and region fee configurations."}
            {activeRole === "tenant_admin" && "Manage tenant users, positions, divisions, and member details."}
          </p>
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

          {/* Tech Support & Diagnostics Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tech Support & Helpdesk</p>
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
          </div>

          {/* Admin Configurations Group */}
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
