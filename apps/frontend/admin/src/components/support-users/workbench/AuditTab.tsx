import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import { UserDiagnosticDetails } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

interface AuditTabProps {
  diagnosticData: UserDiagnosticDetails;
}

type LoginLog = UserDiagnosticDetails["loginHistory"][number];

export function AuditTab({ diagnosticData }: AuditTabProps) {
  const columns = useMemo<ColumnDef<LoginLog>[]>(() => [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (item) => <span className="font-mono text-slate-400">{item.timestamp}</span>,
    },
    {
      header: "Outcome",
      accessorKey: "status",
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
        <>
          <div className="font-mono text-white">{item.ipAddress}</div>
          <div className="text-[10px] text-slate-500">{item.location}</div>
        </>
      ),
    },
    {
      header: "Device / Agent",
      accessorKey: "deviceInfo",
      cell: (item) => <span className="text-slate-300">{item.deviceInfo}</span>,
    },
    {
      header: "Failure Reason / Notes",
      accessorKey: "failureReason",
      cell: (item) => (
        <span className="text-slate-400">
          {item.failureReason ?? <span className="text-slate-600">N/A</span>}
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
