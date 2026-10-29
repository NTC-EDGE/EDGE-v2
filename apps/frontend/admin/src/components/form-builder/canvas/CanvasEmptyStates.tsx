"use client";

import React from "react";
import { LayoutGrid, MousePointerClick, Layers } from "lucide-react";

export function CanvasEmptyFormState({
  isDragOverCanvas,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  isDragOverCanvas: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed transition-all ${
        isDragOverCanvas
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
          : "border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white/50 dark:bg-slate-900/40"
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
        {isDragOverCanvas ? (
          <MousePointerClick className="w-7 h-7 text-indigo-500" />
        ) : (
          <LayoutGrid className="w-7 h-7 text-indigo-400 dark:text-indigo-500" />
        )}
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {isDragOverCanvas ? "Drop here to add component" : "Start building your form"}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm text-center">
        Click or drag component types from the left palette onto this canvas to add input fields,
        sections, and attachments.
      </p>
    </div>
  );
}

export function CanvasEmptyVariantState({
  selectedVariant,
  onSelectVariant,
}: {
  selectedVariant: string;
  onSelectVariant: (variant: string) => void;
}) {
  return (
    <div className="py-16 px-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 text-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
        <Layers className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">
        No sections or fields active for &quot;{selectedVariant}&quot;
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
        Existing fields in this form template have conditional visibility restricted to other
        service variants. Click below to show all base fields or select another variant above.
      </p>
      <button
        type="button"
        onClick={() => onSelectVariant("ALL")}
        className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
      >
        Show All Sections &amp; Fields
      </button>
    </div>
  );
}
