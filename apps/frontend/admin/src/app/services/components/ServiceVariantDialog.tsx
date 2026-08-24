"use client";

import { useState, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ServiceVariant } from "@edge/api";
import { ServiceItem } from "@/services/catalogService";
import { SearchableSelect } from "@/components/ui/searchable-select";

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
  const [variantType, setVariantType] = useState("New");
  const [variantDescription, setVariantDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingVariant) {
        setVariantServiceId(editingVariant.serviceId);
        setVariantType(editingVariant.type);
        setVariantDescription(editingVariant.description ?? "");
      } else {
        const defaultServiceId = initialServiceId || (services.length > 0 ? services[0].id : "");
        setVariantServiceId(defaultServiceId);
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

  const variantTypeOptions = [
    { value: "New", label: "New" },
    { value: "Renewal", label: "Renewal" },
    { value: "Modification", label: "Modification" },
    { value: "FirstTaker", label: "First-taker" },
    { value: "Retaker", label: "Retaker" },
    { value: "Upgrade", label: "Upgrade" },
    { value: "NA", label: "N/A" },
    { value: "VSAT", label: "VSAT" },
    { value: "Private", label: "Private" },
    { value: "CivicActionGroup", label: "Civic Action Group" },
    { value: "Government", label: "Government" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-md w-full rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/60">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            {editingVariant ? "Edit Service Variant" : "New Service Variant"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure application subtypes (e.g., New, Renewal, First-taker) under a specific service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Associated Service *</label>
            <SearchableSelect
              value={variantServiceId}
              onChange={setVariantServiceId}
              placeholder="Select Associated Service..."
              searchPlaceholder="Search services..."
              maxHeight="max-h-52"
              options={services.map((s) => {
                const svcVariants = allVariants.filter((v) => v.serviceId === s.id);
                const variantLabels = svcVariants.map((v) => {
                  if (v.type === "NA") return "Standard";
                  if (v.type === "FirstTaker") return "First-taker";
                  if (v.type === "CivicActionGroup") return "Civic Action Group";
                  return v.type;
                }).join(", ");
                return {
                  value: s.id,
                  label: `[${s.code || "SVC"}] ${s.name}`,
                  description: variantLabels ? `Variants: ${variantLabels}` : "No variants",
                };
              })}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Variant Type *</label>
            <SearchableSelect
              value={variantType}
              onChange={setVariantType}
              placeholder="Select Variant Type..."
              searchPlaceholder="Search variant types..."
              maxHeight="max-h-48"
              options={variantTypeOptions}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={variantDescription}
              onChange={(e) => setVariantDescription(e.target.value)}
              placeholder="Summary description of the variant context..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-medium"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
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
