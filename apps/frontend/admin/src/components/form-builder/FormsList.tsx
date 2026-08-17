"use client";

import React from "react";
import {
  Search,
  Plus,
  Pencil,
  Eye,
  Copy,
  Trash2,
  ClipboardList,
  FileText,
  Building2,
  Filter,
  X,
  Layers,
} from "lucide-react";
import { FormSchema } from "./types";
import { Pagination } from "@/components/ui/pagination";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { ServiceCategory, ServiceItem } from "@/services/catalogService";

interface FormsListProps {
  forms: FormSchema[];
  onEdit: (form: FormSchema) => void;
  onPreview: (form: FormSchema) => void;
  onDuplicate: (form: FormSchema) => void;
  onDelete: (form: FormSchema) => void;
  onCreateNew: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  selectedServiceId?: string;
  onServiceChange?: (serviceId: string) => void;
  categories?: ServiceCategory[];
  services?: ServiceItem[];
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function FormsList({
  forms,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onCreateNew,
  searchTerm,
  onSearchChange,
  selectedCategoryId = "",
  onCategoryChange,
  selectedServiceId = "",
  onServiceChange,
  categories = [],
  services = [],
  currentPage = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: FormsListProps) {
  // Services filtered by the selected category in UI only
  const filteredServices = React.useMemo(() => {
    if (!selectedCategoryId) return services;
    return services.filter((s) => s.serviceCategoryId === selectedCategoryId);
  }, [services, selectedCategoryId]);

  // Filter forms: Category is UI-only (narrows by valid service IDs in that category)
  const filtered = React.useMemo(() => {
    let result = forms;

    // If category selected without a specific service chosen, filter by category services in UI
    if (selectedCategoryId && !selectedServiceId) {
      const validServiceIds = new Set(filteredServices.map((s) => s.id));
      result = result.filter((f) => f.serviceId && validServiceIds.has(f.serviceId));
    }

    // Client-side search fallback if server pagination is disabled
    if (searchTerm && !onPageChange) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          f.description.toLowerCase().includes(term) ||
          (f.serviceName && f.serviceName.toLowerCase().includes(term)) ||
          (f.serviceCode && f.serviceCode.toLowerCase().includes(term))
      );
    }

    return result;
  }, [forms, selectedCategoryId, selectedServiceId, filteredServices, searchTerm, onPageChange]);

  const effectiveTotalItems = totalItems ?? filtered.length;
  const paginatedForms = onPageChange
    ? filtered
    : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hasActiveFilters =
    Boolean(searchTerm) || Boolean(selectedCategoryId) || Boolean(selectedServiceId);

  const handleClearFilters = () => {
    onSearchChange("");
    if (onCategoryChange) onCategoryChange("");
    if (onServiceChange) onServiceChange("");
  };

  const getActionMenuItems = (form: FormSchema): ActionMenuItem[] => [
    {
      label: "Edit Form",
      icon: Pencil,
      onClick: () => onEdit(form),
    },
    {
      label: "Live Preview",
      icon: Eye,
      onClick: () => onPreview(form),
    },
    {
      label: "Duplicate",
      icon: Copy,
      onClick: () => onDuplicate(form),
    },
    {
      label: "Delete Form",
      icon: Trash2,
      variant: "destructive",
      onClick: () => onDelete(form),
    },
  ];

  const selectClass =
    "px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all";

  return (
    <div className="space-y-4">
      {/* Filter & Controls Bar */}
      <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search forms by name, description, or service keyword..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* New Form & Counter */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Forms:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold font-mono">
                {effectiveTotalItems}
              </span>
            </div>
            <button
              type="button"
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Form
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>Filter by:</span>
          </div>

          {/* 1. Category Filter (UI Helper) */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                const catId = e.target.value;
                if (onCategoryChange) onCategoryChange(catId);
                // Reset service if current service doesn't belong to new category
                if (catId && selectedServiceId && onServiceChange) {
                  const s = services.find((x) => x.id === selectedServiceId);
                  if (s && s.serviceCategoryId !== catId) {
                    onServiceChange("");
                  }
                }
              }}
              className={`${selectClass} max-w-[220px]`}
            >
              <option value="">All Categories (Filter)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.code ? `(${cat.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Service Filter (Passed to Backend) */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={selectedServiceId}
              onChange={(e) => {
                if (onServiceChange) onServiceChange(e.target.value);
              }}
              className={`${selectClass} w-full`}
            >
              <option value="">All Services</option>
              {filteredServices.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} {svc.code ? `(${svc.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Forms Table / Card List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-indigo-400 dark:text-indigo-500" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {hasActiveFilters ? "No forms match the selected filters" : "No forms yet"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">
            {hasActiveFilters
              ? "Try adjusting your search or clearing the category/service filters."
              : "Create your first form to get started."}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Form
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Scrollable table container to guarantee readability on all resolutions */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[42%]">
                    Form Template
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[40%]">
                    Associated Service
                  </th>
                  <th className="py-3.5 px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-[8%]">
                    Fields
                  </th>
                  <th className="py-3.5 px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[10%]">
                    Status
                  </th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right w-[60px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedForms.map((form) => (
                  <tr
                    key={form.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Form Name & Description */}
                    <td className="py-4 px-5 align-top">
                      <button
                        type="button"
                        onClick={() => onEdit(form)}
                        className="text-left flex items-start gap-2.5 min-w-0 w-full"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 block">
                            {form.name || "Untitled Form"}
                          </span>
                          {form.description && (
                            <span
                              className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed block"
                              title={form.description}
                            >
                              {form.description}
                            </span>
                          )}
                        </div>
                      </button>
                    </td>

                    {/* Associated Service Name (Wrapped, readable with code badge) */}
                    <td className="py-4 px-4 align-top">
                      {form.serviceName ? (
                        <div className="flex flex-col gap-1 pr-2" title={form.serviceName}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            {form.serviceCode && (
                              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {form.serviceCode}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                            {form.serviceName}
                          </span>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            Standalone / Unassigned
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Field count */}
                    <td className="py-4 px-3 align-top text-center">
                      <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                        {form.fields.length}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 align-top">
                      <span
                        className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                          form.isPublished
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                        }`}
                      >
                        {form.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Actions: 3 Dots Menu */}
                    <td className="py-4 px-5 align-top text-right">
                      <ActionMenu items={getActionMenuItems(form)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {effectiveTotalItems > 0 && onPageChange && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={effectiveTotalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}
        </div>
      )}
    </div>
  );
}
