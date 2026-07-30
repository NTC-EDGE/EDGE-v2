"use client";

import React, { useState, useEffect } from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { Element } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface ElementsTableProps {
  elements: Element[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  onEdit: (item: Element) => void;
  onDelete: (item: Element) => void;
}

export function ElementsTable({
  elements,
  loading,
  canManage,
  searchTerm,
  onEdit,
  onDelete,
}: ElementsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredElements = elements.filter(
    (e) =>
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const paginatedElements = filteredElements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Description</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading billing elements...</span>
                </td>
              </tr>
            ) : filteredElements.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                  <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No billing elements configured</p>
                  <p className="text-xs text-slate-500">Configure billing elements to set up detailed fees mappings.</p>
                </td>
              </tr>
            ) : (
              paginatedElements.map((item) => {
                const menuItems: ActionMenuItem[] = [
                  {
                    label: "Modify Element",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  },
                  {
                    label: "Remove Element",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  },
                ];

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 font-mono font-semibold text-indigo-400">{item.code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-200">{item.name}</td>
                    <td className="px-6 py-4 text-slate-400">{item.description ?? "—"}</td>
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

      {filteredElements.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredElements.length}
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
