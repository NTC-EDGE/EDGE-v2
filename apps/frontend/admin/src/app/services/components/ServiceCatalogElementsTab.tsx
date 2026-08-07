"use client";

import { Layers, Edit2, Trash2, Plus } from "lucide-react";
import { Element } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

interface ServiceCatalogElementsTabProps {
  elements: Element[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  canManage: boolean;
  onEdit: (item: Element) => void;
  onDelete: (item: Element) => void;
  onAdd: () => void;
}

export function ServiceCatalogElementsTab({
  elements,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  canManage,
  onEdit,
  onDelete,
  onAdd,
}: ServiceCatalogElementsTabProps) {
  const columns: ColumnDef<Element>[] = [
    {
      key: "code",
      header: "Code",
      cell: (item) => (
        <span className="font-mono font-semibold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/50 text-[11px]">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (item) => (
        <span className="font-semibold text-slate-200">{item.name ?? "—"}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (item) => (
        <span className="text-slate-400 text-xs max-w-md block truncate">
          {item.description ?? "—"}
        </span>
      ),
    },
  ];

  const emptyState = {
    icon: <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
    title: "No exam elements configured",
    description: "Exam elements define what a candidate must complete per variant.",
  };

  const pagination =
    totalCount > 0
      ? { currentPage, totalItems: totalCount, pageSize, onPageChange, onPageSizeChange }
      : undefined;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Service Variant Elements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exam elements mapped to service variants (e.g. RTG, PHN, Amateur class elements).
          </p>
        </div>
        {canManage && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Element
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={elements}
        getItemKey={(item) => item.id}
        loading={loading}
        emptyState={emptyState}
        pagination={pagination}
        rowActionMenu={
          canManage
            ? (item) => [
                {
                  label: "Edit Element",
                  icon: Edit2,
                  onClick: () => onEdit(item),
                },
                {
                  label: "Delete Element",
                  icon: Trash2,
                  onClick: () => onDelete(item),
                  variant: "destructive" as const,
                },
              ]
            : undefined
        }
      />
    </div>
  );
}
