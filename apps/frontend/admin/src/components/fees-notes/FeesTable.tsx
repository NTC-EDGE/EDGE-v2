"use client";

import React, { useState, useEffect } from "react";
import { Coins, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Fee, ServiceFee } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface FeesTableProps {
  fees: Fee[];
  serviceFees: ServiceFee[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  onEdit: (item: Fee) => void;
  onDelete: (item: Fee) => void;
  onToggleStatus: (item: Fee) => void;
}

export function FeesTable({
  fees,
  serviceFees,
  loading,
  canManage,
  searchTerm,
  onEdit,
  onDelete,
  onToggleStatus,
}: FeesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredFees = fees.filter(
    (f) =>
      f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const paginatedFees = filteredFees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
            ) : filteredFees.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <Coins className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No fees configured</p>
                  <p className="text-xs text-slate-500">There are no administrative fees registered in the catalog yet.</p>
                </td>
              </tr>
            ) : (
              paginatedFees.map((item) => {
                const isUsedInServiceFee = serviceFees.some((sf) => sf.feeId === item.id);
                const isDeleteAllowed = item.isActive === false && !isUsedInServiceFee;

                const menuItems: ActionMenuItem[] = [
                  {
                    label: item.isActive ? "Set Inactive" : "Set Active",
                    icon: item.isActive ? XCircle : CheckCircle,
                    onClick: () => onToggleStatus(item),
                  },
                ];

                if (item.isActive === false) {
                  menuItems.push({
                    label: "Edit Fee Details",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  });
                }

                if (isDeleteAllowed) {
                  menuItems.push({
                    label: "Delete Fee",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  });
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{item.description ?? "—"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onToggleStatus(item)}
                        disabled={!canManage}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
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

      {filteredFees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredFees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
