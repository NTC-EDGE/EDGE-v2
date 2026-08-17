"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Save, Trash2 } from "lucide-react";

export interface UnsavedChangesDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveAndExit: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
  formTitle?: string;
}

export function UnsavedChangesDialog({
  open,
  onClose,
  onSaveAndExit,
  onDiscard,
  isSaving = false,
  formTitle = "this form",
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[460px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Unsaved Changes
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                You have modifications to <span className="font-semibold text-slate-700 dark:text-slate-200">{formTitle}</span> that haven&apos;t been saved yet.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            What would you like to do with your changes?
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Leaving without saving will discard any newly added fields, reorderings, or column edits.
          </p>
        </div>

        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Keep Editing
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onDiscard}
              disabled={isSaving}
              className="w-full sm:w-auto text-xs border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Discard Changes
            </Button>
            <Button
              type="button"
              onClick={onSaveAndExit}
              disabled={isSaving}
              className="w-full sm:w-auto text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              {isSaving ? "Saving to Backend..." : "Save & Exit"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
