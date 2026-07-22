import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { TenantMember } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface RemoveMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMember: TenantMember | null;
  submitting: boolean;
  onConfirmRemove: () => void;
}

export function RemoveMemberModal({
  open,
  onOpenChange,
  selectedMember,
  submitting,
  onConfirmRemove,
}: RemoveMemberModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-400">
            <Trash2 className="w-5 h-5 text-rose-400" /> Remove Member Confirmation
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">
            Are you sure you want to remove <strong className="text-white">{selectedMember?.userFirstName} {selectedMember?.userLastName}</strong> from <strong className="text-slate-200">{selectedMember?.tenantName}</strong>?
          </DialogDescription>
        </DialogHeader>

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
            type="button"
            disabled={submitting}
            onClick={onConfirmRemove}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
