"use client";

import React from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { FormField, FieldType } from "./types";
import { generateId, getFieldLabel } from "./utils";

interface FieldEditorProps {
  field: FormField | null;
  onUpdateField: (updates: Partial<FormField>) => void;
}

function LabeledSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {title}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

const FIELDS_WITH_PLACEHOLDER: FieldType[] = ["text", "textarea", "number", "email", "phone", "date"];
const FIELDS_WITH_OPTIONS: FieldType[] = ["select", "radio", "checkbox"];

export function FieldEditor({ field, onUpdateField }: FieldEditorProps) {
  if (!field) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Properties</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
            Select a field on the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const hasPlaceholder = FIELDS_WITH_PLACEHOLDER.includes(field.type);
  const hasOptions = FIELDS_WITH_OPTIONS.includes(field.type);

  const handleOptionChange = (optionId: string, key: "label" | "value", value: string) => {
    if (!field.options) return;
    onUpdateField({
      options: field.options.map((opt) =>
        opt.id === optionId ? { ...opt, [key]: value } : opt
      ),
    });
  };

  const handleAddOption = () => {
    const newOption = {
      id: generateId(),
      label: `Option ${(field.options?.length ?? 0) + 1}`,
      value: `option_${(field.options?.length ?? 0) + 1}`,
    };
    onUpdateField({ options: [...(field.options ?? []), newOption] });
  };

  const handleRemoveOption = (optionId: string) => {
    onUpdateField({ options: (field.options ?? []).filter((o) => o.id !== optionId) });
  };

  const handleMoveOption = (optionId: string, direction: "up" | "down") => {
    if (!field.options) return;
    const idx = field.options.findIndex((o) => o.id === optionId);
    if (idx < 0) return;
    const newOptions = [...field.options];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newOptions.length) return;
    const temp = newOptions[idx];
    const swap = newOptions[targetIdx];
    if (!temp || !swap) return;
    newOptions[idx] = swap;
    newOptions[targetIdx] = temp;
    onUpdateField({ options: newOptions });
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
          Field Properties
        </h2>
        <p className="text-[10px] text-slate-400 mt-0.5">{getFieldLabel(field.type)}</p>
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {/* Label */}
        <LabeledSection title="Label">
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdateField({ label: e.target.value })}
            className={inputClass}
            placeholder="Field label"
          />
        </LabeledSection>

        {/* Section Title */}
        {field.type === "section-header" && (
          <LabeledSection title="Section Title">
            <input
              type="text"
              value={field.sectionTitle ?? ""}
              onChange={(e) => onUpdateField({ sectionTitle: e.target.value })}
              className={inputClass}
              placeholder="Section title text"
            />
          </LabeledSection>
        )}

        {/* Placeholder */}
        {hasPlaceholder && (
          <LabeledSection title="Placeholder">
            <input
              type="text"
              value={field.placeholder ?? ""}
              onChange={(e) => onUpdateField({ placeholder: e.target.value })}
              className={inputClass}
              placeholder="Placeholder text"
            />
          </LabeledSection>
        )}

        {/* Help Text */}
        {field.type !== "section-header" && field.type !== "divider" && (
          <LabeledSection title="Help Text">
            <input
              type="text"
              value={field.helpText ?? ""}
              onChange={(e) => onUpdateField({ helpText: e.target.value })}
              className={inputClass}
              placeholder="Optional help text"
            />
          </LabeledSection>
        )}

        {/* Required toggle */}
        {field.type !== "section-header" && field.type !== "divider" && (
          <LabeledSection title="Validation">
            <label className="flex items-center gap-2.5 cursor-pointer">
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
              <span className="text-xs text-slate-700 dark:text-slate-300">Required field</span>
            </label>
          </LabeledSection>
        )}

        {/* Column Span */}
        {field.type !== "divider" && (
          <LabeledSection title="Column Span">
            <div className="flex gap-2">
              {([1, 2] as const).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => onUpdateField({ cols: col })}
                  className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                    field.cols === col
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400"
                  }`}
                >
                  {col === 1 ? "Half Width" : "Full Width"}
                </button>
              ))}
            </div>
          </LabeledSection>
        )}

        {/* Text length constraints */}
        {(field.type === "text" || field.type === "textarea") && (
          <LabeledSection title="Length Constraints">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Min Length</label>
                <input
                  type="number"
                  value={field.minLength ?? ""}
                  onChange={(e) =>
                    onUpdateField({ minLength: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className={inputClass}
                  placeholder="0"
                  min={0}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Max Length</label>
                <input
                  type="number"
                  value={field.maxLength ?? ""}
                  onChange={(e) =>
                    onUpdateField({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className={inputClass}
                  placeholder="∞"
                  min={0}
                />
              </div>
            </div>
          </LabeledSection>
        )}

        {/* Number constraints */}
        {field.type === "number" && (
          <LabeledSection title="Number Range">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Min</label>
                <input
                  type="number"
                  value={field.min ?? ""}
                  onChange={(e) =>
                    onUpdateField({ min: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  className={inputClass}
                  placeholder="—"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Max</label>
                <input
                  type="number"
                  value={field.max ?? ""}
                  onChange={(e) =>
                    onUpdateField({ max: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  className={inputClass}
                  placeholder="—"
                />
              </div>
            </div>
          </LabeledSection>
        )}

        {/* File constraints */}
        {field.type === "file" && (
          <>
            <LabeledSection title="Accepted File Types">
              <input
                type="text"
                value={field.acceptedFileTypes ?? ""}
                onChange={(e) => onUpdateField({ acceptedFileTypes: e.target.value })}
                className={inputClass}
                placeholder=".pdf,.jpg,.png"
              />
            </LabeledSection>
            <LabeledSection title="Max File Size (MB)">
              <input
                type="number"
                value={field.maxFileSizeMb ?? ""}
                onChange={(e) =>
                  onUpdateField({
                    maxFileSizeMb: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className={inputClass}
                placeholder="10"
                min={0}
              />
            </LabeledSection>
          </>
        )}

        {/* Options */}
        {hasOptions && (
          <LabeledSection title="Options">
            <div className="space-y-2">
              {(field.options ?? []).map((option, idx) => (
                <div key={option.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMoveOption(option.id, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <GripVertical className="w-3 h-3" />
                  </button>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => handleOptionChange(option.id, "label", e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="Label"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => handleOptionChange(option.id, "value", e.target.value)}
                    className={`${inputClass} w-24`}
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    title="Remove option"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Option
              </button>
            </div>
          </LabeledSection>
        )}
      </div>
    </div>
  );
}
