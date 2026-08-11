"use client";

import React from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { Element } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

export interface ElementsTableProps {
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
}

export function ElementsTable({
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
}: ElementsTableProps) {
  const columns: ColumnDef<Element>[] = [
    {
      key: "code",
      header: "Code",
      cell: (item) => <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{item.code}</span>,
    },
    {
      key: "name",
      header: "Name",
      cell: (item) => <span className="font-semibold text-slate-900 dark:text-slate-200">{item.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      cell: (item) => <span className="text-slate-600 dark:text-slate-400">{item.description ?? "—"}</span>,
    },
  ];

  const emptyState = {
    icon: <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
    title: "No billing elements configured",
    description: "Configure billing elements to set up detailed fees mappings.",
  };

  const pagination = elements.length > 0 ? {
    currentPage,
    totalItems: totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
  } : undefined;

  return (
    <DataTable
      columns={columns}
      data={elements}
      getItemKey={(item) => item.id}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      rowActionMenu={canManage ? (item) => [
        {
          label: "Modify Element",
          icon: Edit2,
          onClick: () => onEdit(item),
        },
        {
          label: "Remove Element",
          icon: Trash2,
          onClick: () => onDelete(item),
          variant: "destructive",
        },
      ] : undefined}
    />
  );
}
