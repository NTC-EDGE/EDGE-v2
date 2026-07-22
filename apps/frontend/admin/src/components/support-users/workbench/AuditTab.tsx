import React from "react";
import { FileText } from "lucide-react";
import { UserDiagnosticDetails } from "@edge/api";

interface AuditTabProps {
  diagnosticData: UserDiagnosticDetails;
}

export function AuditTab({ diagnosticData }: AuditTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <FileText className="w-4 h-4 text-indigo-400" /> Recent Authentication Attempts
      </h3>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3">IP & Location</th>
              <th className="px-4 py-3">Device / Agent</th>
              <th className="px-4 py-3">Failure Reason / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-950">
            {diagnosticData.loginHistory.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/50">
                <td className="px-4 py-3 font-mono text-slate-400">{log.timestamp}</td>
                <td className="px-4 py-3">
                  {log.status === "success" ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      SUCCESS
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                      FAILED
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono text-white">{log.ipAddress}</div>
                  <div className="text-[10px] text-slate-500">{log.location}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">{log.deviceInfo}</td>
                <td className="px-4 py-3 text-slate-400">
                  {log.failureReason ?? <span className="text-slate-600">N/A</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
