"use client";

import React from "react";
import { BookOpen, Edit2, Trash2 } from "lucide-react";
import { Note } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ServiceCategoryItem } from "@/services/feesNotesService";

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
      key: "category",
      header: "Service Category Scope",
      cell: (item) => {
        const categoryName = categories.find((c) => c.id === item.serviceCategoryId)?.name ?? "Global";
        return (
          <span className="font-semibold text-indigo-300 text-xs bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
            {categoryName}
          </span>
        );
      },
    },
    {
      key: "notes",
      header: "Regulatory Guideline Notes",
      cell: (item) => (
        <p className="text-slate-300 text-xs leading-relaxed max-w-xl whitespace-pre-wrap">{item.notes}</p>
      ),
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
