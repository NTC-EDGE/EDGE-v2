import React from "react";
import { Lock, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { AccountStatus } from "@edge/api";

interface StatusBadgeProps {
  status: AccountStatus;
  isLocked: boolean;
}

export function StatusBadge({ status, isLocked }: StatusBadgeProps) {
  if (isLocked || status === "locked") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <Lock className="w-3 h-3 text-rose-400" /> Locked Out
      </span>
    );
  }
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
        </span>
      );
    case "suspended":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-400" /> Suspended
        </span>
      );
    case "pending_verification":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <Clock className="w-3 h-3 text-sky-400" /> Pending Verification
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
          {status}
        </span>
      );
  }
}
