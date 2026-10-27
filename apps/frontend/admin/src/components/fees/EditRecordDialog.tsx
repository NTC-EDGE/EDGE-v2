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
  initialServiceId?: string | null;
  initialServiceVariantId?: string | null;
  initialElementId?: string | null;
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
  initialServiceId,
  initialServiceVariantId,
  initialElementId,
  onSubmit,
}: EditRecordDialogProps) {
  const { useServiceVariants, createFee } = useFeesService();
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

  // Quick Fee Code creation states
  const [isAddingNewFeeCode, setIsAddingNewFeeCode] = useState(false);
  const [newFeeCode, setNewFeeCode] = useState("");
  const [newFeeName, setNewFeeName] = useState("");
  const [isCreatingFeeCode, setIsCreatingFeeCode] = useState(false);
  const [localFees, setLocalFees] = useState<Fee[]>(fees);

  useEffect(() => {
    setLocalFees(fees);
  }, [fees]);

  const handleCreateNewFeeCode = async () => {
    if (newFeeCode.trim().length === 0 || newFeeName.trim().length === 0) {
      setErrorMsg("Please enter both fee code and fee name.");
      return;
    }
    setIsCreatingFeeCode(true);
    setErrorMsg(null);
    try {
      const created = await createFee({
        code: newFeeCode.trim().toUpperCase(),
        name: newFeeName.trim(),
        description: null,
      });
      if (created !== null && created !== undefined && typeof created.id === "string") {
        setLocalFees((prev) => [created, ...prev]);
        setFeeId(created.id);
        setIsAddingNewFeeCode(false);
        setNewFeeCode("");
        setNewFeeName("");
      }
    } catch {
      setErrorMsg("Failed to create new fee code. It may already exist.");
    } finally {
      setIsCreatingFeeCode(false);
    }
  };

  // Multiplier & Surcharge states
  const [multiplierType, setMultiplierType] = useState<"years" | "fixed" | "units" | "pages">("years");
  const [applyLateRenewalSurcharge, setApplyLateRenewalSurcharge] = useState(false);

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
          const resolvedServiceId =
            selectedServiceVariantFee.serviceVariant?.serviceId ??
            (initialServiceId !== null && initialServiceId !== undefined && initialServiceId !== ""
              ? initialServiceId
              : (services[0]?.id ?? ""));
          setServiceId(resolvedServiceId);
          setServiceVariantId(selectedServiceVariantFee.serviceVariantId);
          setFeeId(selectedServiceVariantFee.feeId);
          setAmount(selectedServiceVariantFee.amount);
          
          if (selectedServiceVariantFee.multiplyByValidityYears) {
            setMultiplierType("years");
          } else if (selectedServiceVariantFee.multiplyByUnits) {
            setMultiplierType("units");
          } else if (selectedServiceVariantFee.multiplyByPages) {
            setMultiplierType("pages");
          } else {
            setMultiplierType("fixed");
          }
          setApplyLateRenewalSurcharge(selectedServiceVariantFee.applyLateRenewalSurcharge ?? false);
        } else if (activeTab === "service-variant-element-fees" && selectedServiceVariantElementFee !== null) {
          const resolvedServiceId =
            selectedServiceVariantElementFee.serviceVariant?.serviceId ??
            (initialServiceId !== null && initialServiceId !== undefined && initialServiceId !== ""
              ? initialServiceId
              : (services[0]?.id ?? ""));
          setServiceId(resolvedServiceId);
          setServiceVariantId(selectedServiceVariantElementFee.serviceVariantId);
          setElementId(selectedServiceVariantElementFee.elementId || (initialElementId ?? elements[0]?.id ?? ""));
          setFeeId(selectedServiceVariantElementFee.feeId);
          setAmount(selectedServiceVariantElementFee.amount);
          
          if (selectedServiceVariantElementFee.multiplyByValidityYears) {
            setMultiplierType("years");
          } else if (selectedServiceVariantElementFee.multiplyByUnits) {
            setMultiplierType("units");
          } else if (selectedServiceVariantElementFee.multiplyByPages) {
            setMultiplierType("pages");
          } else {
            setMultiplierType("fixed");
          }
          setApplyLateRenewalSurcharge(selectedServiceVariantElementFee.applyLateRenewalSurcharge ?? false);
        }
        hasInitialized.current = true;
      }
    } else {
      hasInitialized.current = false;
    }
  }, [open, activeTab, selectedFee, selectedServiceFee, selectedServiceVariantFee, selectedServiceVariantElementFee, services, elements, initialServiceId, initialElementId]);

  // Auto-sync variant if none selected when variants finish loading
  useEffect(() => {
    if (variants.length > 0 && !serviceVariantId) {
      setServiceVariantId(variants[0].id);
    }
  }, [variants, serviceVariantId]);

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
      const formula =
        multiplierType === "years"
          ? "{RATE} * {YEARS}"
          : multiplierType === "units"
          ? "{RATE} * {UNITS}"
          : multiplierType === "pages"
          ? "{RATE} * {PAGES}"
          : "{RATE}";

      await onSubmit(activeTab, {
        code,
        name,
        description,
        serviceId,
        serviceVariantId,
        elementId,
        feeId,
        amount,
        calculationMode: 1,
        calculationFormula: formula,
        multiplyByValidityYears: multiplierType === "years",
        multiplyByUnits: multiplierType === "units",
        multiplyByChannels: false,
        multiplyByPages: multiplierType === "pages",
        applyLateRenewalSurcharge,
        includeDst: false,
        dstAmount: 0,
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mapped Fee Code *</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewFeeCode((prev) => !prev)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {isAddingNewFeeCode ? "Cancel" : "+ Add New Fee Code"}
                  </button>
                </div>

                {isAddingNewFeeCode && (
                  <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl space-y-2 mb-2">
                    <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">Create & Assign New Fee Code</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Code (e.g. FEEEXAM)"
                        value={newFeeCode}
                        onChange={(e) => setNewFeeCode(e.target.value.toUpperCase())}
                        className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Name (e.g. Examination Fee)"
                        value={newFeeName}
                        onChange={(e) => setNewFeeName(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isCreatingFeeCode || !newFeeCode.trim() || !newFeeName.trim()}
                      onClick={handleCreateNewFeeCode}
                      className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      {isCreatingFeeCode ? "Creating Fee Code..." : "Create & Select Fee Code"}
                    </Button>
                  </div>
                )}

                <select
                  value={feeId}
                  onChange={(e) => setFeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">-- Select Fee Code --</option>
                  {localFees.map((f) => (
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
                      serviceVariantId ? (
                        <option value={serviceVariantId} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                          Selected Variant
                        </option>
                      ) : (
                        <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">No variants available for this service</option>
                      )
                    ) : (
                      variants.map((v) => (
                        <option key={v.id} value={v.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                          {v.description ? `${v.description} (${v.type})` : v.type}
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mapped Fee Code *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewFeeCode((prev) => !prev)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {isAddingNewFeeCode ? "Cancel" : "+ Add New Fee Code"}
                    </button>
                  </div>

                  {isAddingNewFeeCode && (
                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl space-y-2 mb-2">
                      <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">Create & Assign New Fee Code</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Code (e.g. FEEEXAM)"
                          value={newFeeCode}
                          onChange={(e) => setNewFeeCode(e.target.value.toUpperCase())}
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Name (e.g. Examination Fee)"
                          value={newFeeName}
                          onChange={(e) => setNewFeeName(e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isCreatingFeeCode || !newFeeCode.trim() || !newFeeName.trim()}
                        onClick={handleCreateNewFeeCode}
                        className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        {isCreatingFeeCode ? "Creating Fee Code..." : "Create & Select Fee Code"}
                      </Button>
                    </div>
                  )}

                  <select
                    value={feeId}
                    onChange={(e) => setFeeId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">-- Select Fee Code --</option>
                    {localFees.map((f) => (
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

              {/* Rate Multiplier & Surcharge Configuration */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Rate Multiplier & Surcharge Rules
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Specify how this component fee scales (per year, per unit, or fixed) and if late renewal surcharges apply.
                  </p>
                </div>

                {/* Multiplier Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Rate Multiplier Rule *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        multiplierType === "years"
                          ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="multiplierTypeEdit"
                        value="years"
                        checked={multiplierType === "years"}
                        onChange={() => setMultiplierType("years")}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Per Validity Year</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Multiplies base rate by license validity years (e.g. ₱60/yr × 3 yrs)
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        multiplierType === "fixed"
                          ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="multiplierTypeEdit"
                        value="fixed"
                        checked={multiplierType === "fixed"}
                        onChange={() => setMultiplierType("fixed")}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Fixed Flat Amount</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          One-time flat rate per transaction (e.g. ₱10 filing fee)
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        multiplierType === "units"
                          ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="multiplierTypeEdit"
                        value="units"
                        checked={multiplierType === "units"}
                        onChange={() => setMultiplierType("units")}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Per Equipment Unit</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Multiplies by number of registered devices / stations
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        multiplierType === "pages"
                          ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="multiplierTypeEdit"
                        value="pages"
                        checked={multiplierType === "pages"}
                        onChange={() => setMultiplierType("pages")}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Per Copy / Page</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Multiplies by number of copy pages authenticated
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Surcharges */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400">
                    <input
                      type="checkbox"
                      checked={applyLateRenewalSurcharge}
                      onChange={(e) => setApplyLateRenewalSurcharge(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Subject to Late Renewal Surcharge (SUR)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Imposes statutory late filing surcharge (50% for 1d–6m, 100% for 6m–1y, +50% thereafter)
                      </span>
                    </div>
                  </label>
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

