"use client";

import { Search, Edit, Trash2, Loader2 } from "lucide-react";
import { ServiceItem } from "@/services/catalogService";
import { ServiceVariant, Requirement, ServiceVariantRequirement } from "@edge/api";

interface ServiceRequirementsTabProps {
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
  onEditMapping: (mr: any) => void;
  onDeleteMapping: (id: string) => void;
}

export function ServiceRequirementsTab({
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
  onEditMapping,
  onDeleteMapping,
}: ServiceRequirementsTabProps) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Services Column */}
        <div className="lg:col-span-4 flex flex-col space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-855">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">1. Select Service</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono">
              {services.length} Total
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search services..."
              value={servicesSearch}
              onChange={(e) => onServicesSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-905 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[420px] pr-1 scrollbar-thin">
            {filteredServices.map((s) => (
              <button
                key={s.id}
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
                    {s.group || "No Category"}
                  </span>
                </div>
                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  mappingServiceId === s.id ? "bg-indigo-700 text-white" : "bg-slate-900 text-slate-400 group-hover:bg-slate-800/80"
                }`}>
                  {s.code || "SVC"}
                </span>
              </button>
            ))}
            {filteredServices.length === 0 && (
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
                onClick={() => onSelectMappingVariantId(v.id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex flex-col text-slate-300 border ${
                  mappingVariantId === v.id
                    ? "bg-indigo-600 border-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/10"
                    : "bg-slate-900/20 border-slate-850 hover:bg-slate-900/50 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{(() => {
                    if (v.type === "NA") return "N/A";
                    if (v.type === "FirstTaker") return "First-taker";
                    if (v.type === "CivicActionGroup") return "Civic Action Group";
                    return v.type;
                  })()}</span>
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
                <button
                  onClick={() => onOpenCreateVariant(mappingServiceId)}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[10px] text-indigo-400 rounded-lg border border-slate-800 transition-colors font-medium"
                >
                  Create Variant
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Requirements Checklist Pane */}
        <div className="lg:col-span-5 flex flex-col space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-855 min-h-[300px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">3. Documentary Checklist</span>
            {mappingVariantId && (
              <button
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
                <button
                  onClick={onOpenLinkMapping}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl font-medium shadow-md shadow-indigo-600/20"
                >
                  Add First Requirement
                </button>
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
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditMapping(mr)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Edit Requirement"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMapping(mr.serviceVariantRequirementId)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-805 hover:text-rose-400 transition-colors"
                        title="Remove Requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      mr.isRequired 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      {mr.isRequired ? "Mandatory" : "Optional"}
                    </span>

                    <span className="text-[9px] font-medium text-slate-500 font-mono truncate">
                      Context: {mr.contextKey ? (
                        <span className="text-indigo-400 bg-slate-950 px-1 py-0.5 rounded border border-slate-855 font-bold ml-1">
                          {mr.contextKey}
                        </span>
                      ) : "All Applicant Types"}
                    </span>
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
