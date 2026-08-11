"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Requirement, ServiceVariantRequirement } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRequirementsService } from "@/services/requirementsService";

export interface EditRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: "requirements" | "service-requirements";
  requirements: Requirement[];
  selectedRequirement: Requirement | null;
  selectedSvr: ServiceVariantRequirement | null;
  onSubmit: (
    tab: "requirements" | "service-requirements",
    data: {
      name: string;
      description: string;
      requirementId: string;
      serviceVariantId: string;
      contextKey: string | null;
      isRequired: boolean;
    }
  ) => Promise<void>;
}

export function EditRequirementDialog({
  open,
  onOpenChange,
  activeTab,
  requirements,
  selectedRequirement,
  selectedSvr,
  onSubmit,
}: EditRequirementDialogProps) {
  const { useServices, useServiceVariants } = useRequirementsService();
  const { data: services = [] } = useServices();

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Requirement form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // SVR form states
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedReqId, setSelectedReqId] = useState("");
  const [contextKey, setContextKey] = useState("");
  const [isRequired, setIsRequired] = useState(true);

  // Fetch variants for selected service
  const { data: variants = [] } = useServiceVariants(
    1,
    9999,
    undefined,
    selectedServiceId !== "" ? selectedServiceId : null
  );

  // Sync state with selected items when open
  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      if (activeTab === "requirements" && selectedRequirement !== null) {
        setName(selectedRequirement.name);
        setDescription(selectedRequirement.description ?? "");
      } else if (activeTab === "service-requirements" && selectedSvr !== null) {
        // Find matching service for the variant
        // Since we mapped serviceId in ServiceVariant, let's look up in services
        // But wait! If we don't have serviceId directly on the svr, we can use useSWR or query it
        // Or wait, does MOCK_SERVICES or the service catalog list have the service?
        // Yes, we can find a service whose name or code matches svr.serviceName/serviceCode,
        // or just let them select it.
        // Wait, how can we match the service?
        const matchedService = services.find(
          (s) => s.name === selectedSvr.serviceName || s.code === selectedSvr.serviceCode
        );
        setSelectedServiceId(matchedService?.id ?? "");
        setSelectedVariantId(selectedSvr.serviceVariantId);
        setSelectedReqId(selectedSvr.requirementId);
        setContextKey(selectedSvr.contextKey ?? "");
        setIsRequired(selectedSvr.isRequired);
      }
    }
  }, [open, activeTab, selectedRequirement, selectedSvr, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    if (activeTab === "service-requirements") {
      if (selectedVariantId === "") {
        setErrorMsg("Please select a Service Variant.");
        setSubmitting(false);
        return;
      }
      if (selectedReqId === "") {
        setErrorMsg("Please select a Requirement.");
        setSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(activeTab, {
        name,
        description,
        requirementId: selectedReqId,
        serviceVariantId: selectedVariantId,
        contextKey: contextKey.trim() === "" ? null : contextKey.trim().toUpperCase(),
        isRequired,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg("Failed to update record. Please check inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            {activeTab === "requirements" && "Modify Requirement Catalog Entry"}
            {activeTab === "service-requirements" && "Modify Service Requirement Mapping"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Edit the properties of the selected record below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg !== null && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "requirements" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Requirement Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Requirement Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                <textarea
                  placeholder="Provide context about what document or criteria this requirement refers to."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                />
              </div>
            </>
          )}

          {activeTab === "service-requirements" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Service *</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>Select Service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Service Variant *</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  disabled={variants.length === 0}
                >
                  {variants.length === 0 ? (
                    <option value="">No variants defined</option>
                  ) : (
                    variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.type} Variant ({v.description !== null && v.description !== undefined && v.description !== "" ? v.description : "No description"})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Requirement *</label>
                <select
                  value={selectedReqId}
                  onChange={(e) => setSelectedReqId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>Select Requirement...</option>
                  {requirements.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 flex-1 animate-pulse-once">
                  <label className="text-xs font-semibold text-slate-300">Context Key</label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, RENEW (leave blank for Any)"
                    value={contextKey}
                    onChange={(e) => setContextKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none self-end pb-2">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="accent-indigo-600 rounded w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-300 uppercase">Mandatory</span>
                </label>
              </div>
            </>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
