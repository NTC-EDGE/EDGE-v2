"use client";

import React from "react";
import { Receipt, Loader2 } from "lucide-react";
import { Tenant } from "@edge/api";
import { useApi } from "@/services/api";

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
  const { useQuery } = useApi();
  const { data: fetchedTx, isLoading } = useQuery<RegionalTransaction[]>(
    `/api/v2/tenants/${currentTenant.id}/transactions`
  );
  const currentTransactions: RegionalTransaction[] = fetchedTx ?? [];

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-white">Regional Permit & Regulatory Transactions</h3>
        <p className="text-xs text-slate-400">Financial reference records for spectrum permits and inspections.</p>
      </div>

      <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            <span>Loading regional transaction records...</span>
          </div>
        ) : currentTransactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No regional permit or fee transactions recorded yet.
          </div>
        ) : (
          currentTransactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {tx.refNo}
                  </span>
                  <span className="text-sm font-bold text-white">{tx.applicantName}</span>
                </div>
                <p className="text-xs text-slate-400">{tx.serviceType}</p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-sm font-extrabold text-white font-mono">
                  ₱{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    tx.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
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
