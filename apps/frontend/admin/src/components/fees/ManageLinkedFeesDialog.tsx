"use client";

import React, { useMemo, useState } from "react";
import {
  Tag,
  Edit2,
  Trash2,
  Plus,
  Coins,
  Scale,
  Boxes,
  Blocks,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import {
  ServiceFee,
  ServiceVariantFee,
  ServiceVariantElementFee,
} from "@edge/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { showToast } from "@/components/ui/toast-notification";
import { useFeesService } from "@/services/feesService";
import {
  validateFormula,
  STANDARD_FORMULA_VARIABLES,
  COMMON_FORMULA_TEMPLATES,
} from "@/lib/formulaValidator";

export type ManageLinkedFeesEntityType =
  | "service"
  | "service-variant"
  | "service-variant-element";

export interface ManageLinkedFeesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: ManageLinkedFeesEntityType;
  entityId: string | null;
  secondaryId?: string | null;
  entityTitle: string;
  entitySubtitle?: string;
  canManage: boolean;
  onEditFee: (
    item: ServiceFee | ServiceVariantFee | ServiceVariantElementFee
  ) => void;
  onDeleteFee: (
    item: ServiceFee | ServiceVariantFee | ServiceVariantElementFee
  ) => void;
  onAddFee: () => void;
}

