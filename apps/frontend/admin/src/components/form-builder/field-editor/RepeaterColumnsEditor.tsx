"use client";

import React from "react";
import { Plus, Table } from "lucide-react";
import { FormField, RepeaterColumn } from "../types";
import { generateId } from "../utils";
import { LabeledSection, inputClass } from "./FieldEditorPrimitives";
import { RepeaterPresetsBar } from "./RepeaterPresetsBar";
import { RepeaterColumnItem } from "./RepeaterColumnItem";

export function RepeaterColumnsEditor({
  field,
  onUpdateField,
}: {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
}) {
  const columns: RepeaterColumn[] = field.repeaterColumns ?? [];

  const handleAddColumn = () => {
    let nextIdx = columns.length + 1;
    while (columns.some((c) => c.key === `col_${nextIdx}`)) nextIdx++;
    const newCol: RepeaterColumn = {
      id: generateId(),
      key: `col_${nextIdx}`,
      label: `Column ${nextIdx}`,
      type: "text",
      required: false,
    };
    onUpdateField({ repeaterColumns: [...columns, newCol] });
  };

  const handleUpdateColumn = (colId: string, updates: Partial<RepeaterColumn>) => {
    onUpdateField({
      repeaterColumns: columns.map((c) => (c.id === colId ? { ...c, ...updates } : c)),
    });
  };

  const handleMoveColumn = (colId: string, direction: "up" | "down") => {
    const idx = columns.findIndex((c) => c.id === colId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= columns.length) return;
    const newCols = [...columns];
    const temp = newCols[idx];
    const swap = newCols[targetIdx];
    if (!temp || !swap) return;
    newCols[idx] = swap;
    newCols[targetIdx] = temp;
    onUpdateField({ repeaterColumns: newCols });
  };

  return (
    <LabeledSection
      title="Table Columns & Equipment Fields"
      icon={Table}
      description="Define the table columns for each repeatable equipment entry."
    >
      <RepeaterPresetsBar onUpdateField={onUpdateField} />

      <div className="space-y-2">
        {columns.map((col, idx) => (
          <RepeaterColumnItem
            key={col.id}
            col={col}
            idx={idx}
            totalColumns={columns.length}
            onMoveColumn={handleMoveColumn}
            onUpdateColumn={handleUpdateColumn}
            onRemoveColumn={(colId) =>
              onUpdateField({ repeaterColumns: columns.filter((c) => c.id !== colId) })
            }
          />
        ))}
        <button
          type="button"
          onClick={handleAddColumn}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Table Column
        </button>
      </div>

      <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800">
        <div>
          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            Add Button Label
          </label>
          <input
            type="text"
            value={field.addButtonLabel ?? "Add Equipment"}
            onChange={(e) => onUpdateField({ addButtonLabel: e.target.value })}
            className={inputClass}
            placeholder="e.g. Add Equipment / Add Row"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Min Rows Required
            </label>
            <input
              type="number"
              min={0}
              value={field.minRows ?? 1}
              onChange={(e) => onUpdateField({ minRows: e.target.value ? parseInt(e.target.value, 10) : 0 })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Max Rows Allowed
            </label>
            <input
              type="number"
              min={1}
              value={field.maxRows ?? ""}
              onChange={(e) =>
                onUpdateField({ maxRows: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
              className={inputClass}
              placeholder="Unlimited"
            />
          </div>
        </div>
      </div>
    </LabeledSection>
  );
}
