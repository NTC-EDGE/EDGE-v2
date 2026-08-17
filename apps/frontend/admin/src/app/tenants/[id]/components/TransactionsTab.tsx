"use client";

import React from "react";
import { Loader2, Receipt } from "lucide-react";
import { Tenant } from "@edge/api";
import { useTenantService } from "@/services/tenantService";

export interface RegionalTransaction {
  id: string;
  refNo: string;
  applicantName: string;
  serviceType: string;
  amount: number;
  paymentStatus: string;
  date: string;
}

interface TransactionsTabProps {
  currentTenant: Tenant;
}

export function TransactionsTab({ currentTenant }: TransactionsTabProps) {
  const { useTenantTransactions } = useTenantService();
  const { data: fetchedTx, isLoading } = useTenantTransactions(currentTenant.id);
  const currentTransactions: RegionalTransaction[] = fetchedTx ?? [];

  return (
    <div className="space-y-4 min-w-0">
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Regional Permit & Regulatory Transactions</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">Financial reference records for spectrum permits and inspections.</p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/60 min-w-0">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-600 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400 mb-2" />
            <span className="text-xs font-semibold">Loading regional transaction records...</span>
          </div>
        ) : currentTransactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 border border-teal-500/20 shadow-sm">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Transactions Recorded</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              There are no permit, fee, or order of payment transactions recorded for this tenant office yet.
            </p>
          </div>
        ) : (
          currentTransactions.map((tx) => (
            <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors min-w-0">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 shrink-0">
                    {tx.refNo}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white break-words">{tx.applicantName}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 break-words">{tx.serviceType}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/80 dark:border-slate-800/60">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  ₱{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    tx.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}>
                    {tx.paymentStatus}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{tx.date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
