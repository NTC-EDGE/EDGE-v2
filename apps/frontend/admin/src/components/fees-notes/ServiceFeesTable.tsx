"use client";

import React, { useState, useEffect } from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { ServiceFee, Fee } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";
import { ServiceCatalogItem } from "@/services/feesNotesService";

export interface ServiceFeesTableProps {
  serviceFees: ServiceFee[];
  fees: Fee[];
  services: ServiceCatalogItem[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  onEdit: (item: ServiceFee) => void;
  onDelete: (item: ServiceFee) => void;
}

export function ServiceFeesTable({
  serviceFees,
  fees,
  services,
  loading,
  canManage,
  searchTerm,
  onEdit,
  onDelete,
}: ServiceFeesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredServiceFees = serviceFees.filter((sf) => {
    const serviceName = services.find((s) => s.id === sf.serviceId)?.name ?? "";
    const fee = fees.find((f) => f.id === sf.feeId);
    const feeName = fee?.name ?? "";
    const feeCode = fee?.code ?? "";

    return (
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sf.amount.toString().includes(searchTerm)
    );
  });

  const paginatedServiceFees = filteredServiceFees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Service Standard</th>
              <th className="px-6 py-4">Mapped Fee</th>
              <th className="px-6 py-4">Charge Amount</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading service fees catalog...</span>
                </td>
              </tr>
            ) : filteredServiceFees.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                  <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No service fees configured</p>
                  <p className="text-xs text-slate-500">No fees have been mapped to services catalog items yet.</p>
                </td>
              </tr>
            ) : (
              paginatedServiceFees.map((item) => {
                const serviceName = services.find((s) => s.id === item.serviceId)?.name ?? "Unknown Service";
                const fee = fees.find((f) => f.id === item.feeId);
                const menuItems: ActionMenuItem[] = [
                  {
                    label: "Modify Charge",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  },
                  {
                    label: "Remove Charge Rule",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  },
                ];

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-200">{serviceName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-emerald-400">{fee?.code ?? "UNKNOWN"}</span>
                        <span className="text-xs text-slate-400">{fee?.name ?? "Unknown Fee"}</span>
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

      {filteredServiceFees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredServiceFees.length}
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
