"use client";

import React from "react";
import { BookOpen, Edit2, Trash2 } from "lucide-react";
import { Note } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ServiceCategoryItem } from "@/services/feesService";

export interface NotesTableProps {
  notes: Note[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  categories: ServiceCategoryItem[];
  loading: boolean;
  canManage: boolean;
  onEdit: (item: Note) => void;
  onDelete: (item: Note) => void;
}

export function NotesTable({
  notes,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  categories,
  loading,
  canManage,
  onEdit,
  onDelete,
}: NotesTableProps) {
  const columns: ColumnDef<Note>[] = [
    {
      key: "serviceVariant",
      header: "Service & Variant Scope",
      cell: (item) => (
        <div className="flex flex-col gap-1.5 py-0.5">
          <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs max-w-[260px] truncate block">
            {item.serviceName ?? "Global"}
          </span>
          <span className={`text-[10px] w-fit px-2 py-0.5 rounded-lg border font-semibold tracking-wide ${item.serviceVariantName ? "text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20" : "text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/20"}`}>
            {item.serviceVariantName ?? "All Variants"}
          </span>
        </div>
      ),
    },
    {
      key: "notes",
      header: "Regulatory Guideline Notes",
      cell: (item) => {
        // Handle multiline formatting if present
        const lines = (item.notes ?? "")
          .split("\n")
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);

        return (
          <div className="flex flex-col gap-1.5 max-w-xl py-1">
            {lines.length > 1 ? (
              <ul className="space-y-1.5 list-none">
                {lines.map((line: string, idx: number) => {
                  // If it already starts with a number like "1.", let it show normally, otherwise prefix with bullet
                  const hasPrefix = /^\d+\./.test(line);
                  return (
                    <li key={idx} className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed flex gap-2">
                      {!hasPrefix && <span className="text-indigo-600 dark:text-indigo-400 font-bold select-none">•</span>}
                      <span>{line}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{item.notes}</p>
            )}
          </div>
        );
      },
    },
  ];

  const emptyState = {
    icon: <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
    title: "No regulatory notes",
    description: "There are no procedural compliance notes configured for service categories.",
  };

  const pagination = notes.length > 0 ? {
    currentPage,
    totalItems: totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
  } : undefined;

  return (
    <DataTable
      columns={columns}
      data={notes}
      getItemKey={(item) => item.id}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      rowActionMenu={canManage ? (item) => [
        {
          label: "Edit Guideline Note",
          icon: Edit2,
          onClick: () => onEdit(item),
        },
        {
          label: "Remove Note",
          icon: Trash2,
          onClick: () => onDelete(item),
          variant: "destructive",
        },
      ] : undefined}
    />
  );
}
