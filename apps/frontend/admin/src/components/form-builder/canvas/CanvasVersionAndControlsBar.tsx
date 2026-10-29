"use client";

import React from "react";
import { Radio, Copy, Trash2, Layers, RotateCcw, Plus } from "lucide-react";
import { FormSchema, FieldType } from "../types";

export function CanvasVersionBar({
  form,
  onSwitchVersion,
  onSetActive,
  onCreateNewVersion,
  onDeleteVersion,
}: {
  form: FormSchema;
  onSwitchVersion?: (formId: string) => void;
  onSetActive?: () => void;
  onCreateNewVersion?: () => void;
  onDeleteVersion?: () => void;
}) {
  const isLive = Boolean(form.isPublished || form.isActive);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mb-4 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
    >
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Version:
        </span>
        {form.availableVersions && form.availableVersions.length > 1 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {form.availableVersions.map((v) => {
              const isSelected = v.formId === form.id;
              return (
                <button
                  key={v.formId}
                  type="button"
                  onClick={() => onSwitchVersion && onSwitchVersion(v.formId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>v{v.version}</span>
                  {v.isActive ? (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Live
                    </span>
                  ) : (
                    <span className="text-[9px] opacity-70">Draft</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              v{form.version || "1.0"}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isLive
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isLive ? "Active on Client" : "Draft"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        {form.serviceId && !isLive && onSetActive && (
          <button
            type="button"
            onClick={onSetActive}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Set v{form.version || "1.0"} as Active</span>
          </button>
        )}
        {onCreateNewVersion && (
          <button
            type="button"
            onClick={onCreateNewVersion}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>New Version</span>
          </button>
        )}
        {onDeleteVersion && (
          <button
            type="button"
            onClick={onDeleteVersion}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Delete this version"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function CanvasSectionsControlBar({
  sectionCount,
  totalFieldsCount,
  applicableFieldsCount,
  selectedVariant,
  hasSections,
  onCollapseAll,
  onExpandAll,
  onOpenResetConfirm,
  onAddField,
  canResetVariant,
}: {
  sectionCount: number;
  totalFieldsCount: number;
  applicableFieldsCount: number;
  selectedVariant: string;
  hasSections: boolean;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  onOpenResetConfirm: () => void;
  onAddField: (type: FieldType) => void;
  canResetVariant: boolean;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mb-4 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
    >
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            {sectionCount} {sectionCount === 1 ? "Section" : "Sections"} ·{" "}
            {selectedVariant === "ALL"
              ? `${totalFieldsCount} ${totalFieldsCount === 1 ? "Field" : "Fields"}`
              : `${applicableFieldsCount} of ${totalFieldsCount} Fields Active`}
          </span>
        </div>
        {selectedVariant !== "ALL" && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-medium">
            Variant Scoped
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {hasSections && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCollapseAll}
              className="text-[11px] px-2.5 py-1 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
              title="Minimize all sections"
            >
              Minimize All
            </button>
            <button
              type="button"
              onClick={onExpandAll}
              className="text-[11px] px-2.5 py-1 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
              title="Expand all sections"
            >
              Expand All
            </button>
          </div>
        )}
        {selectedVariant !== "ALL" && canResetVariant && (
          <button
            type="button"
            onClick={onOpenResetConfirm}
            className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title={`Reset "${selectedVariant}" fields back to the base form blueprint`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset from Base</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onAddField("section-header")}
          className="flex items-center gap-1 text-[11px] text-white bg-indigo-600 hover:bg-indigo-500 font-semibold px-3 py-1 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Section</span>
        </button>
      </div>
    </div>
  );
}
