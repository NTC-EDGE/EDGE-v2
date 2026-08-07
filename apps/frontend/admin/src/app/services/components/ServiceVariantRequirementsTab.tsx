"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import { ServiceVariantRequirement } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
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
  const columns: ColumnDef<ServiceVariantRequirement>[] = [
    {
      header: "Service & Variant",
      accessorKey: "serviceName",
      cell: (_, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-white block">{row.serviceName || "Global Service"}</span>
          {row.serviceVariantType !== "NA" && (
            <span className="text-[10px] text-indigo-400 mt-0.5 font-medium block">{row.serviceVariantType || "Standard"} Variant</span>
          )}
        </div>
      ),
    },
    {
      header: "Mapped Requirement",
      accessorKey: "requirement",
      cell: (_, row) => <span className="font-bold text-white block">{row.requirement?.name || "Requirement"}</span>,
    },
    {
      header: "Context Key (Applicant Type)",
      accessorKey: "contextKey",
      cell: (val) => val ? (
        <span className="px-2 py-0.5 bg-slate-950 border border-slate-855 text-indigo-400 rounded inline-block font-mono text-[10px]">
          {String(val)}
        </span>
      ) : (
        <span className="text-slate-500 text-[10px] inline-block font-mono">All Types</span>
      ),
    },
    {
      header: "Necessity",
      accessorKey: "isRequired",
      cell: (val) => (
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase inline-block ${
          val 
            ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
            : "bg-slate-800 text-slate-400 border-slate-700"
        }`}>
          {val ? "Mandatory" : "Optional"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEditMapping(row)}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteMapping(row.id)}
            className="p-1.5 rounded-lg border border-slate-855 hover:bg-slate-850 hover:text-rose-400 transition-colors"
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
          data={pagedFlatMappings}
          columns={columns}
          loading={loadingAllMapped}
          emptyState={<div>No service variant requirements registered.</div>}
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
    </div>
  );
}
