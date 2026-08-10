"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Boxes,
  KeyRound,
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

  const activeLinkClass =
    "bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-600/30 dark:to-slate-800 text-indigo-900 dark:text-white border border-indigo-200 dark:border-indigo-500/30 shadow-sm";
  const inactiveLinkClass =
    "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NTC Logo"
            width={120}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
          <span className="font-bold text-slate-800 dark:text-white text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-72 bg-slate-50/90 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 transition-colors duration-200 ${
          mobileOpen ? "block" : "hidden md:flex"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="NTC Logo"
              width={140}
              height={38}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Admin
            </span>
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
                isActive("/") && pathname === "/" ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Tech Support & Helpdesk Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tech Support & Diagnostics</p>
            </div>

            <Link
              href="/support-users"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/support-users") ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                <span>Global User Directory</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 font-mono">Support</span>
            </Link>

            <Link
              href="/audit-logs"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/audit-logs") ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span>Audit Logs</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-mono">Logs</span>
            </Link>

            <Link
              href="/error-logs"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/error-logs") ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                <span>Error Logs</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 font-mono">Errors</span>
            </Link>
          </div>

          {/* System Admin Configurations Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Admin Configurations</p>
            </div>

            {isRegionAdmin && (
              <Link
                href="/tenants"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/tenants") ? activeLinkClass : inactiveLinkClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <TenantIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Tenants & Branches</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">System/Region</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/services"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/services") ? activeLinkClass : inactiveLinkClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <Boxes className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  <span>Services Catalog</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/announcements"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/announcements") ? activeLinkClass : inactiveLinkClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <Megaphone className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  <span>Announcements</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/system-config"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/system-config") ? activeLinkClass : inactiveLinkClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  <span>System Configuration</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/notification-templates"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/notification-templates") ? activeLinkClass : inactiveLinkClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  <span>Email Templates</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/fees"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/fees") ? activeLinkClass : inactiveLinkClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <CircleDollarSign className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  <span>Fees</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">System</span>
              </Link>
            )}

            {isSystemAdmin && (
              <Link
                href="/roles-permissions"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/roles-permissions") ? activeLinkClass : inactiveLinkClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  <span>Roles &amp; Permissions</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">System</span>
              </Link>
            )}
          </div>

          {/* Geographics Reference Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Geographic References</p>
            </div>

            <Link
              href="/regions"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/regions") ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Regions</span>
            </Link>

            <Link
              href="/provinces"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/provinces") ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Provinces</span>
            </Link>

            <Link
              href="/municipalities"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/municipalities") ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Municipalities</span>
            </Link>

            <Link
              href="/barangays"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive("/barangays") ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <Home className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Barangays</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserButton />
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{roleLabel[activeRole]}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">NTC EDGE Portal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
