"use client";

import React, { useMemo } from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { ServiceVariantElementFee } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

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
  const columns = useMemo<ColumnDef<ServiceVariantElementFee>[]>(() => [
    {
      header: "Service & Variant",
      id: "serviceVariant",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-200">{item.serviceVariant?.serviceName ?? "Unknown Service"}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 italic">{item.serviceVariant?.type ?? "—"}</span>
        </div>
      ),
    },
    {
      header: "Billing Element",
      id: "billingElement",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{item.elementCode ?? "UNKNOWN"}</span>
          <span className="text-xs text-slate-600 dark:text-slate-400">{item.elementName ?? "Unknown Element"}</span>
        </div>
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

  const getRowActionMenu = (item: ServiceVariantElementFee): ActionMenuItem[] | undefined => {
    if (!canManage) return undefined;
    return [
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
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <DataTable
        data={serviceVariantElementFees}
        columns={columns}
        loading={loading}
        rowActionMenu={getRowActionMenu}
        emptyState={
          <div className="py-12 text-center text-slate-400">
            <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No service variant element fees mapped</p>
            <p className="text-xs text-slate-500">Map fee codes to service variants and billing elements.</p>
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
