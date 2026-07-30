"use client";

import React from "react";
import { BookOpen, Edit2, Trash2 } from "lucide-react";
import { Note } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";
import { ServiceCategoryItem } from "@/services/feesNotesService";

export interface NotesTableProps {
  notes: Note[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  categories: ServiceCategoryItem[];
  loading: boolean;
  canManage: boolean;
  onEdit: (item: Note) => void;
  onDelete: (item: Note) => void;
}

export function NotesTable({
  notes,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  categories,
  loading,
  canManage,
  onEdit,
  onDelete,
}: NotesTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Service Category Scope</th>
              <th className="px-6 py-4">Regulatory Guideline Notes</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 3 : 2} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading regulatory notes...</span>
                </td>
              </tr>
            ) : notes.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 3 : 2} className="px-6 py-12 text-center text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No regulatory notes</p>
                  <p className="text-xs text-slate-500">There are no procedural compliance notes configured for service categories.</p>
                </td>
              </tr>
            ) : (
              notes.map((item) => {
                const categoryName = categories.find((c) => c.id === item.serviceCategoryId)?.name ?? "Global";
                const menuItems: ActionMenuItem[] = [
                  {
                    label: "Edit Guideline Note",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  },
                  {
                    label: "Remove Note",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  },
                ];

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-indigo-300 text-xs bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                        {categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-xs leading-relaxed max-w-xl whitespace-pre-wrap">{item.notes}</p>
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

      {notes.length > 0 && (
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
