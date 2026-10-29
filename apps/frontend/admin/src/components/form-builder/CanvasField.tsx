"use client";

import React from "react";
import { GripVertical, Pencil, Copy, Trash2, Star, Layout, ChevronDown, ChevronRight } from "lucide-react";
import { FormField } from "./types";
import { getFieldLabel, getFieldIcon } from "./utils";
import { CanvasFieldPreview } from "./canvas/CanvasFieldPreview";
import { CanvasFieldBadges } from "./canvas/CanvasFieldBadges";

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

export function CanvasField(props: CanvasFieldProps) {
  const {
    field, isSelected, onSelect, onEdit, onDuplicate, onDelete,
    onDragStart, onDragOver, onDrop, isDragOver, isCollapsed = false,
    childFieldCount = 0, onToggleCollapse, allFields, isReadOnly = false,
  } = props;
  const isSectionHeader = field.type === "section-header";

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
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm">{getFieldIcon(field.type)}</span>
            <span className={`text-xs truncate ${isSectionHeader ? "font-extrabold text-indigo-950 dark:text-indigo-100 uppercase tracking-wide text-[11px]" : "font-bold text-slate-900 dark:text-white"}`}>
              {field.label}
            </span>

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

            {field.required && (
              <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800/60 flex-shrink-0">
                <Star className="w-2.5 h-2.5 fill-rose-500" />
                Required
              </span>
            )}

            {field.type !== "divider" && !isSectionHeader && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
                <Layout className="w-2.5 h-2.5" />
                {(field.cols ?? 2) === 1 ? "Half Width" : "Full Width"}
              </span>
            )}

            <CanvasFieldBadges field={field} allFields={allFields} />
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
            <CanvasFieldPreview field={field} />
          )}

          {field.helpText && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 italic">
              ℹ️ {field.helpText}
            </p>
          )}
        </div>

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
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              title="Configure properties"
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
        )}
      </div>
    </div>
  );
}
