"use client";

import React from "react";
import { GripVertical, Pencil, Copy, Trash2, Star } from "lucide-react";
import { FormField } from "./types";
import { getFieldLabel, getFieldIcon } from "./utils";

interface CanvasFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragOver: boolean;
}

function FieldPreview({ field }: { field: FormField }) {
  const previewInputClass =
    "w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500 pointer-events-none";

  if (field.type === "section-header") {
    return (
      <div className="py-1">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {field.sectionTitle || field.label}
        </p>
        <div className="mt-1 h-px bg-indigo-200 dark:bg-indigo-800" />
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
        placeholder={field.placeholder || "Text area preview..."}
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
      <div className="space-y-1 pointer-events-none">
        {(field.options ?? []).slice(0, 3).map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <input type="radio" disabled className="pointer-events-none" />
            {opt.label}
          </label>
        ))}
        {(field.options ?? []).length > 3 && (
          <p className="text-[10px] text-slate-400">+{(field.options ?? []).length - 3} more…</p>
        )}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="space-y-1 pointer-events-none">
        {(field.options ?? []).slice(0, 3).map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <input type="checkbox" disabled className="pointer-events-none" />
            {opt.label}
          </label>
        ))}
        {(field.options ?? []).length > 3 && (
          <p className="text-[10px] text-slate-400">+{(field.options ?? []).length - 3} more…</p>
        )}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center pointer-events-none">
        <p className="text-[11px] text-slate-400">
          📎 {field.acceptedFileTypes ? `Accepts: ${field.acceptedFileTypes}` : "Click or drop to upload"}
          {field.maxFileSizeMb ? ` · max ${field.maxFileSizeMb}MB` : ""}
        </p>
      </div>
    );
  }

  const typeMap: Record<string, string> = {
    text: "text",
    number: "number",
    email: "email",
    phone: "tel",
    date: "date",
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

export function CanvasField({
  field,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: CanvasFieldProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="relative"
    >
      {isDragOver && (
        <div className="h-0.5 bg-indigo-500 rounded-full mb-2 mx-4 shadow-md shadow-indigo-500/30 transition-all" />
      )}
      <div
        draggable
        onDragStart={onDragStart}
        onClick={onSelect}
        className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30 shadow-lg"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md"
        }`}
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 mt-1 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{getFieldIcon(field.type)}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
              {field.label}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-mono flex-shrink-0">
              {getFieldLabel(field.type)}
            </span>
            {field.required && (
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold flex-shrink-0">
                <Star className="w-2.5 h-2.5" />
                Required
              </span>
            )}
          </div>
          <FieldPreview field={field} />
          {field.helpText && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">{field.helpText}</p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="Edit field"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
            title="Duplicate field"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            title="Delete field"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
