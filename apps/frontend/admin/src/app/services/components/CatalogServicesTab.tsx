"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import { ServiceCategory, ServiceItem } from "@/services/catalogService";
import { Pagination } from "@/components/ui/pagination";

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
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <button
          onClick={() => onSelectCategoryId("ALL")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
            selectedCategoryId === "ALL"
              ? "bg-indigo-600 text-white"
              : "bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-300"
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
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.name} {cat.code ? `(${cat.code})` : ""}
            </button>
            <div className="flex items-center bg-slate-950 border-y border-r border-slate-850 rounded-r-lg px-0.5">
              <button
                onClick={() => onEditCategory(cat)}
                className="p-1 text-slate-500 hover:text-indigo-400"
                title="Edit Category"
              >
                <Edit className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={() => onDeleteCategory(cat.id)}
                className="p-1 text-slate-500 hover:text-rose-400"
                title="Delete Category"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/20">
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Service Name</th>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Group</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingServices ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                </td>
              </tr>
            ) : pagedServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No services registered.
                </td>
              </tr>
            ) : (
              pagedServices.map((s) => (
                <tr key={s.id} className="border-b border-slate-850 hover:bg-slate-955/20 transition-all text-slate-200">
                  <td className="py-3.5 px-4 font-medium">
                    <span className="text-[10px] bg-slate-950 text-indigo-400 px-2 py-0.5 rounded font-bold border border-indigo-950 uppercase">
                      {s.serviceCategoryType || s.serviceCategoryCode || "Service"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px]">{s.code || "-"}</td>
                  <td className="py-3.5 px-4 text-slate-400">{s.group || "General"}</td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-sm truncate">{s.description || "No description."}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditService(s)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteService(s.id)}
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

      {filteredServices.length > 0 && (
        <Pagination
          currentPage={servicesPage}
          totalItems={filteredServices.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
