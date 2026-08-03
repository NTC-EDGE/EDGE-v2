"use client";

import { useState, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ServiceVariant } from "@edge/api";
import { ServiceItem } from "@/services/catalogService";

interface ServiceVariantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { serviceId: string; type: string; description: string | null }) => Promise<void>;
  editingVariant: ServiceVariant | null;
  isSubmitting: boolean;
  services: ServiceItem[];
  allVariants: ServiceVariant[];
  initialServiceId?: string; // in case we open it with a preselected service from Tab 4
}

export function ServiceVariantDialog({
  isOpen,
  onClose,
  onSubmit,
  editingVariant,
  isSubmitting,
  services,
  allVariants,
  initialServiceId,
}: ServiceVariantDialogProps) {
  const [variantServiceId, setVariantServiceId] = useState("");
  const [isVariantServiceDropdownOpen, setIsVariantServiceDropdownOpen] = useState(false);
  const [variantType, setVariantType] = useState("New");
  const [variantDescription, setVariantDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsVariantServiceDropdownOpen(false);
      if (editingVariant) {
        setVariantServiceId(editingVariant.serviceId);
        setVariantType(editingVariant.type);
        setVariantDescription(editingVariant.description ?? "");
      } else {
        setVariantServiceId(initialServiceId || (services.length > 0 ? services[0].id : ""));
        setVariantType("New");
        setVariantDescription("");
      }
    }
  }, [isOpen, editingVariant, services, initialServiceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantServiceId) return;
    onSubmit({
      serviceId: variantServiceId,
      type: variantType,
      description: variantDescription.trim() ? variantDescription.trim() : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md w-full rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-800/60">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-indigo-400" />
            {editingVariant ? "Edit Service Variant" : "New Service Variant"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Service variants let you differentiate forms (e.g. *New* vs *Renewal*) and enforce separate checklists.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Associated Service *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsVariantServiceDropdownOpen(!isVariantServiceDropdownOpen)}
                className="w-full text-left px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium block"
              >
                {(() => {
                  const s = services.find(x => x.id === variantServiceId);
                  const displayText = s ? (s.code || s.name) : "Select Associated Service...";
                  return (
                    <span className="flex items-center justify-between w-full min-w-0">
                      <span className="truncate flex-1 mr-2 text-slate-200" title={s ? `[${s.code || "SVC"}] ${s.name}` : undefined}>
                        {displayText}
                      </span>
                      <span className="text-slate-500 text-[10px] shrink-0">▼</span>
                    </span>
                  );
                })()}
              </button>
 
              {isVariantServiceDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsVariantServiceDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-[220px] overflow-y-auto overflow-x-hidden p-1 space-y-0.5 scrollbar-thin">
                    {services.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500 font-medium">
                        Loading services catalog...
                      </div>
                    ) : (
                      services.map((s) => {
                        const svcVariants = allVariants.filter((v) => v.serviceId === s.id);
                        const variantLabels = svcVariants.map((v) => v.type === "FirstTaker" ? "First-taker" : v.type).join(", ");
                        const variantSuffix = variantLabels ? ` [${variantLabels}]` : " [No variants]";
                        const fullLabel = `[${s.code || "SVC"}] ${s.name}${variantSuffix}`;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setVariantServiceId(s.id);
                              setIsVariantServiceDropdownOpen(false);
                            }}
                            title={fullLabel}
                            className={`w-full min-w-0 text-left px-3 py-2.5 rounded-lg text-xs transition-colors block truncate ${
                              variantServiceId === s.id 
                                ? "bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/20" 
                                : "text-slate-300 hover:bg-slate-900/50 hover:text-white"
                            }`}
                          >
                            [{s.code || "SVC"}] {s.name}{variantSuffix}
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Variant Type *</label>
            <select
              value={variantType}
              onChange={(e) => setVariantType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="New">New</option>
              <option value="Renewal">Renewal</option>
              <option value="Modification">Modification</option>
              <option value="FirstTaker">First-taker</option>
              <option value="Retaker">Retaker</option>
              <option value="Upgrade">Upgrade</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={variantDescription}
              onChange={(e) => setVariantDescription(e.target.value)}
              placeholder="Summary description of the variant context..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-medium"
            />
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
              {isSubmitting ? "Saving..." : editingVariant ? "Update Variant" : "Create Variant"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
