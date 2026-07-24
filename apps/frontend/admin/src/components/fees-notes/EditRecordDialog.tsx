"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Fee, ServiceFee, Note } from "@edge/api";
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

export interface EditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: "fees" | "service-fees" | "notes";
  fees: Fee[];
  selectedFee: Fee | null;
  selectedServiceFee: ServiceFee | null;
  selectedNote: Note | null;
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

export function EditRecordDialog({
  open,
  onOpenChange,
  activeTab,
  fees,
  selectedFee,
  selectedServiceFee,
  selectedNote,
  onSubmit,
}: EditRecordDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [feeId, setFeeId] = useState("");
  const [amount, setAmount] = useState(0);

  const [notes, setNotes] = useState("");
  const [serviceCategoryId, setServiceCategoryId] = useState("");

  const hasInitialized = useRef(false);

  // Load existing data when open or selections change
  useEffect(() => {
    if (open) {
      if (!hasInitialized.current) {
        setErrorMsg(null);
        if (activeTab === "fees" && selectedFee !== null) {
          setCode(selectedFee.code);
          setName(selectedFee.name);
          setDescription(selectedFee.description ?? "");
        } else if (activeTab === "service-fees" && selectedServiceFee !== null) {
          setServiceId(selectedServiceFee.serviceId);
          setFeeId(selectedServiceFee.feeId);
          setAmount(selectedServiceFee.amount);
        } else if (activeTab === "notes" && selectedNote !== null) {
          setNotes(selectedNote.notes);
          setServiceCategoryId(selectedNote.serviceCategoryId);
        }
        hasInitialized.current = true;
      }
    } else {
      hasInitialized.current = false;
    }
  }, [open, activeTab, selectedFee, selectedServiceFee, selectedNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit(activeTab, {
        code,
        name,
        description,
        serviceId,
        feeId,
        amount,
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
            {activeTab === "fees" && "Edit Fee Code details"}
            {activeTab === "service-fees" && "Modify Mapped Service Fee"}
            {activeTab === "notes" && "Update Guideline Instruction"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Modify the configuration parameters. Saved changes update instantly.
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
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {MOCK_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mapped Fee Code *</label>
                <select
                  value={feeId}
                  onChange={(e) => setFeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Fee Code --</option>
                  {fees.map((f) => (
                    <option key={f.id} value={f.id}>
                      [{f.code}] {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold pointer-events-none">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
              {submitting ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
