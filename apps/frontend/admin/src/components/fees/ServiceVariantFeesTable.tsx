"use client";

import React, { useMemo } from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { ServiceVariantFee } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

export interface ServiceVariantFeesTableProps {
  serviceVariantFees: ServiceVariantFee[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  canManage: boolean;
  onEdit: (item: ServiceVariantFee) => void;
  onDelete: (item: ServiceVariantFee) => void;
}

export function ServiceVariantFeesTable({
  serviceVariantFees,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  canManage,
  onEdit,
  onDelete,
}: ServiceVariantFeesTableProps) {
  const columns = useMemo<ColumnDef<ServiceVariantFee>[]>(() => [
    {
      header: "Service",
      id: "serviceName",
      cell: (item) => <span className="font-semibold text-slate-900 dark:text-slate-200">{item.serviceVariant?.serviceName ?? "Unknown Service"}</span>,
    },
    {
      header: "Variant Type",
      id: "variantType",
      cell: (item) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700">
          {item.serviceVariant?.type ?? "—"}
        </span>
      ),
    },
    {
      header: "Mapped Fee",
      id: "mappedFee",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{item.feeCode ?? "UNKNOWN"}</span>
          <span className="text-xs text-slate-600 dark:text-slate-400">{item.feeName ?? "Unknown Fee"}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      id: "amount",
      cell: (item) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-lg">
          ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
  ], []);

  const getRowActionMenu = (item: ServiceVariantFee): ActionMenuItem[] | undefined => {
    if (!canManage) return undefined;
    return [
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
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <DataTable
        data={serviceVariantFees}
        columns={columns}
        loading={loading}
        rowActionMenu={getRowActionMenu}
        emptyState={
          <div className="py-12 text-center text-slate-400">
            <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No service variant fees mapped</p>
            <p className="text-xs text-slate-500">Map fee codes directly to service variants.</p>
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
