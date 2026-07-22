"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Fee } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MOCK_SERVICES, MOCK_CATEGORIES } from "@/services/feesNotesService";

export interface CreateRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: "fees" | "service-fees" | "notes";
  fees: Fee[];
  onSubmit: (
    tab: "fees" | "service-fees" | "notes",
    data: {
      code: string;
      name: string;
      description: string;
      serviceId: string;
      feeId: string;
      amount: number;
      serviceFees?: { feeId: string; amount: number }[];
      notes: string;
      serviceCategoryId: string;
    }
  ) => Promise<void>;
}

export function CreateRecordDialog({
  open,
  onOpenChange,
  activeTab,
  fees,
  onSubmit,
}: CreateRecordDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [feeId, setFeeId] = useState("");
  const [amount, setAmount] = useState(0);
  const [feeEntries, setFeeEntries] = useState<{ feeId: string; amount: number }[]>([]);

  const [notes, setNotes] = useState("");
  const [serviceCategoryId, setServiceCategoryId] = useState("");

  // Initialize values when tab changes or dialog opens
  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setCode("");
      setName("");
      setDescription("");
      
      setServiceId(MOCK_SERVICES[0]?.id ?? "");
      setFeeId(fees[0]?.id ?? "");
      setAmount(0);
      setFeeEntries([{ feeId: fees[0]?.id ?? "", amount: 0 }]);
      
      setNotes("");
      setServiceCategoryId(MOCK_CATEGORIES[0]?.id ?? "");
    }
  }, [open, activeTab, fees]);

  const handleAddFeeEntry = () => {
    setFeeEntries([...feeEntries, { feeId: fees[0]?.id ?? "", amount: 0 }]);
  };

  const handleRemoveFeeEntry = (index: number) => {
    if (feeEntries.length <= 1) return;
    setFeeEntries(feeEntries.filter((_, i) => i !== index));
  };

  const handleUpdateFeeEntry = (index: number, field: "feeId" | "amount", value: any) => {
    setFeeEntries(
      feeEntries.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    if (activeTab === "service-fees") {
      const invalidEntry = feeEntries.find((entry) => !entry.feeId);
      if (invalidEntry) {
        setErrorMsg("Please select a Fee Code for all entries.");
        setSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(activeTab, {
        code,
        name,
        description,
        serviceId,
        feeId: feeEntries[0]?.feeId ?? "",
        amount: feeEntries[0]?.amount ?? 0,
        serviceFees: feeEntries,
        notes,
        serviceCategoryId,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            {activeTab === "fees" && "Register New Fee Code"}
            {activeTab === "service-fees" && "Configure Service Fee"}
            {activeTab === "notes" && "Add Guideline Instruction"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Create and store new configurations. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg !== null && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "fees" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Fee Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FILING_FEE"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Fee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Licensing Application Filing Fee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                <textarea
                  placeholder="Provide context about what this fee applies to."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                />
              </div>
            </>
          )}

          {activeTab === "service-fees" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Service Standard *</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {MOCK_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Service Fees & Amounts *</label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddFeeEntry}
                    className="h-7 px-2.5 border-dashed border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-[11px] flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add Fee Code
                  </Button>
                </div>
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {feeEntries.map((entry, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Fee Code</label>
                        <select
                          value={entry.feeId}
                          onChange={(e) => handleUpdateFeeEntry(index, "feeId", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="" disabled>Select Fee Code...</option>
                          {fees.map((f) => (
                            <option key={f.id} value={f.id}>
                              [{f.code}] {f.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-28 space-y-1.5 shrink-0">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-semibold pointer-events-none">₱</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={entry.amount}
                            onChange={(e) => handleUpdateFeeEntry(index, "amount", Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      {feeEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveFeeEntry(index)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0 self-end mb-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "notes" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Service Category Scope *</label>
                <select
                  value={serviceCategoryId}
                  onChange={(e) => setServiceCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Guideline Instruction Text *</label>
                <textarea
                  required
                  placeholder="Enter compliance rules, document requirements, or general process instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                />
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
