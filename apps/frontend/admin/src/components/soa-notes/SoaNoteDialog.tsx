"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, FileText, Sparkles } from "lucide-react";
import { SoaNote } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface SoaNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote: SoaNote | null;
  onSubmit: (data: { code?: string; title?: string; notes: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function SoaNoteDialog({
  open,
  onOpenChange,
  editingNote,
  onSubmit,
  isSubmitting,
}: SoaNoteDialogProps) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingNote) {
        setCode(editingNote.code ?? "");
        setTitle(editingNote.title ?? "");
        setNotes(editingNote.notes ?? "");
      } else {
        setCode("");
        setTitle("");
        setNotes("");
      }
      setErrorMsg(null);
    }
  }, [open, editingNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMsg("Please enter the note or terms content.");
      return;
    }

    try {
      setErrorMsg(null);
      await onSubmit({
        code: code.trim() || undefined,
        title: title.trim() || undefined,
        notes: notes.trim(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save SOA note template.";
      setErrorMsg(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                {editingNote ? "Edit SOA Note Template" : "New SOA Note Template"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {editingNote
                  ? "Update standard terms, notes, or payment instructions for Statements of Account."
                  : "Create reusable master terms or payment instructions for Statements of Account."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Template Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. TERMS_STD, LATE_FEE"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-500">Short unique identifier for quick lookup</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Template Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Standard Billing Terms"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-500">Descriptive name shown in dropdowns</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Note Content / Terms & Conditions <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-500">{notes.length} / 4000 chars</span>
            </div>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter the standard terms, payment reminders, banking instructions, or regulatory guidance..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none transition-all resize-y placeholder:text-slate-400 font-sans"
              required
            />
            <p className="text-[10px] text-slate-500">
              When an SOA is generated, this text can be prefilled and further customized per applicant if needed.
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4"
            >
              {isSubmitting ? "Saving..." : editingNote ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
