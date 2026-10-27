"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Building2,
  Check,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { FormSchema, LinkedServiceItem } from "./types";
import { ServiceItem, ServiceCategory } from "@/services/catalogService";
import { getEffectiveLinkedServices } from "./canonicalFormServices";

interface LinkServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: FormSchema;
  catalogServices: ServiceItem[];
  catalogCategories: ServiceCategory[];
  onSaveLinkedServices: (
    services: LinkedServiceItem[],
    customVariants?: string[]
  ) => void;
}

export function LinkServiceModal({
  isOpen,
  onClose,
  form,
  catalogServices,
  catalogCategories,
  onSaveLinkedServices,
}: LinkServiceModalProps) {
  const initialEffectiveServices = useMemo(() => {
    return getEffectiveLinkedServices(form, catalogServices);
  }, [form, catalogServices]);

  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(() => {
    return new Set(initialEffectiveServices.map((s) => s.id));
  });

  const [customVariantsList, setCustomVariantsList] = useState<string[]>(() => {
    return form.linkedVariants ? [...form.linkedVariants] : [];
  });

  const [newVariantInput, setNewVariantInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Re-sync when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const effective = getEffectiveLinkedServices(form, catalogServices);
      setSelectedServiceIds(new Set(effective.map((s) => s.id)));
      setCustomVariantsList(form.linkedVariants ? [...form.linkedVariants] : []);
      setSearchTerm("");
      setSelectedCategoryId("");
      setNewVariantInput("");
    }
  }, [isOpen, form, catalogServices]);

  const primaryServiceId = form.serviceId ?? null;

  // Filter catalog services by search term and category
  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return catalogServices.filter((svc) => {
      if (selectedCategoryId && svc.serviceCategoryId !== selectedCategoryId) {
        return false;
      }
      if (!term) return true;
      const nameMatch = svc.name.toLowerCase().includes(term);
      const codeMatch = Boolean(svc.code && svc.code.toLowerCase().includes(term));
      const groupMatch = Boolean(svc.group && svc.group.toLowerCase().includes(term));
      return nameMatch || codeMatch || groupMatch;
    });
  }, [catalogServices, searchTerm, selectedCategoryId]);

  const toggleService = (svc: ServiceItem) => {
    if (svc.id === primaryServiceId) {
      // Primary service cannot be unlinked
      return;
    }
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(svc.id)) {
        next.delete(svc.id);
      } else {
        next.add(svc.id);
      }
      return next;
    });
  };

  const handleAddCustomVariant = () => {
    const trimmed = newVariantInput.trim();
    if (!trimmed) return;
    const exists = customVariantsList.some(
      (v) => v.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      setCustomVariantsList((prev) => [...prev, trimmed]);
    }
    setNewVariantInput("");
  };

  const handleRemoveCustomVariant = (index: number) => {
    setCustomVariantsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedServices: LinkedServiceItem[] = [];

    // Always include primary service if defined
    if (form.serviceId && form.serviceName) {
      updatedServices.push({
        id: form.serviceId,
        name: form.serviceName,
        code: form.serviceCode,
      });
    }

    // Add selected services from catalog
    for (const svc of catalogServices) {
      if (selectedServiceIds.has(svc.id) && svc.id !== primaryServiceId) {
        updatedServices.push({
          id: svc.id,
          name: svc.name,
          code: svc.code,
          categoryName: svc.serviceCategoryType || svc.serviceCategoryCode,
        });
      }
    }

    onSaveLinkedServices(updatedServices, customVariantsList);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        style={{ maxWidth: 720 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Link Services to Form Template
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Associate application services with &quot;{form.name || form.serviceName || "this form"}&quot;. Service variants from linked services appear in the editor variant toolbar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Service Banner */}
        {form.serviceName && (
          <div className="px-5 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                Primary Assigned Service:
              </span>
              <strong className="text-slate-900 dark:text-white font-semibold">
                {form.serviceName}
              </strong>
              {form.serviceCode && (
                <span className="font-mono text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                  {form.serviceCode}
                </span>
              )}
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
              Primary (Locked)
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search catalog services by name or code..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            {catalogCategories.length > 0 && (
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">All Service Categories</option>
                {catalogCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Services Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Catalog Services ({selectedServiceIds.size} selected)
              </span>
              <span className="text-[11px] text-slate-400">
                Click any service to toggle association
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
              {filteredServices.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No services found matching your search.
                </div>
              ) : (
                filteredServices.map((svc) => {
                  const isChecked = selectedServiceIds.has(svc.id);
                  const isPrimary = svc.id === primaryServiceId;

                  return (
                    <div
                      key={svc.id}
                      onClick={() => toggleService(svc)}
                      className={`p-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      } ${isPrimary ? "cursor-default opacity-85" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {svc.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            {svc.code && (
                              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300">
                                {svc.code}
                              </span>
                            )}
                            {svc.serviceCategoryType && (
                              <span>· {svc.serviceCategoryType}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isPrimary && (
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Custom Service Variants Section */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Additional / Custom Variants
              </span>
              <span className="text-[11px] text-slate-400">
                Optional custom variant buttons
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              If this form uses specialized variant titles not listed in the catalog, add them here so buttons are created at the top of the form builder.
            </p>

            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={newVariantInput}
                onChange={(e) => setNewVariantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomVariant();
                  }
                }}
                placeholder="e.g. Foreign Visitor, Special Event, Storage..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={handleAddCustomVariant}
                disabled={!newVariantInput.trim()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {customVariantsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {customVariantsList.map((varName, idx) => (
                  <span
                    key={`custom-var-${idx}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <span>{varName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomVariant(idx)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove variant"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Changes take effect immediately on the form canvas.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Apply Linked Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
