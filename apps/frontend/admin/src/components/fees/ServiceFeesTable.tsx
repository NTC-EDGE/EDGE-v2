"use client";

import React from "react";
import { Boxes, Coins, Settings2, Tag } from "lucide-react";
import { ServiceFeeGroup } from "@edge/api";
import { Button } from "@/components/ui/button";

export interface ServiceFeesTableProps {
  groups: ServiceFeeGroup[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  canManage: boolean;
  onManageFees: (group: ServiceFeeGroup) => void;
}

export function ServiceFeesTable({
  groups = [],
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  canManage,
  onManageFees,
}: ServiceFeesTableProps) {
  const safeGroups = Array.isArray(groups) ? groups : [];

  if (loading && safeGroups.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-sm font-medium">Loading service rate configurations...</p>
      </div>
    );
  }

  if (safeGroups.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
        <p className="font-semibold text-slate-300">No service fees configured</p>
        <p className="text-xs text-slate-500">
          No fees have been mapped to services catalog items yet.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Service Name & Code</th>
                <th className="py-3.5 px-6">Payment Links</th>
                <th className="py-3.5 px-6">Total Base Charge</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {safeGroups.map((group) => {
                const feeCount = group.fees?.length ?? 0;
                return (
                  <tr
                    key={group.serviceId}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => onManageFees(group)}
                  >
                    <td className="py-4 px-6 min-w-[200px] max-w-sm break-words whitespace-normal">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
                          <Boxes className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="font-bold text-sm text-slate-900 dark:text-white break-words">
                              {group.serviceName ?? "Unknown Service"}
                            </span>
                            {group.serviceCode && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] border border-slate-200 dark:border-slate-700 break-words">
                                {group.serviceCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                            Service Level Fixed Fee Assignment
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 min-w-[160px] max-w-xs break-words whitespace-normal">
                      <div className="flex flex-col gap-1.5 min-w-0 break-words">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 w-fit shrink-0 break-words">
                          {feeCount} {feeCount === 1 ? "Fee Linked" : "Fees Linked"}
                        </span>
                        {group.fees && group.fees.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {group.fees.map((f) => (
                              <span
                                key={f.id}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 break-words whitespace-normal"
                                title={f.feeName ?? undefined}
                              >
                                {f.feeCode}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 min-w-[130px] whitespace-nowrap">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold inline-flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5" />
                        ₱
                        {(group.totalAmount ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onManageFees(group);
                        }}
                        className="bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-600 dark:hover:text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>{canManage ? "Manage Fees" : "View Fees"}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing page {currentPage} of {Math.max(totalPages, 1)} (
              {totalCount} total services)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs"
            >
              {[10, 25, 50, 100].map((sz) => (
                <option key={sz} value={sz}>
                  {sz} per page
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
