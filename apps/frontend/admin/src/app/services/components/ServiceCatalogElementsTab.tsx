"use client";

import { useState, useMemo } from "react";
import { Layers, Edit2, Trash2, Plus, Search, Loader2, Folder } from "lucide-react";
import { ServiceVariant } from "@edge/api";
import { ServiceVariantElement } from "@/services/feesService";
import { ServiceItem, ServiceCategory } from "@/services/catalogService";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ServiceCatalogElementsTabProps {
  categories: ServiceCategory[];
  services: ServiceItem[];
  filteredServices: ServiceItem[];
  servicesSearch: string;
  onServicesSearchChange: (val: string) => void;
  elementsSearch: string;
  onElementsSearchChange: (val: string) => void;
  mappingServiceId: string;
  onSelectMappingServiceId: (id: string) => void;
  mappingVariants: ServiceVariant[];
  mappingVariantId: string;
  onSelectMappingVariantId: (id: string) => void;
  elements: ServiceVariantElement[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loadingElements: boolean;
  canManage: boolean;
  onAddElement: () => void;
  onEditElement: (item: ServiceVariantElement) => void;
  onDeleteElement: (id: string) => void;
}

export function ServiceCatalogElementsTab({
  categories,
  services,
  filteredServices,
  servicesSearch,
  onServicesSearchChange,
  elementsSearch,
  onElementsSearchChange,
  mappingServiceId,
  onSelectMappingServiceId,
  mappingVariants,
  mappingVariantId,
  onSelectMappingVariantId,
  elements,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loadingElements,
  canManage,
  onAddElement,
  onEditElement,
  onDeleteElement,
}: ServiceCatalogElementsTabProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Scope services to selected category (UI-only helper for user experience)
  const scopedServices = useMemo(() => {
    let list = filteredServices;
    if (selectedCategoryId.trim().length > 0) {
      list = list.filter((s) => s.serviceCategoryId === selectedCategoryId);
    }
    return list;
  }, [filteredServices, selectedCategoryId]);

  // Exclude N/A variants from display in Column 2
  const displayVariants = useMemo(() => {
    return mappingVariants.filter((v) => v.type !== "NA" && v.type !== "N/A");
  }, [mappingVariants]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    if (categoryId.trim().length > 0) {
      const isCurrentServiceInCategory = services.some(
        (s) => s.id === mappingServiceId && s.serviceCategoryId === categoryId
      );
      if (!isCurrentServiceInCategory) {
        const firstMatchingService = services.find((s) => s.serviceCategoryId === categoryId);
        if (firstMatchingService !== undefined) {
          onSelectMappingServiceId(firstMatchingService.id);
        } else {
          onSelectMappingServiceId("");
        }
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-900">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Element Mappings
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">
            Map examination and operational elements to specific service variants.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Services Column */}
        <div className="lg:col-span-4 flex flex-col space-y-3 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-850">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">1. Select Service</span>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              {scopedServices.length} Total
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Folder className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
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

          {/* Service Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search services..."
              value={servicesSearch}
              onChange={(e) => onServicesSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Service List */}
          <div className="space-y-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
            {scopedServices.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectMappingServiceId(s.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                  mappingServiceId === s.id
                    ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/10"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="truncate mr-2 flex flex-col">
                  <span className="truncate">{s.name}</span>
                  <span className={`text-[9px] mt-0.5 ${mappingServiceId === s.id ? "text-indigo-200" : "text-slate-500"}`}>
                    {s.group || s.serviceCategoryCode || "General"}
                  </span>
                </div>
                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  mappingServiceId === s.id ? "bg-indigo-700 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-800/80"
                }`}>
                  {s.code || "SVC"}
                </span>
              </button>
            ))}
            {scopedServices.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">No services found.</div>
            )}
          </div>
        </div>

        {/* 2. Variants Column */}
        <div className="lg:col-span-3 flex flex-col space-y-3 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-850">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">2. Select Variant</span>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              {displayVariants.length} Active
            </span>
          </div>
          <div className="space-y-1.5 overflow-y-auto max-h-[420px] pr-1">
            {displayVariants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectMappingVariantId(v.id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex flex-col border ${
                  mappingVariantId === v.id
                    ? "bg-indigo-600 border-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/10"
                    : "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{v.type}</span>
                  <span className={`text-[8px] font-mono uppercase px-1 rounded ${
                    mappingVariantId === v.id ? "bg-indigo-700 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500"
                  }`}>
                    Variant
                  </span>
                </div>
                {v.description && (
                  <span className={`text-[9px] mt-1 font-normal line-clamp-2 leading-relaxed ${
                    mappingVariantId === v.id ? "text-indigo-200" : "text-slate-500"
                  }`}>
                    {v.description}
                  </span>
                )}
              </button>
            ))}
            {displayVariants.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                {mappingServiceId ? "No variants registered for this service." : "Select a service to view variants."}
              </div>
            )}
          </div>
        </div>

        {/* 3. Elements Column */}
        <div className="lg:col-span-5 flex flex-col space-y-3 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200 min-h-[300px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-850">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">3. Exam & Operational Elements</span>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              {elements.length} Linked
            </span>
          </div>

          {/* Elements Search */}
          {mappingVariantId && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search mapped elements..."
                value={elementsSearch}
                onChange={(e) => onElementsSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-[420px] pr-1 space-y-2.5 mt-2">
            {!mappingVariantId ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                Select a service and variant from the left lists to view required elements.
              </div>
            ) : loadingElements ? (
              <div className="text-center py-16 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
              </div>
            ) : elements.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center justify-center space-y-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">No elements mapped to this variant.</span>
                <span className="text-[11px] text-slate-400">Click "Link Element" in the header to map elements to this variant.</span>
              </div>
            ) : (
              elements.map((el) => (
                <div
                  key={el.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl transition-all flex flex-col space-y-2 min-w-0"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 shrink-0">
                          {el.code}
                        </span>
                      </div>
                      {el.description ? (
                        <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed break-words whitespace-normal">
                          {el.description}
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">
                          No description provided
                        </p>
                      )}
                    </div>

                    {canManage && (
                      <div className="shrink-0 ml-1">
                        <ActionMenu
                          items={[
                            {
                              label: "Edit Mapping",
                              icon: Edit2,
                              onClick: () => onEditElement(el),
                            },
                            {
                              label: "Unlink Element",
                              icon: Trash2,
                              onClick: () => onDeleteElement(el.id),
                              variant: "destructive",
                            },
                          ]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
