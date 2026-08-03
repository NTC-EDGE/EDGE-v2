"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import { Requirement } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
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
  const columns: ColumnDef<Requirement>[] = [
    {
      header: "Requirement Name",
      accessorKey: "name",
      cell: (val) => <span className="font-bold text-white max-w-md block">{String(val)}</span>,
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (val) => <span className="max-w-lg leading-relaxed block">{val ? String(val) : "-"}</span>,
    },
    {
      header: "System ID",
      accessorKey: "id",
      cell: (val) => <span className="font-mono text-[10px] text-slate-500">{String(val)}</span>,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEditRequirement(row)}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteRequirement(row.id)}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="overflow-x-auto">
        <DataTable
          data={pagedRequirements}
          columns={columns}
          loading={loadingReqs}
          emptyState={<div>No master catalog requirements registered.</div>}
          pagination={
            filteredRequirements.length > 0
              ? {
                  currentPage: requirementsPage,
                  totalItems: filteredRequirements.length,
                  pageSize,
                  onPageChange,
                  onPageSizeChange,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
