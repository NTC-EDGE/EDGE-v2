import React from "react";
import { Search, Globe, Filter } from "lucide-react";
import { Region } from "@edge/api";

interface SupportFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  regionFilter: string;
  onRegionChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  regions: Region[];
}

export function SupportFilterToolbar({
  searchTerm,
  onSearchChange,
  regionFilter,
  onRegionChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
  regions,
}: SupportFilterToolbarProps) {
  return (
    <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 transition-colors duration-200">
      {/* Real-time Global Search */}
      <div className="relative w-full lg:w-96">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Name, Email, Phone, or Tenant..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Region Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 shrink-0">
          <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Region:</span>
        </div>
        <select
          value={regionFilter}
          onChange={(e) => onRegionChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer max-w-[200px] truncate"
        >
          <option value="ALL">All Regions (Global Directory)</option>
          {regions.map((reg) => (
            <option key={reg.id} value={reg.id}>
              {reg.name}
            </option>
          ))}
        </select>

        {/* Account Status Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 shrink-0 ml-1">
          <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="active">Active</option>
          <option value="locked">Locked Out 🔒</option>
          <option value="suspended">Suspended ⚠️</option>
          <option value="pending_verification">Pending Verification</option>
        </select>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
        >
          <option value="ALL">All Assigned Roles</option>
          <option value="System Administrator">System Administrator</option>
          <option value="Regional Director">Regional Director</option>
          <option value="Tenant Administrator">Tenant Administrator</option>
          <option value="Licensing Officer">Licensing Officer</option>
          <option value="Field Inspector">Field Inspector</option>
          <option value="Public Telecom Applicant">Public Telecom Applicant</option>
        </select>
      </div>
    </div>
  );
}
