"use client";

import React from "react";
import { Plus } from "lucide-react";
import { FieldType } from "./types";
import { getFieldIcon, getFieldLabel } from "./utils";

interface PaletteItemProps {
  type: FieldType;
  description: string;
  colorClass: string;
  onAdd?: (type: FieldType) => void;
}

function PaletteItem({ type, description, colorClass, onAdd }: PaletteItemProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("fieldType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onAdd && onAdd(type)}
      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group"
      title={`Click or drag to add ${getFieldLabel(type)}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${colorClass}`}>
          {getFieldIcon(type)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {getFieldLabel(type)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onAdd) onAdd(type);
        }}
        className="p-1 rounded-md text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
        title="Add to canvas"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface PaletteGroup {
  title: string;
  items: { type: FieldType; description: string; colorClass: string }[];
}

const paletteGroups: PaletteGroup[] = [
  {
    title: "Text & Data Inputs",
    items: [
      { type: "text", description: "Single-line text input", colorClass: "bg-indigo-100 dark:bg-indigo-900/50" },
      { type: "textarea", description: "Multi-line text box / remarks", colorClass: "bg-indigo-100 dark:bg-indigo-900/50" },
      { type: "number", description: "Numeric input with min/max", colorClass: "bg-sky-100 dark:bg-sky-900/50" },
      { type: "email", description: "Email address validation", colorClass: "bg-sky-100 dark:bg-sky-900/50" },
      { type: "phone", description: "Phone / mobile number", colorClass: "bg-sky-100 dark:bg-sky-900/50" },
      { type: "date", description: "Date selection picker", colorClass: "bg-teal-100 dark:bg-teal-900/50" },
      { type: "time", description: "Time selection (HH:MM AM/PM)", colorClass: "bg-teal-100 dark:bg-teal-900/50" },
    ],
  },
  {
    title: "Choice & Selection",
    items: [
      { type: "select", description: "Single-choice dropdown menu", colorClass: "bg-violet-100 dark:bg-violet-900/50" },
      { type: "radio", description: "Radio group (single selection)", colorClass: "bg-violet-100 dark:bg-violet-900/50" },
      { type: "checkbox", description: "Checkboxes (multiple selection)", colorClass: "bg-purple-100 dark:bg-purple-900/50" },
    ],
  },
  {
    title: "File Attachment",
    items: [
      { type: "file", description: "Document / image upload", colorClass: "bg-amber-100 dark:bg-amber-900/50" },
    ],
  },
  {
    title: "Equipment & Tables",
    items: [
      {
        type: "repeater",
        description: "Repeatable equipment inventory table",
        colorClass: "bg-emerald-100 dark:bg-emerald-900/50",
      },
    ],
  },
  {
    title: "Structure & Layout",
    items: [
      { type: "section-header", description: "Section title banner", colorClass: "bg-slate-100 dark:bg-slate-700" },
      { type: "divider", description: "Horizontal separator line", colorClass: "bg-slate-100 dark:bg-slate-700" },
    ],
  },
];

interface FieldPaletteProps {
  onAddField?: (type: FieldType) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Field Components
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Click or drag onto canvas
        </p>
      </div>
      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {paletteGroups.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-0.5">
              {group.title}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <PaletteItem
                  key={item.type}
                  type={item.type}
                  description={item.description}
                  colorClass={item.colorClass}
                  onAdd={onAddField}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
