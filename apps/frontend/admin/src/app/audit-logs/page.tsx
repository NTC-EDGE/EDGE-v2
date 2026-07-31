"use client";

import { useState } from "react";
import { useAuditLogService, AuditLog } from "@/services/auditLogService";
import {
  FileText,
  Search,
  User,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { ToastNotification, ToastMessage } from "@/components/ui/toast-notification";

export default function AuditLogsPage() {
  const { useAuditLogs } = useAuditLogService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data: responseData, isLoading, error } = useAuditLogs(page, pageSize, searchTerm);

  const auditLogs: AuditLog[] = responseData?.data ?? responseData?.items ?? [];
  const totalCount = responseData?.totalCount ?? auditLogs.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("POST")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {action}
        </span>
      );
    }
    if (act.includes("UPDATE") || act.includes("PUT") || act.includes("PATCH")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {action}
        </span>
      );
    }
    if (act.includes("DELETE")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        {action}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Logs & Activity Monitoring</h1>
            <p className="text-sm text-slate-400">
              Record and monitor all user activities, system changes, and resource mutations for compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 py-0.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, user email, or entity..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target Entity</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-white">{log.userEmail || log.userId || "System Admin"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-300">
                      {log.entityName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                      {log.details || log.entityId || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page} of {totalPages} ({totalCount} total entries)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
