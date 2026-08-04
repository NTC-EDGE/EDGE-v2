"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Requirement, ServiceVariant } from "@edge/api";
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

export interface CreateRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: "requirements" | "service-requirements";
  requirements: Requirement[];
  onSubmit: (
    tab: "requirements" | "service-requirements",
    data: {
      name: string;
      description: string;
      serviceVariantId: string;
      requirementsList: { requirementId: string; contextKey: string | null; isRequired: boolean }[];
    }
  ) => Promise<void>;
}

interface RequirementEntry {
  uid: number;
  requirementId: string;
  contextKey: string;
  isRequired: boolean;
}


let uidCounter = 0;
const nextUid = () => { uidCounter += 1; return uidCounter; };

const makeEntry = (firstReqId: string): RequirementEntry => ({
  uid: nextUid(),
  requirementId: firstReqId,
  contextKey: "",
  isRequired: true,
});

const MOCK_SERVICE_VARIANTS = [
  { id: "mock-variant-1", type: "New", description: "New Application" },
  { id: "mock-variant-2", type: "Renewal", description: "Renewal Application" },
  { id: "mock-variant-3", type: "Modification", description: "Modification" },
];

const MOCK_REQUIREMENTS = [
  { id: "mock-req-1", name: "Valid NTC Amateur Operator Certificate", description: null },
  { id: "mock-req-2", name: "Government Issued ID", description: null },
  { id: "mock-req-3", name: "Proof of Billing", description: null },
];

export function CreateRequirementDialog({
  open,
  onOpenChange,
  activeTab,
  requirements,
  onSubmit,
}: CreateRequirementDialogProps) {

  const displayRequirements = requirements.length > 0 ? requirements : MOCK_REQUIREMENTS;

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Catalog tab states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Mapping tab states
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [entries, setEntries] = useState<RequirementEntry[]>([]);

  // Track whether the form was already seeded for this open session
  const seededRef = useRef(false);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      seededRef.current = false;
      setErrorMsg(null);
      setName("");
      setDescription("");
      setSelectedVariantId("");
      setEntries([]);
    }
  }, [open, activeTab]);

  // Seed entries once data is available after open
  useEffect(() => {
    if (!open || seededRef.current) return;
    const firstReqId = displayRequirements[0]?.id ?? "";
    if (displayRequirements.length > 0) {
      seededRef.current = true;
      setEntries([makeEntry(firstReqId)]);
    }
  }, [open, displayRequirements]);

  // --- Entry handlers ---
  const handleAddEntry = useCallback(() => {
    setEntries((prev) => [...prev, makeEntry(displayRequirements[0]?.id ?? "")]);
  }, [displayRequirements]);

  const handleRemoveEntry = useCallback((uid: number) => {
    setEntries((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((e) => e.uid !== uid);
    });
  }, []);

  const handleUpdateField = useCallback(<K extends keyof RequirementEntry>(
    uid: number,
    field: K,
    value: RequirementEntry[K]
  ) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.uid === uid ? { ...entry, [field]: value } : entry))
    );
  }, []);

  // --- Submit ---
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
      if (entries.some((entry) => entry.requirementId === "")) {
        setErrorMsg("Please select a Requirement for all entries.");
        setSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(activeTab, {
        name,
        description,
        serviceVariantId: selectedVariantId,
        requirementsList: entries.map((entry) => ({
          requirementId: entry.requirementId,
          contextKey: entry.contextKey.trim() === "" ? null : entry.contextKey.trim(),
          isRequired: entry.isRequired,
        })),
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg("Failed to save changes. Please check inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            {activeTab === "requirements" && "Register New Requirement"}
            {activeTab === "service-requirements" && "Map Requirements to Service Variant"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Configure system requirements. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg !== null && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Requirement Catalog tab ──────────────────────── */}
          {activeTab === "requirements" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Requirement Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valid NTC Amateur Operator Certificate"
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

          {/* ── Service Mapping tab ──────────────────────────── */}
          {activeTab === "service-requirements" && (
            <>
              {/* Service Variant Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Service Variant *</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>Select Variant...</option>
                  {MOCK_SERVICE_VARIANTS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.type} {v.description ? `— ${v.description}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirements & Rules entry list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Requirements &amp; Rules *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddEntry}
                    disabled={displayRequirements.length === 0}
                    className="h-7 px-2.5 border-dashed border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-[11px] flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add Requirement
                  </Button>
                </div>

                {displayRequirements.length === 0 ? (
                  <div className="text-center py-6 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 text-xs">
                    No master requirements registered. Please create a requirement catalog entry first.
                  </div>
                ) : (
                  <div className="space-y-3 h-[280px] overflow-y-auto pr-1">
                    {entries.map((entry) => (
                      <div
                        key={entry.uid}
                        className="flex gap-2 items-end bg-slate-950 p-3.5 rounded-xl border border-slate-800/80"
                      >
                        {/* Requirement dropdown */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Requirement
                          </label>
                          <select
                            value={entry.requirementId}
                            onChange={(e) => handleUpdateField(entry.uid, "requirementId", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="" disabled>Select Requirement...</option>
                            {displayRequirements.map((req) => (
                              <option key={req.id} value={req.id}>
                                {req.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Context Key — free text input */}
                        <div className="w-36 space-y-1.5 shrink-0">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Context Key
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. NEW"
                            value={entry.contextKey}
                            onChange={(e) => handleUpdateField(entry.uid, "contextKey", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                          />
                        </div>

                        {/* Is Required checkbox */}
                        <div className="space-y-1.5 shrink-0">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block text-center">
                            Required
                          </label>
                          <div className="flex items-center justify-center h-[30px]">
                            <input
                              type="checkbox"
                              checked={entry.isRequired}
                              onChange={(e) => handleUpdateField(entry.uid, "isRequired", e.target.checked)}
                              className="accent-indigo-600 w-4 h-4 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Remove row */}
                        {entries.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveEntry(entry.uid)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
              {submitting ? "Saving..." : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
