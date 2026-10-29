"use client";

import React from "react";
import { GripVertical, Pencil, Copy, Trash2, Star, Layout, Paperclip, ChevronDown, ChevronRight } from "lucide-react";
import { FormField } from "./types";
import { getFieldLabel, getFieldIcon, parseFieldCondition } from "./utils";

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
  isCollapsed?: boolean;
  childFieldCount?: number;
  onToggleCollapse?: () => void;
  allFields?: FormField[];
  isReadOnly?: boolean;
}

function FieldPreview({ field }: { field: FormField }) {
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
            <span>{field.placeholder || field.label || 'Checkbox option'}</span>
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
  isCollapsed = false,
  childFieldCount = 0,
  onToggleCollapse,
  allFields,
  isReadOnly = false,
}: CanvasFieldProps) {
  const isSectionHeader = field.type === "section-header";

  const condition = React.useMemo(() => {
    if (field.condition && typeof field.condition === "object") {
      return field.condition;
    }
    if (field.visibilityCondition) {
      return parseFieldCondition(field.visibilityCondition);
    }
    return undefined;
  }, [field.condition, field.visibilityCondition]);

  const dependencyBadges = React.useMemo(() => {
    if (!condition) {
      if (Boolean(field.visibilityCondition && field.visibilityCondition.trim() !== "")) {
        return [{ label: "⚡ Conditional", tooltip: field.visibilityCondition, type: "generic" as const }];
      }
      return [];
    }

    const badges: Array<{ label: string; tooltip?: string; type: "parent" | "variant" | "service" | "applicant" | "generic" }> = [];

    const deps = condition.fieldDependencies ?? [];
    for (const dep of deps) {
      const parentField = allFields?.find((f) => {
        if (f.id === dep.fieldId) return true;
        const normTarget = dep.fieldId.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normTarget.length > 0 && normLabel === normTarget;
      });
      const pLabel = parentField ? parentField.label : dep.fieldId;
      const op = dep.operator === "equals" ? "=" : dep.operator === "not_equals" ? "≠" : dep.operator === "is_not_empty" ? "filled" : dep.operator === "is_empty" ? "empty" : dep.operator;
      const valStr = dep.value ? ` "${dep.value}"` : "";
      badges.push({
        label: `🔗 Depends on: ${pLabel} ${op}${valStr}`,
        tooltip: `Shown only when "${pLabel}" is ${op}${valStr}`,
        type: "parent",
      });
    }

    const variants = condition.variants ?? condition.applicationTypes ?? [];
    if (variants.length > 0) {
      badges.push({
        label: variants.length <= 2 ? `⚡ Variant: ${variants.join(", ")}` : `⚡ ${variants.length} Variants`,
        tooltip: `Active for variants: ${variants.join(", ")}`,
        type: "variant",
      });
    }

    const excluded = condition.excludedVariants ?? [];
    if (excluded.length > 0) {
      badges.push({
        label: excluded.length <= 2 ? `🚫 Excluded: ${excluded.join(", ")}` : `🚫 ${excluded.length} Excluded`,
        tooltip: `Hidden for variants: ${excluded.join(", ")}`,
        type: "variant",
      });
    }

    const services = condition.services ?? [];
    if (services.length > 0) {
      badges.push({
        label: services.length === 1 ? `📁 ${services[0]}` : `📁 ${services.length} Services`,
        tooltip: `Applies to services: ${services.join(", ")}`,
        type: "service",
      });
    }

    const applicantTypes = condition.applicantTypes ?? [];
    if (applicantTypes.length > 0) {
      badges.push({
        label: `👤 ${applicantTypes.join("/")}`,
        tooltip: `Applicant type: ${applicantTypes.join(", ")}`,
        type: "applicant",
      });
    }

    if (badges.length === 0 && Boolean(field.visibilityCondition && field.visibilityCondition.trim() !== "")) {
      badges.push({
        label: "⚡ Conditional",
        tooltip: field.visibilityCondition,
        type: "generic",
      });
    }

    return badges;
  }, [condition, field.visibilityCondition, allFields]);

  return (
    <div onDragOver={onDragOver} onDrop={onDrop} className="relative">
      {isDragOver && (
        <div className="h-0.5 bg-indigo-500 rounded-full mb-2 mx-4 shadow-md shadow-indigo-500/30 transition-all" />
      )}
      <div
        draggable={!isReadOnly}
        onDragStart={!isReadOnly ? onDragStart : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
          isSectionHeader
            ? isSelected
              ? "border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/40 shadow-lg"
              : "border-indigo-200/90 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/60 via-white to-slate-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm"
            : isSelected
            ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 shadow-lg"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md"
        }`}
      >
        {/* Drag handle */}
        {!isReadOnly && (
          <div
            className={`flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing transition-colors ${
            isSectionHeader
              ? "text-indigo-400 dark:text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
              : "text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
          }`}
          title={isSectionHeader ? "Drag to move entire section and all its child fields" : "Drag to reorder field"}
        >
          <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Section Collapse / Minimize Toggle Button */}
        {isSectionHeader && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            className="flex-shrink-0 mt-0.5 p-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            title={isCollapsed ? "Expand section fields" : "Minimize section fields for compact reordering"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm">{getFieldIcon(field.type)}</span>
            <span className={`text-xs truncate ${isSectionHeader ? "font-extrabold text-indigo-950 dark:text-indigo-100 uppercase tracking-wide text-[11px]" : "font-bold text-slate-900 dark:text-white"}`}>
              {field.label}
            </span>

            {/* Type badge */}
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full font-mono flex-shrink-0 ${
              isSectionHeader
                ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}>
              {isSectionHeader ? "Section Group" : getFieldLabel(field.type)}
            </span>

            {isSectionHeader && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse?.();
                }}
                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 transition-all ${
                  isCollapsed
                    ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200 shadow-sm"
                    : "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40 hover:bg-indigo-100"
                }`}
                title={isCollapsed ? "Click to expand fields" : "Click to minimize section"}
              >
                <span>{isCollapsed ? "▶ Minimized" : "▼ Expanded"}</span>
                <span>· {childFieldCount ?? 0} {(childFieldCount === 1 ? "field" : "fields")}</span>
              </button>
            )}

            {/* Required badge */}
            {field.required && (
              <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800/60 flex-shrink-0">
                <Star className="w-2.5 h-2.5 fill-rose-500" />
                Required
              </span>
            )}

            {/* Column badge */}
            {field.type !== "divider" && !isSectionHeader && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
                <Layout className="w-2.5 h-2.5" />
                {(field.cols ?? 2) === 1 ? "Half Width" : "Full Width"}
              </span>
            )}

            {/* Conditional Visibility badges */}
            {dependencyBadges.map((badge, idx) => (
              <span
                key={`badge-${idx}`}
                title={badge.tooltip || badge.label}
                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 flex-shrink-0 ${
                  badge.type === "parent"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                    : badge.type === "variant"
                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
                    : badge.type === "service"
                    ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          {isSectionHeader && isCollapsed ? (
            <div className="py-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-indigo-50/60 dark:bg-indigo-950/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 mt-1">
              <span className="italic text-indigo-900 dark:text-indigo-300">
                {childFieldCount === 0 ? "No fields in this section" : `${childFieldCount} ${childFieldCount === 1 ? "field" : "fields"} bundled inside (minimized)`}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                Drag to move entire section block ⇅
              </span>
            </div>
          ) : (
            <FieldPreview field={field} />
          )}

          {field.helpText && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 italic">
              ℹ️ {field.helpText}
            </p>
          )}
        </div>

        {/* Action Toolbar */}
        {!isReadOnly && (
          <div
            className={`flex-shrink-0 flex items-center gap-1 transition-opacity ${
              isSelected
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
          >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="Configure properties"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
            title="Duplicate field"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            title="Delete field"
          >
            <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
