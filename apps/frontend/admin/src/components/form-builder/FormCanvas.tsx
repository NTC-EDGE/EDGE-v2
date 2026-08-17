"use client";

import React, { useState, useCallback } from "react";
import { LayoutGrid, MousePointerClick } from "lucide-react";
import { FormField, FormSchema, FieldType } from "./types";
import { CanvasField } from "./CanvasField";

interface FormCanvasProps {
  form: FormSchema;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onUpdateForm: (updates: Partial<FormSchema>) => void;
  onAddField: (type: FieldType, atIndex?: number) => void;
  onReorderFields: (fromIndex: number, toIndex: number) => void;
  onDuplicateField: (id: string) => void;
  onDeleteField: (id: string) => void;
}

export function FormCanvas({
  form,
  selectedFieldId,
  onSelectField,
  onUpdateForm,
  onAddField,
  onReorderFields,
  onDuplicateField,
  onDeleteField,
}: FormCanvasProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOverCanvas(true);
  }, []);

  const handleCanvasDragLeave = useCallback(() => {
    setIsDragOverCanvas(false);
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOverCanvas(false);
      const fieldType = e.dataTransfer.getData("fieldType") as FieldType;
      if (fieldType) {
        onAddField(fieldType);
      }
    },
    [onAddField]
  );

  const handleFieldDragStart = (e: React.DragEvent<HTMLDivElement>, fieldId: string) => {
    e.dataTransfer.setData("canvasFieldId", fieldId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFieldDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleFieldDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    const canvasFieldId = e.dataTransfer.getData("canvasFieldId");
    const fieldType = e.dataTransfer.getData("fieldType") as FieldType;

    if (canvasFieldId) {
      const fromIndex = form.fields.findIndex((f) => f.id === canvasFieldId);
      if (fromIndex >= 0 && fromIndex !== toIndex) {
        onReorderFields(fromIndex, toIndex);
      }
    } else if (fieldType) {
      onAddField(fieldType, toIndex);
    }
  };

  const handleFieldDragEnd = () => {
    setDragOverIndex(null);
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950"
      onClick={() => onSelectField(null)}
    >
      {/* Canvas scroll area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-6 min-h-full">
          {/* Form Header */}
          <div className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                  form.isPublished
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    form.isPublished ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {form.isPublished ? "Published" : "Draft"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{form.fields.length} fields</span>
            </div>

            {editingTitle ? (
              <input
                autoFocus
                type="text"
                value={form.name}
                onChange={(e) => onUpdateForm({ name: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                className="text-2xl font-extrabold text-slate-900 dark:text-white w-full bg-transparent border-b-2 border-indigo-500 outline-none tracking-tight"
              />
            ) : (
              <h1
                onClick={(e) => { e.stopPropagation(); setEditingTitle(true); }}
                className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight cursor-text hover:opacity-70 transition-opacity"
                title="Click to edit title"
              >
                {form.name || "Untitled Form"}
              </h1>
            )}

            {editingDescription ? (
              <textarea
                autoFocus
                value={form.description}
                onChange={(e) => onUpdateForm({ description: e.target.value })}
                onBlur={() => setEditingDescription(false)}
                rows={2}
                className="mt-2 text-sm text-slate-600 dark:text-slate-400 w-full bg-transparent border-b border-indigo-400 outline-none resize-none"
              />
            ) : (
              <p
                onClick={(e) => { e.stopPropagation(); setEditingDescription(true); }}
                className="mt-2 text-sm text-slate-500 dark:text-slate-400 cursor-text hover:opacity-70 transition-opacity min-h-[20px]"
                title="Click to edit description"
              >
                {form.description || "Click to add description..."}
              </p>
            )}
          </div>

          {/* Fields area */}
          {form.fields.length === 0 ? (
            <div
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed transition-all ${
                isDragOverCanvas
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                  : "border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                {isDragOverCanvas ? (
                  <MousePointerClick className="w-7 h-7 text-indigo-500" />
                ) : (
                  <LayoutGrid className="w-7 h-7 text-indigo-400 dark:text-indigo-500" />
                )}
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {isDragOverCanvas ? "Drop to add field" : "Start building your form"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Drag fields from the left palette to get started
              </p>
            </div>
          ) : (
            <div
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              className="space-y-3"
            >
              {form.fields.map((field: FormField, index: number) => (
                <CanvasField
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  isDragOver={dragOverIndex === index}
                  onSelect={() => { onSelectField(field.id); }}
                  onEdit={() => { onSelectField(field.id); }}
                  onDuplicate={() => onDuplicateField(field.id)}
                  onDelete={() => onDeleteField(field.id)}
                  onDragStart={(e) => handleFieldDragStart(e, field.id)}
                  onDragOver={(e) => handleFieldDragOver(e, index)}
                  onDrop={(e) => handleFieldDrop(e, index)}
                />
              ))}

              {/* Bottom drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(form.fields.length); }}
                onDrop={(e) => handleFieldDrop(e, form.fields.length)}
                onDragEnd={handleFieldDragEnd}
                className={`h-8 rounded-xl border-2 border-dashed transition-all ${
                  dragOverIndex === form.fields.length
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                    : "border-transparent"
                }`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

