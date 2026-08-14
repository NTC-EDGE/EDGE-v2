"use client";

import React, { useState } from "react";
import {
  FileText,
  Calendar,
  User,
  Copy,
  Check,
  Edit2,
  Clock,
  Key,
  Layers,
  Sparkles,
} from "lucide-react";
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

export interface SoaNoteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: SoaNote | null;
  canManage?: boolean;
  onEdit?: (note: SoaNote) => void;
}

export function SoaNoteDetailsDialog({
  open,
  onOpenChange,
  note,
  canManage = false,
  onEdit,
}: SoaNoteDetailsDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(note.notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl p-0 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-2 py-0.5 rounded tracking-wider uppercase">
                    {note.code || "UNTITLED_CODE"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ID: <span className="font-mono text-[10px] select-all">{note.id}</span>
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  {note.title || "Untitled SOA Note Template"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Master template for Statement of Account terms, payment guidelines, and disclaimers.
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-180px)] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Key className="h-3 w-3" />
                <span>Template Code</span>
              </div>
              <p className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                {note.code || "—"}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Calendar className="h-3 w-3" />
                <span>Created Date</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {formatDate(note.createdAt)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Clock className="h-3 w-3" />
                <span>Last Updated</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {formatDate(note.lastModifiedAt || note.createdAt)}
              </p>
            </div>
          </div>

          {/* Full Note Text Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Terms &amp; Instructions Content</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                  {note.notes.length} characters
                </span>
              </label>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
              <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans select-text">
                {note.notes}
              </p>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-xl flex items-start gap-2.5 text-indigo-900 dark:text-indigo-200 text-xs">
            <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Usage Note:</strong> When staff creates a Statement of Account (SOA), selecting this template automatically copies this text into the statement&apos;s remarks where it can be tailored per applicant.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Template"}</span>
            </Button>

            {canManage && onEdit && (
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(note);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Template</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
