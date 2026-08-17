"use client";

import React, { useState, useCallback } from "react";
import {
  LayoutGrid,
  MousePointerClick,
  Building2,
  Tag,
  Layers,
  Pencil,
  Info,
} from "lucide-react";
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

  // Count section headers
  const sectionCount = form.fields.filter((f) => f.type === "section-header").length;

  return (
    <div
      className="h-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950"
      onClick={() => onSelectField(null)}
    >
      {/* Canvas scroll area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-6 min-h-full">
          {/* Form Header Card */}
          <div className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Published / Draft Status */}
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
                {form.isPublished ? "Published Form" : "Draft Template"}
              </span>

              {/* Service association */}
              {form.serviceName ? (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1 max-w-[320px] truncate">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {form.serviceName}
                    {form.serviceCode ? ` (${form.serviceCode})` : ""}
                  </span>
                </span>
              ) : (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Standalone Template
                </span>
              )}

              {/* Counts */}
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono font-medium flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {form.fields.length} {form.fields.length === 1 ? "field" : "fields"}
                {sectionCount > 0 && ` · ${sectionCount} ${sectionCount === 1 ? "section" : "sections"}`}
              </span>
            </div>

            {/* Editable Form Title */}
            {editingTitle ? (
              <input
                autoFocus
                type="text"
                value={form.name}
                onChange={(e) => onUpdateForm({ name: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                className="text-2xl font-extrabold text-slate-900 dark:text-white w-full bg-transparent border-b-2 border-indigo-500 outline-none tracking-tight"
                placeholder="Enter Form Template Name..."
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTitle(true);
                }}
                className="group/title flex items-center gap-2 cursor-pointer"
                title="Click to edit form title"
              >
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                  {form.name || "Untitled Form"}
                </h1>
                <Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Editable Description */}
            {editingDescription ? (
              <textarea
                autoFocus
                value={form.description}
                onChange={(e) => onUpdateForm({ description: e.target.value })}
                onBlur={() => setEditingDescription(false)}
                rows={2}
                className="mt-2 text-sm text-slate-600 dark:text-slate-400 w-full bg-transparent border-b border-indigo-400 outline-none resize-none"
                placeholder="Enter form description or guidance for applicants..."
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDescription(true);
                }}
                className="group/desc flex items-center gap-2 mt-2 cursor-pointer"
                title="Click to edit form description"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[20px] group-hover/desc:text-slate-700 dark:group-hover/desc:text-slate-300 transition-colors">
                  {form.description || "Click to add form description or instructions..."}
                </p>
                <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/desc:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Hint Banner */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                Tip: Click any field on the canvas to configure properties in the right panel. Drag handles to reorder.
              </span>
            </div>
          </div>

          {/* Fields canvas area */}
          {form.fields.length === 0 ? (
            <div
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
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
                {isDragOverCanvas ? "Drop here to add field" : "Start building your form"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm text-center">
                Click or drag component types from the left palette onto this canvas to add input fields, sections, and attachments.
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
                  key={`${field.id}-${index}`}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  isDragOver={dragOverIndex === index}
                  onSelect={() => {
                    onSelectField(field.id);
                  }}
                  onEdit={() => {
                    onSelectField(field.id);
                  }}
                  onDuplicate={() => onDuplicateField(field.id)}
                  onDelete={() => onDeleteField(field.id)}
                  onDragStart={(e) => handleFieldDragStart(e, field.id)}
                  onDragOver={(e) => handleFieldDragOver(e, index)}
                  onDrop={(e) => handleFieldDrop(e, index)}
                />
              ))}

              {/* Bottom drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(form.fields.length);
                }}
                onDrop={(e) => handleFieldDrop(e, form.fields.length)}
                onDragEnd={handleFieldDragEnd}
                className={`h-10 rounded-xl border-2 border-dashed transition-all flex items-center justify-center text-[11px] ${
                  dragOverIndex === form.fields.length
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 font-semibold"
                    : "border-transparent text-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-400"
                }`}
              >
                + Drop new field at the end
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
