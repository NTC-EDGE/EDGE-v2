"use client";

import { useState, useEffect, useMemo } from "react";
import { Link2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Requirement, ServiceVariant, ServiceVariantRequirement } from "@edge/api";
import { ServiceItem } from "@/services/catalogService";

interface MappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    serviceId: string;
    variantId: string;
    requirementId: string;
    contextKey: string | null;
    isRequired: boolean;
  }) => Promise<void>;
  editingMapping: ServiceVariantRequirement | null;
  isSubmitting: boolean;
  services: ServiceItem[];
  allVariants: ServiceVariant[];
  availableRequirements: Requirement[];
  activeTab: string;
  mappingServiceId: string;
  mappingVariantId: string;
  mappingVariants: ServiceVariant[];
}

export function MappingDialog({
  isOpen,
  onClose,
  onSubmit,
  editingMapping,
  isSubmitting,
  services,
  allVariants,
  availableRequirements,
  activeTab,
  mappingServiceId,
  mappingVariantId,
  mappingVariants,
}: MappingDialogProps) {
  const [dialogServiceId, setDialogServiceId] = useState("");
  const [dialogVariantId, setDialogVariantId] = useState("");
  const [selectedRequirementId, setSelectedRequirementId] = useState("");
  const [contextKey, setContextKey] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic variants selection list when in flat-mapping tab creation
  const dialogVariants = useMemo(() => {
    if (!dialogServiceId) return [];
    return allVariants.filter((v) => v.serviceId === dialogServiceId);
  }, [allVariants, dialogServiceId]);

  // Set initial selected variant when service category changes in flat tab
  useEffect(() => {
    if (dialogVariants.length > 0) {
      const hasMatch = dialogVariants.some(v => v.id === dialogVariantId);
      if (!hasMatch) {
        setDialogVariantId(dialogVariants[0].id);
      }
    } else {
      setDialogVariantId("");
    }
  }, [dialogVariants, dialogVariantId]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (editingMapping) {
        const variant = allVariants.find(v => v.id === editingMapping.serviceVariantId);
        const resolvedServiceId = variant?.serviceId ?? "";
        setDialogServiceId(resolvedServiceId);
        setDialogVariantId(editingMapping.serviceVariantId ?? "");
        setSelectedRequirementId(editingMapping.requirementId ?? "");
        setContextKey(editingMapping.contextKey ?? "");
        setIsRequired(editingMapping.isRequired);
      } else if (activeTab === "service-requirements") {
        setDialogServiceId(mappingServiceId);
        setDialogVariantId(mappingVariantId);
        setSelectedRequirementId("");
        setContextKey("");
        setIsRequired(true);
      } else {
        // Flat mapping mode
        const initialSvcId = services.length > 0 ? services[0].id : "";
        setDialogServiceId(initialSvcId);
        const matchingVars = allVariants.filter((v) => v.serviceId === initialSvcId);
        setDialogVariantId(matchingVars.length > 0 ? matchingVars[0].id : "");
        setSelectedRequirementId("");
        setContextKey("");
        setIsRequired(true);
      }
    }
  }, [
    isOpen,
    editingMapping,
    activeTab,
    mappingServiceId,
    mappingVariantId,
    services,
    allVariants,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const variant = allVariants.find(v => v.id === dialogVariantId);
    const sId = editingMapping
      ? (allVariants.find(v => v.id === editingMapping.serviceVariantId)?.serviceId ?? "")
      : (activeTab === "service-requirements" ? mappingServiceId : dialogServiceId);
    const vId = editingMapping ? editingMapping.serviceVariantId : (activeTab === "service-requirements" ? mappingVariantId : dialogVariantId);
    const rId = editingMapping ? editingMapping.requirementId : selectedRequirementId;

    if (!sId || !vId || !rId) {
      setError("Please select all required fields.");
      return;
    }

    try {
      await onSubmit({
        serviceId: sId,
        variantId: vId,
        requirementId: rId,
        contextKey: contextKey.trim() ? contextKey.trim() : null,
        isRequired,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to save mapping configuration.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-md w-full rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/60">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Link2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            {editingMapping ? "Edit Mapping Rule" : "Link Master Requirement"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Link requirements to specific service variants to dynamically build application checklists.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 animate-pulse text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Service & Variant Selection */}
          {editingMapping ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 select-none truncate" title={services.find(s => s.id === dialogServiceId)?.name || "Selected Service"}>
                  {services.find(s => s.id === dialogServiceId)?.name || "Selected Service"}
                </div>
              </div>
              <div className="min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Variant</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 select-none truncate">
                  {(() => {
                    const t = dialogVariants.find(v => v.id === dialogVariantId)?.type;
                    return t === "NA" ? "N/A" : (t || "Selected Variant");
                  })()}
                </div>
              </div>
            </div>
          ) : activeTab === "service-requirements" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 select-none truncate" title={services.find(s => s.id === mappingServiceId)?.name || "Selected Service"}>
                  {services.find(s => s.id === mappingServiceId)?.name || "Selected Service"}
                </div>
              </div>
              <div className="min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Variant</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 select-none truncate">
                  {(() => {
                    const t = mappingVariants.find(v => v.id === mappingVariantId)?.type;
                    return t === "NA" ? "N/A" : (t || "Selected Variant");
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service *</label>
                <select
                  required
                  value={dialogServiceId}
                  onChange={(e) => setDialogServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      [{s.code || "SVC"}] {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service Variant *</label>
                <select
                  required
                  value={dialogVariantId}
                  onChange={(e) => setDialogVariantId(e.target.value)}
                  disabled={dialogVariants.length === 0}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-40 font-medium"
                >
                  {dialogVariants.length === 0 ? (
                    <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">No variants registered for this service</option>
                  ) : (
                    dialogVariants.map((v) => (
                      <option key={v.id} value={v.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                        {v.type === "NA" ? "N/A" : v.type} {v.description ? `- ${v.description}` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Requirement *</label>
            {editingMapping ? (
              <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-900 dark:text-slate-300 select-none font-semibold truncate">
                {editingMapping.requirement?.name ?? ""}
              </div>
            ) : (
              <select
                required
                value={selectedRequirementId}
                onChange={(e) => setSelectedRequirementId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              >
                <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select Requirement...</option>
                {availableRequirements.map((req) => (
                  <option key={req.id} value={req.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                    {req.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Context Key (Applicant Type Key)</label>
            <input
              type="text"
              placeholder="e.g. NEW, RENEW (leave blank for Any)"
              value={contextKey}
              onChange={(e) => setContextKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono uppercase"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer py-1.5 select-none hover:text-slate-900 dark:hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="accent-indigo-600 w-4 h-4 cursor-pointer rounded border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
            <span>Mark as Mandatory Checklist Entry</span>
          </label>

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
              {isSubmitting ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
