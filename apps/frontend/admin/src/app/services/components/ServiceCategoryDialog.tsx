"use client";

import { useState, useEffect } from "react";
import { FolderPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ServiceCategory } from "@/services/catalogService";

interface ServiceCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; code: string; type: string }) => Promise<void>;
  editingCategory: ServiceCategory | null;
  isSubmitting: boolean;
}

export function ServiceCategoryDialog({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  isSubmitting,
}: ServiceCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryType, setCategoryType] = useState("License");

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setCategoryName(editingCategory.name);
        setCategoryCode(editingCategory.code ?? "");
        setCategoryType(editingCategory.type);
      } else {
        setCategoryName("");
        setCategoryCode("");
        setCategoryType("License");
      }
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: categoryName.trim(),
      code: categoryCode.trim(),
      type: categoryType,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md w-full rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-800/60">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-indigo-400" />
            {editingCategory ? "Edit Service Category" : "New Service Category"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Configure category folders to classify your public-facing application forms.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Category Name *</label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Amateur Radio Licenses"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Category Code</label>
            <input
              type="text"
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
              placeholder="e.g. ARL"
              className="w-full px-3.5 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Category Type</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="License">License</option>
              <option value="Permit">Permit</option>
              <option value="Accreditation">Accreditation</option>
              <option value="Certificate">Certificate</option>
              <option value="Exam">Exam</option>
              <option value="RequestsAndComplaints">Requests &amp; Complaints</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
