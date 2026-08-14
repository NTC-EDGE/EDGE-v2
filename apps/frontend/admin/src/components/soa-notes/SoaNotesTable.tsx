"use client";

import React, { useState } from "react";
import { FileText, Edit2, Trash2, Calendar, ChevronDown, ChevronUp, Copy, Check, Eye } from "lucide-react";
import { SoaNote } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

export interface SoaNotesTableProps {
  notes: SoaNote[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  canManage: boolean;
  onViewDetails?: (item: SoaNote) => void;
  onEdit: (item: SoaNote) => void;
  onDelete: (item: SoaNote) => void;
}

export function SoaNotesTable({
  notes,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  canManage,
  onViewDetails,
  onEdit,
  onDelete,
}: SoaNotesTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: ColumnDef<SoaNote>[] = [
    {
      key: "code",
      header: "Code",
      cell: (item) => (
        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded tracking-wider uppercase">
          {item.code || "—"}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title / Name",
      cell: (item) => (
        <div className="flex flex-col">
          {onViewDetails ? (
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="text-left font-semibold text-slate-900 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {item.title || <span className="text-slate-400 italic">Untitled Template</span>}
            </button>
          ) : (
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {item.title || <span className="text-slate-400 italic">Untitled Template</span>}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "notes",
      header: "Note Content / Terms",
      cell: (item) => {
        const isExpanded = expandedRowId === item.id;
        const isLong = item.notes.length > 120;
        return (
          <div className="max-w-md">
            <p className={`text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed ${!isExpanded && isLong ? "line-clamp-2" : ""}`}>
              {item.notes}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 mt-1"
              >
                {isExpanded ? (
                  <>Show less <ChevronUp className="h-3 w-3" /></>
                ) : (
                  <>Read full terms <ChevronDown className="h-3 w-3" /></>
                )}
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              title="View full details"
              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleCopy(item.notes, item.id)}
            title="Copy template text"
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEdit(item)}
                title="Edit SOA note"
                className="p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                title="Delete SOA note"
                className="p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={notes}
      loading={loading}
      emptyState={{
        title: "No SOA note templates found",
        description: "Click 'New SOA Note' above to create standard billing terms and instructions.",
      }}
      pagination={{
        currentPage,
        totalItems: totalCount,
        pageSize,
        onPageChange,
        onPageSizeChange,
      }}
    />
  );
}
