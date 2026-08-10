import React from "react";
import { Laptop, Smartphone, RefreshCw } from "lucide-react";
import { GlobalSupportUser, UserDiagnosticDetails } from "@edge/api";
import { Button } from "@/components/ui/button";

interface SessionsTabProps {
  user: GlobalSupportUser;
  diagnosticData: UserDiagnosticDetails;
  actionLoading: boolean;
  onRevokeSessions: (userId: string) => void;
  onTerminateSession: (sessionId: string) => void;
}

export function SessionsTab({
  user,
  diagnosticData,
  actionLoading,
  onRevokeSessions,
  onTerminateSession,
}: SessionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Laptop className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Active User Sessions
        </h3>
        <Button
          onClick={() => onRevokeSessions(user.id)}
          disabled={actionLoading}
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Revoke All Sessions
        </Button>
      </div>

      <div className="space-y-3">
        {diagnosticData.activeSessions.map((sess) => (
          <div key={sess.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400">
                {sess.device.includes("iPhone") || sess.device.includes("Android") ? (
                  <Smartphone className="w-5 h-5" />
                ) : (
                  <Laptop className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{sess.device}</h4>
                  {sess.isCurrent && (
                    <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                      Active Now
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  IP: <span className="font-mono text-slate-900 dark:text-slate-300">{sess.ipAddress}</span> • {sess.location} • Last active {sess.lastActive}
                </p>
              </div>
            </div>

            <Button
              onClick={() => onTerminateSession(sess.id)}
              disabled={actionLoading}
              className="bg-white dark:bg-slate-800 hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-300 dark:border-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium"
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
