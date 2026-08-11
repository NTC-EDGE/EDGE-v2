import React from "react";
import { LifeBuoy, Shield, User, Lock, ShieldCheck, Ticket } from "lucide-react";

interface SupportHeaderBannerProps {
  metrics: {
    total: number;
    locked: number;
    mfaCount: number;
    openTickets: number;
  };
}

export function SupportHeaderBanner({ metrics }: SupportHeaderBannerProps) {
  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/95 dark:to-cyan-950/60 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-colors duration-200">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <LifeBuoy className="w-64 h-64 text-cyan-600 dark:text-cyan-400" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Technical Support & Helpdesk Directory
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Global User Directory & Troubleshooting
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Search and diagnose user accounts globally across all regions, troubleshoot login & MFA lockouts, inspect active sessions, verify regional scope permissions, and review audit logs.
          </p>
        </div>
      </div>

      {/* Global Key Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>Total Global Users</span>
            <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across all 17 regions</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>Locked Accounts</span>
            <Lock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{metrics.locked}</div>
          <div className="text-[10px] text-rose-600/80 dark:text-rose-500/80 mt-0.5">Require Support Unlock</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>MFA Enrolled</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.total > 0 ? `${Math.round((metrics.mfaCount / metrics.total) * 100)}%` : "0%"}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 mt-0.5">{metrics.mfaCount} protected accounts</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>Open Support Tickets</span>
            <Ticket className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.openTickets}</div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-500/80 mt-0.5">Pending resolution</div>
        </div>
      </div>
    </div>
  );
}
