"use client";

import React, { useState, useEffect } from "react";
import { Link2, Edit2, Trash2 } from "lucide-react";
import { ServiceVariantRequirement } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface ServiceVariantRequirementsTableProps {
  serviceVariantRequirements: ServiceVariantRequirement[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  onEdit: (item: ServiceVariantRequirement) => void;
  onDelete: (item: ServiceVariantRequirement) => void;
}

export function ServiceVariantRequirementsTable({
  serviceVariantRequirements,
  loading,
  canManage,
  searchTerm,
  onEdit,
  onDelete,
}: ServiceVariantRequirementsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredSvr = serviceVariantRequirements.filter((svr) => {
    const serviceName = svr.serviceName ?? "";
    const serviceCode = svr.serviceCode ?? "";
    const variantType = svr.serviceVariantType ?? "";
    const reqName = svr.requirement?.name ?? "";
    const appType = svr.contextKey ?? "";

    return (
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variantType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reqName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const paginatedSvr = filteredSvr.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Service & Variant</th>
              <th className="px-6 py-4">Requirement</th>
              <th className="px-6 py-4">Context Key</th>
              <th className="px-6 py-4">Necessity</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading service requirements catalog...</span>
                </td>
              </tr>
            ) : filteredSvr.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                  <Link2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No service requirements mapped</p>
                  <p className="text-xs text-slate-500">No requirements have been mapped to service variants yet.</p>
                </td>
              </tr>
            ) : (
              paginatedSvr.map((item) => {
                const serviceDisplay = item.serviceName !== null && item.serviceName !== undefined && item.serviceName !== "" 
                  ? `${item.serviceName} (${item.serviceCode ?? ""})` 
                  : "Unknown Service";
                const variantDisplay = item.serviceVariantType !== null && item.serviceVariantType !== undefined && item.serviceVariantType !== "" 
                  ? item.serviceVariantType 
                  : "Standard";
                
                const menuItems: ActionMenuItem[] = [
                  {
                    label: "Modify Mapping",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  },
                  {
                    label: "Remove Mapping Rule",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  },
                ];

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{serviceDisplay}</span>
                        <span className="text-xs text-indigo-400 mt-0.5 font-medium">{variantDisplay} Variant</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{item.requirement?.name ?? "Unknown Requirement"}</span>
                        <span className="text-xs text-slate-400 mt-0.5">{item.requirement?.description ?? ""}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-950/70 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {item.contextKey !== null && item.contextKey !== undefined && item.contextKey !== "" 
                          ? item.contextKey 
                          : "Any / Default"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.isRequired
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-slate-850 text-slate-400 border-slate-700"
                        }`}
                      >
                        {item.isRequired ? "Mandatory" : "Optional"}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <ActionMenu items={menuItems} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredSvr.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSvr.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
