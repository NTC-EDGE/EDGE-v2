"use client";

import React from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  FolderKanban,
  Pencil,
  Copy,
  Trash2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { SectionGroup } from "./useCanvasSections";

export function CanvasSectionHeader({
  group,
  isCollapsed,
  isSectionSelected,
  isReadOnly,
  isDeleteLocked = false,
  usedByVariantsCount = 0,
  onToggleCollapse,
  onSelectField,
  onDuplicateField,
  onRequestDeleteSection,
  onLockedDeleteSection,
  onFieldDragStart,
}: {
  group: SectionGroup;
  isCollapsed: boolean;
  isSectionSelected: boolean;
  isReadOnly: boolean;
  isDeleteLocked?: boolean;
  usedByVariantsCount?: number;
  onToggleCollapse: (sectionId: string) => void;
  onSelectField: (id: string | null) => void;
  onDuplicateField: (id: string) => void;
  onRequestDeleteSection: (target: {
    id: string;
    title: string;
    childCount: number;
    contractRequired?: boolean;
  }) => void;
  onLockedDeleteSection?: (sectionId: string) => void;
  onFieldDragStart: (e: React.DragEvent<HTMLDivElement>, fieldId: string) => void;
}) {
  const sectionId = group.headerField ? group.headerField.id : "default-section";
  const isContractRequired = Boolean(group.headerField?.contractRequired);

  return (
    <div
      draggable={!isReadOnly && group.headerField !== null}
      onDragStart={(e) => {
        if (!isReadOnly && group.headerField) onFieldDragStart(e, group.headerField.id);
      }}
      onClick={() => {
        if (group.headerField) onSelectField(group.headerField.id);
      }}
      className={`px-5 py-4 flex items-center justify-between border-b transition-colors cursor-pointer select-none ${
        isSectionSelected
          ? "bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800"
          : "bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:bg-indigo-50/40 dark:hover:bg-slate-800/90"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
        {group.headerField && !isReadOnly && (
          <div
            className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-grab active:cursor-grabbing p-0.5"
            title="Drag to move entire section card and all its fields"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(group.id);
          }}
          className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
          title={isCollapsed ? "Expand section fields" : "Minimize section"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-2 truncate">
          <FolderKanban className="w-4 h-4 text-indigo-500 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{group.title}</h3>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono shrink-0">
          {group.childFields.length} {group.childFields.length === 1 ? "field" : "fields"}
        </span>
        {isContractRequired && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0"
            title="Section key is referenced by the Service Contract schema"
          >
            <ShieldCheck className="w-3 h-3" />
            Contract Linked
          </span>
        )}
        {isCollapsed && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-medium border border-amber-300 dark:border-amber-700 shrink-0">
            Minimized
          </span>
        )}
      </div>

      {!isReadOnly && (
        <div className="flex items-center gap-1 shrink-0">
          {group.headerField && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (group.headerField) onSelectField(group.headerField.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                title="Configure section properties"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (group.headerField) onDuplicateField(group.headerField.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                title="Duplicate section and all fields"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isDeleteLocked && onLockedDeleteSection) {
                onLockedDeleteSection(sectionId);
                return;
              }
              onRequestDeleteSection({
                id: sectionId,
                title: group.title,
                childCount: group.childFields.length,
                contractRequired: isContractRequired,
              });
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isDeleteLocked
                ? "text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
            }`}
            title={
              isDeleteLocked
                ? `Used by ${usedByVariantsCount} Service Variant(s) — click to see which variants block deletion`
                : "Delete section and its fields"
            }
          >
            {isDeleteLocked ? <Lock className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
