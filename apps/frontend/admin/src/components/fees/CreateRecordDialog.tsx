"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Fee, Element } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ServiceCatalogItem, ServiceCategoryItem, useFeesService } from "@/services/feesService";

type TabType = "fees" | "service-fees" | "service-variant-fees" | "service-variant-element-fees";

export interface CreateRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TabType;
  fees: Fee[];
  elements: Element[];
  services: ServiceCatalogItem[];
  onSubmit: (
    tab: TabType,
    data: {
      code: string;
      name: string;
      description: string;
      serviceId: string;
      serviceVariantId: string;
      elementId: string;
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
  elements,
  services,
  onSubmit,
}: CreateRecordDialogProps) {
  const { useServiceVariants } = useFeesService();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [serviceVariantId, setServiceVariantId] = useState("");
  const [elementId, setElementId] = useState("");
  const [feeId, setFeeId] = useState("");
  const [amount, setAmount] = useState(0);
  const [feeEntries, setFeeEntries] = useState<{ feeId: string; amount: number }[]>([]);

  // Query variants dynamically based on selected serviceId
  const { data: variants = [] } = useServiceVariants(serviceId);

  const hasInitialized = useRef(false);

  // Initialize values when tab changes or dialog opens
  useEffect(() => {
    if (open) {
      if (!hasInitialized.current) {
        setErrorMsg(null);
        setCode("");
        setName("");
        setDescription("");
        
        const defaultServiceId = services[0]?.id ?? "";
        setServiceId(defaultServiceId);
        setServiceVariantId("");
        setElementId(elements[0]?.id ?? "");
        setFeeId(fees[0]?.id ?? "");
        setAmount(0);
        setFeeEntries([{ feeId: fees[0]?.id ?? "", amount: 0 }]);
        
        hasInitialized.current = true;
      } else {
        if (fees.length > 0) {
          setFeeId((prev) => prev || (fees[0]?.id ?? ""));
        }
        if (elements.length > 0) {
          setElementId((prev) => prev || (elements[0]?.id ?? ""));
        }
      }
    } else {
      hasInitialized.current = false;
    }
  }, [open, activeTab, fees, elements, services]);

  // Sync selected variant when variants load
  useEffect(() => {
    if (variants.length > 0 && !serviceVariantId) {
      setServiceVariantId(variants[0].id);
    }
  }, [variants, serviceVariantId]);

  const handleServiceChange = (val: string) => {
    setServiceId(val);
    setServiceVariantId(""); // reset variant to let next useEffect pick first item
  };

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

    if ((activeTab === "service-variant-fees" || activeTab === "service-variant-element-fees") && !serviceVariantId) {
      setErrorMsg("Please select a Service Variant.");
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(activeTab, {
        code,
        name,
        description,
        serviceId,
        serviceVariantId,
        elementId,
        feeId: activeTab === "service-fees" ? (feeEntries[0]?.feeId ?? "") : feeId,
        amount: activeTab === "service-fees" ? (feeEntries[0]?.amount ?? 0) : amount,
        serviceFees: feeEntries,
        notes: "",
        serviceCategoryId: "",
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
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            {activeTab === "fees" && "Register New Fee Code"}
            {activeTab === "service-fees" && "Configure Service Fee"}
            {activeTab === "service-variant-fees" && "Map Variant Fee"}
            {activeTab === "service-variant-element-fees" && "Map Variant Element Fee"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
            Create and store new configurations. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg !== null && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "fees" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Code *</label>
                <input
                  type="text"
                  required
                  placeholder={activeTab === "fees" ? "e.g. FILING_FEE" : "e.g. ELEM_TRANS"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name *</label>
                <input
                  type="text"
                  required
                  placeholder={activeTab === "fees" ? "e.g. Licensing Application Filing Fee" : "e.g. Transmitter Element"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (Optional)</label>
                <textarea
                  placeholder="Provide context about what this applies to."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                />
              </div>
            </>
          )}

          {activeTab === "service-fees" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Service Standard *</label>
                <select
                  value={serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Service Fees & Amounts *</label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddFeeEntry}
                    className="h-7 px-2.5 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[11px] flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add Fee Code
                  </Button>
                </div>
                <div className="space-y-3 h-[260px] overflow-y-auto pr-1">
                  {feeEntries.map((entry, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Fee Code</label>
                        <select
                          value={entry.feeId}
                          onChange={(e) => handleUpdateFeeEntry(index, "feeId", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select Fee Code...</option>
                          {fees.map((f) => (
                            <option key={f.id} value={f.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                              [{f.code}] {f.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-28 space-y-1.5 shrink-0">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Amount</label>
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
                            className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      {feeEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveFeeEntry(index)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0 self-end mb-0.5"
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

          {(activeTab === "service-variant-fees" || activeTab === "service-variant-element-fees") && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Service Standard *</label>
                <select
                  value={serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Service Variant Type *</label>
                <select
                  value={serviceVariantId}
                  onChange={(e) => setServiceVariantId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {variants.length === 0 ? (
                    <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">No variants available for this service</option>
                  ) : (
                    variants.map((v) => (
                      <option key={v.id} value={v.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                        {v.type} {v.description ? `(${v.description})` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {activeTab === "service-variant-element-fees" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Billing Element *</label>
                  <select
                    value={elementId}
                    onChange={(e) => setElementId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {elements.map((elem) => (
                      <option key={elem.id} value={elem.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                        [{elem.code}] {elem.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mapped Fee Code *</label>
                <select
                  value={feeId}
                  onChange={(e) => setFeeId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {fees.map((f) => (
                    <option key={f.id} value={f.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      [{f.code}] {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount *</label>
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
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
