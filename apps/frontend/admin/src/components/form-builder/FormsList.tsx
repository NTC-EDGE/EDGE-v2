"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  Radio,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Calendar,
} from "lucide-react";
import { FormSchema, FormVersionSummary } from "./types";
import { Pagination } from "@/components/ui/pagination";
import { ServiceCategory, ServiceItem } from "@/services/catalogService";

interface FormsListProps {
  forms: FormSchema[];
  onEdit: (form: FormSchema) => void;
  onPreview: (form: FormSchema) => void;
  onDuplicate: (form: FormSchema) => void;
  onDelete: (form: FormSchema) => void;
  onSetActive?: (form: FormSchema) => void;
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

function formatFormBadge(code?: string): string {
  if (!code) return "";
  const match = code.match(/^NTC[_-]1[_-](\d{2})$/i);
  if (match) {
    return `NTC 1-${match[1]}`;
  }
  return code;
}

export function FormsList({
  forms,
  onEdit,
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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");

  const getVersionsList = (form: FormSchema): FormVersionSummary[] => {
    if (form.availableVersions && form.availableVersions.length > 0) {
      return form.availableVersions;
    }
    return [
      {
        formId: form.id,
        version: form.version || "1.0",
        name: form.name,
        isActive: Boolean(form.isPublished || form.isActive),
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        sectionsCount: 1,
        fieldsCount: form.fields.length,
      },
    ];
  };

  // Services filtered by category
  const filteredServices = React.useMemo(() => {
    if (!selectedCategoryId) return services;
    return services.filter((s) => s.serviceCategoryId === selectedCategoryId);
  }, [services, selectedCategoryId]);

  // Filter forms: one entry per application type (ServiceId)
  const filtered = React.useMemo(() => {
    let result = forms;

    if (statusFilter === "active") {
      result = result.filter((f) => f.isPublished || f.isActive);
    } else if (statusFilter === "draft") {
      result = result.filter((f) => !f.isPublished && !f.isActive);
    }

    if (selectedCategoryId && !selectedServiceId) {
      const validServiceIds = new Set(filteredServices.map((s) => s.id));
      result = result.filter((f) => f.serviceId && validServiceIds.has(f.serviceId));
    }

    if (searchTerm && !onPageChange) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          f.description.toLowerCase().includes(term) ||
          (f.version && f.version.toLowerCase().includes(term)) ||
          (f.serviceName && f.serviceName.toLowerCase().includes(term)) ||
          (f.serviceCode && f.serviceCode.toLowerCase().includes(term)) ||
          (f.availableVersions &&
            f.availableVersions.some(
              (v) =>
                v.version.toLowerCase().includes(term) ||
                (v.name && v.name.toLowerCase().includes(term))
            ))
      );
    }

    return result;
  }, [
    forms,
    statusFilter,
    selectedCategoryId,
    selectedServiceId,
    filteredServices,
    searchTerm,
    onPageChange,
  ]);

  const effectiveTotalItems = totalItems ?? filtered.length;
  const paginatedForms = onPageChange
    ? filtered
    : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedCategoryId) ||
    Boolean(selectedServiceId) ||
    statusFilter !== "all";

  const handleClearFilters = () => {
    onSearchChange("");
    setStatusFilter("all");
    if (onCategoryChange) onCategoryChange("");
    if (onServiceChange) onServiceChange("");
  };

  const selectClass =
    "px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all";

  const totalActiveCount = forms.filter((f) => f.isPublished || f.isActive).length;
  const totalDraftCount = forms.length - totalActiveCount;

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search application type, form name, or version (e.g. v2.0)..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Clean Borderless Segment Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-medium self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({forms.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === "active"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active ({totalActiveCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === "draft"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Drafts ({totalDraftCount})
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <select
            value={selectedCategoryId}
            onChange={(e) => {
              const catId = e.target.value;
              if (onCategoryChange) onCategoryChange(catId);
              if (catId && selectedServiceId && onServiceChange) {
                const s = services.find((x) => x.id === selectedServiceId);
                if (s && s.serviceCategoryId !== catId) {
                  onServiceChange("");
                }
              }
            }}
            className={`${selectClass} max-w-[240px]`}
          >
            <option value="">All Service Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat.code ? `(${cat.code})` : ""}
              </option>
            ))}
          </select>

          <select
            value={selectedServiceId}
            onChange={(e) => {
              if (onServiceChange) onServiceChange(e.target.value);
            }}
            className={`${selectClass} flex-1 min-w-[220px] max-w-md`}
          >
            <option value="">All Application Types (Services)</option>
            {filteredServices.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name} {svc.code ? `(${svc.code})` : ""}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main List of Forms by Service — Clicking View Details directly opens the Form Builder Editor */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-indigo-400 dark:text-indigo-500" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {hasActiveFilters ? "No application types match your filters" : "No form templates yet"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">
            {hasActiveFilters
              ? "Try adjusting your search query or clearing the filters."
              : "Create your first form template to associate it with an application type."}
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950">
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[44%]">
                    Application Type / Service
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[20%]">
                    Active Client Version
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-[22%]">
                    Available Versions
                  </th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right w-[14%]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedForms.map((form) => {
                  const versions = getVersionsList(form);
                  const activeVersionObj = versions.find((v) => v.isActive);

                  return (
                    <tr
                      key={form.id}
                      onClick={() => onEdit(form)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Application Type / Service (Clean typography, no button-like borders) */}
                      <td className="py-4 px-5 align-middle">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                {form.name || form.serviceName || "Untitled Application"}
                              </span>
                              {form.serviceCode && (
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                                  {formatFormBadge(form.serviceCode)}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 block">
                              {form.serviceName && form.name !== form.serviceName
                                ? form.serviceName
                                : form.description || "Click to open in Form Builder"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Active Client Version (Clean borderless status indicator) */}
                      <td className="py-4 px-4 align-middle">
                        {activeVersionObj ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>v{activeVersionObj.version} Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span>No Active Version</span>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Available Versions Summary (Clean borderless text) */}
                      <td className="py-4 px-4 align-middle">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <span>
                            {versions.length} {versions.length === 1 ? "Version" : "Versions"}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono ml-1.5">
                            ({versions.map((v) => `v${v.version}`).join(", ")})
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Single Direct Action -> Opens Form Builder Editor */}
                      <td
                        className="py-4 px-5 align-middle text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onEdit(form)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-indigo-300 dark:hover:text-white text-xs font-semibold transition-all"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
              pageSizeOptions={[10, 25, 50, 100]}
            />
          )}
        </div>
      )}
    </div>
  );
}
