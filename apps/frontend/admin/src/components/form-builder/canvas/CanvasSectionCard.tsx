"use client";

import React from "react";
import { FormField } from "../types";
import { CanvasField } from "../CanvasField";
import { SectionGroup } from "./useCanvasSections";
import { CanvasSectionHeader } from "./CanvasSectionHeader";

export function CanvasSectionCard({
  group,
  allFields,
  isCollapsed,
  selectedFieldId,
  dragOverIndex,
  selectedVariant,
  isReadOnly,
  onToggleCollapse,
  onSelectField,
  onDuplicateField,
  onDeleteField,
  onRequestDeleteSection,
  onFieldDragStart,
  onFieldDragOver,
  onFieldDrop,
  onSetDragOverIndex,
}: {
  group: SectionGroup;
  allFields: FormField[];
  isCollapsed: boolean;
  selectedFieldId: string | null;
  dragOverIndex: number | null;
  selectedVariant: string;
  isReadOnly: boolean;
  onToggleCollapse: (sectionId: string) => void;
  onSelectField: (id: string | null) => void;
  onDuplicateField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onRequestDeleteSection: (target: { id: string; title: string; childCount: number }) => void;
  onFieldDragStart: (e: React.DragEvent<HTMLDivElement>, fieldId: string) => void;
  onFieldDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onFieldDrop: (e: React.DragEvent<HTMLDivElement>, toIndex: number) => void;
  onSetDragOverIndex: (index: number | null) => void;
}) {
  const isSectionSelected = group.headerField ? selectedFieldId === group.headerField.id : false;
  const isHeaderDragOver = group.headerIndex >= 0 && dragOverIndex === group.headerIndex;
  const emptyDropIndex = group.headerIndex >= 0 ? group.headerIndex + 1 : allFields.length;

  return (
    <div
      onDragOver={(e) => {
        if (!isReadOnly && group.headerIndex >= 0) onFieldDragOver(e, group.headerIndex);
      }}
      onDrop={(e) => {
        if (!isReadOnly && group.headerIndex >= 0) onFieldDrop(e, group.headerIndex);
      }}
      className="relative"
    >
      {isHeaderDragOver && (
        <div className="h-1 bg-indigo-500 rounded-full mb-3 mx-2 shadow-md shadow-indigo-500/30 transition-all" />
      )}
      <div
        className={`rounded-2xl border transition-all overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${
          isSectionSelected
            ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
            : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60"
        }`}
      >
        <CanvasSectionHeader
          group={group}
          isCollapsed={isCollapsed}
          isSectionSelected={isSectionSelected}
          isReadOnly={isReadOnly}
          onToggleCollapse={onToggleCollapse}
          onSelectField={onSelectField}
          onDuplicateField={onDuplicateField}
          onRequestDeleteSection={onRequestDeleteSection}
          onFieldDragStart={onFieldDragStart}
        />

        {!isCollapsed && (
          <div className="p-5 space-y-3 bg-slate-50/40 dark:bg-slate-900/40">
            {group.childFields.length === 0 ? (
              <div
                onDragOver={(e) => {
                  if (isReadOnly) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onSetDragOverIndex(emptyDropIndex);
                }}
                onDrop={(e) => {
                  if (isReadOnly) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onFieldDrop(e, emptyDropIndex);
                }}
                className="py-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-slate-900"
              >
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {selectedVariant === "ALL"
                    ? "No fields inside this section yet"
                    : `No fields configured for "${selectedVariant}" inside this section`}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Drag components from the left palette to add fields to {group.title}.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                  {group.childFields.map(({ field, originalIndex }) => {
                    const isHalfWidth =
                      field.type !== "repeater" &&
                      field.type !== "divider" &&
                      field.type !== "section-header" &&
                      (field.cols ?? 2) === 1;
                    return (
                      <div
                        key={`${field.id}-${originalIndex}`}
                        className={isHalfWidth ? "col-span-1" : "col-span-1 xl:col-span-2"}
                      >
                        <CanvasField
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          isDragOver={dragOverIndex === originalIndex}
                          allFields={allFields}
                          isReadOnly={isReadOnly}
                          onSelect={() => onSelectField(field.id)}
                          onEdit={() => onSelectField(field.id)}
                          onDuplicate={() => onDuplicateField(field.id)}
                          onDelete={() => onDeleteField(field.id)}
                          onDragStart={(e) => onFieldDragStart(e, field.id)}
                          onDragOver={(e) => onFieldDragOver(e, originalIndex)}
                          onDrop={(e) => onFieldDrop(e, originalIndex)}
                        />
                      </div>
                    );
                  })}
                </div>
                {!isReadOnly && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const lastIdx = group.childFields[group.childFields.length - 1].originalIndex;
                      onSetDragOverIndex(lastIdx + 1);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const lastIdx = group.childFields[group.childFields.length - 1].originalIndex;
                      onFieldDrop(e, lastIdx + 1);
                    }}
                    className={`h-8 rounded-xl border border-dashed transition-all flex items-center justify-center text-[10px] ${
                      dragOverIndex === group.childFields[group.childFields.length - 1].originalIndex + 1
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 font-semibold"
                        : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    + Drop component into {group.title}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
