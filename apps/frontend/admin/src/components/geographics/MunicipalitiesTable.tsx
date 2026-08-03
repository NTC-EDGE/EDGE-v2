"use client";

import React, { useState, useEffect } from "react";
import { Building2, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Municipality, Province } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

export interface MunicipalitiesTableProps {
  municipalities: Municipality[];
  provinces: Province[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  hasBarangays: (municipalityId: string) => boolean;
  onEdit: (item: Municipality) => void;
  onDelete: (item: Municipality) => void;
  onToggleStatus: (item: Municipality) => void;
}

export function MunicipalitiesTable({
  municipalities,
  provinces,
  loading,
  canManage,
  searchTerm,
  hasBarangays,
  onEdit,
  onDelete,
  onToggleStatus,
}: MunicipalitiesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = municipalities.filter(
    (m) =>
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<Municipality>[] = [
    {
      key: "code",
      header: "Code",
      cell: (item) => (
        <span className="font-mono text-indigo-400 font-bold text-sm bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Municipality/City",
      cell: (item) => <span className="font-semibold text-white">{item.name}</span>,
    },
    {
      key: "province",
      header: "Province Scope",
      cell: (item) => {
        const parentProvince = provinces.find((p) => p.id === item.provinceId);
        return (
          <span className="text-slate-300 font-medium">
            {parentProvince ? (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs border border-slate-700 text-slate-400">
                {parentProvince.code} - {parentProvince.name}
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
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
          }`}
        >
          {item.isActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
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
              const hasChildren = hasBarangays(item.id);
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
                  label: "Edit Municipality",
                  icon: Edit2,
                  onClick: () => onEdit(item),
                });
              }

              if (isDeleteAllowed) {
                menuItems.push({
                  label: "Delete Municipality",
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
        icon: <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
        title: "No municipalities configured",
        description: "There are no cities or municipalities registered in the catalog yet.",
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