export function ManageLinkedFeesDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  secondaryId,
  entityTitle,
  entitySubtitle,
  canManage,
  onEditFee,
  onDeleteFee,
  onAddFee,
}: ManageLinkedFeesDialogProps) {
  const {
    useServiceFees,
    useServiceVariantFees,
    useServiceVariantElementFees,
    updateServiceVariantFee,
    updateServiceVariantElementFee,
    updateVariantFormula,
    updateVariantElementFormula,
  } = useFeesService();

  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const [customFormulaText, setCustomFormulaText] = useState("");
  const [savingFormula, setSavingFormula] = useState(false);
  const [formulaError, setFormulaError] = useState<string | null>(null);

  // On-demand fetch by ID specifically for this entity
  const isService = entityType === "service";
  const isVariant = entityType === "service-variant";
  const isElement = entityType === "service-variant-element";

  const {
    data: serviceFeesList = [],
    isLoading: loadingSF,
  } = useServiceFees(
    entityId !== null && isService ? entityId : undefined,
    1,
    999,
    undefined,
    open && isService && entityId !== null
  );

  const {
    data: variantFeesList = [],
    isLoading: loadingSV,
    mutate: mutateVariantFees,
  } = useServiceVariantFees(
    entityId !== null && isVariant ? entityId : undefined,
    1,
    999,
    undefined,
    open && isVariant && entityId !== null
  );

  const {
    data: elementFeesList = [],
    isLoading: loadingSVE,
    mutate: mutateElementFees,
  } = useServiceVariantElementFees(
    entityId !== null && isElement ? entityId : undefined,
    secondaryId !== null && secondaryId !== undefined && isElement
      ? secondaryId
      : undefined,
    1,
    999,
    undefined,
    open && isElement && entityId !== null
  );

  const safeServiceFeesList = Array.isArray(serviceFeesList) ? serviceFeesList : [];
  const safeVariantFeesList = Array.isArray(variantFeesList) ? variantFeesList : [];
  const safeElementFeesList = Array.isArray(elementFeesList) ? elementFeesList : [];

  const isLoading = loadingSF || loadingSV || loadingSVE;

  const availableFeeCodes = useMemo(() => {
    const codes: string[] = [];
    if (isVariant) {
      for (let i = 0; i < safeVariantFeesList.length; i++) {
        const item = safeVariantFeesList[i];
        const code = item?.feeCode;
        if (code !== undefined && code !== null && code !== "" && !codes.includes(code)) {
          codes.push(code);
        }
      }
    } else if (isElement) {
      for (let i = 0; i < safeElementFeesList.length; i++) {
        const item = safeElementFeesList[i];
        const code = item?.feeCode;
        if (code !== undefined && code !== null && code !== "" && !codes.includes(code)) {
          codes.push(code);
        }
      }
    }
    return codes;
  }, [isVariant, isElement, safeVariantFeesList, safeElementFeesList]);

  const totalBaseSum = useMemo(() => {
    if (isService) {
      return safeServiceFeesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    }
    if (isVariant) {
      return safeVariantFeesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    }
    return safeElementFeesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [isService, isVariant, safeServiceFeesList, safeVariantFeesList, safeElementFeesList]);

  const itemCount = isService
    ? safeServiceFeesList.length
    : isVariant
    ? safeVariantFeesList.length
    : safeElementFeesList.length;

  const autoDerivedFormula = useMemo(() => {
    if (isService) {
      if (safeServiceFeesList.length === 0) return null;
      const terms = safeServiceFeesList.map((f) => f.feeCode ?? "FEE");
      return `TOTAL = ${terms.join(" + ")}`;
    }
    if (isVariant) {
      if (safeVariantFeesList.length === 0) return null;
      const terms = safeVariantFeesList.map((f) => {
        const code = f.feeCode ?? "FEE";
        if (f.multiplyByValidityYears && f.multiplyByUnits) return `(${code})(YR)(UNIT)`;
        if (f.multiplyByValidityYears) return `(${code})(YR)`;
        if (f.multiplyByUnits) return `(${code})(UNIT)`;
        if (f.multiplyByPages) return `(${code})(COPY)`;
        return code;
      });
      const hasSur = safeVariantFeesList.some((f) => f.applyLateRenewalSurcharge);
      return `TOTAL = ${terms.join(" + ")}${hasSur ? " + SUR" : ""}`;
    }
    if (isElement) {
      if (safeElementFeesList.length === 0) return null;
      const terms = safeElementFeesList.map((f) => {
        const code = f.feeCode ?? "FEE";
        if (f.multiplyByValidityYears && f.multiplyByUnits) return `(${code})(YR)(UNIT)`;
        if (f.multiplyByValidityYears) return `(${code})(YR)`;
        if (f.multiplyByUnits) return `(${code})(UNIT)`;
        if (f.multiplyByPages) return `(${code})(COPY)`;
        return code;
      });
      const hasSur = safeElementFeesList.some((f) => f.applyLateRenewalSurcharge);
      return `TOTAL = ${terms.join(" + ")}${hasSur ? " + SUR" : ""}`;
    }
    return null;
  }, [isService, isVariant, isElement, safeServiceFeesList, safeVariantFeesList, safeElementFeesList]);

  const compositeFormula = useMemo(() => {
    if (isVariant) {
      const knownFormula = safeVariantFeesList.find(
        (f) =>
          f.calculationFormula !== null &&
          f.calculationFormula !== undefined &&
          f.calculationFormula.includes("=")
      );
      if (knownFormula?.calculationFormula) {
        return knownFormula.calculationFormula;
      }
      return autoDerivedFormula;
    }
    if (isElement) {
      const knownFormula = safeElementFeesList.find(
        (f) =>
          f.calculationFormula !== null &&
          f.calculationFormula !== undefined &&
          f.calculationFormula.includes("=")
      );
      if (knownFormula?.calculationFormula) {
        return knownFormula.calculationFormula;
      }
      return autoDerivedFormula;
    }
    return autoDerivedFormula;
  }, [isVariant, isElement, safeVariantFeesList, safeElementFeesList, autoDerivedFormula]);

  const formulaValidation = useMemo(() => {
    if (!isEditingFormula) {
      return { isValid: true, error: null, previewCalculation: null, detectedVariables: [] };
    }
    return validateFormula(customFormulaText, availableFeeCodes);
  }, [isEditingFormula, customFormulaText, availableFeeCodes]);

  const handleStartEditFormula = () => {
    setCustomFormulaText(compositeFormula ?? "");
    setFormulaError(null);
    setIsEditingFormula(true);
  };

  const handleInsertToken = (token: string) => {
    setCustomFormulaText((prev) => {
      const trimmed = prev.trimEnd();
      if (trimmed === "") {
        return token;
      }
      if (token === "+" || token === "-" || token === "*" || token === "/") {
        return `${trimmed} ${token} `;
      }
      if (token === "(" || token === ")") {
        return `${trimmed}${token}`;
      }
      if (
        trimmed.endsWith("(") ||
        trimmed.endsWith("+") ||
        trimmed.endsWith("-") ||
        trimmed.endsWith("*") ||
        trimmed.endsWith("/") ||
        trimmed.endsWith("=")
      ) {
        return `${prev} ${token}`;
      }
      return `${trimmed} + ${token}`;
    });
  };

  const handleSaveFormula = async () => {
    if (!canManage || entityId === null) return;

    const trimmed = customFormulaText.trim();
    const targetFormula = trimmed !== "" ? trimmed : (autoDerivedFormula ?? "{RATE}");

    const validation = validateFormula(targetFormula, availableFeeCodes);
    if (!validation.isValid) {
      setFormulaError(validation.error ?? "Invalid formula expression syntax.");
      return;
    }

    setSavingFormula(true);
    setFormulaError(null);

    try {
      if (isVariant) {
        await updateVariantFormula(entityId, {
          formulaExpression: targetFormula,
          applyLateRenewalSurcharge: hasAnySurcharge,
        });
        await mutateVariantFees();
      } else if (isElement) {
        const resolvedElementId = secondaryId ?? safeElementFeesList[0]?.elementId;
        if (resolvedElementId) {
          await updateVariantElementFormula({
            serviceVariantId: entityId,
            elementId: resolvedElementId,
            formulaExpression: targetFormula,
            applyLateRenewalSurcharge: hasAnySurcharge,
          });
          await mutateElementFees();
        }
      }
      setIsEditingFormula(false);
      showToast.success("Formula saved successfully", "The statutory calculation formula has been updated.");
    } catch {
      setFormulaError("Failed to update formula. Please try again.");
      showToast.error("Failed to update formula", "Please check the formula expression and try again.");
    } finally {
      setSavingFormula(false);
    }
  };

  const handleResetFormulaToAuto = () => {
    if (autoDerivedFormula !== null) {
      setCustomFormulaText(autoDerivedFormula);
    }
  };

  const hasAnySurcharge = useMemo(() => {
    if (isVariant) return safeVariantFeesList.some((f) => f.applyLateRenewalSurcharge);
    if (isElement) return safeElementFeesList.some((f) => f.applyLateRenewalSurcharge);
    return false;
  }, [isVariant, isElement, safeVariantFeesList, safeElementFeesList]);

  const getMultiplierLabel = (item: ServiceVariantFee | ServiceVariantElementFee) => {
    if (item.multiplyByValidityYears && item.multiplyByUnits) return "Per Year × Unit";
    if (item.multiplyByValidityYears) return "Per Year (× Years)";
    if (item.multiplyByUnits) return "Per Unit (× Units)";
    if (item.multiplyByPages) return "Per Page / Copy (× Copies)";
    if (item.multiplyByChannels) return "Per Channel (× Channels)";
    return "Fixed Rate (1x)";
  };

  const getRowActionMenu = (
    item: ServiceFee | ServiceVariantFee | ServiceVariantElementFee
  ): ActionMenuItem[] => {
    if (!canManage) return [];
    return [
      {
        label: "Modify Fee Mapping",
        icon: Edit2,
        onClick: () => onEditFee(item),
      },
      {
        label: "Remove Mapping",
        icon: Trash2,
        onClick: () => onDeleteFee(item),
        variant: "destructive",
      },
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-slate-50/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80">
                {isService && <Boxes className="w-5 h-5" />}
                {isVariant && <Scale className="w-5 h-5" />}
                {isElement && <Blocks className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {entityTitle}
                  </DialogTitle>
                  {entitySubtitle !== undefined && entitySubtitle !== "" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-300/60 dark:border-slate-700">
                      {entitySubtitle}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isService && "Service Base Rate Schedule & Payment Breakdown"}
                  {isVariant && "Service Variant Statutory Formula & Component Fees"}
                  {isElement && "Billing Element Statutory Formula & Component Rates"}
                </DialogDescription>
              </div>
            </div>

            {/* Metrics & Add action */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                <span>
                  Base Total: ₱
                  {(totalBaseSum ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {canManage && (
                <Button
                  onClick={onAddFee}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Fee Mapping</span>
                </Button>
              )}
            </div>
          </div>

          {/* Statutory Formula Display / Editor in Header */}
          {compositeFormula !== null && (
            <div className="mt-4 px-4 py-3.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 shadow-sm space-y-3">
              {!isEditingFormula ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/80 px-2 py-0.5 rounded-md shrink-0">
                      Statutory Formula
                    </span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 break-words whitespace-normal break-all">
                      {compositeFormula}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasAnySurcharge && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-500/30 w-fit shrink-0">
                        + Late Renewal Surcharge
                      </span>
                    )}
                    {canManage && !isService && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleStartEditFormula}
                        className="h-7 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2.5 rounded-lg flex items-center gap-1 shrink-0"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Formula</span>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Edit Statutory Application Formula
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetFormulaToAuto}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Reset to Auto-Constructed Formula</span>
                    </button>
                  </div>

                  {/* Input and Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={customFormulaText}
                        onChange={(e) => {
                          setCustomFormulaText(e.target.value);
                          if (formulaError !== null) setFormulaError(null);
                        }}
                        placeholder="e.g. TOTAL = (ROC)(YR) + DST"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border focus:outline-none focus:ring-2 ${
                          formulaValidation.isValid
                            ? "border-emerald-400 dark:border-emerald-600 focus:ring-emerald-500"
                            : "border-rose-400 dark:border-rose-600 focus:ring-rose-500"
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        disabled={savingFormula || !formulaValidation.isValid}
                        onClick={handleSaveFormula}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs h-8 px-3 rounded-lg"
                      >
                        {savingFormula ? "Saving..." : "Save Formula"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={savingFormula}
                        onClick={() => setIsEditingFormula(false)}
                        className="text-xs h-8 px-2.5 rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Live Validation / Preview Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    {formulaValidation.isValid ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Valid formula syntax</span>
                        {formulaValidation.previewCalculation !== null && (
                          <span className="ml-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 font-mono text-[11px] font-bold">
                            Sample Preview: ₱
                            {formulaValidation.previewCalculation.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{formulaValidation.error ?? "Invalid formula syntax"}</span>
                      </div>
                    )}
                  </div>

                  {/* Variable & Operator Insertion Badges */}
                  <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <HelpCircle className="w-3 h-3" />
                      <span>Click to insert formula variables & operators:</span>
                    </div>

                    {/* Standard Variables */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {STANDARD_FORMULA_VARIABLES.map((v) => (
                        <button
                          key={v.token}
                          type="button"
                          onClick={() => handleInsertToken(v.token)}
                          title={`${v.label}: ${v.description}`}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-indigo-700 dark:text-indigo-300 transition-colors shadow-2xs"
                        >
                          {v.token}
                        </button>
                      ))}

                      {/* Quick Operators */}
                      <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>
                      {["+", "-", "*", "/", "(", ")"].map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => handleInsertToken(op)}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
                        >
                          {op}
                        </button>
                      ))}

                      {/* Available Mapped Fee Codes */}
                      {availableFeeCodes.length > 0 && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>
                          {availableFeeCodes.map((code) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => handleInsertToken(`(${code})(YR)`)}
                              title={`Insert mapped fee ${code} with years multiplier`}
                              className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 transition-colors shadow-2xs"
                            >
                              ({code})(YR)
                            </button>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Common Templates */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Presets:
                      </span>
                      {COMMON_FORMULA_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.label}
                          type="button"
                          onClick={() => setCustomFormulaText(tmpl.template)}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40 transition-colors"
                        >
                          {tmpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formulaError !== null && (
                    <p className="text-[11px] text-rose-500 font-medium">{formulaError}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">
                Fetching linked payment configurations...
              </p>
            </div>
          ) : itemCount === 0 ? (
            <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
              <Tag className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No fee codes currently linked
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                No component payment lines have been configured for this entity yet.
              </p>
              {canManage && (
                <Button
                  onClick={onAddFee}
                  size="sm"
                  variant="outline"
                  className="mt-4 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Map First Fee
                </Button>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {isElement && <th className="py-3 px-4 min-w-[130px] whitespace-normal">Billing Element</th>}
                      <th className="py-3 px-4 min-w-[140px] whitespace-normal">Component Fee</th>
                      <th className="py-3 px-4 min-w-[110px] whitespace-normal">Base Rate</th>
                      {!isService && (
                        <th className="py-3 px-4 min-w-[130px] whitespace-normal">Rate Multiplier</th>
                      )}
                      {!isService && (
                        <th className="py-3 px-4 min-w-[130px] whitespace-normal">Surcharge Rule</th>
                      )}
                      {canManage && (
                        <th className="py-3 px-4 text-right min-w-[80px]">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                    {/* Render Service Fees */}
                    {isService &&
                      safeServiceFeesList.map((item) => {
                        const actions = getRowActionMenu(item);
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-4 min-w-[150px] max-w-sm break-words whitespace-normal">
                              <div className="flex flex-col gap-0.5 min-w-0 break-words">
                                <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 break-words">
                                  {item.feeCode ?? "UNKNOWN"}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 break-words leading-relaxed">
                                  {item.feeName ?? "Unknown Fee"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 min-w-[110px] whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                                ₱
                                {(item.amount ?? 0).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            {canManage && (
                              <td className="py-3 px-4 text-right">
                                {actions.length > 0 && (
                                  <ActionMenu items={actions} />
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}

                    {/* Render Service Variant Fees */}
                    {isVariant &&
                      safeVariantFeesList.map((item) => {
                        const actions = getRowActionMenu(item);
                        const multiplierLabel = getMultiplierLabel(item);

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-4 min-w-[150px] max-w-sm break-words whitespace-normal">
                              <div className="flex flex-col gap-0.5 min-w-0 break-words">
                                <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 break-words">
                                  {item.feeCode ?? "UNKNOWN"}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 break-words leading-relaxed">
                                  {item.feeName ?? "Unknown Fee"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 min-w-[110px] whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                                ₱
                                {(item.amount ?? 0).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="py-3 px-4 min-w-[130px] break-words whitespace-normal">
                              <span className="font-medium text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-md w-fit block break-words">
                                {multiplierLabel}
                              </span>
                            </td>
                            <td className="py-3 px-4 min-w-[130px] break-words whitespace-normal">
                              {item.applyLateRenewalSurcharge === true ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium border border-amber-500/20 break-words inline-block">
                                  + Late Surcharge (50%–100%)
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Standard
                                </span>
                              )}
                            </td>
                            {canManage && (
                              <td className="py-3 px-4 text-right">
                                {actions.length > 0 && (
                                  <ActionMenu items={actions} />
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}

                    {/* Render Service Variant Element Fees */}
                    {isElement &&
                      safeElementFeesList.map((item) => {
                        const actions = getRowActionMenu(item);
                        const multiplierLabel = getMultiplierLabel(item);

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-4 min-w-[130px] max-w-xs break-words whitespace-normal">
                              <div className="flex flex-col gap-0.5 min-w-0 break-words">
                                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 break-words">
                                  {item.elementCode ?? "UNKNOWN"}
                                </span>
                                <span className="text-xs text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                                  {item.elementName ?? "Unknown Element"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 min-w-[150px] max-w-sm break-words whitespace-normal">
                              <div className="flex flex-col gap-0.5 min-w-0 break-words">
                                <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 break-words">
                                  {item.feeCode ?? "UNKNOWN"}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 break-words leading-relaxed">
                                  {item.feeName ?? "Unknown Fee"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 min-w-[110px] whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                                ₱
                                {(item.amount ?? 0).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="py-3 px-4 min-w-[130px] break-words whitespace-normal">
                              <span className="font-medium text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-md w-fit block break-words">
                                {multiplierLabel}
                              </span>
                            </td>
                            <td className="py-3 px-4 min-w-[130px] break-words whitespace-normal">
                              {item.applyLateRenewalSurcharge === true ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium border border-amber-500/20 break-words inline-block">
                                  + Late Surcharge (50%–100%)
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Standard
                                </span>
                              )}
                            </td>
                            {canManage && (
                              <td className="py-3 px-4 text-right">
                                {actions.length > 0 && (
                                  <ActionMenu items={actions} />
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-slate-50/80 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between sm:justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            <span>
              {itemCount} {itemCount === 1 ? "fee mapped" : "fees mapped"}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs px-4 py-2 rounded-xl"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
