"use client";

import React from "react";
import { Search, Plus, Pencil, Eye, Copy, Trash2, ClipboardList, FileText } from "lucide-react";
import { FormSchema } from "./types";

interface FormsListProps {
  forms: FormSchema[];
  onEdit: (form: FormSchema) => void;
  onPreview: (form: FormSchema) => void;
  onDuplicate: (form: FormSchema) => void;
  onDelete: (form: FormSchema) => void;
  onCreateNew: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

export function FormsList({
  forms,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onCreateNew,
  searchTerm,
  onSearchChange,
}: FormsListProps) {
  const filtered = forms.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors duration-200">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search forms by name or description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Total Forms:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold font-mono">
              {forms.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Form
          </button>
        </div>
      </div>

      {/* Forms Table / Card List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-indigo-400 dark:text-indigo-500" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {searchTerm ? "No forms match your search" : "No forms yet"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">
            {searchTerm ? "Try a different search term" : "Create your first form to get started"}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Form
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_80px_100px_120px_120px_120px] gap-4 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Name</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Description</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fields</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Created</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Updated</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((form) => (
              <div
                key={form.id}
                className="grid grid-cols-[1fr_1fr_80px_100px_120px_120px_120px] gap-4 px-5 py-4 items-center hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Name */}
                <button
                  type="button"
                  onClick={() => onEdit(form)}
                  className="text-left flex items-center gap-2.5 min-w-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {form.name || "Untitled Form"}
                  </span>
                </button>

                {/* Description */}
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {truncate(form.description || "—", 60)}
                </span>

                {/* Field count */}
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-semibold text-center w-fit">
                  {form.fields.length}
                </span>

                {/* Status */}
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border w-fit ${
                    form.isPublished
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                  }`}
                >
                  {form.isPublished ? "Published" : "Draft"}
                </span>

                {/* Created */}
                <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(form.createdAt)}</span>

                {/* Updated */}
                <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(form.updatedAt)}</span>

                {/* Actions */}
                <div className="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    onClick={() => onEdit(form)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                    title="Edit form"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onPreview(form)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                    title="Preview form"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(form)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                    title="Duplicate form"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(form)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                    title="Delete form"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
