"use client";

import React, { useMemo } from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { ServiceFee } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

export interface ServiceFeesTableProps {
  serviceFees: ServiceFee[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  canManage: boolean;
  onEdit: (item: ServiceFee) => void;
  onDelete: (item: ServiceFee) => void;
}

export function ServiceFeesTable({
  serviceFees,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  canManage,
  onEdit,
  onDelete,
}: ServiceFeesTableProps) {
  const columns = useMemo<ColumnDef<ServiceFee>[]>(() => [
    {
      header: "Service Standard",
      accessorKey: "serviceName",
      cell: (item) => <span className="font-semibold text-slate-200">{item.serviceName ?? "Unknown Service"}</span>,
    },
    {
      header: "Mapped Fee",
      id: "mappedFee",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono text-emerald-400">{item.feeCode ?? "UNKNOWN"}</span>
          <span className="text-xs text-slate-400">{item.feeName ?? "Unknown Fee"}</span>
        </div>
      ),
    },
    {
      header: "Charge Amount",
      accessorKey: "amount",
      cell: (item) => (
        <span className="font-mono font-bold text-white text-sm bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-lg">
          ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
  ], []);

  const getRowActionMenu = (item: ServiceFee): ActionMenuItem[] | undefined => {
    if (!canManage) return undefined;
    return [
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
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <DataTable
        data={serviceFees}
        columns={columns}
        loading={loading}
        rowActionMenu={getRowActionMenu}
        emptyState={
          <div className="py-12 text-center text-slate-400">
            <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No service fees configured</p>
            <p className="text-xs text-slate-500">No fees have been mapped to services catalog items yet.</p>
          </div>
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: totalCount,
          onPageChange,
          onPageSizeChange,
        }}
      />
    </div>
  );
}
