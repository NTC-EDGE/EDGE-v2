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
      header: "Base Rate",
      id: "amount",
      cell: (item) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-lg">
          ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Calculation Formula",
      id: "calculationFormula",
      cell: (item) => {
        const mode = item.calculationMode === 1 || item.calculationMode === "CustomFormula" ? "Custom Formula" : "Standard Multiplier";
        const formula = item.calculationFormula !== null && item.calculationFormula !== undefined && item.calculationFormula.trim() !== ""
          ? item.calculationFormula
          : "{RATE}";
        return (
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-semibold w-fit">
              {formula}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {mode}
            </span>
          </div>
        );
      },
    },
    {
      header: "Multipliers & Rules",
      id: "multipliers",
      cell: (item) => {
        const tags: string[] = [];
        if (item.multiplyByValidityYears === true) tags.push("Years");
        if (item.multiplyByUnits === true) tags.push("Units");
        if (item.multiplyByChannels === true) tags.push("Channels");
        if (item.multiplyByPages === true) tags.push("Pages");
        if (item.applyLateRenewalSurcharge === true) tags.push("+Late Surcharge");
        if (item.includeDst === true) tags.push(`+DST (₱${(item.dstAmount ?? 30).toFixed(2)})`);

        if (tags.length === 0) {
          return <span className="text-xs text-slate-400 italic">Flat Rate</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        );
      },
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
