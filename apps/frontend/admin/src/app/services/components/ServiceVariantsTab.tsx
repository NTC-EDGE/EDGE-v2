"use client";

import { useState, useMemo, useEffect } from "react";
import { Settings2, Edit, Trash2, Filter, Search, X, Folder } from "lucide-react";
import { ServiceVariant } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";
import { ServiceCatalogItem } from "@/services/feesService";
import { ServiceCategory } from "@/services/catalogService";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ServiceVariantsTabProps {
  loadingVariants: boolean;
  pagedVariants: ServiceVariant[];
  totalCount: number;
  variantsPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditVariant: (v: ServiceVariant) => void;
  onDeleteVariant: (id: string) => void;
  categories: ServiceCategory[];
  services: ServiceCatalogItem[];
  filterCategoryId?: string;
  onFilterCategoryChange?: (categoryId: string) => void;
  filterServiceId: string;
  onFilterServiceChange: (serviceId: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onClearFilters: () => void;
}

export function ServiceVariantsTab({
  loadingVariants,
  pagedVariants,
  totalCount,
  variantsPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEditVariant,
  onDeleteVariant,
  categories,
  services,
  filterCategoryId = "",
  onFilterCategoryChange,
  filterServiceId,
  onFilterServiceChange,
  searchTerm,
  onSearchChange,
  onClearFilters,
}: ServiceVariantsTabProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localCategoryId, setLocalCategoryId] = useState<string>(filterCategoryId);
  const isControlled = onFilterCategoryChange !== undefined;
  const selectedCategoryId = isControlled ? filterCategoryId : localCategoryId;

  // Sync local state when controlled filterCategoryId changes externally
  useEffect(() => {
    setLocalCategoryId(filterCategoryId);
  }, [filterCategoryId]);

  // Filter services list based on selected category (UI-only helper for easy navigation)
  const filteredServices = useMemo(() => {
    if (selectedCategoryId.trim().length === 0) {
      return services;
    }
    return services.filter((s) => s.serviceCategoryId === selectedCategoryId);
  }, [services, selectedCategoryId]);

  const handleCategoryChange = (categoryId: string) => {
    setLocalCategoryId(categoryId);
    if (onFilterCategoryChange) {
      onFilterCategoryChange(categoryId);
    }
    if (categoryId.trim().length > 0) {
      const isCurrentServiceInCategory = services.some(
        (s) => s.id === filterServiceId && s.serviceCategoryId === categoryId
      );
      if (!isCurrentServiceInCategory) {
        onFilterServiceChange("");
      }
    }
  };

  const handleClearAll = () => {
    setLocalCategoryId("");
    if (onFilterCategoryChange) {
      onFilterCategoryChange("");
    }
    onClearFilters();
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedService = services.find((s) => s.id === filterServiceId);
  const hasActiveFilters = selectedCategoryId !== "" || filterServiceId !== "" || searchTerm.trim().length > 0;

  const columns: ColumnDef<ServiceVariant>[] = [
    {
      header: "Service",
      accessorKey: "serviceName",
      cell: (val) => (
        <span className="font-semibold text-slate-900 dark:text-slate-300 max-w-xs truncate block">
          {val !== null && val !== undefined && String(val).trim().length > 0 ? String(val) : "Global Service"}
        </span>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (val) => {
        const typeStr = val !== null && val !== undefined ? String(val) : "";
        if (typeStr === "NA" || typeStr.length === 0) return null;

        const isNewStyle = ["New", "FirstTaker", "First-taker", "VSAT"].includes(typeStr);
        const isRenewalStyle = ["Renewal", "Retaker"].includes(typeStr);

        let label = typeStr;
        if (typeStr === "FirstTaker") label = "First-taker";
        if (typeStr === "CivicActionGroup") label = "Civic Action Group";

        return (
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-lg border uppercase inline-block font-bold tracking-wide ${
              isNewStyle
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : isRenewalStyle
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
            }`}
          >
            {label}
          </span>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (val) => (
        <span className="text-slate-600 dark:text-slate-400 max-w-sm truncate block text-xs">
          {val !== null && val !== undefined && String(val).trim().length > 0 ? String(val) : "No description."}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header & Quick Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Service Variants
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">
            Configure application types, pricing parameters, and requirements per service.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Quick Category Filter Dropdown */}
          <div className="w-full sm:w-48">
            <SearchableSelect
              value={selectedCategoryId}
              onChange={(val) => handleCategoryChange(val)}
              placeholder="All Categories"
              searchPlaceholder="Search categories..."
              maxHeight="max-h-48"
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                  badge: cat.code || undefined,
                })),
              ]}
            />
          </div>

          {/* Quick Service Filter Dropdown */}
          <div className="w-full sm:w-56">
            <SearchableSelect
              value={filterServiceId}
              onChange={(val) => onFilterServiceChange(val)}
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

          {/* Always Visible Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search variants..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 ${
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

      {showFilters && (
        <div className="flex flex-col md:flex-row items-start md:items-end gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
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
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                  badge: cat.code || undefined,
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
              onChange={(val) => onFilterServiceChange(val)}
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Search className="w-3 h-3 text-indigo-400" />
              Search Variants
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by type or description..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 mb-2 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Active Filter Indicator Tags */}
      {hasActiveFilters && (selectedCategoryId !== "" || filterServiceId !== "") && (
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
                onClick={() => onFilterServiceChange("")}
                className="text-indigo-400 hover:text-white transition-colors"
                title="Remove service filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <DataTable
          data={pagedVariants}
          columns={columns}
          loading={loadingVariants}
          emptyState={
            <div className="text-center py-8 text-slate-400">
              <Settings2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">No service variants found</p>
              <p className="text-xs text-slate-500 mt-1">
                {hasActiveFilters
                  ? "Try adjusting your category, service, or search filter criteria."
                  : "No service variants have been registered yet."}
              </p>
            </div>
          }
          rowActionMenu={(row): ActionMenuItem[] => [
            {
              label: "Edit Variant",
              icon: Edit,
              onClick: () => onEditVariant(row),
            },
            {
              label: "Delete Variant",
              icon: Trash2,
              onClick: () => onDeleteVariant(row.id),
              variant: "destructive",
            },
          ]}
          pagination={
            totalCount > 0
              ? {
                  currentPage: variantsPage,
                  totalItems: totalCount,
                  pageSize,
                  onPageChange,
                  onPageSizeChange,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
