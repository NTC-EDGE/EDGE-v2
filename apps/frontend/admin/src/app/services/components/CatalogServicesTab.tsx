"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import { ServiceCategory, ServiceItem } from "@/services/catalogService";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
interface CatalogServicesTabProps {
  categories: ServiceCategory[];
  selectedCategoryId: string;
  onSelectCategoryId: (id: string) => void;
  onEditCategory: (cat: ServiceCategory) => void;
  onDeleteCategory: (id: string) => void;
  loadingServices: boolean;
  pagedServices: ServiceItem[];
  filteredServices: ServiceItem[];
  servicesPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditService: (s: ServiceItem) => void;
  onDeleteService: (id: string) => void;
}

export function CatalogServicesTab({
  categories,
  selectedCategoryId,
  onSelectCategoryId,
  onEditCategory,
  onDeleteCategory,
  loadingServices,
  pagedServices,
  filteredServices,
  servicesPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEditService,
  onDeleteService,
}: CatalogServicesTabProps) {
  const columns: ColumnDef<ServiceItem>[] = [
    {
      header: "Category",
      accessorKey: "serviceCategoryType",
      cell: (val, row) => (
        <span className="text-[10px] bg-indigo-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold border border-indigo-200 dark:border-indigo-950 uppercase">
          {String(val) || row.serviceCategoryCode || "Service"}
        </span>
      ),
    },
    {
      header: "Service Name",
      accessorKey: "name",
      cell: (val) => <span className="font-bold text-slate-900 dark:text-white">{String(val)}</span>,
    },
    {
      header: "Code",
      accessorKey: "code",
      cell: (val) => <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300">{val ? String(val) : "-"}</span>,
    },
    {
      header: "Group",
      accessorKey: "group",
      cell: (val) => String(val) || "General",
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (val) => <span className="max-w-sm truncate block text-slate-600 dark:text-slate-400">{val ? String(val) : "No description."}</span>,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <button
          onClick={() => onSelectCategoryId("ALL")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
            selectedCategoryId === "ALL"
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center shrink-0">
            <button
              onClick={() => onSelectCategoryId(cat.id)}
              className={`px-3 py-1.5 rounded-l-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap border-y border-l ${
                selectedCategoryId === cat.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {cat.name} {cat.code ? `(${cat.code})` : ""}
            </button>
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 border-y border-r border-slate-200 dark:border-slate-800 rounded-r-lg px-0.5">
              <button
                onClick={() => onEditCategory(cat)}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                title="Edit Category"
              >
                <Edit className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={() => onDeleteCategory(cat.id)}
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                title="Delete Category"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <DataTable
          data={pagedServices}
          columns={columns}
          loading={loadingServices}
          emptyState={<div>No services registered.</div>}
          rowActionMenu={(row) => [
            {
              label: "Edit Service",
              icon: Edit,
              onClick: () => onEditService(row),
            },
            {
              label: "Delete Service",
              icon: Trash2,
              onClick: () => onDeleteService(row.id),
              variant: "destructive" as const,
            },
          ]}
          pagination={
            filteredServices.length > 0
              ? {
                  currentPage: servicesPage,
                  totalItems: filteredServices.length,
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
