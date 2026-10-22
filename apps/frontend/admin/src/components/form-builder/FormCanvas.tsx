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
  ChevronDown,
  ChevronRight,
  GripVertical,
  FolderKanban,
  Copy,
  Trash2,
  Plus,
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

interface SectionGroup {
  id: string;
  headerField: FormField | null;
  headerIndex: number;
  title: string;
  childFields: Array<{ field: FormField; originalIndex: number }>;
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
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(new Set());

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const collapseAllSections = useCallback(() => {
    const allSectionIds = form.fields
      .filter((f) => f.type === "section-header")
      .map((f) => f.id);
    if (allSectionIds.length === 0) {
      allSectionIds.push("default-section");
    }
    setCollapsedSectionIds(new Set(allSectionIds));
  }, [form.fields]);

  const expandAllSections = useCallback(() => {
    setCollapsedSectionIds(new Set());
  }, []);

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

  // Group fields into section containers
  const sectionGroups: SectionGroup[] = [];
  let currentGroup: SectionGroup = {
    id: "default-section",
    headerField: null,
    headerIndex: -1,
    title: "General Information",
    childFields: [],
  };

  form.fields.forEach((field, index) => {
    if (field.type === "section-header") {
      if (currentGroup.headerField !== null || currentGroup.childFields.length > 0) {
        sectionGroups.push(currentGroup);
      }
      currentGroup = {
        id: field.id,
        headerField: field,
        headerIndex: index,
        title: field.sectionTitle || field.label || "Untitled Section",
        childFields: [],
      };
    } else {
      currentGroup.childFields.push({ field, originalIndex: index });
    }
  });

  if (currentGroup.headerField !== null || currentGroup.childFields.length > 0) {
    sectionGroups.push(currentGroup);
  }

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

