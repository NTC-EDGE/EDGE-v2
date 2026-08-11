import React, { useMemo } from "react";
import { FileText, Calendar } from "lucide-react";
import { UserDiagnosticDetails } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

interface AuditTabProps {
  diagnosticData: UserDiagnosticDetails;
}

type LoginLog = UserDiagnosticDetails["loginHistory"][number];

function formatLogTimestamp(ts?: string): string {
  if (!ts) return "Recent";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
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

export function AuditTab({ diagnosticData }: AuditTabProps) {
  const columns = useMemo<ColumnDef<LoginLog>[]>(() => [
    {
      header: "Timestamp",
      id: "timestamp",
      cell: (item) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-mono text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{formatLogTimestamp(item.timestamp)}</span>
        </div>
      ),
    },
    {
      header: "Outcome",
      id: "status",
      cell: (item) => (
        item.status === "success" ? (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            SUCCESS
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
            FAILED
          </span>
        )
      ),
    },
    {
      header: "IP & Location",
      id: "ipLocation",
      cell: (item) => (
        <div>
          <div className="font-mono text-white text-xs">{item.ipAddress}</div>
          <div className="text-[10px] text-slate-400">{item.location}</div>
        </div>
      ),
    },
    {
      header: "Device / Agent",
      id: "deviceInfo",
      cell: (item) => <span className="text-slate-300 text-xs">{item.deviceInfo}</span>,
    },
    {
      header: "Failure Reason / Notes",
      id: "failureReason",
      cell: (item) => (
        <span className="text-slate-400 text-xs">
          {item.failureReason ?? <span className="text-slate-600">None</span>}
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <FileText className="w-4 h-4 text-indigo-400" /> Recent Authentication Attempts
      </h3>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <DataTable
          data={diagnosticData.loginHistory}
          columns={columns}
          emptyState={
            <div className="py-8 text-center text-slate-500 text-xs">
              No authentication logs found.
            </div>
          }
        />
      </div>
    </div>
  );
}
