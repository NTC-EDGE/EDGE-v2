"use client";

import React from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";
import { Element } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface ElementsTableProps {
  elements: Element[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  canManage: boolean;
  onEdit: (item: Element) => void;
  onDelete: (item: Element) => void;
}

export function ElementsTable({
  elements,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  canManage,
  onEdit,
  onDelete,
}: ElementsTableProps) {
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
            ) : elements.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                  <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No billing elements configured</p>
                  <p className="text-xs text-slate-500">Configure billing elements to set up detailed fees mappings.</p>
                </td>
              </tr>
            ) : (
              elements.map((item) => {
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

      {elements.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
