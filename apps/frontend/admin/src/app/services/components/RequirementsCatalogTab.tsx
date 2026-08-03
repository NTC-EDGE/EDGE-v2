"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import { Requirement } from "@edge/api";
import { Pagination } from "@/components/ui/pagination";

interface RequirementsCatalogTabProps {
  loadingReqs: boolean;
  pagedRequirements: Requirement[];
  filteredRequirements: Requirement[];
  requirementsPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditRequirement: (r: Requirement) => void;
  onDeleteRequirement: (id: string) => void;
}

export function RequirementsCatalogTab({
  loadingReqs,
  pagedRequirements,
  filteredRequirements,
  requirementsPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEditRequirement,
  onDeleteRequirement,
}: RequirementsCatalogTabProps) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/20">
              <th className="py-3 px-4">Requirement Name</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">System ID</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingReqs ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                </td>
              </tr>
            ) : pagedRequirements.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">
                  No master catalog requirements registered.
                </td>
              </tr>
            ) : (
              pagedRequirements.map((r) => (
                <tr key={r.id} className="border-b border-slate-855 hover:bg-slate-955/20 transition-all text-slate-200">
                  <td className="py-3.5 px-4 font-bold text-white max-w-md">{r.name}</td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-lg leading-relaxed">{r.description || "-"}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{r.id}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditRequirement(r)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRequirement(r.id)}
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

      {filteredRequirements.length > 0 && (
        <Pagination
          currentPage={requirementsPage}
          totalItems={filteredRequirements.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
