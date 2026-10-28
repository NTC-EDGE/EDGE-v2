"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Search,
  Filter,
  Plus,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { ServiceVariantToolbarItem } from "./types";

interface ServiceVariantToolbarProps {
  variants: ServiceVariantToolbarItem[];
  selectedVariant: string;
  onSelectVariant: (variantName: string) => void;
  onOpenLinkServiceModal: () => void;
  totalFieldsCount: number;
  applicableFieldsCount: number;
  linkedServicesCount?: number;
  customizedVariantNames?: string[];
}

export function ServiceVariantToolbar({
  variants,
  selectedVariant,
  onSelectVariant,
  onOpenLinkServiceModal,
  totalFieldsCount,
  applicableFieldsCount,
  linkedServicesCount = 0,
  customizedVariantNames = [],
}: ServiceVariantToolbarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("ALL");

  // Extract unique distinct services from the variants list
  const distinctServices = useMemo(() => {
    const map = new Map<string, { id?: string; name: string; code?: string }>();
    for (const v of variants) {
      if (v.serviceName) {
        const key = v.serviceName.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: v.serviceId,
            name: v.serviceName,
            code: v.serviceCode,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [variants]);

  // Filter variants by search term and selected service filter
  const filteredVariants = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return variants.filter((v) => {
      // Service filter
      if (selectedServiceFilter !== "ALL") {
        if (!v.serviceName || v.serviceName.toLowerCase() !== selectedServiceFilter.toLowerCase()) {
          return false;
        }
      }
      // Search term
      if (!term) return true;
      const nameMatch = v.name.toLowerCase().includes(term);
      const svcMatch = Boolean(v.serviceName && v.serviceName.toLowerCase().includes(term));
      const codeMatch = Boolean(v.serviceCode && v.serviceCode.toLowerCase().includes(term));
      return nameMatch || svcMatch || codeMatch;
    });
  }, [variants, searchTerm, selectedServiceFilter]);

  const isFiltered = selectedVariant !== "ALL";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mb-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Service Variants & Conditional Views
              </h2>
              <span className="text-[10px] font-semibold font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/50">
                {variants.length} {variants.length === 1 ? "Variant" : "Variants"}
                {linkedServicesCount > 0 && ` · ${linkedServicesCount} Services`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Click any service variant button below to view the form sections and fields configured for that variant.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          {isFiltered && (
            <button
              type="button"
              onClick={() => onSelectVariant("ALL")}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Show all form sections and fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Fields</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenLinkServiceModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/70 border border-indigo-200/80 dark:border-indigo-800/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            title="Link additional services or variants to this form"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link / Add Service</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search variants (e.g. Amateur, Domestic, VSAT)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Service Dropdown Filter */}
          {distinctServices.length > 1 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[200px] truncate"
              >
                <option value="ALL">All Services ({variants.length})</option>
                {distinctServices.map((svc) => (
                  <option key={svc.name} value={svc.name}>
                    {svc.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Counter of matching variants */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 self-end sm:self-center">
          Showing {filteredVariants.length} of {variants.length} variants
        </div>
      </div>

      {/* Variant Buttons / Chips List */}
      <div className="p-3.5 max-h-48 overflow-y-auto">
        <div className="flex flex-wrap gap-2 items-center">
          {/* "All Sections & Fields" Base Button */}
          <button
            type="button"
            onClick={() => onSelectVariant("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedVariant === "ALL"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/30"
                : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {selectedVariant === "ALL" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
            )}
            <span>All Sections & Fields</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                selectedVariant === "ALL"
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              {totalFieldsCount}
            </span>
          </button>

          {/* Dynamic Variant Buttons */}
          {filteredVariants.map((v) => {
            const isSelected = selectedVariant.toLowerCase().trim() === v.name.toLowerCase().trim();

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVariant(v.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer max-w-full truncate ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/30 font-semibold"
                    : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
                title={v.serviceName ? `${v.name} (${v.serviceName})` : v.name}
              >
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                )}
                {customizedVariantNames.includes(v.name) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Independent custom form configured" />
                )}
                <span className="truncate">{v.name}</span>
                {v.serviceCode && (
                  <span
                    className={`text-[9px] font-mono px-1 rounded uppercase tracking-wider shrink-0 ${
                      isSelected
                        ? "bg-indigo-500/90 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {v.serviceCode.replace(/^NTC_/, "")}
                  </span>
                )}
              </button>
            );
          })}

          {filteredVariants.length === 0 && (
            <div className="py-2 px-3 text-xs text-slate-400 italic">
              No service variants match your search filter.
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedServiceFilter("ALL");
                }}
                className="ml-2 text-indigo-600 dark:text-indigo-400 underline font-semibold not-italic"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Variant Live Banner */}
      {isFiltered && (
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-transparent border-t border-indigo-100 dark:border-indigo-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300 truncate">
              Editor Active Variant: <strong className="text-indigo-700 dark:text-indigo-300 font-bold">{selectedVariant}</strong>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 shrink-0">
              Showing {applicableFieldsCount} of {totalFieldsCount} fields
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectVariant("ALL")}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-3"
          >
            Reset to All
          </button>
        </div>
      )}
    </div>
  );
}
