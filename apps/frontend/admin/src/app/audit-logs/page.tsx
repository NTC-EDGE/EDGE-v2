"use client";

import { useState, useMemo } from "react";
import { useAuditLogService, AuditLog } from "@/services/auditLogService";
import {
  Search,
  User,
  Activity,
  Calendar,
  Globe,
  CheckCircle2,
  FileText,
  Shield,
  Layers,
  Database,
  Key,
  Info,
  SlidersHorizontal,
} from "lucide-react";

import { ToastNotification, ToastMessage } from "@/components/ui/toast-notification";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatLogDate(dateStr?: string): string {
  if (!dateStr) return "Recent";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function parseJsonChanges(jsonStr?: string | null): Record<string, unknown> | null {
  if (!jsonStr || jsonStr.trim().length === 0) return null;
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Return null if not JSON
  }
  return null;
}

export default function AuditLogsPage() {
  const { useAuditLogs } = useAuditLogService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const pageSize = 15;

  const { data: responseData, isLoading, error } = useAuditLogs(page, pageSize, searchTerm);

  const rawLogs: AuditLog[] = responseData?.data ?? responseData?.items ?? [];
  const totalCount = responseData?.totalCount ?? rawLogs.length;

  const filteredLogs = useMemo(() => {
    if (selectedType === "ALL") return rawLogs;
    return rawLogs.filter((l) => (l.type || "").toLowerCase() === selectedType.toLowerCase());
  }, [rawLogs, selectedType]);

  const getActionBadge = (action: string) => {
    const act = (action || "").toUpperCase();
    if (act.includes("CREATE") || act.includes("POST") || act.includes("INSERT")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {action || "CREATE"}
        </span>
      );
    }
    if (act.includes("UPDATE") || act.includes("PUT") || act.includes("PATCH")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          {action || "UPDATE"}
        </span>
      );
    }
    if (act.includes("DELETE") || act.includes("REMOVE")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          {action || "DELETE"}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
        {action || "ACTIVITY"}
      </span>
    );
  };

  const getTypeIcon = (type?: string) => {
    const t = (type || "").toLowerCase();
    if (t === "security") return <Shield className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />;
    if (t === "user") return <User className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />;
    if (t === "data") return <Database className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
    if (t === "auth") return <Key className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />;
    return <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
  };

  const getReadableDetails = (log: AuditLog): string => {
    if (log.event && log.event.trim().length > 0) {
      return log.event;
    }
    if (log.details && log.details.trim().length > 0) {
      return log.details;
    }
    const act = (log.action || "Modified").toLowerCase();
    return `${log.entityName || "Resource"} ${act}`;
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (log) => {
        const dateStr = log.timestamp || log.createdAt;
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-mono text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>{formatLogDate(dateStr)}</span>
          </div>
        );
      },
    },
    {
      key: "user",
      header: "Operator / Actor",
      cell: (log) => {
        const actorName = log.actor || log.userEmail || "System Administrator";
        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <User className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white text-xs">{actorName}</span>
          </div>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      cell: (log) => <div className="whitespace-nowrap">{getActionBadge(log.action)}</div>,
    },
    {
      key: "target",
      header: "Target Entity",
      cell: (log) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-700 dark:text-slate-200">
          {getTypeIcon(log.type)}
          <span className="font-medium">{log.entityName}</span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Event Details",
      cell: (log) => (
        <div className="text-xs text-slate-700 dark:text-slate-300 max-w-md truncate font-medium">
          {getReadableDetails(log)}
        </div>
      ),
    },
    {
      key: "inspect",
      header: "Inspection",
      cell: (log) => (
        <button
          onClick={() => setSelectedLog(log)}
          className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-all"
        >
          <Info className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto animate-fade-in transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Audit & Security Logs</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Comprehensive trace of system activities, configuration changes, and security events.
            </p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, operator, or event..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 hidden sm:inline-block mr-1" />
          {["ALL", "Security", "User", "Data", "Auth", "System"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setSelectedType(t);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === t
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      {!!error && isForbiddenError(error) ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6">
          <PageForbiddenState />
        </div>
      ) : !!error && !isForbiddenError(error) ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl p-12 text-center text-slate-500 font-mono">
          <p className="text-sm font-semibold text-rose-500">Failed to load audit logs.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLogs}
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

      {/* Structured Audit Log Inspection Modal */}
      <Dialog open={Boolean(selectedLog)} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <span>Audit Event Details</span>
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-3">
              {/* Event Banner */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{getReadableDetails(selectedLog)}</h3>
                  {getActionBadge(selectedLog.action)}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    {formatLogDate(selectedLog.timestamp || selectedLog.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    IP: {selectedLog.ipAddress || "192.168.1.105"}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status: {selectedLog.status || "Success"}
                  </span>
                </div>
              </div>

              {/* Grid Overview */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Operator / Actor</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedLog.actor || selectedLog.userEmail || "System Administrator"}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Target Entity</p>
                  <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    {getTypeIcon(selectedLog.type)}
                    <span>{selectedLog.entityName}</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Event Category</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedLog.type || "System"}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Resource Path</p>
                  <p className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.resource || `/${(selectedLog.entityName || "resource").toLowerCase()}s`}</p>
                </div>
              </div>

              {/* Changes Section */}
              {(() => {
                const changesObj = parseJsonChanges(selectedLog.changes || selectedLog.newValues);
                if (changesObj && Object.keys(changesObj).length > 0) {
                  return (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                        Recorded Modifications
                      </p>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(changesObj)
                          .filter(([key]) => !key.toLowerCase().includes("id") && !key.toLowerCase().includes("guid"))
                          .map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-slate-600 dark:text-slate-400 font-medium">{key}:</span>
                              <span className="text-slate-900 dark:text-slate-200 font-mono font-medium">
                                {typeof val === "object" ? JSON.stringify(val) : String(val ?? "None")}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
                >
                  Close Inspection
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
