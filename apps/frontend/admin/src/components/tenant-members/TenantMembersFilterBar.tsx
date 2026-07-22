import React from "react";
import { Search, Filter, Building } from "lucide-react";
import { Tenant, FieldOffice } from "@edge/api";

interface TenantMembersFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTenantFilter: string;
  onTenantFilterChange: (value: string) => void;
  selectedFieldOfficeFilter: string;
  onFieldOfficeFilterChange: (value: string) => void;
  tenants: Tenant[];
  fieldOffices: FieldOffice[];
}

export function TenantMembersFilterBar({
  searchTerm,
  onSearchChange,
  selectedTenantFilter,
  onTenantFilterChange,
  selectedFieldOfficeFilter,
  onFieldOfficeFilterChange,
  tenants,
  fieldOffices,
}: TenantMembersFilterBarProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="relative w-full lg:w-72">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search member name, email, or position..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Tenant:</span>
        </div>
        <select
          value={selectedTenantFilter}
          onChange={(e) => onTenantFilterChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer max-w-xs truncate"
        >
          <option value="ALL">All Tenants ({tenants.length})</option>
          {tenants.map((ten) => (
            <option key={ten.id} value={ten.id}>
              {ten.name} ({ten.code})
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 ml-2">
          <Building className="w-3.5 h-3.5 text-emerald-400" />
          <span>Field Office:</span>
        </div>
        <select
          value={selectedFieldOfficeFilter}
          onChange={(e) => onFieldOfficeFilterChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer max-w-xs truncate"
        >
          <option value="ALL">All Field Offices ({fieldOffices.length})</option>
          {fieldOffices.map((fo) => (
            <option key={fo.id} value={fo.id}>
              {fo.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
