"use client";

import React from "react";
import {
  ArrowLeft, Eye, CheckCircle2, Loader2, Sparkles, Building2,
  Save, RotateCcw, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
} from "lucide-react";
import { FormSchema } from "../types";

export function BuilderTopToolbar(props: {
  activeForm: FormSchema;
  selectedVariant: string;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onBackToList: () => void;
  onInspectFormOverview: () => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onResetChanges: () => void;
  onOpenSaveConfirm: () => void;
  onPreview: () => void;
}) {
  const { activeForm, selectedVariant, isLeftPanelOpen, isRightPanelOpen, isSaving, isDirty } = props;
  return (
    <>
      <div className="h-14 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          <button
            type="button"
            onClick={props.onBackToList}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            title="Return to Forms List"
          >
            <ArrowLeft className="w-4 h-4" />
            Forms
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {selectedVariant === "ALL" ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Main Form
              </span>
              <button
                type="button"
                onClick={props.onInspectFormOverview}
                className="flex items-center gap-1.5 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer group"
                title="Click to view/edit form details in Properties Inspector"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[280px] xl:max-w-[440px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {activeForm.name || "Untitled Form"}
                </span>
                {activeForm.key && (
                  <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                    {activeForm.key}
                  </span>
                )}
              </button>
              {activeForm.serviceName && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 max-w-[260px] xl:max-w-[360px] shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 truncate">{activeForm.serviceName}</span>
                </div>
              )}
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                v{activeForm.version || "1.0"}
              </span>
              <span className="hidden lg:inline text-[11px] text-slate-400 dark:text-slate-500 shrink-0">· All Sections &amp; Fields</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Variant View
              </span>
              <button
                type="button"
                onClick={props.onInspectFormOverview}
                className="flex items-center gap-1.5 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer group"
              >
                <span className="text-sm font-bold text-indigo-950 dark:text-white truncate max-w-[280px] xl:max-w-[420px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {selectedVariant}
                </span>
                {activeForm.key && (
                  <span className="text-[10px] font-mono font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 shrink-0">
                    {activeForm.key}
                  </span>
                )}
              </button>
              <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 max-w-[260px] truncate shrink-0">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Base Form:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{activeForm.name}</span>
              </div>
              <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 shrink-0">
                Conditional Subset
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1 mr-1 pr-2 border-r border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={props.onToggleLeftPanel}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isLeftPanelOpen
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={isLeftPanelOpen ? "Hide Field Palette" : "Show Field Palette"}
            >
              {isLeftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={props.onToggleRightPanel}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isRightPanelOpen
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={isRightPanelOpen ? "Hide Properties Inspector" : "Show Properties Inspector"}
            >
              {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>

          {isSaving ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>Saving changes…</span>
            </div>
          ) : !isDirty ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>All changes saved</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes</span>
            </div>
          )}

          {isDirty && !isSaving && (
            <button
              type="button"
              onClick={props.onResetChanges}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={props.onOpenSaveConfirm}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              isDirty && !isSaving
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 cursor-pointer"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>

          <button
            type="button"
            onClick={props.onPreview}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
      </div>

      <div className="h-0.5 w-full bg-slate-200/30 dark:bg-slate-800/30 overflow-hidden relative z-20">
        {isSaving && <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 animate-pulse w-full shadow-sm shadow-indigo-500/50" />}
      </div>
    </>
  );
}
