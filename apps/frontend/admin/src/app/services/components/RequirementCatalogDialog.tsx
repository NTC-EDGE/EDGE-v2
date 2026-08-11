"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Requirement } from "@edge/api";

interface RequirementCatalogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string | null }) => Promise<void>;
  editingReq: Requirement | null;
  isSubmitting: boolean;
}

export function RequirementCatalogDialog({
  isOpen,
  onClose,
  onSubmit,
  editingReq,
  isSubmitting,
}: RequirementCatalogDialogProps) {
  const [reqName, setReqName] = useState("");
  const [reqDescription, setReqDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingReq) {
        setReqName(editingReq.name);
        setReqDescription(editingReq.description ?? "");
      } else {
        setReqName("");
        setReqDescription("");
      }
    }
  }, [isOpen, editingReq]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim()) return;
    onSubmit({
      name: reqName.trim(),
      description: reqDescription.trim() ? reqDescription.trim() : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-md w-full rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/60">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            {editingReq ? "Edit Catalog Requirement" : "New Catalog Requirement"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Define documentary or system qualifications that citizens must provide during application submittal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Requirement Name *</label>
            <input
              type="text"
              required
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              placeholder="e.g. Valid NTC Operator Certificate"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={reqDescription}
              onChange={(e) => setReqDescription(e.target.value)}
              placeholder="Detail what type of verification, file upload, or certificate parameters are expected..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-medium"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingReq ? "Update Requirement" : "Create Requirement"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
