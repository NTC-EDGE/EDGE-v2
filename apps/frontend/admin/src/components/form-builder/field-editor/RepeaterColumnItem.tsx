"use client";

import React from "react";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { RepeaterColumn } from "../types";
import { generateId } from "../utils";
import { inputClass, parseRepeaterColType } from "./FieldEditorPrimitives";

export function RepeaterColumnItem({
  col,
  idx,
  totalColumns,
  onMoveColumn,
  onUpdateColumn,
  onRemoveColumn,
}: {
  col: RepeaterColumn;
  idx: number;
  totalColumns: number;
  onMoveColumn: (colId: string, direction: "up" | "down") => void;
  onUpdateColumn: (colId: string, updates: Partial<RepeaterColumn>) => void;
  onRemoveColumn: (colId: string) => void;
}) {
  return (
    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveColumn(col.id, "up")}
            disabled={idx === 0}
            className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
            title="Move column up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveColumn(col.id, "down")}
            disabled={idx === totalColumns - 1}
            className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
            title="Move column down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={col.required ?? false}
              onChange={(e) => onUpdateColumn(col.id, { required: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-0 w-3 h-3"
            />
            <span>Req</span>
          </label>
          <button
            type="button"
            onClick={() => onRemoveColumn(col.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            title="Delete column"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <label className="text-[9px] font-semibold text-slate-400 block mb-0.5">Column Label</label>
          <input
            type="text"
            value={col.label}
            onChange={(e) => onUpdateColumn(col.id, { label: e.target.value })}
            className={inputClass}
            placeholder="Column Label"
          />
        </div>
        <div>
          <label className="text-[9px] font-semibold text-slate-400 block mb-0.5">Input Type</label>
          <select
            value={col.type}
            onChange={(e) => onUpdateColumn(col.id, { type: parseRepeaterColType(e.target.value) })}
            className={inputClass}
          >
            <option value="text">Text Input</option>
            <option value="number">Number</option>
            <option value="select">Dropdown</option>
            <option value="date">Date Picker</option>
            <option value="file">File Upload</option>
            <option value="equipments">Equipment Units (Freq &amp; Serial)</option>
            <option value="serials">Serial Number List</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[9px] font-semibold text-slate-400 block mb-0.5">Placeholder</label>
        <input
          type="text"
          value={col.placeholder ?? ""}
          onChange={(e) => onUpdateColumn(col.id, { placeholder: e.target.value })}
          className={inputClass}
          placeholder="e.g. Motorola / IC-7300..."
        />
      </div>

      {col.type === "select" && (
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-semibold text-slate-400">Dropdown Options</label>
            <button
              type="button"
              onClick={() => {
                const currentOpts = col.options ?? [];
                const nextNum = currentOpts.length + 1;
                const newOpt = { id: generateId(), label: `Option ${nextNum}`, value: `option_${nextNum}` };
                onUpdateColumn(col.id, { options: [...currentOpts, newOpt] });
              }}
              className="text-[9px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              + Add Option
            </button>
          </div>
          <div className="space-y-1">
            {(col.options ?? []).map((opt, oIdx) => (
              <div key={opt.id} className="flex items-center gap-1">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => {
                    const updated = (col.options ?? []).map((o) =>
                      o.id === opt.id ? { ...o, label: e.target.value, value: e.target.value } : o
                    );
                    onUpdateColumn(col.id, { options: updated });
                  }}
                  className={inputClass}
                  placeholder={`Option ${oIdx + 1}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateColumn(col.id, {
                      options: (col.options ?? []).filter((o) => o.id !== opt.id),
                    })
                  }
                  className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  title="Delete option"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
