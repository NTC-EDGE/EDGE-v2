import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { DynamicFormRenderer } from "../../../../shared/components/DynamicFormRenderer";
import { ApplicantInformationFormSection } from "./applicant-info/ApplicantInformationFormSection";
import { useServiceForm } from "../hooks/useServiceForm";
import { getApplicantDisplayName } from "../helpers/applicantDisplayHelper";
import { evaluateVisibilityCondition, FormEvaluationContext } from "../../../../shared/components/dynamic-form/dynamicFormUtils";

interface GeneralFilingDetailsStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (
    fields: Partial<GeneralApplicantData> | ((prevApp: GeneralApplicantData) => Partial<GeneralApplicantData>)
  ) => void;
  appMode?: "SINGLE" | "BULK";
  applicants?: GeneralApplicantData[];
  currentApplicantIndex?: number;
  setCurrentApplicantIndex?: (idx: number) => void;
  onRequiredFieldsChange?: (fieldIds: string[]) => void;
  errors?: Record<string, string>;
  variants?: Array<{ id: string; type?: string; name?: string; description?: string; isIndividual?: boolean; [key: string]: unknown }>;
  variantElements?: Array<{ id: string; code?: string; description?: string; [key: string]: unknown }>;
}

export function GeneralFilingDetailsStep({
  service,
  activeApplicant,
  updateActiveApplicant,
  appMode = "SINGLE",
  applicants = [],
  currentApplicantIndex = 0,
  setCurrentApplicantIndex,
  onRequiredFieldsChange,
  errors = {},
  variants = [],
  variantElements = [],
}: GeneralFilingDetailsStepProps) {
  const { form, loading } = useServiceForm(service.id);

  const isExamService =
    (service.category || "").toLowerCase().includes("exam") ||
    (service.title || "").toLowerCase().includes("exam") ||
    (service.title || "").toLowerCase().includes("admission") ||
    (service.title || "").toLowerCase().includes("operator examination");

  const isBulk = appMode === "BULK" && applicants.length > 1;

  // Build key-value map for dynamic service fields from activeApplicant.formFieldValues
  const dynamicValuesRecord: Record<string, string> = {};
  if (activeApplicant.formFieldValues && Array.isArray(activeApplicant.formFieldValues)) {
    activeApplicant.formFieldValues.forEach((fv) => {
      if (fv.fieldId) dynamicValuesRecord[fv.fieldId] = fv.value;
      if (fv.fieldLabel) dynamicValuesRecord[fv.fieldLabel] = fv.value;
    });
  }

  useEffect(() => {
    if (!form || !form.sections || form.sections.length === 0) {
      onRequiredFieldsChange?.([]);
      return;
    }

    const matchedVariantItem = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
    const matchedElementItem = variantElements.find((e) => String(e.id) === String(activeApplicant.selectedElementId));

    const evaluationContext: FormEvaluationContext = {
      variantType: matchedVariantItem?.type ? String(matchedVariantItem.type) : undefined,
      variantId: activeApplicant.selectedVariantId,
      variantDescription: matchedVariantItem?.description || matchedVariantItem?.name,
      elementCodes: matchedElementItem?.code
        ? [matchedElementItem.code]
        : variantElements
            .map((e) => (typeof e.code === "string" ? e.code : undefined))
            .filter((c): c is string => Boolean(c)),
      applicantType: activeApplicant.applicantType,
      formValues: dynamicValuesRecord,
    };

    const requiredFieldIds: string[] = [];

    form.sections.forEach((sec) => {
      if (!sec) return;
      const k = (sec.key || sec.id || "").trim().toLowerCase();
      const t = (sec.title || "").trim().toLowerCase();
      if (
        k === "declaration" ||
        t.includes("declaration") ||
        k === "payment" ||
        t.includes("payment") ||
        k === "applicant" ||
        k === "applicantperson" ||
        k === "applicantparticulars" ||
        k === "applicantaddress" ||
        k === "applicantcontact"
      ) {
        return;
      }

      if (!evaluateVisibilityCondition(sec.visibilityCondition, evaluationContext)) {
        return;
      }

      (sec.fields || []).forEach((field) => {
        if (!field || !field.isRequired) return;

        const rawTargetId = field.fieldId || field.id;
        const labelLower = (field.label || "").toLowerCase();
        if (
          rawTargetId?.toLowerCase().includes("declaration") ||
          labelLower.includes("declaration") ||
          labelLower.includes("i hereby declare") ||
          rawTargetId?.toLowerCase().includes("payment") ||
          labelLower.includes("official receipt") ||
          labelLower.includes("amount paid")
        ) {
          return;
        }

        if (!evaluateVisibilityCondition(field.visibilityCondition, evaluationContext)) {
          return;
        }

        if (rawTargetId) {
          requiredFieldIds.push(rawTargetId);
        }
      });
    });

    onRequiredFieldsChange?.(requiredFieldIds);
  }, [
    form,
    activeApplicant.selectedVariantId,
    activeApplicant.selectedElementId,
    activeApplicant.applicantType,
    onRequiredFieldsChange,
  ]);

  const handleDynamicFieldChange = (fieldId: string, fieldLabel: string, value: string) => {
    updateActiveApplicant((prevApp) => {
      const currentArr = prevApp.formFieldValues || [];
      const filtered = currentArr.filter((item) => item.fieldId !== fieldId);
      return {
        formFieldValues: [...filtered, { fieldId, fieldLabel, value }],
      };
    });
  };

  const matchedVariant = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
  const allowCompany = matchedVariant?.isIndividual === false || (!matchedVariant && !isExamService);

  const renderBulkCohortBanner = () => {
    if (!isBulk) return null;

    return (
      <View style={styles.bulkBanner}>
        <View style={styles.bulkHeaderRow}>
          <View style={styles.bulkTitleContainer}>
            <Icon name="users" size={18} color={COLORS.brand[700]} />
            <Text style={styles.bulkBannerTitle}>
              Bulk Roster Applicant {currentApplicantIndex + 1} of {applicants.length}
            </Text>
          </View>
          <Text style={styles.applicantBadge}>
            {getApplicantDisplayName(activeApplicant, currentApplicantIndex + 1)}
          </Text>
        </View>

        {setCurrentApplicantIndex && (
          <View style={styles.carouselRow}>
            {applicants.map((app, idx) => {
              const isSelected = idx === currentApplicantIndex;
              const displayName = getApplicantDisplayName(app, idx + 1);
              return (
                <TouchableOpacity
                  key={`applicant-tab-${app.id || idx}`}
                  style={[styles.carouselTab, isSelected && styles.carouselTabSelected]}
                  onPress={() => setCurrentApplicantIndex(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.carouselTabText, isSelected && styles.carouselTabTextSelected]}>
                    #{idx + 1} {displayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBulkCohortBanner()}

      {/* 1. Standardized Applicant Particulars Section */}
      <ApplicantInformationFormSection
        applicant={activeApplicant}
        onChange={(partial) => updateActiveApplicant(partial)}
        allowCompany={allowCompany}
        isExamService={isExamService}
        errors={errors}
        title={isBulk ? `Applicant #${currentApplicantIndex + 1} Information` : "Applicant Particulars"}
      />

      {/* 2. Dynamic Service Specifications Section (100% Schema-Driven from Form Builder) */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.brand[700]} />
          <Text style={styles.loadingText}>Loading dynamic service specifications...</Text>
        </View>
      ) : form && form.sections && form.sections.length > 0 ? (
        <DynamicFormRenderer
          key={`dynamic-form-${activeApplicant.id || currentApplicantIndex}`}
          form={form}
          values={dynamicValuesRecord}
          onChange={handleDynamicFieldChange}
          applicantName={getApplicantDisplayName(activeApplicant)}
          applicantType={activeApplicant.applicantType}
          serviceCategory={service.category}
          serviceTitle={service.title}
          selectedVariantId={activeApplicant.selectedVariantId}
          selectedElementId={activeApplicant.selectedElementId}
          variants={variants}
          variantElements={variantElements}
          errors={errors}
          appMode={appMode}
          isBulk={isBulk}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  bulkBanner: {
    backgroundColor: COLORS.brand.light,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  bulkHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  bulkTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bulkBannerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.brand[900],
  },
  applicantBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.brand[900],
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  carouselRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  carouselTab: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  carouselTabSelected: {
    backgroundColor: COLORS.brand[700],
    borderColor: COLORS.brand[800],
  },
  carouselTabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.neutral[700],
  },
  carouselTabTextSelected: {
    fontWeight: "700",
    color: COLORS.neutral.white,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
  },
});
