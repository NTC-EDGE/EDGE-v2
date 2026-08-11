"use client";

import React, { useState } from "react";
import {
  Plus,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tenant, Role } from "@edge/api";
import { useRoleService } from "@/services/roleService";
import { Loader2 } from "lucide-react";

interface RolesTabProps {
  currentTenant: Tenant;
  showToast: (msg: string) => void;
}

export function RolesTab({ currentTenant, showToast }: RolesTabProps) {
  const { useRoles } = useRoleService();
  const { data: fetchedRoles, isLoading: loadingRoles } = useRoles(currentTenant.id);
  const rolesList: Role[] = fetchedRoles ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Tenant Roles & Access Policy Matrix</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Configured security roles and permission capabilities for this tenant domain.</p>
        </div>
        <Button
          onClick={() => {
            showToast("Role creation is configured via global policies.");
          }}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Security Role</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesList.map((role) => (
          <div key={role.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" /> {role.name}
              </h4>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-50 dark:bg-slate-900 text-purple-600 dark:text-slate-400 border border-purple-200 dark:border-slate-800">
                {role.key}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
