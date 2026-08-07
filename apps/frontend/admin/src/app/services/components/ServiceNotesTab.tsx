"use client";

import { useState } from "react";
import { BookOpen, Edit2, Trash2, Plus, Search, Filter } from "lucide-react";
import { Note } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ServiceCatalogItem } from "@/services/feesNotesService";
import { ServiceVariant } from "@edge/api";

interface ServiceNotesTabProps {
  notes: Note[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  canManage: boolean;
  onEdit: (item: Note) => void;
  onDelete: (item: Note) => void;
  onAdd: () => void;
  services: ServiceCatalogItem[];
  variants: ServiceVariant[];
  filterServiceId: string;
  filterServiceVariantId: string;
  onFilterServiceChange: (id: string) => void;
  onFilterVariantChange: (id: string) => void;
  onClearFilters: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export function ServiceNotesTab({
  notes,
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
  services,
  variants,
  filterServiceId,
  filterServiceVariantId,
  onFilterServiceChange,
  onFilterVariantChange,
  onClearFilters,
  searchTerm,
  onSearchChange,
}: ServiceNotesTabProps) {
  const [showFilters, setShowFilters] = useState(false);

  const columns: ColumnDef<Note>[] = [
    {
      key: "serviceVariant",
      header: "Service & Variant Scope",
      cell: (item) => (
        <div className="flex flex-col gap-1.5 py-0.5">
          <span className="font-semibold text-slate-200 text-xs max-w-[260px] truncate block">
            {item.serviceName ?? "Global"}
          </span>
          <span
            className={`text-[10px] w-fit px-2 py-0.5 rounded-lg border font-semibold tracking-wide ${
              item.serviceVariantName
                ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-300 bg-amber-500/10 border-amber-500/20"
            }`}
          >
            {item.serviceVariantName ?? "All Variants"}
          </span>
        </div>
      ),
    },
    {
      key: "notes",
      header: "Regulatory Guideline Notes",
      cell: (item) => {
        const lines = (item.notes ?? "")
          .split("\n")
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);

        return (
          <div className="flex flex-col gap-1.5 max-w-xl py-1">
            {lines.length > 1 ? (
              <ul className="space-y-1.5 list-none">
                {lines.map((line: string, idx: number) => {
                  const hasPrefix = /^\d+\./.test(line);
                  return (
                    <li key={idx} className="text-slate-300 text-xs leading-relaxed flex gap-2">
                      {!hasPrefix && (
                        <span className="text-indigo-400 font-bold select-none">•</span>
                      )}
                      <span>{line}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                {item.notes}
              </p>
            )}
          </div>
        );
      },
    },
  ];

  const emptyState = {
    icon: <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
    title: "No service notes configured",
    description: "Add regulatory and procedural notes to services and their variants.",
  };

  const pagination =
    totalCount > 0
      ? { currentPage, totalItems: totalCount, pageSize, onPageChange, onPageSizeChange }
      : undefined;

  const hasActiveFilters = filterServiceId !== "" || filterServiceVariantId !== "";

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Service Notes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Regulatory and procedural notes scoped to services or specific variants.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              hasActiveFilters
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {hasActiveFilters && (
              <span className="bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                ON
              </span>
            )}
          </button>

          {canManage && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Note
            </button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex flex-col gap-1.5 w-full md:w-72">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Filter by Service
            </label>
            <select
              value={filterServiceId}
              onChange={(e) => {
                onFilterServiceChange(e.target.value);
                onFilterVariantChange("");
              }}
              className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-72">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Filter by Variant
            </label>
            <select
              value={filterServiceVariantId}
              onChange={(e) => onFilterVariantChange(e.target.value)}
              disabled={filterServiceId === ""}
              className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Variants</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.type} {v.description ? `— ${v.description}` : ""}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 self-end mb-2.5 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={notes}
        getItemKey={(item) => item.id}
        loading={loading}
        emptyState={emptyState}
        pagination={pagination}
        rowActionMenu={
          canManage
            ? (item) => [
                {
                  label: "Edit Note",
                  icon: Edit2,
                  onClick: () => onEdit(item),
                },
                {
                  label: "Delete Note",
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
