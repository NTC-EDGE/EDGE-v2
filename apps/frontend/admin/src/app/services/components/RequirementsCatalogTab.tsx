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
      cell: (val) => <span className="font-bold text-slate-900 dark:text-white max-w-md block">{String(val)}</span>,
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (val) => <span className="max-w-lg leading-relaxed text-slate-600 dark:text-slate-400 block">{val ? String(val) : "-"}</span>,
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
          rowActionMenu={(row) => [
            {
              label: "Edit Requirement",
              icon: Edit,
              onClick: () => onEditRequirement(row),
            },
            {
              label: "Delete Requirement",
              icon: Trash2,
              onClick: () => onDeleteRequirement(row.id),
              variant: "destructive" as const,
            },
          ]}
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
