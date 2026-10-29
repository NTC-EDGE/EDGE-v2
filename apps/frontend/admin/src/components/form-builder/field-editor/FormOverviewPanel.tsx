"use client";

import React from "react";
import { FileText, Building2, Globe, EyeOff, Layers, ListFilter, Calendar } from "lucide-react";
import { FormSchema } from "../types";
import { getFieldIcon } from "../utils";
import { LabeledSection, inputClass, formatDate } from "./FieldEditorPrimitives";

export function FormOverviewPanel({
  form,
  onUpdateForm,
  onSelectField,
}: {
  form?: FormSchema | null;
  onUpdateForm?: (updates: Partial<FormSchema>) => void;
  onSelectField?: (fieldId: string | null) => void;
}) {
  const totalFields = form?.fields.length ?? 0;
  const requiredFields = form?.fields.filter((f) => f.required).length ?? 0;
  const sectionHeaders = form?.fields.filter((f) => f.type === "section-header").length ?? 0;
  const fileFields = form?.fields.filter((f) => f.type === "file").length ?? 0;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
              Form Template Details
            </h2>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {form?.id ? `ID: ${form.id}` : "Overview & Summary"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Associated Service
            </span>
          </div>
          {form?.serviceName ? (
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {form.serviceName}
              </p>
              {form.serviceCode && (
                <span className="inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {form.serviceCode}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Standalone / Unassigned</p>
          )}
        </div>

        <LabeledSection title="Form Title" icon={FileText} description="Display title of this form template.">
          <input
            type="text"
            value={form?.name ?? ""}
            onChange={(e) => onUpdateForm && onUpdateForm({ name: e.target.value })}
            className={inputClass}
            placeholder="Form template name"
          />
        </LabeledSection>

        <LabeledSection title="Form Description" description="Instructions displayed to applicants.">
          <textarea
            value={form?.description ?? ""}
            onChange={(e) => onUpdateForm && onUpdateForm({ description: e.target.value })}
            className={`${inputClass} h-16 resize-none`}
            placeholder="Form description / purpose"
          />
        </LabeledSection>

        <LabeledSection
          title="Publication State"
          icon={form?.isPublished ? Globe : EyeOff}
          description="Control whether this form is live for applicants."
        >
          <button
            type="button"
            onClick={() => onUpdateForm && onUpdateForm({ isPublished: !form?.isPublished })}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
              form?.isPublished
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${form?.isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{form?.isPublished ? "Published (Live)" : "Draft Mode"}</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Click to switch</span>
          </button>
        </LabeledSection>

        <LabeledSection title="Form Statistics" icon={Layers} description="Summary of fields and sections in this form.">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block font-mono">{totalFields}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Total Fields</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400 block font-mono">{requiredFields}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Required</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300 block font-mono">{sectionHeaders}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Sections</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block font-mono">{fileFields}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Attachments</span>
            </div>
          </div>
        </LabeledSection>

        {form?.fields && form.fields.length > 0 && (
          <LabeledSection
            title="Field Outline (Click to Inspect)"
            icon={ListFilter}
            description="Click any component below to edit its specific properties."
          >
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {form.fields.map((f, idx) => (
                <button
                  key={`${f.id}-${idx}`}
                  type="button"
                  onClick={() => onSelectField && onSelectField(f.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">{getFieldIcon(f.type)}</span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {f.type === "section-header"
                        ? f.sectionTitle || f.label || `Section ${idx + 1}`
                        : f.label || `Field ${idx + 1}`}
                    </span>
                  </div>
                  {f.required && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold shrink-0">
                      *
                    </span>
                  )}
                </button>
              ))}
            </div>
          </LabeledSection>
        )}

        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Created:
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-300" suppressHydrationWarning>
              {formatDate(form?.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Updated:
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-300" suppressHydrationWarning>
              {formatDate(form?.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
