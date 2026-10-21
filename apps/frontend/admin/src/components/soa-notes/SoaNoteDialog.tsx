"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, FileText, Sparkles, Building2 } from "lucide-react";
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
  onSubmit: (data: { code?: string; title?: string; notes: string; tenantId?: string | null }) => Promise<void>;
  isSubmitting: boolean;
  tenants?: Array<{ id: string; name: string; code: string }>;
  defaultTenantId?: string | null;
}

export function SoaNoteDialog({
  open,
  onOpenChange,
  editingNote,
  onSubmit,
  isSubmitting,
  tenants = [],
  defaultTenantId = null,
}: SoaNoteDialogProps) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tenantId, setTenantId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingNote) {
        setCode(editingNote.code ?? "");
        setTitle(editingNote.title ?? "");
        setNotes(editingNote.notes ?? "");
        setTenantId(editingNote.tenantId ?? "");
      } else {
        setCode("");
        setTitle("");
        setNotes("");
        setTenantId(defaultTenantId ?? "");
      }
      setErrorMsg(null);
    }
  }, [open, editingNote, defaultTenantId]);

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
        tenantId: tenantId.trim() ? tenantId : null,
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

          {tenants.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                Regional Tenant Scope
              </label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              >
                <option value="">Global (All Tenants)</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Select the region/tenant that owns this SOA Note template.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Code / Key (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. TERMS_STD, PAYMENT_INST"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Title / Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Standard Payment Terms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>
                Notes / Terms Content <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Pre-populates Evaluator SOA remarks
              </span>
            </label>
            <textarea
              rows={5}
              placeholder="Enter official notes, bank payment instructions, check settlement rules, or statutory reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans leading-relaxed resize-y"
              required
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
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
              disabled={isSubmitting || !notes.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {editingNote ? "Save Changes" : "Create SOA Note"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
