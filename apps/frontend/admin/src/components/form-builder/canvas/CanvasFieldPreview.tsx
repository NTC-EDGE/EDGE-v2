"use client";

import React from "react";
import { Paperclip } from "lucide-react";
import { FormField } from "../types";
import { getFieldLabel } from "../utils";

export function CanvasFieldPreview({ field }: { field: FormField }) {
  const previewInputClass =
    "w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500 pointer-events-none";

  if (field.type === "section-header") {
    return (
      <div className="py-1">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {field.sectionTitle || field.label}
        </p>
        <div className="mt-1 h-0.5 bg-indigo-200 dark:bg-indigo-800 rounded-full" />
      </div>
    );
  }

  if (field.type === "divider") {
    return <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />;
  }

  if (field.type === "textarea") {
    return (
      <textarea
        readOnly
        placeholder={field.placeholder || "Text area response preview..."}
        className={`${previewInputClass} h-16 resize-none`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select disabled className={previewInputClass}>
        <option>{field.placeholder || "Select an option..."}</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt.id} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="space-y-1.5 pointer-events-none">
        {(field.options ?? []).slice(0, 4).map((opt, optIdx) => (
          <label key={`${opt.id || opt.value}-${optIdx}`} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input type="radio" disabled className="pointer-events-none text-indigo-600" />
            <span>{opt.label}</span>
          </label>
        ))}
        {(field.options ?? []).length > 4 && (
          <p className="text-[10px] text-slate-400 italic">+{(field.options ?? []).length - 4} more options…</p>
        )}
        {(field.options ?? []).length === 0 && (
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input type="checkbox" disabled className="pointer-events-none text-indigo-600 rounded" />
            <span>{field.placeholder || field.label || "Checkbox option"}</span>
          </label>
        )}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="space-y-1.5 pointer-events-none">
        {(field.options ?? []).slice(0, 4).map((opt, optIdx) => (
          <label key={`${opt.id || opt.value}-${optIdx}`} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input type="checkbox" disabled className="pointer-events-none text-indigo-600 rounded" />
            <span>{opt.label}</span>
          </label>
        ))}
        {(field.options ?? []).length > 4 && (
          <p className="text-[10px] text-slate-400 italic">+{(field.options ?? []).length - 4} more options…</p>
        )}
      </div>
    );
  }

  if (field.type === "repeater") {
    const cols =
      field.repeaterColumns && field.repeaterColumns.length > 0
        ? field.repeaterColumns
        : [
            { id: "1", key: "type", label: "Equipment Type", type: "text" as const },
            { id: "2", key: "make", label: "Make / Model", type: "text" as const },
            { id: "3", key: "serial", label: "Serial No.", type: "text" as const },
            { id: "4", key: "qty", label: "Qty", type: "number" as const },
          ];

    return (
      <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden pointer-events-none bg-slate-50/50 dark:bg-slate-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-2.5 py-1.5 w-8 text-center text-slate-400">#</th>
                {cols.map((col, colIdx) => (
                  <th key={`${col.id || col.key}-${colIdx}`} className="px-2.5 py-1.5">
                    {col.label}
                    {col.required && <span className="text-red-500 ml-0.5">*</span>}
                  </th>
                ))}
                <th className="px-2 py-1.5 w-10 text-center text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
              <tr className="bg-white/60 dark:bg-slate-900/40">
                <td className="px-2.5 py-2 text-center text-slate-400 font-mono">1</td>
                {cols.map((col, colIdx) => (
                  <td key={`${col.id || col.key}-${colIdx}`} className="px-2.5 py-2">
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 px-2 flex items-center text-[10px] text-slate-400">
                      {col.placeholder || col.label}
                    </div>
                  </td>
                ))}
                <td className="px-2 py-2 text-center text-slate-300">✕</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 bg-slate-100/50 dark:bg-slate-800/40 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
            + {field.addButtonLabel || "Add Equipment"}
          </span>
          <span className="text-[10px] text-slate-400">
            {cols.length} Columns · Min: {field.minRows ?? 1} row(s)
          </span>
        </div>
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center pointer-events-none bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
          <span>{field.acceptedFileTypes ? `Allowed: ${field.acceptedFileTypes}` : "Click or drop file attachment"}</span>
          {field.maxFileSizeMb ? ` · max ${field.maxFileSizeMb}MB` : ""}
        </div>
      </div>
    );
  }

  const typeMap: Record<string, string> = {
    text: "text",
    number: "number",
    email: "email",
    phone: "tel",
    date: "date",
    time: "time",
  };

  return (
    <input
      type={typeMap[field.type] ?? "text"}
      readOnly
      placeholder={field.placeholder || `${getFieldLabel(field.type)} preview...`}
      className={previewInputClass}
    />
  );
}
