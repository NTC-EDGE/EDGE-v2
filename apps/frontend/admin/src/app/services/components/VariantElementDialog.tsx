"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Layers, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Element, ServiceVariant } from "@edge/api";
import { ServiceItem } from "@/services/catalogService";
import { ServiceVariantElement } from "@/services/feesService";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface VariantElementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { serviceVariantId: string; code: string; description: string }) => Promise<void>;
  editingElement: ServiceVariantElement | null;
  isSubmitting: boolean;
  services: ServiceItem[];
  allVariants: ServiceVariant[];
  availableElements?: Element[];
  activeTab: string;
  mappingServiceId: string;
  mappingVariantId: string;
  mappingVariants: ServiceVariant[];
}

export function VariantElementDialog({
  isOpen,
  onClose,
  onSubmit,
  editingElement,
  isSubmitting,
  services,
  allVariants,
  availableElements = [],
  activeTab,
  mappingServiceId,
  mappingVariantId,
  mappingVariants,
}: VariantElementDialogProps) {
  const [dialogServiceId, setDialogServiceId] = useState("");
  const [dialogVariantId, setDialogVariantId] = useState("");
  const [selectedMasterElementId, setSelectedMasterElementId] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Dynamic variants list for the currently selected service
  const dialogVariants = useMemo(() => {
    if (!dialogServiceId) return [];
    return allVariants.filter((v) => v.serviceId === dialogServiceId);
  }, [allVariants, dialogServiceId]);

  // Sync selected variant when service changes in flat mode
  useEffect(() => {
    if (dialogVariants.length > 0) {
      const hasMatch = dialogVariants.some((v) => v.id === dialogVariantId);
      if (!hasMatch) {
        setDialogVariantId(dialogVariants[0].id);
      }
    } else {
      setDialogVariantId("");
    }
  }, [dialogVariants, dialogVariantId]);

  // Master Element auto-fill code & description
  const handleMasterElementSelect = (elementId: string) => {
    setSelectedMasterElementId(elementId);
    if (!elementId) return;
    const found = availableElements.find((e) => e.id === elementId);
    if (found) {
      setCode(found.code);
      setDescription(found.description || found.name || "");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (editingElement) {
        const variant = allVariants.find((v) => v.id === editingElement.serviceVariantId);
        const resolvedServiceId = variant?.serviceId ?? "";
        setDialogServiceId(resolvedServiceId);
        setDialogVariantId(editingElement.serviceVariantId ?? "");
        setCode(editingElement.code ?? "");
        setDescription(editingElement.description ?? "");
        setSelectedMasterElementId("");
      } else if (activeTab === "variant-elements" && mappingServiceId && mappingVariantId) {
        setDialogServiceId(mappingServiceId);
        setDialogVariantId(mappingVariantId);
        setCode("");
        setDescription("");
        setSelectedMasterElementId("");
      } else {
        const initialSvcId = mappingServiceId || (services.length > 0 ? services[0].id : "");
        setDialogServiceId(initialSvcId);
        const matchingVars = allVariants.filter((v) => v.serviceId === initialSvcId);
        setDialogVariantId(matchingVars.length > 0 ? matchingVars[0].id : "");
        setCode("");
        setDescription("");
        setSelectedMasterElementId("");
      }
    }
  }, [
    isOpen,
    editingElement,
    activeTab,
    mappingServiceId,
    mappingVariantId,
    services,
    allVariants,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const vId = editingElement
      ? editingElement.serviceVariantId
      : (activeTab === "variant-elements" && mappingServiceId && mappingVariantId ? mappingVariantId : dialogVariantId);

    if (!vId) {
      setError("Please select a service variant to link this element.");
      return;
    }

    if (!code.trim()) {
      setError("Element code is required.");
      return;
    }

    try {
      await onSubmit({
        serviceVariantId: vId,
        code: code.trim().toUpperCase(),
        description: description.trim(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save variant element.";
      setError(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-md w-full rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/60">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            {editingElement ? "Edit Element Mapping" : "Link Element to Variant"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Map examination elements or operational subjects to a specific service variant.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 animate-pulse text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Service & Variant Context */}
          {editingElement ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 select-none truncate" title={services.find((s) => s.id === dialogServiceId)?.name || "Selected Service"}>
                  {services.find((s) => s.id === dialogServiceId)?.name || "Selected Service"}
                </div>
              </div>
              <div className="min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Variant</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 select-none truncate">
                  {(() => {
                    const t = dialogVariants.find((v) => v.id === dialogVariantId)?.type;
                    return t === "NA" ? "N/A" : (t || "Selected Variant");
                  })()}
                </div>
              </div>
            </div>
          ) : (activeTab === "variant-elements" && mappingServiceId && mappingVariantId) ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 select-none truncate" title={services.find((s) => s.id === mappingServiceId)?.name || "Selected Service"}>
                  {services.find((s) => s.id === mappingServiceId)?.name || "Selected Service"}
                </div>
              </div>
              <div className="min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Variant</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 select-none truncate">
                  {(() => {
                    const t = mappingVariants.find((v) => v.id === mappingVariantId)?.type;
                    return t === "NA" ? "N/A" : (t || "Selected Variant");
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service *</label>
                <SearchableSelect
                  value={dialogServiceId}
                  onChange={setDialogServiceId}
                  placeholder="Select Service..."
                  searchPlaceholder="Search services..."
                  maxHeight="max-h-48"
                  options={services.map((s) => ({
                    value: s.id,
                    label: s.name,
                    badge: s.code || "SVC",
                  }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service Variant *</label>
                <SearchableSelect
                  value={dialogVariantId}
                  onChange={setDialogVariantId}
                  disabled={dialogVariants.length === 0}
                  placeholder={dialogVariants.length === 0 ? "No variants registered for this service" : "Select Variant..."}
                  searchPlaceholder="Search variants..."
                  maxHeight="max-h-48"
                  options={dialogVariants.map((v) => ({
                    value: v.id,
                    label: v.type === "NA" ? "N/A" : v.type,
                    description: v.description || undefined,
                  }))}
                />
              </div>
            </div>
          )}

          {/* Quick Select From Master Elements */}
          {availableElements.length > 0 && !editingElement && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                Copy from Master Elements <span className="text-slate-500 font-normal font-sans text-[9px]">(Optional)</span>
              </label>
              <SearchableSelect
                value={selectedMasterElementId}
                onChange={handleMasterElementSelect}
                placeholder="Choose from master elements catalog..."
                searchPlaceholder="Search master elements..."
                maxHeight="max-h-48"
                clearable={true}
                options={availableElements.map((el) => ({
                  value: el.id,
                  label: `[${el.code}] ${el.name || el.description || "Element"}`,
                  description: el.description || undefined,
                }))}
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Element Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 1RTG-STD"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this element or exam subject covers..."
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
              disabled={isSubmitting || !code.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingElement ? "Update Element" : "Link Element"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
