"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import { ServiceVariant } from "@edge/api";
import { Pagination } from "@/components/ui/pagination";

interface ServiceVariantsTabProps {
  loadingVariants: boolean;
  pagedVariants: ServiceVariant[];
  filteredVariants: ServiceVariant[];
  variantsPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditVariant: (v: ServiceVariant) => void;
  onDeleteVariant: (id: string) => void;
}

export function ServiceVariantsTab({
  loadingVariants,
  pagedVariants,
  filteredVariants,
  variantsPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEditVariant,
  onDeleteVariant,
}: ServiceVariantsTabProps) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/20">
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingVariants ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                </td>
              </tr>
            ) : pagedVariants.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">
                  No service variants registered.
                </td>
              </tr>
            ) : (
              pagedVariants.map((v) => (
                <tr key={v.id} className="border-b border-slate-855 hover:bg-slate-955/20 transition-all text-slate-200">
                  <td className="py-3.5 px-4 font-medium text-slate-400 max-w-xs truncate">{v.serviceName || "Global Service"}</td>
                  <td className="py-3.5 px-4 font-bold">
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${
                      v.type === "New" || v.type === "FirstTaker" || v.type === "First-taker"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : v.type === "Renewal" || v.type === "Retaker"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                        : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                    }`}>
                      {v.type === "FirstTaker" ? "First-taker" : v.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-sm truncate">{v.description || "No description."}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditVariant(v)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteVariant(v.id)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-rose-400 transition-colors"
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

      {filteredVariants.length > 0 && (
        <Pagination
          currentPage={variantsPage}
          totalItems={filteredVariants.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
