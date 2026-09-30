"use client";

import React from "react";
import { Coins, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Fee, ServiceFee } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

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
  fees = [],
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  serviceFees = [],
  loading,
  canManage,
  onEdit,
  onDelete,
  onToggleStatus,
}: FeesTableProps) {
  const safeServiceFees = Array.isArray(serviceFees) ? serviceFees : [];
  const safeFees = Array.isArray(fees) ? fees : [];

  const columns: ColumnDef<Fee>[] = [
    {
      key: "code",
      header: "Fee Code",
      cell: (item) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase select-all">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Fee Name",
      cell: (item) => {
        const mappedServices = safeServiceFees.filter((sf) => sf.feeId === item.id && sf.isActive !== false);
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-slate-200">{item.name}</span>
            {mappedServices.length > 0 && (
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                Mapped to {mappedServices.length} service{mappedServices.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "description",
      header: "Description",
      cell: (item) => (
        <span className="text-slate-600 dark:text-slate-400 max-w-xs truncate block">
          {item.description || <span className="text-slate-400 dark:text-slate-600 italic">No description</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs border font-semibold inline-flex items-center gap-1 ${
          item.isActive !== false
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive !== false ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-400 dark:bg-slate-500"}`} />
          {item.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const emptyState = {
    icon: <Coins className="w-10 h-10 mx-auto text-slate-650 mb-2" />,
    title: "No fee codes registered",
    description: "Configure administrative fee categories.",
  };

  const pagination = fees.length > 0 ? {
    currentPage,
    totalItems: totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
  } : undefined;

  return (
    <DataTable
      columns={columns}
      data={fees}
      getItemKey={(item) => item.id}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      rowActionMenu={canManage ? (item) => [
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
      ] : undefined}
    />
  );
}
