"use client";

import React from "react";
import { CheckCircle2, Layout, ShieldAlert } from "lucide-react";
import { FormField } from "../types";
import { LabeledSection, inputClass } from "./FieldEditorPrimitives";

export function FieldConstraintsEditor({
  field,
  onUpdateField,
}: {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
}) {
  return (
    <>
      {field.type !== "section-header" && field.type !== "divider" && (
        <LabeledSection
          title="Validation Requirements"
          icon={ShieldAlert}
          description="Enforce user input before form submission."
        >
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  field.required ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                }`}
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Mandatory Field
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {field.required ? "Required to submit form" : "Optional field"}
                </span>
              </div>
            </div>
            <div
              role="checkbox"
              aria-checked={field.required}
              tabIndex={0}
              onClick={() => onUpdateField({ required: !field.required })}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") onUpdateField({ required: !field.required });
              }}
              className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                field.required ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  field.required ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>
        </LabeledSection>
      )}

      {field.type !== "divider" && (
        <LabeledSection
          title="Grid Column Span"
          icon={Layout}
          description="Choose how wide this field renders on the page."
        >
          <div className="grid grid-cols-2 gap-2">
            {([1, 2] as const).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => onUpdateField({ cols: col })}
                className={`py-2 px-3 text-xs rounded-xl border font-semibold transition-all text-center ${
                  (field.cols ?? 2) === col
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-400"
                }`}
              >
                {col === 1 ? "Half Width (1 Col)" : "Full Width (2 Cols)"}
              </button>
            ))}
          </div>
        </LabeledSection>
      )}

      {(field.type === "text" || field.type === "textarea") && (
        <LabeledSection
          title="Character Limits"
          description="Optional minimum and maximum length constraints."
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                Min Characters
              </label>
              <input
                type="number"
                value={field.minLength ?? ""}
                onChange={(e) =>
                  onUpdateField({ minLength: e.target.value ? parseInt(e.target.value, 10) : undefined })
                }
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                Max Characters
              </label>
              <input
                type="number"
                value={field.maxLength ?? ""}
                onChange={(e) =>
                  onUpdateField({ maxLength: e.target.value ? parseInt(e.target.value, 10) : undefined })
                }
                className={inputClass}
                placeholder="No limit"
                min={0}
              />
            </div>
          </div>
        </LabeledSection>
      )}

      {field.type === "number" && (
        <LabeledSection title="Numeric Value Range" description="Minimum and maximum accepted numbers.">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                Min Value
              </label>
              <input
                type="number"
                value={field.min ?? ""}
                onChange={(e) =>
                  onUpdateField({ min: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                className={inputClass}
                placeholder="Min"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                Max Value
              </label>
              <input
                type="number"
                value={field.max ?? ""}
                onChange={(e) =>
                  onUpdateField({ max: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                className={inputClass}
                placeholder="Max"
              />
            </div>
          </div>
        </LabeledSection>
      )}

      {field.type === "file" && (
        <>
          <LabeledSection
            title="Allowed File Types"
            description="Comma-separated extensions e.g. .pdf, .docx, .png, .jpg"
          >
            <input
              type="text"
              value={field.acceptedFileTypes ?? ""}
              onChange={(e) => onUpdateField({ acceptedFileTypes: e.target.value })}
              className={inputClass}
              placeholder=".pdf,.jpg,.png"
            />
          </LabeledSection>
          <LabeledSection title="Maximum File Size (MB)" description="Upload limit per attached file.">
            <input
              type="number"
              value={field.maxFileSizeMb ?? ""}
              onChange={(e) =>
                onUpdateField({
                  maxFileSizeMb: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className={inputClass}
              placeholder="10 (MB)"
              min={1}
            />
          </LabeledSection>
        </>
      )}
    </>
  );
}
