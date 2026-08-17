"use client";

import { useState, useMemo } from "react";
import { BookOpen, Edit2, Trash2, Plus, Search, Filter, Folder, Settings2, X } from "lucide-react";
import { Note, ServiceVariant } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";
import { ServiceCatalogItem } from "@/services/feesService";
import { ServiceCategory } from "@/services/catalogService";
import { SearchableSelect } from "@/components/ui/searchable-select";

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
  categories: ServiceCategory[];
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
  categories,
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Scope services to selected category (UI-only helper for user experience)
  const filteredServices = useMemo(() => {
    if (selectedCategoryId.trim().length === 0) {
      return services;
    }
    return services.filter((s) => s.serviceCategoryId === selectedCategoryId);
  }, [services, selectedCategoryId]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    if (categoryId.trim().length > 0) {
      const isCurrentServiceInCategory = services.some(
        (s) => s.id === filterServiceId && s.serviceCategoryId === categoryId
      );
      if (!isCurrentServiceInCategory) {
        onFilterServiceChange("");
        onFilterVariantChange("");
      }
    }
  };

  const handleClearAll = () => {
    setSelectedCategoryId("");
    onClearFilters();
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedService = services.find((s) => s.id === filterServiceId);
  const selectedVariant = variants.find((v) => v.id === filterServiceVariantId);
  const hasActiveFilters =
    selectedCategoryId !== "" ||
    filterServiceId !== "" ||
    filterServiceVariantId !== "" ||
    searchTerm.trim().length > 0;

  const columns: ColumnDef<Note>[] = [
    {
      key: "serviceVariant",
      header: "Service & Variant Scope",
      cell: (item) => (
        <div className="flex flex-col gap-1.5 py-0.5">
          <span className="font-bold text-slate-900 dark:text-slate-200 text-xs max-w-[260px] truncate block">
            {item.serviceName ?? "Global"}
          </span>
          <span
            className={`text-[10px] w-fit px-2 py-0.5 rounded-lg border font-semibold tracking-wide ${
              item.serviceVariantName
                ? "text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                : "text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
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
                    <li key={idx} className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed flex gap-2">
                      {!hasPrefix && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold select-none">•</span>
                      )}
                      <span>{line}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                {item.notes}
              </p>
            )}
          </div>
        );
      },
    },
  ];

  const emptyState = {
    icon: <BookOpen className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />,
    title: "No service notes configured",
    description: "Add regulatory and procedural notes to services and their variants.",
  };

  const pagination =
    totalCount > 0
      ? { currentPage, totalItems: totalCount, pageSize, onPageChange, onPageSizeChange }
      : undefined;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Service Notes
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">
            Regulatory and procedural notes scoped to services or specific variants.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              hasActiveFilters
                ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl items-start md:items-end flex-wrap">
          <div className="flex flex-col gap-1.5 w-full md:w-56">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Folder className="w-3 h-3 text-indigo-400" />
              Filter by Category
            </label>
            <SearchableSelect
              value={selectedCategoryId}
              onChange={(val) => handleCategoryChange(val)}
              placeholder="All Categories"
              searchPlaceholder="Search categories..."
              maxHeight="max-h-48"
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                  badge: c.code || undefined,
                })),
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-64">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Settings2 className="w-3 h-3 text-indigo-400" />
              Filter by Service
            </label>
            <SearchableSelect
              value={filterServiceId}
              onChange={(val) => {
                onFilterServiceChange(val);
                onFilterVariantChange("");
              }}
              placeholder={selectedCategoryId ? `All in Category (${filteredServices.length})` : "All Services"}
              searchPlaceholder="Search services..."
              maxHeight="max-h-48"
              options={[
                { value: "", label: selectedCategoryId ? `All in Category (${filteredServices.length})` : "All Services" },
                ...filteredServices.map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-64">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Filter by Variant
            </label>
            <SearchableSelect
              value={filterServiceVariantId}
              onChange={(val) => onFilterVariantChange(val)}
              disabled={filterServiceId === ""}
              placeholder="All Variants"
              searchPlaceholder="Search variants..."
              maxHeight="max-h-48"
              options={[
                { value: "", label: "All Variants" },
                ...variants.map((v) => ({
                  value: v.id,
                  label: `${v.type} ${v.description ? `— ${v.description}` : ""}`,
                })),
              ]}
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 self-end mb-2.5 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Active Filter Badges */}
      {hasActiveFilters && (selectedCategoryId !== "" || filterServiceId !== "" || filterServiceVariantId !== "") && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Active filters:</span>
          {selectedCategory !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <span>Category: <strong>{selectedCategory.name}</strong></span>
              <button
                type="button"
                onClick={() => handleCategoryChange("")}
                className="text-indigo-400 hover:text-white transition-colors"
                title="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedService !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <span>Service: <strong>{selectedService.name}</strong></span>
              <button
                type="button"
                onClick={() => {
                  onFilterServiceChange("");
                  onFilterVariantChange("");
                }}
                className="text-indigo-400 hover:text-white transition-colors"
                title="Remove service filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedVariant !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <span>Variant: <strong>{selectedVariant.type}</strong></span>
              <button
                type="button"
                onClick={() => onFilterVariantChange("")}
                className="text-indigo-400 hover:text-white transition-colors"
                title="Remove variant filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
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
            ? (item): ActionMenuItem[] => [
                {
                  label: "Edit Note",
                  icon: Edit2,
                  onClick: () => onEdit(item),
                },
                {
                  label: "Delete Note",
                  icon: Trash2,
                  onClick: () => onDelete(item),
                  variant: "destructive",
                },
              ]
            : undefined
        }
      />
    </div>
  );
}
