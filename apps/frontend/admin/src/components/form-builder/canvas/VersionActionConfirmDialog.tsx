"use client";

import React from "react";
import { AlertTriangle, Radio, GitBranch, Copy, ArrowRight, X, ShieldAlert } from "lucide-react";

export type PendingVersionAction =
  | {
      kind: "activate";
      targetVersion: string;
      currentActiveVersion?: string;
    }
  | {
      kind: "switch";
      targetFormId: string;
      targetVersion: string;
      targetIsActive: boolean;
    }
  | {
      kind: "create";
      sourceVersion: string;
      nextVersion: string;
    }
  | null;

interface VersionActionConfirmDialogProps {
  action: PendingVersionAction;
  formName: string;
  selectedVariant?: string;
  currentEditorVersion: string;
  linkedVariantsCount: number;
  isDirty: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function VersionActionConfirmDialog({
  action,
  formName,
  selectedVariant = "ALL",
  currentEditorVersion,
  linkedVariantsCount,
  isDirty,
  isProcessing,
  onClose,
  onConfirm,
}: VersionActionConfirmDialogProps) {
  if (!action) return null;

  const isActivate = action.kind === "activate";
  const isSwitch = action.kind === "switch";
  const isVariantScope = Boolean(selectedVariant && selectedVariant !== "ALL");
  const targetScopeLabel = isVariantScope ? `Variant: ${selectedVariant}` : formName;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => {
        if (!isProcessing) onClose();
      }}
    >
      <div
        className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between ${
            isActivate
              ? "bg-amber-50/80 dark:bg-amber-950/30"
              : "bg-slate-50/80 dark:bg-slate-950/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isActivate
                  ? "bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                  : isSwitch
                  ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                  : "bg-sky-50 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400"
              }`}
            >
              {isActivate ? (
                <Radio className="w-5 h-5" />
              ) : isSwitch ? (
                <GitBranch className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isActivate
                  ? isVariantScope
                    ? "Change Active Service Variant Version?"
                    : "Change Active Client Form Version?"
                  : isSwitch
                  ? isVariantScope
                    ? "Switch Variant Version in Editor?"
                    : "Switch Form Version in Editor?"
                  : isVariantScope
                  ? "Create New Variant Draft Version?"
                  : "Create New Draft Version?"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {targetScopeLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Version Transition Pill Row */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            {action.kind === "activate" ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Current Live Version
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    {action.currentActiveVersion ? `v${action.currentActiveVersion}` : "None"}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                    New Active Client Version
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    v{action.targetVersion} (Live)
                  </span>
                </div>
              </>
            ) : action.kind === "switch" ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Currently Viewing
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    v{currentEditorVersion}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                    Switch Editor To
                  </span>
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                    v{action.targetVersion} ({action.targetIsActive ? "Live on Client" : "Draft"})
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Clone From
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    v{action.sourceVersion}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-500 shrink-0" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-sky-600 dark:text-sky-400">
                    New Draft Version
                  </span>
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-300 mt-0.5">
                    v{action.nextVersion} (Draft)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Detailed Impact Explanation */}
          {action.kind === "activate" && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-200 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  Immediate Client Application UI Impact
                </p>
                <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  Setting <strong>v{action.targetVersion}</strong> as Active will immediately update the{" "}
                  <strong>full application form UI</strong> seen by clients applying for{" "}
                  <strong>{formName}</strong>
                  {linkedVariantsCount > 0
                    ? ` and its ${linkedVariantsCount} linked Service ${linkedVariantsCount === 1 ? "Variant" : "Variants"}`
                    : ""}.
                </p>
                {action.currentActiveVersion && (
                  <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                    <strong>Single-Active Rule:</strong> Version{" "}
                    <strong>v{action.currentActiveVersion}</strong> will automatically move to{" "}
                    <strong>Draft</strong> so only one active version exists.
                  </p>
                )}
              </div>

              {isDirty && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200">
                  Your current unsaved edits on <strong>v{action.targetVersion}</strong> will be saved first before activating this version.
                </div>
              )}
            </div>
          )}

          {action.kind === "switch" && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                action.targetIsActive
                  ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/70 text-amber-950 dark:text-amber-200"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {action.targetIsActive ? (
                <>
                  <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    Target Version is Currently Live on Client Portal
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    <strong>v{action.targetVersion}</strong> is the active version currently rendered in the Client Application UI. Switching opens it in the editor — any changes you save on this version will directly affect client applications.
                  </p>
                </>
              ) : (
                <p className="text-[11px] leading-relaxed">
                  You are switching the editor workspace to <strong>v{action.targetVersion} (Draft)</strong>. Editing a Draft version is safe and will not affect the live Client Application UI unless you explicitly activate it.
                </p>
              )}
            </div>
          )}

          {action.kind === "create" && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="text-[11px] leading-relaxed">
                This will clone all sections and fields from <strong>v{action.sourceVersion}</strong> into a new{" "}
                <strong>Inactive Draft (v{action.nextVersion})</strong>. Your current live client application UI will remain unchanged until you activate the new version.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 ${
              isActivate
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {isProcessing
              ? "Processing…"
              : action.kind === "activate"
              ? `Confirm & Activate v${action.targetVersion}`
              : action.kind === "switch"
              ? `Switch to v${action.targetVersion}`
              : `Create Draft v${action.nextVersion}`}
          </button>
        </div>
      </div>
    </div>
  );
}