              {/* Quick Section Collapse Controls */}
              {sectionGroups.length > 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={collapseAllSections}
                    className="text-[10px] px-2.5 py-1 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                    title="Minimize all sections for quick whole-section reordering"
                  >
                    Minimize All Sections
                  </button>
                  <button
                    type="button"
                    onClick={expandAllSections}
                    className="text-[10px] px-2.5 py-1 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                    title="Expand all sections"
                  >
                    Expand All
                  </button>
                </div>
              )}
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
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  Tip: Drag section headers to reorder whole sections. Click any field to edit properties.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onAddField("section-header")}
                className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Section
              </button>
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
                {isDragOverCanvas ? "Drop here to add component" : "Start building your form"}
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
              className="space-y-6"
            >
              {sectionGroups.map((group, groupIdx) => {
                const isCollapsed = collapsedSectionIds.has(group.id);
                const isSectionSelected = group.headerField ? selectedFieldId === group.headerField.id : false;
                const isHeaderDragOver = group.headerIndex >= 0 && dragOverIndex === group.headerIndex;

                return (
                  <div
                    key={group.id}
                    onDragOver={(e) => {
                      if (group.headerIndex >= 0) {
                        handleFieldDragOver(e, group.headerIndex);
                      }
                    }}
                    onDrop={(e) => {
                      if (group.headerIndex >= 0) {
                        handleFieldDrop(e, group.headerIndex);
                      }
                    }}
                    className="relative"
                  >
                    {isHeaderDragOver && (
                      <div className="h-1 bg-indigo-500 rounded-full mb-3 mx-2 shadow-md shadow-indigo-500/30 transition-all" />
                    )}

                    {/* Section Card Container */}
                    <div
                      className={`rounded-2xl border transition-all overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${
                        isSectionSelected
                          ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                          : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60"
                      }`}
                    >
                      {/* Section Card Header */}
                      <div
                        draggable={group.headerField !== null}
                        onDragStart={(e) => {
                          if (group.headerField) {
                            handleFieldDragStart(e, group.headerField.id);
                          }
                        }}
                        onClick={() => {
                          if (group.headerField) {
                            onSelectField(group.headerField.id);
                          }
                        }}
                        className={`px-5 py-4 flex items-center justify-between border-b transition-colors cursor-pointer select-none ${
                          isSectionSelected
                            ? "bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800"
                            : "bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:bg-indigo-50/40 dark:hover:bg-slate-800/90"
                        }`}
                      >
                        {/* Left Side: Drag handle, chevron, title, badge */}
                        <div className="flex items-center gap-3 min-w-0">
                          {group.headerField && (
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
                              toggleSectionCollapse(group.id);
                            }}
                            className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                            title={isCollapsed ? "Expand section fields" : "Minimize section"}
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex items-center gap-2 truncate">
                            <FolderKanban className="w-4 h-4 text-indigo-500 shrink-0" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {group.title}
                            </h3>
                          </div>

                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono shrink-0">
                            {group.childFields.length} {group.childFields.length === 1 ? "field" : "fields"}
                          </span>

                          {isCollapsed && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-medium border border-amber-300 dark:border-amber-700 shrink-0">
                              Minimized
                            </span>
                          )}
                        </div>

                        {/* Right Side: Section Actions */}
                        <div className="flex items-center gap-1">
                          {group.headerField && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectField(group.headerField!.id);
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
                                  onDuplicateField(group.headerField!.id);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                                title="Duplicate section and all fields"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteField(group.headerField!.id);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                                title="Delete section header"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Section Card Body (Collapsible) */}
                      {!isCollapsed && (
                        <div className="p-5 space-y-3 bg-slate-50/40 dark:bg-slate-900/40">
                          {group.childFields.length === 0 ? (
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverIndex(group.headerIndex >= 0 ? group.headerIndex + 1 : form.fields.length);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFieldDrop(e, group.headerIndex >= 0 ? group.headerIndex + 1 : form.fields.length);
                              }}
                              className="py-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-slate-900"
                            >
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                No fields inside this section yet
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Drag components from the left palette to add fields to {group.title}.
                              </p>
                            </div>
                          ) : (
                            <>
                              {group.childFields.map(({ field, originalIndex }) => (
                                <CanvasField
                                  key={`${field.id}-${originalIndex}`}
                                  field={field}
                                  isSelected={selectedFieldId === field.id}
                                  isDragOver={dragOverIndex === originalIndex}
                                  onSelect={() => onSelectField(field.id)}
                                  onEdit={() => onSelectField(field.id)}
                                  onDuplicate={() => onDuplicateField(field.id)}
                                  onDelete={() => onDeleteField(field.id)}
                                  onDragStart={(e) => handleFieldDragStart(e, field.id)}
                                  onDragOver={(e) => handleFieldDragOver(e, originalIndex)}
                                  onDrop={(e) => handleFieldDrop(e, originalIndex)}
                                />
                              ))}

                              {/* Drop zone inside the section */}
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const lastChildIndex = group.childFields[group.childFields.length - 1].originalIndex;
                                  setDragOverIndex(lastChildIndex + 1);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const lastChildIndex = group.childFields[group.childFields.length - 1].originalIndex;
                                  handleFieldDrop(e, lastChildIndex + 1);
                                }}
                                className={`h-8 rounded-xl border border-dashed transition-all flex items-center justify-center text-[10px] ${
                                  dragOverIndex === (group.childFields[group.childFields.length - 1].originalIndex + 1)
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 font-semibold"
                                    : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-300 hover:text-indigo-600"
                                }`}
                              >
                                + Drop component into {group.title}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bottom drop zone for adding new section or field */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(form.fields.length);
                }}
                onDrop={(e) => handleFieldDrop(e, form.fields.length)}
                onDragEnd={handleFieldDragEnd}
                className={`h-12 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center text-xs font-semibold ${
                  dragOverIndex === form.fields.length
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600"
                    : "border-slate-300 dark:border-slate-700 text-slate-400 hover:border-indigo-400 hover:text-indigo-600"
                }`}
              >
                + Drop new field or section at the end
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
