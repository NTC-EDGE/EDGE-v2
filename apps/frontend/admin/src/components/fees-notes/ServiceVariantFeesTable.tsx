"use client";

import React, { useState, useEffect } from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { ServiceVariantFee } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface ServiceVariantFeesTableProps {
  serviceVariantFees: ServiceVariantFee[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  onEdit: (item: ServiceVariantFee) => void;
  onDelete: (item: ServiceVariantFee) => void;
}

export function ServiceVariantFeesTable({
  serviceVariantFees,
  loading,
  canManage,
  searchTerm,
  onEdit,
  onDelete,
}: ServiceVariantFeesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = serviceVariantFees.filter((svf) => {
    const serviceName = svf.serviceVariant?.serviceName ?? "";
    const serviceVariantType = svf.serviceVariant?.type ?? "";
    const feeCode = svf.feeCode ?? "";
    const feeName = svf.feeName ?? "";

    return (
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceVariantType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svf.amount.toString().includes(searchTerm)
    );
  });

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Variant Type</th>
              <th className="px-6 py-4">Mapped Fee</th>
              <th className="px-6 py-4">Amount</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading service variant fees...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No service variant fees mapped</p>
                  <p className="text-xs text-slate-500">Map fee codes directly to service variants.</p>
                </td>
              </tr>
            ) : (
              paginated.map((item) => {
                const menuItems: ActionMenuItem[] = [
                  {
                    label: "Modify Fee Mapping",
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
                    <td className="px-6 py-4 font-semibold text-slate-200">{item.serviceVariant?.serviceName ?? "Unknown Service"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                        {item.serviceVariant?.type ?? "—"}
                      </span>
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

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
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
