"use client";

import { useState } from "react";
import { useErrorLogService, SystemErrorLog } from "@/services/errorLogService";
import {
  AlertCircle,
  Search,
  Code,
  Globe
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ToastNotification, ToastMessage } from "@/components/ui/toast-notification";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";
import { DataTable } from "@/components/ui/data-table";

export default function ErrorLogsPage() {
  const { useErrorLogs } = useErrorLogService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedError, setSelectedError] = useState<SystemErrorLog | null>(null);
  const pageSize = 15;

  const { data: responseData, isLoading, error } = useErrorLogs(page, pageSize, levelFilter, searchTerm);

  const errorLogs: SystemErrorLog[] = responseData?.items ?? [];
  const totalCount = responseData?.totalCount ?? errorLogs.length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Error Logs</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
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
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
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
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {!!error && isForbiddenError(error) ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6">
          <PageForbiddenState />
        </div>
      ) : !!error && !isForbiddenError(error) ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl p-12 text-center text-slate-500 font-mono">
           <p className="text-sm font-semibold text-rose-500">Failed to load error logs.</p>
           <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 font-medium">Retry</button>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: "timestamp",
              header: "Timestamp",
              cell: (log) => <span className="whitespace-nowrap text-xs font-mono text-slate-600 dark:text-slate-400">{new Date(log.loggedAt).toLocaleString()}</span>,
            },
            {
              key: "level",
              header: "Level",
              cell: (log) => (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {log.level}
                </span>
              ),
            },
            {
              key: "message",
              header: "Message",
              cell: (log) => <div className="font-mono text-xs text-slate-900 dark:text-white max-w-sm truncate">{log.message}</div>,
            },
            {
              key: "requestPath",
              header: "Request Path",
              cell: (log) => (
                <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-mono text-slate-600 dark:text-slate-400">
                  <Globe className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{log.httpMethod ? `${log.httpMethod} ${log.requestPath}` : log.requestPath || "-"}</span>
                </div>
              ),
            },
            {
              key: "action",
              header: "Action",
              cell: (log) => (
                <button
                  onClick={() => setSelectedError(log)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-all"
                >
                  <Code className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Inspect Stack Trace</span>
                </button>
              ),
            },
          ]}
          data={errorLogs}
          getItemKey={(log) => log.id}
          loading={isLoading}
          pagination={{
            currentPage: page,
            totalItems: totalCount,
            pageSize,
            onPageChange: setPage,
          }}
        />
      )}

      {/* Stack Trace Inspector Modal */}
      <Dialog open={Boolean(selectedError)} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400" />
              <span>Exception Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4 mt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Exception Message</p>
                <p className="text-sm font-mono text-rose-600 dark:text-rose-300">{selectedError.message}</p>
                {selectedError.exceptionType && (
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Type: <span className="text-slate-800 dark:text-slate-200">{selectedError.exceptionType}</span>
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Stack Trace</p>
                <pre className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-300 overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap">
                  {selectedError.stackTrace || "No detailed stack trace captured for this error."}
                </pre>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
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
