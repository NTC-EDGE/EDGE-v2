"use client";

import { useState, useMemo } from "react";
import { Search, Edit, Trash2, Loader2, Folder, LayoutGrid, TableProperties, Plus, Link2 } from "lucide-react";
import { ServiceItem, ServiceCategory } from "@/services/catalogService";
import { ServiceVariant, Requirement, ServiceVariantRequirement } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

interface ServiceRequirementsTabProps {
  categories: ServiceCategory[];
  services: ServiceItem[];
  filteredServices: ServiceItem[];
  servicesSearch: string;
  onServicesSearchChange: (val: string) => void;
  mappingServiceId: string;
  onSelectMappingServiceId: (id: string) => void;
  mappingVariants: ServiceVariant[];
  mappingVariantId: string;
  onSelectMappingVariantId: (id: string) => void;
  requirements: Requirement[];
  onOpenLinkMapping: () => void;
  onOpenCreateVariant: (serviceId: string) => void;
  loadingServiceReqs: boolean;
  serviceRequirements: any[]; // contains Requirement properties + mappings
  onEditRequirement: (req: any) => void;
  onDeleteMapping: (id: string) => void;
  // Flat table props
  loadingAllMapped: boolean;
  pagedFlatMappings: ServiceVariantRequirement[];
  filteredFlatMappings: ServiceVariantRequirement[];
  flatMappingsPage: number;
  flatMappingsSearch: string;
  onFlatMappingsSearchChange: (val: string) => void;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  canManage: boolean;
}

