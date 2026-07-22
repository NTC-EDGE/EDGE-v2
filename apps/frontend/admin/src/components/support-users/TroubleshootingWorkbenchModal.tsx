import React from "react";
import {
  ShieldCheck,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  FileText,
  Laptop,
  Ticket
} from "lucide-react";
import { GlobalSupportUser, UserDiagnosticDetails } from "@edge/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { HealthTab } from "./workbench/HealthTab";
import { AccessTab } from "./workbench/AccessTab";
import { AuditTab } from "./workbench/AuditTab";
import { SessionsTab } from "./workbench/SessionsTab";
import { TicketsTab } from "./workbench/TicketsTab";

interface TroubleshootingWorkbenchModalProps {
  selectedUser: GlobalSupportUser | null;
  onClose: () => void;
  diagnosticData: UserDiagnosticDetails | null;
  activeTab: "health" | "access" | "audit" | "sessions" | "tickets";
  onTabChange: (tab: "health" | "access" | "audit" | "sessions" | "tickets") => void;
  actionFeedback: { type: "success" | "error"; msg: string } | null;
  actionLoading: boolean;
  onUnlockAccount: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  onRevokeSessions: (userId: string) => void;
  onToggleMfa: (userId: string, currentMfa: boolean) => void;
  onTerminateSession: (sessionId: string) => void;
  newNoteText: string;
  onNewNoteTextChange: (text: string) => void;
  actionTag: string;
  onActionTagChange: (tag: string) => void;
  onAddNoteSubmit: (e: React.FormEvent) => void;
}

export function TroubleshootingWorkbenchModal({
  selectedUser,
  onClose,
  diagnosticData,
  activeTab,
  onTabChange,
  actionFeedback,
  actionLoading,
  onUnlockAccount,
  onResetPassword,
  onRevokeSessions,
  onToggleMfa,
  onTerminateSession,
  newNoteText,
  onNewNoteTextChange,
  actionTag,
  onActionTagChange,
  onAddNoteSubmit,
}: TroubleshootingWorkbenchModalProps) {
  return (
    <Dialog open={selectedUser !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-white p-0 rounded-2xl shadow-2xl">
        {selectedUser !== null && diagnosticData !== null && (
          <div className="flex flex-col min-h-[600px]">
            {/* Modal Header Bar */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/80 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shrink-0">
                    {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h2>
                      <StatusBadge status={selectedUser.status} isLocked={selectedUser.isLockedOut} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                      <span>Email: <strong className="text-slate-200">{selectedUser.email}</strong></span>
                      <span>Region: <strong className="text-cyan-300">{selectedUser.regionName}</strong></span>
                      <span>Auth Provider: <strong className="text-indigo-300">{selectedUser.authProvider}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {selectedUser.isLockedOut && (
                    <Button
                      onClick={() => onUnlockAccount(selectedUser.id)}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                    >
                      <Unlock className="w-4 h-4" /> Unlock Account
                    </Button>
                  )}
                </div>
              </div>

              {/* Feedback Notification Banner */}
              {actionFeedback !== null && (
                <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  actionFeedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}>
                  {actionFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{actionFeedback.msg}</span>
                </div>
              )}

              {/* Workbench Navigation Tabs */}
              <div className="flex items-center gap-1 mt-6 border-b border-slate-800 overflow-x-auto pb-0">
                <button
                  onClick={() => onTabChange("health")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                    activeTab === "health"
                      ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Account Health & Overrides</span>
                </button>

                <button
                  onClick={() => onTabChange("access")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                    activeTab === "access"
                      ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Regional & Scope Diagnostics</span>
                </button>

                <button
                  onClick={() => onTabChange("audit")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                    activeTab === "audit"
                      ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Login & Audit Logs</span>
                </button>

                <button
                  onClick={() => onTabChange("sessions")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                    activeTab === "sessions"
                      ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <Laptop className="w-4 h-4 text-amber-400" />
                  <span>Active Sessions ({diagnosticData.activeSessions.length})</span>
                </button>

                <button
                  onClick={() => onTabChange("tickets")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                    activeTab === "tickets"
                      ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>Support Notes & Tickets</span>
                </button>
              </div>
            </div>

            {/* Tab Content Body */}
            <div className="p-6 space-y-6 flex-1 bg-slate-950">
              {activeTab === "health" && (
                <HealthTab
                  user={selectedUser}
                  actionLoading={actionLoading}
                  onUnlockAccount={onUnlockAccount}
                  onResetPassword={onResetPassword}
                  onToggleMfa={onToggleMfa}
                  onRevokeSessions={onRevokeSessions}
                />
              )}

              {activeTab === "access" && (
                <AccessTab user={selectedUser} diagnosticData={diagnosticData} />
              )}

              {activeTab === "audit" && (
                <AuditTab diagnosticData={diagnosticData} />
              )}

              {activeTab === "sessions" && (
                <SessionsTab
                  user={selectedUser}
                  diagnosticData={diagnosticData}
                  actionLoading={actionLoading}
                  onRevokeSessions={onRevokeSessions}
                  onTerminateSession={onTerminateSession}
                />
              )}

              {activeTab === "tickets" && (
                <TicketsTab
                  diagnosticData={diagnosticData}
                  newNoteText={newNoteText}
                  onNewNoteTextChange={onNewNoteTextChange}
                  actionTag={actionTag}
                  onActionTagChange={onActionTagChange}
                  actionLoading={actionLoading}
                  onAddNoteSubmit={onAddNoteSubmit}
                />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
