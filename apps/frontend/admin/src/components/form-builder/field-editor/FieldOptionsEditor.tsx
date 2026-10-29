"use client";

import React from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, ListFilter } from "lucide-react";
import { FormField } from "../types";
import { generateId } from "../utils";
import { LabeledSection, inputClass } from "./FieldEditorPrimitives";

export function FieldOptionsEditor({
  field,
  onUpdateField,
}: {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
}) {
  const handleOptionChange = (optionId: string, key: "label" | "value", value: string) => {
    if (!field.options) return;
    onUpdateField({
      options: field.options.map((opt) =>
        opt.id === optionId ? { ...opt, [key]: value } : opt
      ),
    });
  };

  const handleAddOption = () => {
    const nextIdx = (field.options?.length ?? 0) + 1;
    const newOption = {
      id: generateId(),
      label: `Option ${nextIdx}`,
      value: `option_${nextIdx}`,
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
    <LabeledSection
      title="Choice Options"
      icon={ListFilter}
      description="Manage choices presented to users."
    >
      <div className="space-y-2">
        {(field.options ?? []).map((option, idx) => (
          <div
            key={option.id}
            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleMoveOption(option.id, "up")}
                disabled={idx === 0}
                className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move option up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveOption(option.id, "down")}
                disabled={idx === (field.options?.length ?? 1) - 1}
                className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move option down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <input
              type="text"
              value={option.label}
              onChange={(e) => handleOptionChange(option.id, "label", e.target.value)}
              className={`${inputClass} flex-1`}
              placeholder="Display Label"
              title="Display Label"
            />
            <input
              type="text"
              value={option.value}
              onChange={(e) => handleOptionChange(option.id, "value", e.target.value)}
              className={`${inputClass} w-24 font-mono text-[11px]`}
              placeholder="Value Code"
              title="Stored Value Code"
            />
            <button
              type="button"
              onClick={() => handleRemoveOption(option.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              title="Delete option"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddOption}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Choice Option
        </button>
      </div>
    </LabeledSection>
  );
}