export function ServiceRequirementsTab({
  categories,
  services,
  filteredServices,
  servicesSearch,
  onServicesSearchChange,
  mappingServiceId,
  onSelectMappingServiceId,
  mappingVariants,
  mappingVariantId,
  onSelectMappingVariantId,
  requirements,
  onOpenLinkMapping,
  onOpenCreateVariant,
  loadingServiceReqs,
  serviceRequirements,
  onEditRequirement,
  onDeleteMapping,
  loadingAllMapped,
  pagedFlatMappings,
  filteredFlatMappings,
  flatMappingsPage,
  flatMappingsSearch,
  onFlatMappingsSearchChange,
  pageSize,
  onPageChange,
  onPageSizeChange,
  canManage,
}: ServiceRequirementsTabProps) {
  const [viewMode, setViewMode] = useState<"navigator" | "table">("navigator");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Scope services to selected category (UI helper)
  const scopedServices = useMemo(() => {
    let list = filteredServices;
    if (selectedCategoryId.trim().length > 0) {
      list = list.filter((s) => s.serviceCategoryId === selectedCategoryId);
    }
    return list;
  }, [filteredServices, selectedCategoryId]);

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

  const tableColumns: ColumnDef<ServiceVariantRequirement>[] = [
    {
      header: "Service & Application Variant",
      accessorKey: "serviceName",
      cell: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-white text-xs block">{row.serviceName || "Global Service"}</span>
          <span className="text-[10px] text-indigo-400 font-medium block">
            {row.serviceVariantType && row.serviceVariantType !== "NA" ? `${row.serviceVariantType} Variant` : "Standard Scope"}
          </span>
        </div>
      ),
    },
    {
      header: "Documentary Requirement",
      accessorKey: "requirement",
      cell: (_, row) => (
        <div className="flex flex-col gap-0.5 max-w-md">
          <span className="font-bold text-slate-200 text-xs block">{row.requirement?.name || "Requirement"}</span>
          {row.requirement?.description && (
            <span className="text-[10px] text-slate-400 line-clamp-1 block">{row.requirement.description}</span>
          )}
        </div>
      ),
    },
    {
      header: "Context Key (Applicant Type)",
      accessorKey: "contextKey",
      cell: (val) =>
        val ? (
          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-indigo-300 rounded inline-block font-mono text-[10px]">
            {String(val)}
          </span>
        ) : (
          <span className="text-slate-500 text-[10px] inline-block font-mono">All Applicant Types</span>
        ),
    },
    {
      header: "Requirement Necessity",
      accessorKey: "isRequired",
      cell: (val) => (
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase inline-block ${
            val
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          {val ? "Mandatory" : "Optional"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Toolbar with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-400" />
            Checklist Requirements Mappings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Link and map mandatory compliance documents to specific services and application variants.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("navigator")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "navigator"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Service Navigator
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              All Mappings Table
            </button>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={onOpenLinkMapping}
              disabled={requirements.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow shadow-indigo-600/20 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Link Requirement
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: Service Navigator (3-Column View) */}
      {viewMode === "navigator" && (
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
                className="w-full px-2.5 py-1.5 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-100 py-1">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100 py-1">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Search */}
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

            {/* Services List */}
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
                {mappingVariants.length} Active
              </span>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-[420px] pr-1">
              {mappingVariants.map((v) => (
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
                    <span>
                      {v.type === "NA" ? "Standard" : v.type === "FirstTaker" ? "First-taker" : v.type === "CivicActionGroup" ? "Civic Action Group" : v.type}
                    </span>
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
              {mappingVariants.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center justify-center space-y-2.5">
                  <span>No variants registered.</span>
                  {mappingServiceId && canManage && (
                    <button
                      type="button"
                      onClick={() => onOpenCreateVariant(mappingServiceId)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[10px] text-indigo-400 rounded-lg border border-slate-800 transition-colors font-medium"
                    >
                      Create Variant
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Requirements Checklist Pane */}
          <div className="lg:col-span-5 flex flex-col space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-855 min-h-[300px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">3. Documentary Checklist</span>
              {mappingVariantId && canManage && (
                <button
                  type="button"
                  onClick={onOpenLinkMapping}
                  disabled={requirements.length === 0}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all text-[10px] shadow shadow-indigo-600/20"
                >
                  + Add Rule
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[420px] pr-1 space-y-2.5 mt-2">
              {!mappingVariantId ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  Select a service and variant from the left lists to view required documents.
                </div>
              ) : loadingServiceReqs ? (
                <div className="text-center py-16 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                </div>
              ) : serviceRequirements.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center justify-center space-y-2.5">
                  <span>No documentary requirements linked to this variant.</span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={onOpenLinkMapping}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl font-medium shadow-md shadow-indigo-600/20"
                    >
                      Add First Requirement
                    </button>
                  )}
                </div>
              ) : (
                serviceRequirements.map((mr) => (
                  <div
                    key={mr.serviceVariantRequirementId || mr.requirementId}
                    className="p-3 bg-slate-900 border border-slate-855 hover:border-slate-800 rounded-xl transition-all flex flex-col space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white leading-normal truncate">{mr.name}</h4>
                        {mr.description && (
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                            {mr.description}
                          </p>
                        )}
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onEditRequirement(mr)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
                            title="Edit Requirement"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMapping(mr.serviceVariantRequirementId)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-805 hover:text-rose-400 transition-colors"
                            title="Remove Requirement from Variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                          mr.isRequired
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {mr.isRequired ? "Mandatory" : "Optional"}
                      </span>

                      <span className="text-[9px] font-medium text-slate-500 font-mono truncate">
                        Context:{" "}
                        {mr.contextKey ? (
                          <span className="text-indigo-400 bg-slate-950 px-1 py-0.5 rounded border border-slate-855 font-bold ml-1">
                            {mr.contextKey}
                          </span>
                        ) : (
                          "All Applicant Types"
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: All Mappings Table (Flat View) */}
      {viewMode === "table" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search mapped requirements, services..."
                value={flatMappingsSearch}
                onChange={(e) => onFlatMappingsSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredFlatMappings.length} Total Rules Configured
            </span>
          </div>

          <DataTable
            data={pagedFlatMappings}
            columns={tableColumns}
            loading={loadingAllMapped}
            emptyState={{
              title: "No checklist mappings found",
              description: "Link requirements to services and variants to start building checklists.",
            }}
            rowActionMenu={
              canManage
                ? (row): ActionMenuItem[] => [
                    {
                      label: "Edit Requirement",
                      icon: Edit,
                      onClick: () => onEditRequirement(row),
                    },
                    {
                      label: "Delete Checklist Rule",
                      icon: Trash2,
                      onClick: () => onDeleteMapping(row.id),
                      variant: "destructive",
                    },
                  ]
                : undefined
            }
            pagination={
              filteredFlatMappings.length > 0
                ? {
                    currentPage: flatMappingsPage,
                    totalItems: filteredFlatMappings.length,
                    pageSize,
                    onPageChange,
                    onPageSizeChange,
                  }
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
