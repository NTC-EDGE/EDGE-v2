"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Region } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

export interface RegionsTableProps {
  regions: Region[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  hasProvinces: (regionId: string) => boolean;
  onEdit: (item: Region) => void;
  onDelete: (item: Region) => void;
  onToggleStatus: (item: Region) => void;
}

export function RegionsTable({
  regions,
  loading,
  canManage,
  searchTerm,
  hasProvinces,
  onEdit,
  onDelete,
  onToggleStatus,
}: RegionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = regions.filter(
    (r) =>
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<Region>[] = [
    {
      key: "code",
      header: "Region Code",
      cell: (item) => (
        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-500/20">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Region Name",
      cell: (item) => <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <button
          onClick={() => onToggleStatus(item)}
          disabled={!canManage}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            item.isActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          {item.isActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Active
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              Inactive
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={paginated}
      loading={loading}
      getItemKey={(item) => item.id}
      rowActionMenu={
        canManage
          ? (item) => {
              const hasChildren = hasProvinces(item.id);
              const isDeleteAllowed = item.isActive === false && !hasChildren;

              const menuItems: ActionMenuItem[] = [
                {
                  label: item.isActive ? "Set Inactive" : "Set Active",
                  icon: item.isActive ? XCircle : CheckCircle,
                  onClick: () => onToggleStatus(item),
                },
              ];

              if (item.isActive === false) {
                menuItems.push({
                  label: "Edit Region",
                  icon: Edit2,
                  onClick: () => onEdit(item),
                });
              }

              if (isDeleteAllowed) {
                menuItems.push({
                  label: "Delete Region",
                  icon: Trash2,
                  onClick: () => onDelete(item),
                  variant: "destructive" as const,
                });
              }
              return menuItems;
            }
          : undefined
      }
      emptyState={{
        icon: <MapPin className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
        title: "No regions configured",
        description: "There are no administrative regions registered in the catalog yet.",
      }}
      pagination={{
        currentPage,
        totalItems: filtered.length,
        pageSize,
        onPageChange: setCurrentPage,
        onPageSizeChange: (sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        },
      }}
    />
  );
}
