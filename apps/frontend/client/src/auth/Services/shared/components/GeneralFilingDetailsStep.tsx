import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

import { DynamicFormRenderer } from "../../../../shared/components/DynamicFormRenderer";
import { useServiceForm } from "../hooks/useServiceForm";

interface GeneralFilingDetailsStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (fields: Partial<GeneralApplicantData>) => void;
  appMode?: "SINGLE" | "BULK" | "";
  applicants?: GeneralApplicantData[];
  currentApplicantIndex?: number;
  setCurrentApplicantIndex?: (idx: number) => void;
  /** Called once after the form layout resolves with the IDs of required fields (empty for hardcoded forms). */
  onRequiredFieldsChange?: (requiredFieldIds: string[]) => void;
  errors?: Record<string, string>;
  variants?: Array<{ id: string; name?: string; title?: string; [key: string]: unknown }>;
}

export function GeneralFilingDetailsStep({
  service,
  activeApplicant,
  updateActiveApplicant,
  appMode,
  applicants = [],
  currentApplicantIndex = 0,
  setCurrentApplicantIndex,
  onRequiredFieldsChange,
  errors = {},
}: GeneralFilingDetailsStepProps) {
  const { form, loading } = useServiceForm(service?.id, activeApplicant.selectedVariantId);

  // Notify parent of required field IDs whenever the dynamic form resolves
  React.useEffect(() => {
    if (loading) return;
    if (form && Array.isArray(form.sections) && form.sections.length > 0) {
      const requiredIds = form.sections
        .filter((section) => {
          const key = (section.key || section.id || "").toLowerCase();
          const title = (section.title || "").toLowerCase();
          return key !== "payment" && title !== "payment details";
        })
        .flatMap((section) => section.fields)
        .filter((field) => field.isRequired === true)
        .map((field) => field.fieldId || field.id)
        .filter((id): id is string => id !== undefined && id !== "");

      onRequiredFieldsChange?.(requiredIds);
    } else {
      onRequiredFieldsChange?.([]);
    }
  }, [loading, form]);

  if (loading) {
    return (
      <View style={{ padding: 24, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0F2C59" />
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", marginTop: 8 }}>
          Loading application form layout...
        </Text>
      </View>
    );
  }

  const renderBulkCohortBanner = () => {
    if (appMode !== "BULK" || !applicants || applicants.length === 0) return null;
    const activeName = [activeApplicant.firstName, activeApplicant.lastName].filter(Boolean).join(" ") || `Applicant #${currentApplicantIndex + 1}`;
    return (
      <View
        style={{
          backgroundColor: "#EFF6FF",
          borderWidth: 1,
          borderColor: "#93C5FD",
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#1D4ED8",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name="users" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#1E40AF" }}>
              BULK FILING COHORT — Applicant {currentApplicantIndex + 1} of {applicants.length}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#2563EB", marginTop: 1 }} numberOfLines={1}>
              Active Profile: {activeName}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          {currentApplicantIndex > 0 && setCurrentApplicantIndex && (
            <TouchableOpacity
              onPress={() => setCurrentApplicantIndex(currentApplicantIndex - 1)}
              style={{ backgroundColor: "#FFFFFF", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: "#93C5FD" }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>← Prev</Text>
            </TouchableOpacity>
          )}
          {currentApplicantIndex < applicants.length - 1 && setCurrentApplicantIndex && (
            <TouchableOpacity
              onPress={() => setCurrentApplicantIndex(currentApplicantIndex + 1)}
              style={{ backgroundColor: "#FFFFFF", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: "#93C5FD" }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>Next →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render Dynamic Form from Backend DB configuration when present
  if (form && form.sections && Array.isArray(form.sections) && form.sections.length > 0) {
    const valuesRecord: Record<string, string> = {};
    if (activeApplicant.formFieldValues) {
      activeApplicant.formFieldValues.forEach((fv) => {
        valuesRecord[fv.fieldId] = fv.value;
      });
    }

    const handleDynamicFieldChange = (fieldId: string, fieldLabel: string, value: string) => {
      const currentArr = activeApplicant.formFieldValues || [];
      const filtered = currentArr.filter((item) => item.fieldId !== fieldId);
      const updatedArr = [...filtered, { fieldId, fieldLabel, value }];
      updateActiveApplicant({ formFieldValues: updatedArr });
    };

    return (
      <View>
        {renderBulkCohortBanner()}
        <DynamicFormRenderer
          form={form}
          values={valuesRecord}
          onChange={handleDynamicFieldChange}
          errors={errors}
        />
      </View>
    );
  }

  // Fallback diagnostic view if no database-seeded form configuration is found
  return (
    <View style={{ gap: 14, padding: 18, backgroundColor: COLORS.neutral[100], borderRadius: 10, borderWidth: 1, borderColor: COLORS.neutral[200] }}>
      {renderBulkCohortBanner()}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="alert-circle" size={18} color={COLORS.semantic.error} />
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.semantic.error }}>
          Form Layout Unavailable
        </Text>
      </View>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12.5, color: COLORS.neutral[600], lineHeight: 18 }}>
        No custom form layout is configured in the database for {service.title} ({service.code}). Please ensure that forms seeding is completed.
      </Text>
    </View>
  );
}
