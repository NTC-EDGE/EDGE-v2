"use client";

import React, { useState, useEffect } from "react";
import { ClipboardList, Edit2, Trash2 } from "lucide-react";
import { Requirement, ServiceVariantRequirement } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface RequirementsTableProps {
  requirements: Requirement[];
  serviceVariantRequirements: ServiceVariantRequirement[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  onEdit: (item: Requirement) => void;
  onDelete: (item: Requirement) => void;
}

export function RequirementsTable({
  requirements,
  serviceVariantRequirements,
  loading,
  canManage,
  searchTerm,
  onEdit,
  onDelete,
}: RequirementsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredRequirements = requirements.filter(
    (req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.description !== null && req.description !== undefined && req.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedRequirements = filteredRequirements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Requirement Name</th>
              <th className="px-6 py-4">Description</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 3 : 2} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading requirements catalog...</span>
                </td>
              </tr>
            ) : filteredRequirements.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 3 : 2} className="px-6 py-12 text-center text-slate-400">
                  <ClipboardList className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No requirements configured</p>
                  <p className="text-xs text-slate-500">There are no administrative requirements registered in the catalog yet.</p>
                </td>
              </tr>
            ) : (
              paginatedRequirements.map((item) => {
                const isUsedInServiceSvr = serviceVariantRequirements.some(
                  (svr) => svr.requirementId === item.id
                );
                // Allow deleting requirements if not currently associated/used.
                const isDeleteAllowed = !isUsedInServiceSvr;

                const menuItems: ActionMenuItem[] = [
                  {
                    label: "Edit Details",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  },
                ];

                if (isDeleteAllowed) {
                  menuItems.push({
                    label: "Delete Requirement",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  });
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{item.description !== null && item.description !== undefined && item.description !== "" ? item.description : "—"}</td>
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

      {filteredRequirements.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRequirements.length}
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
