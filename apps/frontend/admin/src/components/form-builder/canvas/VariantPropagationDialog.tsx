"use client";

import React from "react";
import { Layers, Sparkles, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import { SharedChangesImpact } from "../types";

interface VariantPropagationDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  formName: string;
  impact: SharedChangesImpact | null;
  onClose: () => void;
  onConfirmSave: (propagateToCustomizedVariants: boolean) => void;
}

export function VariantPropagationDialog({
  isOpen,
  isSaving,
  formName,
  impact,
  onClose,
  onConfirmSave,
}: VariantPropagationDialogProps) {
  if (!isOpen) return null;

  const modifiedItems = impact?.modifiedItems ?? [];
  const affectedVariants = impact?.affectedVariantNames ?? [];
  const customizedVariants = impact?.affectedCustomizedVariantNames ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Apply Shared Changes to Service Variants?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                You modified Base Form sections or fields in &ldquo;{formName}&rdquo; that are used by{" "}
                <strong>{affectedVariants.length}</strong> Service{" "}
                {affectedVariants.length === 1 ? "Variant" : "Variants"}.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {modifiedItems.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detected Updates ({modifiedItems.length})
              </p>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {modifiedItems.slice(0, 6).map((item, idx) => (
                  <li key={`mod-${idx}`} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="break-words">{item}</span>
                  </li>
                ))}
                {modifiedItems.length > 6 && (
                  <li className="text-[11px] text-slate-400 pl-5">
                    +{modifiedItems.length - 6} more update(s)
                  </li>
                )}
              </ul>
            </div>
          )}

          {customizedVariants.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                {customizedVariants.length} Customized{" "}
                {customizedVariants.length === 1 ? "Variant Uses" : "Variants Use"} These Fields
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                {customizedVariants.slice(0, 4).join(", ")}
                {customizedVariants.length > 4 ? ` (+${customizedVariants.length - 4} more)` : ""}
              </p>
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onConfirmSave(true)}
              className="w-full p-3.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/70 hover:bg-indigo-100/80 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-left transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Apply to All Service Variants ({affectedVariants.length})
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Updates the Base Form and propagates the renamed labels, dropdown values, and field updates across{" "}
                <strong>every</strong> Service Variant using these fields, including customized variants.
              </p>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => onConfirmSave(false)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/70 text-left transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Apply Only to Base / Uncustomized Variants
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Updates the Base Form for variants inheriting from the blueprint, while keeping any custom labels or values previously configured on customized Service Variants untouched.
              </p>
            </button>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex items-center justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel &amp; Keep Editing
          </button>
        </div>
      </div>
    </div>
  );
}
