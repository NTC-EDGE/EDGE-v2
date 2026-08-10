"use client";

import { useEffect, useState } from "react";
import { ServiceVariantElement } from "@/services/feesService";
import { X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VariantElementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { code: string; description: string }) => Promise<void>;
  editingElement: ServiceVariantElement | null;
  isSubmitting: boolean;
}

export function VariantElementDialog({ isOpen, onClose, onSubmit, editingElement, isSubmitting }: VariantElementDialogProps) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCode(editingElement?.code ?? "");
      setDescription(editingElement?.description ?? "");
    }
  }, [isOpen, editingElement]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ code, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {editingElement !== null ? "Edit Variant Element" : "New Variant Element"}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {editingElement !== null ? "Update exam element details." : "Add a new exam element."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="e.g. 1RTG-STD"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what this element covers..."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-sm py-2.5" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-sm py-2.5" disabled={isSubmitting || code.trim() === ""}>
              {isSubmitting ? "Saving…" : editingElement !== null ? "Update Element" : "Create Element"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
