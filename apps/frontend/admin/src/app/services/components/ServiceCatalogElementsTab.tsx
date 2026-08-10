"use client";

import { useState, useMemo } from "react";
import { Layers, Edit2, Trash2, Plus, Search, Loader2, Folder } from "lucide-react";
import { ServiceVariant } from "@edge/api";
import { ServiceVariantElement } from "@/services/feesService";
import { ServiceItem, ServiceCategory } from "@/services/catalogService";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

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

  const columns: ColumnDef<ServiceVariantElement>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: (val) => (
        <span className="font-mono font-semibold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/50 text-[11px]">
          {String(val)}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (val) => (
        <span className="text-slate-400 text-xs max-w-[200px] block truncate" title={val !== null && val !== undefined ? String(val) : undefined}>
          {val !== null && val !== undefined && String(val).trim().length > 0 ? String(val) : "—"}
        </span>
      ),
    },
  ];

  const emptyState = {
    icon: <Layers className="w-8 h-8 mx-auto text-slate-650 mb-2" />,
    title: "No elements linked",
    description: "Link elements to this variant.",
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Services Column */}
        <div className="lg:col-span-4 flex flex-col space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-855">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">1. Select Service</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono">
              {scopedServices.length} Total
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Folder className="w-3 h-3 text-indigo-400" />
              Filter by Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-100 py-1">
                All Categories
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100 py-1">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Search (calls backend GET /services?searchTerm=...) */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search services..."
              value={servicesSearch}
              onChange={(e) => onServicesSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
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
                    : "text-slate-300 hover:bg-slate-900/50 hover:text-white"
                }`}
              >
                <div className="truncate mr-2 flex flex-col">
                  <span className="truncate">{s.name}</span>
                  <span className={`text-[9px] mt-0.5 ${mappingServiceId === s.id ? "text-indigo-200" : "text-slate-500"}`}>
                    {s.group || s.serviceCategoryCode || "General"}
                  </span>
                </div>
                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  mappingServiceId === s.id ? "bg-indigo-700 text-white" : "bg-slate-900 text-slate-400 group-hover:bg-slate-800/80"
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
        <div className="lg:col-span-3 flex flex-col space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-855">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Select Variant</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono">
              {displayVariants.length} Active
            </span>
          </div>
          <div className="space-y-1.5 overflow-y-auto max-h-[420px] pr-1">
            {displayVariants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectMappingVariantId(v.id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex flex-col text-slate-300 border ${
                  mappingVariantId === v.id
                    ? "bg-indigo-600 border-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/10"
                    : "bg-slate-900/20 border-slate-850 hover:bg-slate-900/50 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{v.type}</span>
                  <span className={`text-[8px] font-mono uppercase px-1 rounded ${
                    mappingVariantId === v.id ? "bg-indigo-700" : "bg-slate-800 text-slate-500"
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
                {mappingServiceId ? "No specific variants for this service." : "Select a service first to view variants."}
              </div>
            )}
          </div>
        </div>

        {/* 3. Elements Column */}
        <div className="lg:col-span-5 flex flex-col space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-855 min-h-[300px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">3. Exam Elements</span>
            {mappingVariantId && canManage && (
              <button
                type="button"
                onClick={onAddElement}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all text-[10px] shadow shadow-indigo-600/20 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Element
              </button>
            )}
          </div>

          {/* Exam Elements Search (calls backend query) */}
          {mappingVariantId && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search variant elements..."
                value={elementsSearch}
                onChange={(e) => onElementsSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex-1 overflow-x-auto mt-2">
            {!mappingVariantId ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                Select a service and variant from the left lists to view required elements.
              </div>
            ) : loadingElements ? (
              <div className="text-center py-16 text-slate-505">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={elements}
                getItemKey={(item) => item.id}
                loading={loadingElements}
                emptyState={emptyState}
                pagination={
                  elements.length > 0
                    ? {
                        currentPage,
                        totalItems: totalCount,
                        pageSize,
                        onPageChange,
                        onPageSizeChange,
                      }
                    : undefined
                }
                rowActionMenu={
                  canManage
                    ? (item): ActionMenuItem[] => [
                        {
                          label: "Edit Element",
                          icon: Edit2,
                          onClick: () => onEditElement(item),
                        },
                        {
                          label: "Delete Element",
                          icon: Trash2,
                          onClick: () => onDeleteElement(item.id),
                          variant: "destructive",
                        },
                      ]
                    : undefined
                }
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
