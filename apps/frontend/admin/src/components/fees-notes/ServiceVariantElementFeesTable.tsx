"use client";

import React from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { ServiceVariantElementFee } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface ServiceVariantElementFeesTableProps {
  serviceVariantElementFees: ServiceVariantElementFee[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  canManage: boolean;
  onEdit: (item: ServiceVariantElementFee) => void;
  onDelete: (item: ServiceVariantElementFee) => void;
}

export function ServiceVariantElementFeesTable({
  serviceVariantElementFees,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  canManage,
  onEdit,
  onDelete,
}: ServiceVariantElementFeesTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Service & Variant</th>
              <th className="px-6 py-4">Billing Element</th>
              <th className="px-6 py-4">Mapped Fee</th>
              <th className="px-6 py-4">Amount</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading service variant element fees...</span>
                </td>
              </tr>
            ) : serviceVariantElementFees.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No service variant element fees mapped</p>
                  <p className="text-xs text-slate-500">Map fee codes to service variants and billing elements.</p>
                </td>
              </tr>
            ) : (
              serviceVariantElementFees.map((item) => {
                const menuItems: ActionMenuItem[] = [
                  {
                    label: "Modify Element Fee",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  },
                  {
                    label: "Remove Mapping",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  },
                ];

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{item.serviceVariant?.serviceName ?? "Unknown Service"}</span>
                        <span className="text-xs text-slate-450 italic">{item.serviceVariant?.type ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-indigo-400">{item.elementCode ?? "UNKNOWN"}</span>
                        <span className="text-xs text-slate-400">{item.elementName ?? "Unknown Element"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-emerald-400">{item.feeCode ?? "UNKNOWN"}</span>
                        <span className="text-xs text-slate-400">{item.feeName ?? "Unknown Fee"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white text-sm bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-lg">
                        ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <ActionMenu items={menuItems} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {serviceVariantElementFees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
