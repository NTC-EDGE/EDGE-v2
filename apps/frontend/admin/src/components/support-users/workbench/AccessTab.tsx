import React from "react";
import { Globe, UserCheck, CheckCircle2 } from "lucide-react";
import { GlobalSupportUser, UserDiagnosticDetails } from "@edge/api";

interface AccessTabProps {
  user: GlobalSupportUser;
  diagnosticData: UserDiagnosticDetails;
}

export function AccessTab({ user, diagnosticData }: AccessTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" /> Regional Access & Tenant Assignment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-slate-400 font-semibold">Primary Regional Domain</div>
            <div className="text-white font-medium">{user.regionName}</div>
            <div className="text-[10px] text-slate-500">Region ID: {user.regionId}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-slate-400 font-semibold">Assigned Tenant Office</div>
            <div className="text-white font-medium">{user.tenantName ?? "Global Platform Level"}</div>
            <div className="text-[10px] text-slate-500">Field Office: {user.fieldOfficeName ?? "Headquarters"}</div>
          </div>
        </div>
      </div>

      {/* Effective Permissions Matrix */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" /> Evaluated Effective Permissions
        </h3>
        <div className="flex flex-wrap gap-2">
          {diagnosticData.effectivePermissions.map((perm) => (
            <span key={perm} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {perm}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
