"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import { ServiceVariantRequirement } from "@edge/api";
import { Pagination } from "@/components/ui/pagination";

interface ServiceVariantRequirementsTabProps {
  loadingAllMapped: boolean;
  pagedFlatMappings: ServiceVariantRequirement[];
  filteredFlatMappings: ServiceVariantRequirement[];
  flatMappingsPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditMapping: (mr: ServiceVariantRequirement) => void;
  onDeleteMapping: (id: string) => void;
}

export function ServiceVariantRequirementsTab({
  loadingAllMapped,
  pagedFlatMappings,
  filteredFlatMappings,
  flatMappingsPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEditMapping,
  onDeleteMapping,
}: ServiceVariantRequirementsTabProps) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/20">
              <th className="py-3 px-4">Service & Variant</th>
              <th className="py-3 px-4">Mapped Requirement</th>
              <th className="py-3 px-4">Context Key (Applicant Type)</th>
              <th className="py-3 px-4">Necessity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingAllMapped ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                </td>
              </tr>
            ) : pagedFlatMappings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No service variant requirements registered.
                </td>
              </tr>
            ) : (
              pagedFlatMappings.map((mr) => (
                <tr key={mr.id} className="border-b border-slate-855 hover:bg-slate-955/20 transition-all text-slate-200">
                  <td className="py-3.5 px-4 font-semibold text-slate-300">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{mr.serviceName || "Global Service"}</span>
                      <span className="text-[10px] text-indigo-400 mt-0.5 font-medium">{mr.serviceVariantType || "Standard"} Variant</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{mr.requirement?.name || "Requirement"}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px]">
                    {mr.contextKey ? (
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-855 text-indigo-400 rounded">
                        {mr.contextKey}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">All Types</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      mr.isRequired 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      {mr.isRequired ? "Mandatory" : "Optional"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditMapping(mr)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMapping(mr.id)}
                        className="p-1.5 rounded-lg border border-slate-855 hover:bg-slate-850 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredFlatMappings.length > 0 && (
        <Pagination
          currentPage={flatMappingsPage}
          totalItems={filteredFlatMappings.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
