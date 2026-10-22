"use client";

import React, { useState } from "react";
import { Loader2, Receipt, Search } from "lucide-react";
import { Tenant } from "@edge/api";
import { useTenantService } from "@/services/tenantService";
import { Pagination } from "@/components/ui/pagination";

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

function formatBackendDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function TransactionsTab({ currentTenant }: TransactionsTabProps) {
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);
  const [txSearchTerm, setTxSearchTerm] = useState("");

  const { useTenantTransactions } = useTenantService();
  const { data: fetchedTxResponse, isLoading } = useTenantTransactions(
    currentTenant.id,
    txPage,
    txPageSize,
    txSearchTerm
  );

  const currentTransactions: RegionalTransaction[] = Array.isArray(fetchedTxResponse?.data)
    ? fetchedTxResponse.data
    : Array.isArray(fetchedTxResponse)
      ? (fetchedTxResponse as unknown as RegionalTransaction[])
      : [];

  const totalCount = fetchedTxResponse?.totalCount ?? currentTransactions.length;

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Regional Permit & Regulatory Transactions</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Financial reference records for spectrum permits, orders of payment, and assessments.</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search reference #, client, or permit..."
            value={txSearchTerm}
            onChange={(e) => {
              setTxSearchTerm(e.target.value);
              setTxPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
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
              {txSearchTerm
                ? "No transactions match your search filter."
                : "There are no permit, fee, or order of payment transactions recorded for this tenant office yet."}
            </p>
          </div>
        ) : (
          currentTransactions.map((tx) => (
            <div key={tx.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors min-w-0">
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 shrink-0">
                    {tx.refNo}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{tx.applicantName}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{tx.serviceType}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/80 dark:border-slate-800/60">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  ₱{(tx.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  tx.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {tx.paymentStatus}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                  {formatBackendDateTime(tx.date)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {totalCount > 0 && (
        <Pagination
          currentPage={txPage}
          totalItems={totalCount}
          pageSize={txPageSize}
          onPageChange={setTxPage}
          onPageSizeChange={(newSize) => {
            setTxPageSize(newSize);
            setTxPage(1);
          }}
        />
      )}
    </div>
  );
}
