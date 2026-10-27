"use client";

import { Edit, Trash2, Search, X, ClipboardList } from "lucide-react";
import { Requirement } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

interface RequirementsCatalogTabProps {
  loadingReqs: boolean;
  pagedRequirements: Requirement[];
  totalCount: number;
  requirementsPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onEditRequirement: (r: Requirement) => void;
  onDeleteRequirement: (id: string) => void;
}

export function RequirementsCatalogTab({
  loadingReqs,
  pagedRequirements,
  totalCount,
  requirementsPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchTerm = "",
  onSearchChange,
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
    <div className="p-4 md:p-6 space-y-4">
      {/* Header and Search Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-500" />
            Master Requirements Catalog
            {totalCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                {totalCount} total
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage standard application requirements, documentary attachments, and descriptions.
          </p>
        </div>

        {onSearchChange && (
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <DataTable
          data={pagedRequirements}
          columns={columns}
          loading={loadingReqs}
          emptyState={
            <div className="text-center py-8 text-slate-400">
              <ClipboardList className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">No master requirements found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm.trim().length > 0
                  ? "Try adjusting your search criteria."
                  : "No master catalog requirements registered yet."}
              </p>
            </div>
          }
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
            totalCount > 0
              ? {
                  currentPage: requirementsPage,
                  totalItems: totalCount,
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
