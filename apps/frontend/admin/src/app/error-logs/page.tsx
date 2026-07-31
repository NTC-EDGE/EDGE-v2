"use client";

import { useState } from "react";
import { useErrorLogService, SystemErrorLog } from "@/services/errorLogService";
import {
  AlertCircle,
  Search,
  Code,
  Globe,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ToastNotification, ToastMessage } from "@/components/ui/toast-notification";

export default function ErrorLogsPage() {
  const { useErrorLogs } = useErrorLogService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedError, setSelectedError] = useState<SystemErrorLog | null>(null);
  const pageSize = 15;

  const { data: responseData, isLoading } = useErrorLogs(page, pageSize, levelFilter, searchTerm);

  const errorLogs: SystemErrorLog[] = responseData?.items ?? [];
  const totalCount = responseData?.totalCount ?? errorLogs.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">System Error Logs</h1>
            <p className="text-sm text-slate-400">
              Capture application and system errors, exception details, and stack traces to assist in debugging and issue resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 py-0.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stack traces, endpoints, or error messages..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "Error", "Critical", "Warning"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevelFilter(lvl);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                levelFilter === lvl
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Request Path</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                    Fetching exception diagnostic logs...
                  </td>
                </tr>
              ) : errorLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                    No application errors captured.
                  </td>
                </tr>
              ) : (
                errorLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      {new Date(log.loggedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-white max-w-sm truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-slate-500" />
                        <span>{log.httpMethod ? `${log.httpMethod} ${log.requestPath}` : log.requestPath || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedError(log)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all"
                      >
                        <Code className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Inspect Stack Trace</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page} of {totalPages} ({totalCount} captured exceptions)
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

      {/* Stack Trace Inspector Modal */}
      <Dialog open={Boolean(selectedError)} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              <span>Exception Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4 mt-2">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400">Exception Message</p>
                <p className="text-sm font-mono text-rose-300">{selectedError.message}</p>
                {selectedError.exceptionType && (
                  <p className="text-xs font-mono text-slate-400">
                    Type: <span className="text-slate-200">{selectedError.exceptionType}</span>
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Stack Trace</p>
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap">
                  {selectedError.stackTrace || "No detailed stack trace captured for this error."}
                </pre>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 font-medium"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
