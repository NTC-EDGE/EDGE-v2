"use client";

import React, { useState, useEffect } from "react";
import { Building, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Province, Region } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

export interface ProvincesTableProps {
  provinces: Province[];
  regions: Region[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  hasMunicipalities: (provinceId: string) => boolean;
  onEdit: (item: Province) => void;
  onDelete: (item: Province) => void;
  onToggleStatus: (item: Province) => void;
}

export function ProvincesTable({
  provinces,
  regions,
  loading,
  canManage,
  searchTerm,
  hasMunicipalities,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProvincesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = provinces.filter(
    (p) =>
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<Province>[] = [
    {
      key: "code",
      header: "Province Code",
      cell: (item) => (
        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-500/20">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Province Name",
      cell: (item) => <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>,
    },
    {
      key: "region",
      header: "Region Scope",
      cell: (item) => {
        const parentRegion = regions.find((r) => r.id === item.regionId);
        return (
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {parentRegion ? (
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                {parentRegion.code} - {parentRegion.name}
              </span>
            ) : (
              "—"
            )}
          </span>
        );
      },
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
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
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
              const hasChildren = hasMunicipalities(item.id);
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
                  label: "Edit Province",
                  icon: Edit2,
                  onClick: () => onEdit(item),
                });
              }

              if (isDeleteAllowed) {
                menuItems.push({
                  label: "Delete Province",
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
        icon: <Building className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
        title: "No provinces configured",
        description: "There are no administrative provinces registered in the catalog yet.",
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
