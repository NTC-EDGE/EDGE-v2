import React from "react";
import { UserX, Loader2 } from "lucide-react";
import { GlobalSupportUser, AccountStatus } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface StatusOverrideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: GlobalSupportUser | null;
  targetStatus: AccountStatus;
  onTargetStatusChange: (status: AccountStatus) => void;
  statusReason: string;
  onStatusReasonChange: (reason: string) => void;
  actionLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function StatusOverrideModal({
  open,
  onOpenChange,
  selectedUser,
  targetStatus,
  onTargetStatusChange,
  statusReason,
  onStatusReasonChange,
  actionLoading,
  onSubmit,
}: StatusOverrideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <UserX className="w-5 h-5 text-amber-400" /> Change User Account Status
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Override status for account {selectedUser?.email}. A support reason is mandatory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Status *</label>
            <select
              value={targetStatus}
              onChange={(e) => onTargetStatusChange(e.target.value as AccountStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="active">Active (Normal Access)</option>
              <option value="locked">Locked Out (Security Lock)</option>
              <option value="suspended">Suspended (Admin Override)</option>
              <option value="pending_verification">Pending Verification</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Reason for Support Log *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide justification (e.g. Identity verified via government ID, Security hold)..."
              value={statusReason}
              onChange={(e) => onStatusReasonChange(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={actionLoading || !statusReason.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Status Override"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
