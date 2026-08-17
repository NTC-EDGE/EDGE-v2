"use client";

import React from "react";
import { FieldType } from "./types";
import { getFieldIcon, getFieldLabel } from "./utils";

interface PaletteItemProps {
  type: FieldType;
  description: string;
  colorClass: string;
}

function PaletteItem({ type, description, colorClass }: PaletteItemProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("fieldType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group"
      title={`Drag to add ${getFieldLabel(type)}`}
    >
      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 ${colorClass}`}>
        {getFieldIcon(type)}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
          {getFieldLabel(type)}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{description}</p>
      </div>
    </div>
  );
}

interface PaletteGroup {
  title: string;
  items: { type: FieldType; description: string; colorClass: string }[];
}

const paletteGroups: PaletteGroup[] = [
  {
    title: "Input Fields",
    items: [
      { type: "text", description: "Single-line text input", colorClass: "bg-indigo-100 dark:bg-indigo-900/50" },
      { type: "textarea", description: "Multi-line text input", colorClass: "bg-indigo-100 dark:bg-indigo-900/50" },
      { type: "number", description: "Numeric input with min/max", colorClass: "bg-sky-100 dark:bg-sky-900/50" },
      { type: "email", description: "Email address input", colorClass: "bg-sky-100 dark:bg-sky-900/50" },
      { type: "phone", description: "Phone number input", colorClass: "bg-sky-100 dark:bg-sky-900/50" },
      { type: "date", description: "Date picker control", colorClass: "bg-teal-100 dark:bg-teal-900/50" },
    ],
  },
  {
    title: "Choice Fields",
    items: [
      { type: "select", description: "Single-choice dropdown", colorClass: "bg-violet-100 dark:bg-violet-900/50" },
      { type: "radio", description: "Single-choice radio buttons", colorClass: "bg-violet-100 dark:bg-violet-900/50" },
      { type: "checkbox", description: "Multi-choice checkboxes", colorClass: "bg-purple-100 dark:bg-purple-900/50" },
    ],
  },
  {
    title: "File & Upload",
    items: [
      { type: "file", description: "File attachment upload", colorClass: "bg-amber-100 dark:bg-amber-900/50" },
    ],
  },
  {
    title: "Layout",
    items: [
      { type: "section-header", description: "Titled section separator", colorClass: "bg-slate-100 dark:bg-slate-700" },
      { type: "divider", description: "Horizontal rule divider", colorClass: "bg-slate-100 dark:bg-slate-700" },
    ],
  },
];

export function FieldPalette() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
          Field Palette
        </h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Drag fields onto the canvas</p>
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
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
