import React from "react";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TenantMembersHeaderProps {
  canManage: boolean;
  onOpenAssign: () => void;
}

export function TenantMembersHeader({ canManage, onOpenAssign }: TenantMembersHeaderProps) {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Users className="w-64 h-64 text-sky-400" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Tenant & Field Office Member Assignment
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Tenant Members & Field Staff
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Tenants and Region Admins can assign users to tenants or regional extension field offices, manage roles, divisions, positions, and salary grades.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={onOpenAssign}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/25 px-5 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Assign New Member
          </Button>
        )}
      </div>
    </div>
  );
}
