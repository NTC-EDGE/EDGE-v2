import React from "react";
import { Ticket, FileText, Send, Loader2 } from "lucide-react";
import { UserDiagnosticDetails } from "@edge/api";
import { Button } from "@/components/ui/button";

interface TicketsTabProps {
  diagnosticData: UserDiagnosticDetails;
  newNoteText: string;
  onNewNoteTextChange: (text: string) => void;
  actionTag: string;
  onActionTagChange: (tag: string) => void;
  actionLoading: boolean;
  onAddNoteSubmit: (e: React.FormEvent) => void;
}

export function TicketsTab({
  diagnosticData,
  newNoteText,
  onNewNoteTextChange,
  actionTag,
  onActionTagChange,
  actionLoading,
  onAddNoteSubmit,
}: TicketsTabProps) {
  return (
    <div className="space-y-6">
      {/* Support Tickets Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Ticket className="w-4 h-4 text-purple-400" /> Linked Tech Support Tickets
        </h3>
        <div className="space-y-2">
          {diagnosticData.supportTickets.map((tkt) => (
            <div key={tkt.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-purple-300 font-bold">{tkt.ticketNumber}</span>
                  <span className="text-xs font-semibold text-white">{tkt.subject}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                  <span>Category: {tkt.category}</span>
                  <span>Priority: {tkt.priority}</span>
                  <span>Opened: {new Date(tkt.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                tkt.status === "Open" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }`}>
                {tkt.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Support Notes Log */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" /> Support Troubleshooting Notes
        </h3>

        {/* Add Note Form */}
        <form onSubmit={onAddNoteSubmit} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <textarea
            required
            rows={2}
            placeholder="Record troubleshooting diagnostic note or action details for Tech Support logs..."
            value={newNoteText}
            onChange={(e) => onNewNoteTextChange(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Action Taken Tag (e.g., Unlocked password, Revoked tokens)"
              value={actionTag}
              onChange={(e) => onActionTagChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 max-w-sm"
            />
            <Button
              type="submit"
              disabled={actionLoading || !newNoteText.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Log Note</span>
            </Button>
          </div>
        </form>

        {/* Existing Notes */}
        <div className="space-y-2.5">
          {diagnosticData.diagnosticNotes.map((note) => (
            <div key={note.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-300">{note.authorName} ({note.authorRole})</span>
                <span className="text-[10px] text-slate-500">{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-300">{note.note}</p>
              {note.actionTaken && (
                <div className="text-[11px] text-emerald-400 font-mono pt-1">
                  ✓ Action: {note.actionTaken}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
