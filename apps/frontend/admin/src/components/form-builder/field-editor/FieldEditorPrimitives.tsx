"use client";

import React from "react";
import { FieldType, RepeaterColumn } from "../types";

export const inputClass =
  "w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

export const FIELDS_WITH_PLACEHOLDER: FieldType[] = [
  "text",
  "textarea",
  "number",
  "email",
  "phone",
  "date",
  "time",
];

export const FIELDS_WITH_OPTIONS: FieldType[] = ["select", "radio", "checkbox"];

export function parseRepeaterColType(val: string): RepeaterColumn["type"] {
  if (
    val === "text" ||
    val === "number" ||
    val === "select" ||
    val === "date" ||
    val === "file" ||
    val === "equipments" ||
    val === "serials"
  ) {
    return val;
  }
  return "text";
}

export function formatDate(isoString?: string): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function LabeledSection({
  title,
  icon: Icon,
  description,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {title}
        </label>
      </div>
      {description && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
