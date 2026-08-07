"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import { ServiceVariant } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
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
  const columns: ColumnDef<ServiceVariant>[] = [
    {
      header: "Service",
      accessorKey: "serviceName",
      cell: (val) => <span className="font-medium text-slate-400 max-w-xs truncate block">{val ? String(val) : "Global Service"}</span>,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (val) => {
        const typeStr = String(val);
        if (typeStr === "NA") return null;
        
        const isNewStyle = ["New", "FirstTaker", "First-taker", "VSAT"].includes(typeStr);
        const isRenewalStyle = ["Renewal", "Retaker"].includes(typeStr);
        
        let label = typeStr;
        if (typeStr === "FirstTaker") label = "First-taker";
        else if (typeStr === "CivicActionGroup") label = "Civic Action Group";

        return (
          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase inline-block font-bold ${
            isNewStyle
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : isRenewalStyle
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
              : "bg-sky-500/10 text-sky-400 border-sky-500/20"
          }`}>
            {label}
          </span>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (val) => <span className="text-slate-400 max-w-sm truncate block">{val ? String(val) : "No description."}</span>,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEditVariant(row)}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteVariant(row.id)}
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
          data={pagedVariants}
          columns={columns}
          loading={loadingVariants}
          emptyState={<div>No service variants registered.</div>}
          pagination={
            filteredVariants.length > 0
              ? {
                  currentPage: variantsPage,
                  totalItems: filteredVariants.length,
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
