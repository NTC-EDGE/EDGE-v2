"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Fee, ServiceFee, Element, ServiceVariantFee, ServiceVariantElementFee, FeeCalculationMode } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ServiceCatalogItem, useFeesService } from "@/services/feesService";

type TabType = "fees" | "service-fees" | "service-variant-fees" | "service-variant-element-fees";

export interface EditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TabType;
  fees: Fee[];
  elements: Element[];
  services: ServiceCatalogItem[];
  selectedFee: Fee | null;
  selectedServiceFee: ServiceFee | null;
  selectedServiceVariantFee: ServiceVariantFee | null;
  selectedServiceVariantElementFee: ServiceVariantElementFee | null;
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
      calculationMode?: FeeCalculationMode;
      calculationFormula?: string | null;
      multiplyByValidityYears?: boolean;
      multiplyByUnits?: boolean;
      multiplyByChannels?: boolean;
      multiplyByPages?: boolean;
      applyLateRenewalSurcharge?: boolean;
      includeDst?: boolean;
      dstAmount?: number;
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
  elements,
  services,
  selectedFee,
  selectedServiceFee,
  selectedServiceVariantFee,
  selectedServiceVariantElementFee,
  onSubmit,
}: EditRecordDialogProps) {
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

  // Dynamic Formula & Multiplier states
  const [calculationMode, setCalculationMode] = useState<"StandardMultiplier" | "CustomFormula">("StandardMultiplier");
  const [calculationFormula, setCalculationFormula] = useState("{RATE}");
  const [multiplyByValidityYears, setMultiplyByValidityYears] = useState(false);
  const [multiplyByUnits, setMultiplyByUnits] = useState(false);
  const [multiplyByChannels, setMultiplyByChannels] = useState(false);
  const [multiplyByPages, setMultiplyByPages] = useState(false);
  const [applyLateRenewalSurcharge, setApplyLateRenewalSurcharge] = useState(false);
  const [includeDst, setIncludeDst] = useState(true);
  const [dstAmount, setDstAmount] = useState(30);

  // Helper to build standard formula
  const buildFormula = (years: boolean, units: boolean, channels: boolean, pages: boolean) => {
    const tokens = ["{RATE}"];
    if (years) tokens.push("{YEARS}");
    if (units) tokens.push("{UNITS}");
    if (channels) tokens.push("{CHANNELS}");
    if (pages) tokens.push("{PAGES}");
    return tokens.join(" * ");
  };

  const handleYearsToggle = (checked: boolean) => {
    setMultiplyByValidityYears(checked);
    if (calculationMode === "StandardMultiplier") {
      setCalculationFormula(buildFormula(checked, multiplyByUnits, multiplyByChannels, multiplyByPages));
    }
  };

  const handleUnitsToggle = (checked: boolean) => {
    setMultiplyByUnits(checked);
    if (calculationMode === "StandardMultiplier") {
      setCalculationFormula(buildFormula(multiplyByValidityYears, checked, multiplyByChannels, multiplyByPages));
    }
  };

  const handleChannelsToggle = (checked: boolean) => {
    setMultiplyByChannels(checked);
    if (calculationMode === "StandardMultiplier") {
      setCalculationFormula(buildFormula(multiplyByValidityYears, multiplyByUnits, checked, multiplyByPages));
    }
  };

  const handlePagesToggle = (checked: boolean) => {
    setMultiplyByPages(checked);
    if (calculationMode === "StandardMultiplier") {
      setCalculationFormula(buildFormula(multiplyByValidityYears, multiplyByUnits, multiplyByChannels, checked));
    }
  };

  const handleModeChange = (mode: "StandardMultiplier" | "CustomFormula") => {
    setCalculationMode(mode);
    if (mode === "StandardMultiplier") {
      setCalculationFormula(buildFormula(multiplyByValidityYears, multiplyByUnits, multiplyByChannels, multiplyByPages));
    }
  };

  const insertToken = (token: string) => {
    setCalculationFormula((prev) => {
      const trimmed = prev.trim();
      if (trimmed === "" || trimmed === "{RATE}") {
        return token === "{RATE}" ? "{RATE}" : `${trimmed} ${token}`;
      }
      return `${trimmed} ${token}`;
    });
  };

  // Query variants dynamically based on selected serviceId
  const { data: variants = [] } = useServiceVariants(serviceId);

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
        } else if (activeTab === "service-variant-fees" && selectedServiceVariantFee !== null) {
          setServiceId(selectedServiceVariantFee.serviceVariant?.serviceId ?? services[0]?.id ?? "");
          setServiceVariantId(selectedServiceVariantFee.serviceVariantId);
          setFeeId(selectedServiceVariantFee.feeId);
          setAmount(selectedServiceVariantFee.amount);

          const isCustom = selectedServiceVariantFee.calculationMode === 1 || selectedServiceVariantFee.calculationMode === "CustomFormula";
          setCalculationMode(isCustom ? "CustomFormula" : "StandardMultiplier");
          setCalculationFormula(selectedServiceVariantFee.calculationFormula ?? "{RATE}");
          setMultiplyByValidityYears(selectedServiceVariantFee.multiplyByValidityYears ?? false);
          setMultiplyByUnits(selectedServiceVariantFee.multiplyByUnits ?? false);
          setMultiplyByChannels(selectedServiceVariantFee.multiplyByChannels ?? false);
          setMultiplyByPages(selectedServiceVariantFee.multiplyByPages ?? false);
          setApplyLateRenewalSurcharge(selectedServiceVariantFee.applyLateRenewalSurcharge ?? false);
          setIncludeDst(selectedServiceVariantFee.includeDst ?? true);
          setDstAmount(selectedServiceVariantFee.dstAmount ?? 30);
        } else if (activeTab === "service-variant-element-fees" && selectedServiceVariantElementFee !== null) {
          setServiceId(selectedServiceVariantElementFee.serviceVariant?.serviceId ?? services[0]?.id ?? "");
          setServiceVariantId(selectedServiceVariantElementFee.serviceVariantId);
          setElementId(selectedServiceVariantElementFee.elementId);
          setFeeId(selectedServiceVariantElementFee.feeId);
          setAmount(selectedServiceVariantElementFee.amount);

          const isCustom = selectedServiceVariantElementFee.calculationMode === 1 || selectedServiceVariantElementFee.calculationMode === "CustomFormula";
          setCalculationMode(isCustom ? "CustomFormula" : "StandardMultiplier");
          setCalculationFormula(selectedServiceVariantElementFee.calculationFormula ?? "{RATE}");
          setMultiplyByValidityYears(selectedServiceVariantElementFee.multiplyByValidityYears ?? false);
          setMultiplyByUnits(selectedServiceVariantElementFee.multiplyByUnits ?? false);
          setMultiplyByChannels(selectedServiceVariantElementFee.multiplyByChannels ?? false);
          setMultiplyByPages(selectedServiceVariantElementFee.multiplyByPages ?? false);
          setApplyLateRenewalSurcharge(selectedServiceVariantElementFee.applyLateRenewalSurcharge ?? false);
          setIncludeDst(selectedServiceVariantElementFee.includeDst ?? true);
          setDstAmount(selectedServiceVariantElementFee.dstAmount ?? 30);
        }
        hasInitialized.current = true;
      }
    } else {
      hasInitialized.current = false;
    }
  }, [open, activeTab, selectedFee, selectedServiceFee, selectedServiceVariantFee, selectedServiceVariantElementFee, services]);

  const handleServiceChange = (val: string) => {
    setServiceId(val);
    setServiceVariantId(""); // reset variant to let next useEffect pick first item
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

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
        feeId,
        amount,
        calculationMode: calculationMode === "CustomFormula" ? 1 : 0,
        calculationFormula,
        multiplyByValidityYears,
        multiplyByUnits,
        multiplyByChannels,
        multiplyByPages,
        applyLateRenewalSurcharge,
        includeDst,
        dstAmount,
        notes: "",
        serviceCategoryId: "",
      });
      onOpenChange(false);
    } catch {
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            {activeTab === "fees" && "Edit Fee Code details"}
            {activeTab === "service-fees" && "Modify Mapped Service Fee"}
            {activeTab === "service-variant-fees" && "Modify Variant Fee Mapping"}
            {activeTab === "service-variant-element-fees" && "Modify Variant Element Fee"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
            Modify the configuration parameters. Saved changes update instantly.
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
                  placeholder="e.g. CODE"
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
                  placeholder="e.g. Name"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mapped Fee Code *</label>
                <select
                  value={feeId}
                  onChange={(e) => setFeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">-- Select Fee Code --</option>
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
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {(activeTab === "service-variant-fees" || activeTab === "service-variant-element-fees") && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Base Rate / Amount *</label>
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
              </div>

              {/* Dynamic Fee Computation & Multiplier Engine Configuration */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Dynamic Fee Calculation Rules</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure automated multipliers, surcharges, and formula syntax.</p>
                  </div>
                  <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleModeChange("StandardMultiplier")}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                        calculationMode === "StandardMultiplier"
                          ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Multipliers
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange("CustomFormula")}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                        calculationMode === "CustomFormula"
                          ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Custom Formula
                    </button>
                  </div>
                </div>

                {/* Multiplier Toggles */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    Multiplier Dimensions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400">
                      <input
                        type="checkbox"
                        checked={multiplyByValidityYears}
                        onChange={(e) => handleYearsToggle(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Years</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400">
                      <input
                        type="checkbox"
                        checked={multiplyByUnits}
                        onChange={(e) => handleUnitsToggle(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Units</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400">
                      <input
                        type="checkbox"
                        checked={multiplyByChannels}
                        onChange={(e) => handleChannelsToggle(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Channels</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400">
                      <input
                        type="checkbox"
                        checked={multiplyByPages}
                        onChange={(e) => handlePagesToggle(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Pages</span>
                    </label>
                  </div>
                </div>

                {/* Surcharges and Taxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400">
                    <input
                      type="checkbox"
                      checked={applyLateRenewalSurcharge}
                      onChange={(e) => setApplyLateRenewalSurcharge(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Late Surcharge (SUR)</span>
                      <span className="text-[10px] text-slate-500">Apply 50% penalty on renewal</span>
                    </div>
                  </label>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDst}
                        onChange={(e) => setIncludeDst(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Include DST</span>
                    </label>
                    {includeDst && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-500">DST Amount: ₱</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={dstAmount}
                          onChange={(e) => setDstAmount(Number(e.target.value))}
                          className="w-20 px-2 py-0.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Formula Display & Tokens */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Calculation Formula Expression
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                      Parsed at Runtime
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={calculationFormula}
                    onChange={(e) => setCalculationFormula(e.target.value)}
                    readOnly={calculationMode === "StandardMultiplier"}
                    className={`w-full px-3.5 py-2 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      calculationMode === "StandardMultiplier"
                        ? "bg-slate-100 dark:bg-slate-950/50 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-800"
                        : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-indigo-400 dark:border-indigo-600"
                    }`}
                  />

                  {calculationMode === "CustomFormula" && (
                    <div className="pt-1.5 space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Insert Formula Variable / Operator:</span>
                      <div className="flex flex-wrap gap-1">
                        {["{RATE}", "{YEARS}", "{UNITS}", "{CHANNELS}", "{PAGES}", "DST", "SUR", "+", "-", "*", "/", "(", ")"].map((token) => (
                          <button
                            key={token}
                            type="button"
                            onClick={() => insertToken(token)}
                            className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-600 hover:text-white rounded transition-colors"
                          >
                            {token}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
              {submitting ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

