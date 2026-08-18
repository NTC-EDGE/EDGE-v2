import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

import { DynamicFormRenderer } from "../../../../shared/components/DynamicFormRenderer";
import { StructuredNameData } from "../../../../shared/components/ApplicantNameField";
import { useServiceForm } from "../hooks/useServiceForm";
import { getApplicantDisplayName } from "../helpers/applicantDisplayHelper";

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
  variants?: Array<{ id: string; type?: string; name?: string; description?: string; [key: string]: unknown }>;
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

  // Auto-populate variant and element selections established in Step 2 into formFieldValues
  useEffect(() => {
    if (!loading && form && form.sections) {
      const allFields = form.sections.flatMap((s) => s.fields);
      const currentValues = activeApplicant.formFieldValues || [];
      const updatedValues = [...currentValues];
      let hasChanges = false;

      const matchedVariant = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
      const matchedElement = variantElements.find(
        (e) => String(e.id) === String(activeApplicant.selectedElementId)
      ) || variantElements[0];

      const selectedElementTitle =
        activeApplicant.selectedElementTitle ||
        (matchedElement
          ? matchedElement.code
            ? `${matchedElement.code} — ${matchedElement.description}`
            : (matchedElement.description || matchedElement.id)
          : "");

      allFields.forEach((field) => {
        const fieldId = field.fieldId || field.id || "";
        const labelLower = (field.label || "").toLowerCase().trim();
        const existingVal = updatedValues.find((v) => v.fieldId === fieldId)?.value;

        // Examinee Type prefill
        if ((labelLower.includes("examinee type") || fieldId === "fd000000-0000-0000-0000-000000000008") && !existingVal) {
          const examineeTypeVal = matchedVariant?.type || matchedVariant?.description || "FirstTaker";
          updatedValues.push({ fieldId, fieldLabel: field.label, value: examineeTypeVal });
          hasChanges = true;
        }

        // Exam Category prefill
        if ((labelLower.includes("exam category") || fieldId === "fd000000-0000-0000-0000-000000000007") && !existingVal) {
          const desc = ((matchedVariant?.description || "") + " " + (service.title || "")).toLowerCase();
          let categoryVal = "Radiotelegraphy";
          if (desc.includes("amateur")) categoryVal = "Amateur";
          else if (desc.includes("radiotelephony") || desc.includes("rtp")) categoryVal = "Radiotelephony";
          else if (desc.includes("restricted") || desc.includes("rroc")) categoryVal = "Restricted Radiotelephone";
          updatedValues.push({ fieldId, fieldLabel: field.label, value: categoryVal });
          hasChanges = true;
        }

        // Exam Elements & Variant Elements prefill
        if ((labelLower.includes("element") || fieldId === "fd000000-0000-0000-0000-000000000009") && !existingVal && selectedElementTitle) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: selectedElementTitle });
          hasChanges = true;
        }

        // Class of Station prefill
        if ((labelLower.includes("class of station") || fieldId === "fd000000-0000-0000-0000-000000000025") && !existingVal && selectedElementTitle) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: selectedElementTitle });
          hasChanges = true;
        }

        // Permit / Certificate Type prefill from variant name
        if ((labelLower.includes("permit / license type") || labelLower.includes("type of certificate")) && !existingVal && matchedVariant) {
          const vName = matchedVariant.name || matchedVariant.description || "";
          if (vName) {
            updatedValues.push({ fieldId, fieldLabel: field.label, value: vName });
            hasChanges = true;
          }
        }
        // Personal / contact details prefill from activeApplicant
        if ((labelLower.includes("full name") || labelLower.includes("applicant name") || labelLower === "name") && !existingVal) {
          const combined = [activeApplicant.firstName, activeApplicant.middleName, activeApplicant.lastName, activeApplicant.suffix].filter(Boolean).join(" ");
          if (combined) {
            updatedValues.push({ fieldId, fieldLabel: field.label, value: combined });
            hasChanges = true;
          }
        }
        if ((labelLower.includes("first name") || labelLower === "fname") && !existingVal && activeApplicant.firstName) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.firstName });
          hasChanges = true;
        }
        if ((labelLower.includes("middle name") || labelLower === "mname") && !existingVal && activeApplicant.middleName) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.middleName });
          hasChanges = true;
        }
        if ((labelLower.includes("last name") || labelLower.includes("surname") || labelLower === "lname") && !existingVal && activeApplicant.lastName) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.lastName });
          hasChanges = true;
        }
        if ((labelLower.includes("suffix") || labelLower.includes("extension")) && !existingVal && activeApplicant.suffix) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.suffix });
          hasChanges = true;
        }
        if ((labelLower.includes("company name") || labelLower.includes("business name") || labelLower.includes("corporate name")) && !existingVal && activeApplicant.companyName) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.companyName });
          hasChanges = true;
        }
        if (labelLower.includes("email") && !existingVal && activeApplicant.email) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.email });
          hasChanges = true;
        }
        if ((labelLower.includes("contact number") || labelLower.includes("contact no") || labelLower.includes("mobile") || labelLower.includes("phone")) && !existingVal && activeApplicant.contactNo) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.contactNo });
          hasChanges = true;
        }
        if ((labelLower.includes("birth") || labelLower.includes("dob") || labelLower === "date of birth") && !existingVal && activeApplicant.birthYear && activeApplicant.birthYear !== "2000") {
          const dobFormatted = `${activeApplicant.birthYear}-${activeApplicant.birthMonth}-${activeApplicant.birthDay}`;
          updatedValues.push({ fieldId, fieldLabel: field.label, value: dobFormatted });
          hasChanges = true;
        }
        if ((labelLower === "sex" || labelLower === "gender") && !existingVal && activeApplicant.sex) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.sex });
          hasChanges = true;
        }
        if ((labelLower === "nationality" || labelLower.includes("citizenship")) && !existingVal && activeApplicant.nationality) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.nationality });
          hasChanges = true;
        }
        if ((labelLower.includes("zip") || labelLower.includes("postal")) && !existingVal && activeApplicant.zipCode) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.zipCode });
          hasChanges = true;
        }
        if (labelLower === "region" && !existingVal && activeApplicant.region) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.region });
          hasChanges = true;
        }
        if (labelLower === "province" && !existingVal && activeApplicant.province) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.province });
          hasChanges = true;
        }
        if ((labelLower === "city" || labelLower.includes("city / municipality") || labelLower.includes("municipality")) && !existingVal && activeApplicant.city) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.city });
          hasChanges = true;
        }
        if (labelLower === "barangay" && !existingVal && activeApplicant.barangay) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.barangay });
          hasChanges = true;
        }
        if ((labelLower.includes("address") || labelLower.includes("street")) && !existingVal && activeApplicant.address) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.address });
          hasChanges = true;
        }
      });

      if (hasChanges) {
        updateActiveApplicant({ formFieldValues: updatedValues });
      }
    }
  }, [
    loading,
    form,
    activeApplicant.id,
    currentApplicantIndex,
    activeApplicant.selectedVariantId,
    activeApplicant.selectedElementId,
    activeApplicant.selectedElementTitle,
    activeApplicant.firstName,
    activeApplicant.middleName,
    activeApplicant.lastName,
    activeApplicant.suffix,
    activeApplicant.email,
    activeApplicant.contactNo,
    activeApplicant.address,
    activeApplicant.region,
    activeApplicant.province,
    activeApplicant.city,
    activeApplicant.barangay,
    activeApplicant.companyName,
    variants,
    variantElements,
  ]);

  // Inform parent of mandatory dynamic fields once form is loaded (only visible fields)
  useEffect(() => {
    if (!loading && form && form.sections) {
      const visibleSections = form.sections.filter((section) => {
        const key = (section.key || section.id || "").toLowerCase();
        const title = (section.title || "").toLowerCase();
        return (
          key !== "payment" &&
          !key.includes("payment") &&
          title !== "payment details" &&
          !title.includes("payment") &&
          key !== "declaration" &&
          !key.includes("declaration") &&
          title !== "declaration" &&
          !title.includes("declaration")
        );
      });

      const requiredIds = visibleSections
        .flatMap((s) => s.fields)
        .filter((f) => f.isRequired)
        .map((f) => f.fieldId || f.id)
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
    const activeName = getApplicantDisplayName(activeApplicant, currentApplicantIndex + 1);
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
        if (fv.fieldId) valuesRecord[fv.fieldId] = fv.value;
        if (fv.fieldLabel) valuesRecord[fv.fieldLabel] = fv.value;
      });
    }
    if (activeApplicant.region && !valuesRecord["region"]) valuesRecord["region"] = activeApplicant.region;
    if (activeApplicant.province && !valuesRecord["province"]) valuesRecord["province"] = activeApplicant.province;
    if (activeApplicant.city && !valuesRecord["city"]) valuesRecord["city"] = activeApplicant.city;
    if (activeApplicant.barangay && !valuesRecord["barangay"]) valuesRecord["barangay"] = activeApplicant.barangay;

    const handleDynamicFieldChange = (fieldId: string, fieldLabel: string, value: string) => {
      updateActiveApplicant((prevApp) => {
        const currentArr = prevApp.formFieldValues || [];
        const filtered = currentArr.filter((item) => item.fieldId !== fieldId);
        const updatedArr = [...filtered, { fieldId, fieldLabel, value }];
        
        const partial: Partial<GeneralApplicantData> = { formFieldValues: updatedArr };
        const normalized = (fieldLabel || "").toLowerCase().trim();

        if (normalized.includes("first name") || normalized === "fname" || normalized === "first") {
          partial.firstName = value;
        } else if (normalized.includes("last name") || normalized.includes("surname") || normalized === "lname" || normalized === "last") {
          partial.lastName = value;
        } else if (normalized.includes("full name") || normalized.includes("applicant name") || normalized === "name") {
          const parts = value.trim().split(/\s+/);
          if (parts.length > 1) {
            partial.firstName = parts[0];
            partial.lastName = parts.slice(1).join(" ");
          } else {
            partial.firstName = value;
            partial.lastName = "";
          }
        } else if (normalized.includes("company name") || normalized.includes("corporate name") || normalized === "business name") {
          partial.firstName = value;
          partial.lastName = "";
        } else if (normalized.includes("contact number") || normalized.includes("mobile") || normalized.includes("phone")) {
          partial.contactNo = value;
        } else if (normalized.includes("email")) {
          partial.email = value;
        } else if (normalized.includes("address") || normalized.includes("street")) {
          partial.address = value;
        } else if (normalized === "region") {
          partial.region = value;
        } else if (normalized === "province") {
          partial.province = value;
        } else if (normalized === "city" || normalized.includes("municipality")) {
          partial.city = value;
        } else if (normalized === "barangay") {
          partial.barangay = value;
        } else if (normalized.includes("birth") || normalized.includes("dob") || normalized.includes("date of birth")) {
          const dateParts = value.split("-");
          if (dateParts.length === 3) {
            partial.birthYear = dateParts[0];
            partial.birthMonth = dateParts[1];
            partial.birthDay = dateParts[2];
          }
        }

        return partial;
      });
    };

    const structuredNameData: Partial<StructuredNameData> = {
      firstName: activeApplicant.firstName || "",
      middleName: activeApplicant.middleName || "",
      lastName: activeApplicant.lastName || "",
      suffix: activeApplicant.suffix || "",
      companyName: activeApplicant.companyName || (activeApplicant.applicantType === "company" ? activeApplicant.firstName : ""),
      representativeName: activeApplicant.representativeName || (activeApplicant.applicantType === "company" ? activeApplicant.lastName : ""),
      applicantType: activeApplicant.applicantType || "individual",
    };

    const handleStructuredNameChange = (data: StructuredNameData) => {
      if (data.applicantType === "individual") {
        updateActiveApplicant({
          applicantType: "individual",
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          suffix: data.suffix,
          companyName: "",
          representativeName: "",
        });
      } else {
        updateActiveApplicant({
          applicantType: "company",
          companyName: data.companyName,
          representativeName: data.representativeName,
          firstName: data.companyName,
          lastName: data.representativeName || "",
          middleName: "",
          suffix: "",
        });
      }
    };

    const isExamService =
      (service.category || "").toLowerCase().includes("exam") ||
      (service.title || "").toLowerCase().includes("exam") ||
      (service.title || "").toLowerCase().includes("admission") ||
      (service.title || "").toLowerCase().includes("operator");

    return (
      <View>
        {renderBulkCohortBanner()}
        <DynamicFormRenderer
          key={`dynamic-form-${activeApplicant.id || currentApplicantIndex}`}
          form={form}
          values={valuesRecord}
          onChange={handleDynamicFieldChange}
          onStructuredNameChange={handleStructuredNameChange}
          structuredNameData={structuredNameData}
          applicantName={getApplicantDisplayName(activeApplicant)}
          allowCompany={!isExamService}
          variantElements={variantElements}
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
