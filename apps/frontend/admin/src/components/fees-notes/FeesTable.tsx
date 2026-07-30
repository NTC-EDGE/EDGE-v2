"use client";

import React from "react";
import { Coins, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Fee, ServiceFee } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface FeesTableProps {
  fees: Fee[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  serviceFees: ServiceFee[];
  loading: boolean;
  canManage: boolean;
  onEdit: (item: Fee) => void;
  onDelete: (item: Fee) => void;
  onToggleStatus: (item: Fee) => void;
}

export function FeesTable({
  fees,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  serviceFees,
  loading,
  canManage,
  onEdit,
  onDelete,
  onToggleStatus,
}: FeesTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Fee Code</th>
              <th className="px-6 py-4">Fee Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Status</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading fees catalog...</span>
                </td>
              </tr>
            ) : fees.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <Coins className="w-10 h-10 mx-auto text-slate-650 mb-2" />
                  <p className="font-semibold text-slate-300">No fee codes registered</p>
                  <p className="text-xs text-slate-500">Configure administrative fee categories.</p>
                </td>
              </tr>
            ) : (
              fees.map((item) => {
                // Find services mapped to this fee code
                const mappedServices = serviceFees.filter((sf) => sf.feeId === item.id && sf.isActive !== false);

                const menuItems: ActionMenuItem[] = [
                  {
                    label: "Edit Fee Configuration",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  },
                  {
                    label: item.isActive !== false ? "Deactivate Fee Code" : "Activate Fee Code",
                    icon: item.isActive !== false ? XCircle : CheckCircle,
                    onClick: () => onToggleStatus(item),
                  },
                  {
                    label: "Delete Fee",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  },
                ];

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-400 tracking-wider uppercase select-all">
                      {item.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{item.name}</span>
                        {mappedServices.length > 0 && (
                          <span className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                            Mapped to {mappedServices.length} service{mappedServices.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {item.description || <span className="text-slate-600 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs border font-semibold inline-flex items-center gap-1 ${
                        item.isActive !== false
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-slate-800 border-slate-700 text-slate-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive !== false ? "bg-emerald-400" : "bg-slate-500"}`} />
                        {item.isActive !== false ? "Active" : "Inactive"}
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

      {fees.length > 0 && (
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
