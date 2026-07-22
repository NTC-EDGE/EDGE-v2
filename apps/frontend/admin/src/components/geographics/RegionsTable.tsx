"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Region } from "@edge/api";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";

export interface RegionsTableProps {
  regions: Region[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  hasProvinces: (regionId: string) => boolean;
  onEdit: (item: Region) => void;
  onDelete: (item: Region) => void;
  onToggleStatus: (item: Region) => void;
}

export function RegionsTable({
  regions,
  loading,
  canManage,
  searchTerm,
  hasProvinces,
  onEdit,
  onDelete,
  onToggleStatus,
}: RegionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = regions.filter(
    (r) =>
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <th className="px-6 py-4">Region Code</th>
              <th className="px-6 py-4">Region Name</th>
              <th className="px-6 py-4">Status</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                  <span>Loading regions catalog...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                  <MapPin className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No regions configured</p>
                  <p className="text-xs text-slate-500">There are no administrative regions registered in the catalog yet.</p>
                </td>
              </tr>
            ) : (
              paginated.map((item) => {
                const hasChildren = hasProvinces(item.id);
                const isDeleteAllowed = item.isActive === false && !hasChildren;

                const menuItems: ActionMenuItem[] = [
                  {
                    label: item.isActive ? "Set Inactive" : "Set Active",
                    icon: item.isActive ? XCircle : CheckCircle,
                    onClick: () => onToggleStatus(item),
                  },
                ];

                if (item.isActive === false) {
                  menuItems.push({
                    label: "Edit Region",
                    icon: Edit2,
                    onClick: () => onEdit(item),
                  });
                }

                if (isDeleteAllowed) {
                  menuItems.push({
                    label: "Delete Region",
                    icon: Trash2,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                  });
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-indigo-400 font-bold text-sm bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onToggleStatus(item)}
                        disabled={!canManage}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {item.isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Inactive
                          </>
                        )}
                      </button>
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

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
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
