"use client";

import { useEffect, useState } from "react";
import { Note, ServiceVariant } from "@edge/api";
import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCatalogItem } from "@/services/feesNotesService";

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { notes: string; serviceId: string; serviceVariantId: string }) => Promise<void>;
  editingNote: Note | null;
  isSubmitting: boolean;
  services: ServiceCatalogItem[];
  variants: ServiceVariant[];
}

export function NoteDialog({ isOpen, onClose, onSubmit, editingNote, isSubmitting, services, variants }: NoteDialogProps) {
  const [notes, setNotes] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [serviceVariantId, setServiceVariantId] = useState("");
  const [scope, setScope] = useState<"service" | "variant">("service");

  useEffect(() => {
    if (isOpen) {
      setNotes(editingNote?.notes ?? "");
      setServiceId(editingNote?.serviceId ?? "");
      setServiceVariantId(editingNote?.serviceVariantId ?? "");
      setScope(editingNote?.serviceVariantId ? "variant" : "service");
    }
  }, [isOpen, editingNote]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let resolvedServiceId = serviceId;
    let resolvedVariantId = serviceVariantId;

    if (scope === "service") {
      resolvedVariantId = "";
    } else {
      const selectedVariant = variants.find((v) => v.id === serviceVariantId);
      if (selectedVariant) {
        resolvedServiceId = selectedVariant.serviceId;
      }
    }

    await onSubmit({ notes, serviceId: resolvedServiceId, serviceVariantId: resolvedVariantId });
  };

  const isFormDisabled =
    isSubmitting ||
    notes.trim() === "" ||
    (scope === "service" && serviceId === "") ||
    (scope === "variant" && serviceVariantId === "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {editingNote !== null ? "Edit Service Note" : "New Service Note"}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {editingNote !== null ? "Update this regulatory note." : "Add a regulatory or procedural note to a service."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Note Scope</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setScope("service")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  scope === "service"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Entire Service
              </button>
              <button
                type="button"
                onClick={() => setScope("variant")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  scope === "variant"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Specific Variant
              </button>
            </div>
          </div>

          {scope === "service" ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service *</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">Select a service…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service Variant *</label>
              <select
                value={serviceVariantId}
                onChange={(e) => setServiceVariantId(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">Select a service variant…</option>
                {variants.map((v) => {
                  const sName = v.serviceName ?? services.find((s) => s.id === v.serviceId)?.name ?? "Unknown Service";
                  return (
                    <option key={v.id} value={v.id}>
                      {sName} — {v.type === "NA" ? "N/A" : v.type} {v.description ? `(${v.description})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Note Content *</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              rows={5}
              placeholder={"e.g. 1. Examinees shall present this Admission Slip and any valid government issued ID...\n2. Examinees who are late for more than 30 minutes..."}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            />
            <p className="text-[10px] text-slate-600">Each line will render as a separate bullet point in the client view.</p>
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-sm py-2.5" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-sm py-2.5" disabled={isFormDisabled}>
              {isSubmitting ? "Saving…" : editingNote !== null ? "Update Note" : "Add Note"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
