import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

import { DynamicFormRenderer } from "../../../../shared/components/DynamicFormRenderer";
import { StructuredNameData } from "../../../../shared/components/ApplicantNameField";
import { useServiceForm } from "../hooks/useServiceForm";
import { getApplicantDisplayName } from "../helpers/applicantDisplayHelper";
import {
  FIELD_ID_FULL_NAME,
  FIELD_ID_BIRTH_DATE,
  FIELD_ID_ADDRESS,
  FIELD_ID_NO_OF_YEARS,
  FIELD_ID_APP_TYPE,
  FIELD_ID_EXAMINEE_TYPE,
  FIELD_ID_EXAM_CATEGORY,
  FIELD_ID_ELEMENTS,
  FIELD_ID_CLASS_OF_STATION,
  FIELD_ID_CONTACT_NO,
  FIELD_ID_EMAIL,
  FIELD_ID_SIGNATURE,
} from "../../../../shared/constants/fieldIds";

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

  const serviceTitle = (service.title || "").toUpperCase();
  const isCompanyCertService =
    serviceTitle.includes("TVRO") ||
    serviceTitle.includes("CATV") ||
    serviceTitle.includes("VALUE-ADDED") ||
    serviceTitle.includes("VAS") ||
    serviceTitle.includes("RFID") ||
    serviceTitle.includes("SRD") ||
    serviceTitle.includes("WDN") ||
    serviceTitle.includes("CPE") ||
    serviceTitle.includes("ACCREDITATION") ||
    serviceTitle.includes("COMMERCIAL") ||
    serviceTitle.includes("CLUB") ||
    (service.id !== undefined && (
      service.id.toLowerCase().includes("119") ||
      service.id.toLowerCase().includes("120") ||
      service.id.toLowerCase().includes("122") ||
      service.id.toLowerCase().includes("ntc_1_19") ||
      service.id.toLowerCase().includes("ntc_1_20") ||
      service.id.toLowerCase().includes("ntc_1_22")
    ));

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
        if ((labelLower.includes("examinee type") || fieldId === FIELD_ID_EXAMINEE_TYPE) && !existingVal) {
          const examineeTypeVal = matchedVariant?.type || matchedVariant?.description || "FirstTaker";
          updatedValues.push({ fieldId, fieldLabel: field.label, value: examineeTypeVal });
          hasChanges = true;
        }

        // Exam Category prefill
        if ((labelLower.includes("exam category") || fieldId === FIELD_ID_EXAM_CATEGORY) && !existingVal) {
          const desc = ((matchedVariant?.description || "") + " " + (service.title || "")).toLowerCase();
          let categoryVal = "Radiotelegraphy";
          if (desc.includes("amateur")) categoryVal = "Amateur";
          else if (desc.includes("radiotelephony") || desc.includes("rtp")) categoryVal = "Radiotelephony";
          else if (desc.includes("restricted") || desc.includes("rroc")) categoryVal = "Restricted Radiotelephone";
          updatedValues.push({ fieldId, fieldLabel: field.label, value: categoryVal });
          hasChanges = true;
        }

        // Exam Elements & Variant Elements prefill
        if ((labelLower.includes("element") || fieldId === FIELD_ID_ELEMENTS) && !existingVal && selectedElementTitle) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: selectedElementTitle });
          hasChanges = true;
        }

        // Class of Station prefill
        if ((labelLower.includes("class of station") || fieldId === FIELD_ID_CLASS_OF_STATION) && !existingVal && selectedElementTitle) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: selectedElementTitle });
          hasChanges = true;
        }

        // Permit / Certificate / Application Type prefill from variant
        if (
          (labelLower.includes("type of application") ||
            labelLower.includes("application type") ||
            labelLower.includes("permit type") ||
            labelLower.includes("permit / license type") ||
            labelLower.includes("type of certificate") ||
            labelLower.includes("certificate type")) &&
          !existingVal &&
          matchedVariant
        ) {
          const vType = matchedVariant.type && matchedVariant.type !== "NA" && matchedVariant.type !== "N/A" ? matchedVariant.type : "";
          const vDesc = matchedVariant.description || matchedVariant.name || "";
          const displayVal = vDesc || vType || "";
          if (displayVal) {
            updatedValues.push({ fieldId, fieldLabel: field.label, value: displayVal });
            hasChanges = true;
          }
        }
        // Personal / contact details prefill from activeApplicant
        if (
          !labelLower.includes("type") &&
          !labelLower.includes("permit") &&
          !labelLower.includes("certificate") &&
          (labelLower.includes("full name") ||
            labelLower.includes("full legal name") ||
            labelLower.includes("applicant name") ||
            labelLower === "name" ||
            fieldId === FIELD_ID_FULL_NAME) &&
          !existingVal
        ) {
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
        if (
          (labelLower.includes("birth") ||
            labelLower.includes("dob") ||
            labelLower === "date of birth" ||
            fieldId === FIELD_ID_BIRTH_DATE) &&
          !existingVal &&
          activeApplicant.birthYear
        ) {
          const monthMap: Record<string, string> = {
            January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
            July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
          };
          const mNum = monthMap[activeApplicant.birthMonth] || activeApplicant.birthMonth.padStart(2, "0");
          const dNum = activeApplicant.birthDay.padStart(2, "0");
          const dobFormatted = `${mNum}/${dNum}/${activeApplicant.birthYear}`;
          updatedValues.push({ fieldId, fieldLabel: field.label, value: dobFormatted });
          hasChanges = true;
        }
        if ((labelLower === "sex" || labelLower === "gender") && !existingVal && activeApplicant.sex) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.sex });
          hasChanges = true;
        }
        if ((labelLower.includes("civil status") || labelLower === "civilstatus") && !existingVal && activeApplicant.civilStatus) {
          updatedValues.push({ fieldId, fieldLabel: field.label, value: activeApplicant.civilStatus });
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
        if (
          (labelLower.includes("address") || labelLower.includes("street")) &&
          !labelLower.includes("email") &&
          !labelLower.includes("exam") &&
          !labelLower.includes("seminar") &&
          !labelLower.includes("station") &&
          !labelLower.includes("installation") &&
          !labelLower.includes("seller") &&
          !labelLower.includes("dealer") &&
          !existingVal &&
          activeApplicant.address
        ) {
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
  ]);

  const prevRequiredKeyRef = React.useRef<string>("");
  useEffect(() => {
    if (!loading && form && form.sections) {
      const isAmateurCertService = (service.category || "").toLowerCase().includes("certificate") && ((service.title || "").toLowerCase().includes("amateur") || (service.id || "").toLowerCase().includes("103") || (service.id || "").toLowerCase().includes("ntc_1_03"));
      const isCompanyCertService =
        (service.category || "").toLowerCase().includes("certificate") &&
        ((service.title || "").toLowerCase().includes("tvro") ||
         (service.title || "").toLowerCase().includes("value-added") ||
         (service.title || "").toLowerCase().includes("vas") ||
         (service.title || "").toLowerCase().includes("rfid") ||
         (service.title || "").toLowerCase().includes("srd") ||
         (service.title || "").toLowerCase().includes("wdn") ||
         (service.id || "").toLowerCase().includes("119") ||
         (service.id || "").toLowerCase().includes("120") ||
         (service.id || "").toLowerCase().includes("122"));

      const visibleSections = form.sections.filter((section) => {
        const key = (section.key || section.id || "").toLowerCase();
        const title = (section.title || "").toLowerCase();

        // Exclude Corporate Representative (captured in Step 2)
        const isRepresentativeSection =
          key === "representative" ||
          key === "authorizedrepresentative" ||
          title === "representative" ||
          title === "authorized representative";

        if (isRepresentativeSection) {
          return false;
        }

        if (!isCompanyCertService) {
          const isLegacyCompanySection =
            key === "companydetails" ||
            key === "company_details" ||
            key === "company" ||
            title === "company details" ||
            title === "company / corporation details";

          if (isLegacyCompanySection) {
            return false;
          }
        }

        // Exclude removed sections for Amateur Service Certificates
        if (isAmateurCertService) {
          const isAmateurRemovedSection =
            key === "employmentstatus" ||
            key === "employment_status" ||
            key === "employment" ||
            key === "classofstation" ||
            key === "class_of_station" ||
            key === "classofstations" ||
            key === "club" ||
            key === "clubdetails" ||
            key === "club_details" ||
            key === "equipment" ||
            key === "equipmentdetails" ||
            key === "equipment_details" ||
            key === "certificateparticulars" ||
            title.includes("employment") ||
            title.includes("class of station") ||
            title.includes("club") ||
            title.includes("equipment") ||
            title.includes("certificate particulars");

          if (isAmateurRemovedSection) {
            return false;
          }
        }

        // Exclude Invoice section for Dealers
        const isInvoiceSection =
          key === "invoicedetails" ||
          key === "invoice_details" ||
          key === "invoice" ||
          title.includes("invoice");

        if (isInvoiceSection) {
          const matchedVar = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
          const varDesc = (matchedVar?.description || matchedVar?.name || "").toLowerCase();
          const isNonDealerVariant = varDesc.includes("non-dealer") || varDesc.includes("non dealer") || String(activeApplicant.selectedVariantId).endsWith("23");
          const registrationTypeVal = (activeApplicant.formFieldValues?.find(fv => (fv.fieldLabel || "").toLowerCase().includes("registration type"))?.value || activeApplicant.deviceRegData?.registrationType || "").toLowerCase();
          const isNonDealerRegType = registrationTypeVal.includes("non");
          const isDealer = varDesc.includes("dealer") && !isNonDealerVariant;

          if (isDealer || (!isNonDealerVariant && !isNonDealerRegType)) {
            return false;
          }
        }

        return (
          key !== "payment" &&
          !key.includes("payment") &&
          title !== "payment details" &&
          !title.includes("payment") &&
          key !== "declaration" &&
          !key.includes("declaration") &&
          title !== "declaration" &&
          !title.includes("declaration") &&
          key !== "typeofcertificate" &&
          key !== "permittype" &&
          key !== "apptype" &&
          key !== "applicationtype" &&
          key !== "typeofapplication" &&
          title !== "type of certificate / application" &&
          title !== "type of application & permit category" &&
          title !== "type of application & category" &&
          title !== "type of certificate" &&
          title !== "type of application" &&
          title !== "application type" &&
          title !== "permit type / application type" &&
          title !== "permit type" &&
          title !== "permit category"
        );
      });

      const requiredIds = visibleSections
        .flatMap((s) => {
          const sectionKeyLower = (s.key || s.id || "").toLowerCase();
          const isOptionalSection =
            sectionKeyLower.includes("education") ||
            sectionKeyLower.includes("assistance") ||
            sectionKeyLower.includes("specialneeds") ||
            sectionKeyLower.includes("emergency") ||
            sectionKeyLower.includes("vasregistration") ||
            sectionKeyLower.includes("vas_registration") ||
            sectionKeyLower.includes("bsd") ||
            sectionKeyLower.includes("declaration") ||
            sectionKeyLower.includes("payment");
          if (isOptionalSection) return [];

          const isExamSection = sectionKeyLower.includes("exam") || sectionKeyLower.includes("seminar");
          if (isAmateurCertService && isExamSection) return [];

          const hasRepeater = s.fields.some((f) => {
            const fType = (f.fieldType || f.type || "").toLowerCase();
            const fId = (f.fieldId || f.id || "").toLowerCase();
            return fType === "repeater" || fType === "table" || fType === "repeater_table" || fId.includes("details");
          });

          return s.fields.filter((f) => {
            if (!f.isRequired) return false;
            const fIdLower = (f.fieldId || f.id || "").toLowerCase();
            const labelLower = (f.label || "").toLowerCase().trim();

            const isExamField = labelLower.includes("exam") || labelLower.includes("seminar") || labelLower.includes("rating");
            if (isAmateurCertService && isExamField) return false;

            const isOfficialAssignment =
              fIdLower.includes("vasregistration") ||
              fIdLower.includes("vas_reg") ||
              fIdLower === "fd000000-0000-0000-0000-000000000236" ||
              fIdLower.includes("bsd") ||
              labelLower.includes("vas registration") ||
              labelLower.includes("bsd no") ||
              labelLower.includes("bsd number");
            if (isOfficialAssignment) return false;

            const isRepresentativeField =
              fIdLower === "fd000000-0000-0000-0000-000000000082" ||
              fIdLower === "fd000000-0000-0000-0000-000000000083" ||
              fIdLower === "representativename" ||
              fIdLower === "representativeposition" ||
              labelLower === "authorized representative name" ||
              labelLower === "representative name" ||
              labelLower === "representative position" ||
              labelLower.includes("representative");
            if (isRepresentativeField) return false;

            // Skip SEC / DTI registration (optional field on registration forms)
            const isDtiSecField =
              fIdLower === "fd000000-0000-0000-0000-000000000086" ||
              fIdLower === "dtisecregistration" ||
              fIdLower === "dti_sec_registration" ||
              labelLower.includes("sec / dti") ||
              labelLower.includes("dti") ||
              labelLower.includes("sec registration");
            if (isDtiSecField) return false;

            const matchedVar = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
            const isIndividualVar = activeApplicant.applicantType === "individual"
              ? true
              : activeApplicant.applicantType === "company"
              ? false
              : (matchedVar?.isIndividual !== undefined ? matchedVar.isIndividual : !isCompanyCertService);
            const isNonIndividualApplicant = !isIndividualVar;

            if (isNonIndividualApplicant) {
              const isPersonalBioField =
                fIdLower === "fd000000-0000-0000-0000-000000000002" ||
                fIdLower === "birthdate" ||
                fIdLower === "dateofbirth" ||
                labelLower === "date of birth" ||
                labelLower === "birth date" ||
                labelLower === "dob" ||
                labelLower === "sex" ||
                labelLower === "gender" ||
                labelLower === "sex / gender" ||
                labelLower === "civil status" ||
                labelLower === "marital status" ||
                labelLower === "nationality" ||
                labelLower === "citizenship" ||
                labelLower === "nationality / citizenship" ||
                labelLower === "height" ||
                labelLower === "height (cm)" ||
                labelLower === "weight" ||
                labelLower === "weight (kg)";

              if (isPersonalBioField) return false;
            }

            if (isIndividualVar && appMode === "BULK") {
              const isLegacyCompanyField =
                fIdLower === "fd000000-0000-0000-0000-000000000081" ||
                fIdLower === "companyname" ||
                labelLower === "company / business name" ||
                labelLower === "company / corporation name" ||
                labelLower === "company name" ||
                labelLower.includes("company") ||
                labelLower.includes("business name");
              if (isLegacyCompanyField) return false;
            }

            const isOtherTradeName =
              fIdLower === "othertradename" ||
              fIdLower === "other_trade_name" ||
              fIdLower === "fd000000-0000-0000-0000-000000000235" ||
              labelLower.includes("please specify");
            if (isOtherTradeName) {
              const knownVal = (
                activeApplicant.formFieldValues?.find(fv =>
                  (fv.fieldId || "").toLowerCase().includes("known") ||
                  (fv.fieldLabel || "").toLowerCase().includes("known")
                )?.value || ""
              ).toLowerCase().trim();
              if (knownVal !== "yes") return false;
            }

            const isEmployment =
              labelLower === "status" ||
              labelLower === "employment status" ||
              labelLower === "type" ||
              labelLower === "employment type";

            const isAppType =
              !isEmployment &&
              (labelLower.includes("type of application") ||
                labelLower.includes("application type") ||
                labelLower.includes("permit type") ||
                labelLower.includes("license type") ||
                labelLower.includes("certificate type") ||
                labelLower.includes("type of certificate") ||
                labelLower === "application" ||
                (labelLower === "type" && !s.title.toLowerCase().includes("employment") && !s.key?.toLowerCase().includes("employment")) ||
                fIdLower === "type_of_application" ||
                fIdLower === "permittype" ||
                fIdLower === "applicationtype" ||
                fIdLower === "typeofcertificate");
            if (isAppType) return false;

            const isElem =
              labelLower.includes("element") ||
              labelLower.includes("class of station") ||
              fIdLower === "elements" ||
              fIdLower === "element";
            if (isElem) return false;

            const isInvoiceField =
              labelLower.includes("invoice") ||
              fIdLower === "invoicenumber" ||
              fIdLower === "invoiceno";

            if (isInvoiceField) {
              const matchedVar = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
              const varDesc = (matchedVar?.description || matchedVar?.name || "").toLowerCase();
              const isNonDealerVariant = varDesc.includes("non-dealer") || varDesc.includes("non dealer") || String(activeApplicant.selectedVariantId).endsWith("23");
              const registrationTypeVal = (activeApplicant.formFieldValues?.find(fv => (fv.fieldLabel || "").toLowerCase().includes("registration type"))?.value || activeApplicant.deviceRegData?.registrationType || "").toLowerCase();
              const isNonDealerRegType = registrationTypeVal.includes("non");
              const isDealer = varDesc.includes("dealer") && !isNonDealerVariant;

              if (isDealer || (!isNonDealerVariant && !isNonDealerRegType)) {
                return false;
              }
            }

            if (
              hasRepeater &&
              !fIdLower.includes("details") &&
              (labelLower === "serial number" ||
                labelLower === "serial numbers" ||
                labelLower === "serial number(s)" ||
                labelLower === "frequency range" ||
                labelLower === "power output" ||
                labelLower === "make" ||
                labelLower === "type/model" ||
                labelLower === "make / type / model" ||
                labelLower === "device / equipment type" ||
                labelLower === "device type" ||
                fIdLower === "fd000000-0000-0000-0000-000000000084" ||
                fIdLower === "fd000000-0000-0000-0000-000000000085" ||
                fIdLower === "fd000000-0000-0000-0000-000000000087")
            ) {
              return false;
            }

            return true;
          });
        })
        .map((f) => f.fieldId || f.id)
        .filter((id): id is string => id !== undefined && id !== "");

      const keyStr = requiredIds.join(",");
      if (keyStr !== prevRequiredKeyRef.current) {
        prevRequiredKeyRef.current = keyStr;
        onRequiredFieldsChange?.(requiredIds);
      }
    } else if (prevRequiredKeyRef.current !== "") {
      prevRequiredKeyRef.current = "";
      onRequiredFieldsChange?.([]);
    }
  }, [loading, form, activeApplicant.selectedVariantId, activeApplicant.deviceRegData?.registrationType, variants]);

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

        <View style={{ backgroundColor: "#DBEAFE", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
            Applicant {currentApplicantIndex + 1}/{applicants.length}
          </Text>
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
    if (activeApplicant.companyName) {
      if (!valuesRecord["companyName"]) valuesRecord["companyName"] = activeApplicant.companyName;
      if (!valuesRecord["fd000000-0000-0000-0000-000000000081"]) valuesRecord["fd000000-0000-0000-0000-000000000081"] = activeApplicant.companyName;
      if (!valuesRecord["Company / Business Name"]) valuesRecord["Company / Business Name"] = activeApplicant.companyName;
      if (!valuesRecord["Company / Corporation Name"]) valuesRecord["Company / Corporation Name"] = activeApplicant.companyName;
      if (!valuesRecord["Company Name"]) valuesRecord["Company Name"] = activeApplicant.companyName;
    }
    if (activeApplicant.representativeName) {
      if (!valuesRecord["representativeName"]) valuesRecord["representativeName"] = activeApplicant.representativeName;
      if (!valuesRecord["fd000000-0000-0000-0000-000000000082"]) valuesRecord["fd000000-0000-0000-0000-000000000082"] = activeApplicant.representativeName;
      if (!valuesRecord["Authorized Representative Name"]) valuesRecord["Authorized Representative Name"] = activeApplicant.representativeName;
      if (!valuesRecord["Representative Name"]) valuesRecord["Representative Name"] = activeApplicant.representativeName;
    }
    if (activeApplicant.representativePosition) {
      if (!valuesRecord["representativePosition"]) valuesRecord["representativePosition"] = activeApplicant.representativePosition;
      if (!valuesRecord["fd000000-0000-0000-0000-000000000083"]) valuesRecord["fd000000-0000-0000-0000-000000000083"] = activeApplicant.representativePosition;
      if (!valuesRecord["Designation / Position"]) valuesRecord["Designation / Position"] = activeApplicant.representativePosition;
    }
    if (activeApplicant.dtiSecRegistration) {
      if (!valuesRecord["dtiSecRegistration"]) valuesRecord["dtiSecRegistration"] = activeApplicant.dtiSecRegistration;
      if (!valuesRecord["fd000000-0000-0000-0000-000000000086"]) valuesRecord["fd000000-0000-0000-0000-000000000086"] = activeApplicant.dtiSecRegistration;
      if (!valuesRecord["SEC / DTI Registration Number"]) valuesRecord["SEC / DTI Registration Number"] = activeApplicant.dtiSecRegistration;
    }
    if (activeApplicant.region && !valuesRecord["region"]) valuesRecord["region"] = activeApplicant.region;
    if (activeApplicant.province && !valuesRecord["province"]) valuesRecord["province"] = activeApplicant.province;
    if (activeApplicant.city && !valuesRecord["city"]) valuesRecord["city"] = activeApplicant.city;
    if (activeApplicant.barangay && !valuesRecord["barangay"]) valuesRecord["barangay"] = activeApplicant.barangay;
    if (activeApplicant.email && !valuesRecord["email"] && !valuesRecord[FIELD_ID_EMAIL]) valuesRecord[FIELD_ID_EMAIL] = activeApplicant.email;
    if (activeApplicant.contactNo && !valuesRecord["contactNo"] && !valuesRecord[FIELD_ID_CONTACT_NO]) valuesRecord[FIELD_ID_CONTACT_NO] = activeApplicant.contactNo;
    if (activeApplicant.address && !valuesRecord["address"] && !valuesRecord[FIELD_ID_ADDRESS]) valuesRecord[FIELD_ID_ADDRESS] = activeApplicant.address;

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
        } else if (
          normalized.includes("full name") ||
          normalized.includes("full legal name") ||
          normalized.includes("applicant name") ||
          normalized === "name" ||
          fieldId === FIELD_ID_FULL_NAME
        ) {
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
        } else if (normalized.includes("contact number") || normalized.includes("mobile") || normalized.includes("phone") || fieldId === FIELD_ID_CONTACT_NO) {
          partial.contactNo = value;
        } else if (normalized.includes("email") || fieldId === FIELD_ID_EMAIL) {
          partial.email = value;
        } else if (
          (normalized.includes("address") || normalized.includes("street")) &&
          !normalized.includes("email") &&
          !normalized.includes("exam") &&
          !normalized.includes("seminar") &&
          !normalized.includes("station") &&
          !normalized.includes("installation") &&
          !normalized.includes("seller") &&
          !normalized.includes("dealer")
        ) {
          partial.address = value;
        } else if (normalized === "region") {
          partial.region = value;
        } else if (normalized === "province") {
          partial.province = value;
        } else if (normalized === "city" || normalized.includes("municipality")) {
          partial.city = value;
        } else if (normalized === "barangay") {
          partial.barangay = value;
        } else if (normalized.includes("birth") || normalized.includes("dob") || normalized.includes("date of birth") || fieldId === FIELD_ID_BIRTH_DATE) {
          const slashParts = value.split("/");
          const dashParts = value.split("-");
          if (slashParts.length === 3) {
            partial.birthMonth = slashParts[0] || "01";
            partial.birthDay = slashParts[1] || "01";
            partial.birthYear = slashParts[2] || "2000";
          } else if (dashParts.length === 3) {
            if (dashParts[0] && dashParts[0].length === 4) {
              partial.birthYear = dashParts[0] || "2000";
              partial.birthMonth = dashParts[1] || "01";
              partial.birthDay = dashParts[2] || "01";
            } else {
              partial.birthMonth = dashParts[0] || "01";
              partial.birthDay = dashParts[1] || "01";
              partial.birthYear = dashParts[2] || "2000";
            }
          }
        } else if (fieldId === FIELD_ID_NO_OF_YEARS || normalized.includes("number of years") || normalized.includes("no of years") || normalized === "years") {
          if (partial.radioCertData) partial.radioCertData.years = value;
          if (partial.amateurLicenseData) partial.amateurLicenseData.noOfYears = value;
          if (partial.tvroRegData) partial.tvroRegData.years = value;
          if (partial.vasData) partial.vasData.years = value;
        } else if (fieldId === FIELD_ID_SIGNATURE || normalized.includes("signature")) {
          partial.signatureUrl = value;
          (partial as any).signature = value;
        }

        return partial;
      });
    };

    const structuredNameData: Partial<StructuredNameData> = {
      applicantType: activeApplicant.applicantType || (activeApplicant.companyName ? "company" : "individual"),
      firstName: activeApplicant.firstName || "",
      middleName: activeApplicant.middleName || "",
      lastName: activeApplicant.lastName || "",
      suffix: activeApplicant.suffix || "",
      companyName: activeApplicant.companyName || "",
      representativeName: activeApplicant.representativeName || "",
    };

    const handleStructuredNameChange = (data: StructuredNameData) => {
      updateActiveApplicant({
        applicantType: data.applicantType,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        suffix: data.suffix,
        companyName: data.companyName,
        representativeName: data.representativeName,
      });
      if (data.companyName) {
        handleDynamicFieldChange("companyName", "Company / Business Name", data.companyName);
      }
      if (data.representativeName) {
        handleDynamicFieldChange("representativeName", "Authorized Representative Name", data.representativeName);
      }
    };

    const isExamService =
      (service.category || "").toLowerCase().includes("exam") ||
      (service.title || "").toLowerCase().includes("exam") ||
      (service.title || "").toLowerCase().includes("admission") ||
      (service.title || "").toLowerCase().includes("operator examination");

    const matchedVariant = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId)) || variants[0];
    const appTypeLabel = matchedVariant
      ? matchedVariant.description || matchedVariant.name || (matchedVariant.type === "RENEWAL" ? "Renewal" : matchedVariant.type === "MODIFICATION" ? "Modification" : "New Application")
      : "New Application";

    const currentNoOfYears = activeApplicant.radioCertData?.years || activeApplicant.amateurLicenseData?.noOfYears || activeApplicant.tvroRegData?.years || activeApplicant.vasData?.years || valuesRecord[FIELD_ID_NO_OF_YEARS] || valuesRecord["Number of Years"] || "1";

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
          allowCompany={
            variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId))?.isIndividual === false ||
            (!variants.some((v) => String(v.id) === String(activeApplicant.selectedVariantId)) && isCompanyCertService)
          }
          serviceCategory={service.category}
          serviceTitle={service.title}
          selectedVariantId={activeApplicant.selectedVariantId}
          onVariantChange={(vId, vName) => {
            const isRenewal = vName.toUpperCase().includes("RENEWAL");
            const isModification = vName.toUpperCase().includes("MODIFICATION");
            let appType: "NEW" | "RENEWAL" | "MODIFICATION" = "NEW";
            if (isRenewal) appType = "RENEWAL";
            if (isModification) appType = "MODIFICATION";

            updateActiveApplicant((prevApp) => {
              const currentAmateur = prevApp.amateurLicenseData;
              const currentRadio = prevApp.radioCertData;
              return {
                selectedVariantId: vId,
                selectedVariantName: vName,
                selectedElementId: prevApp.selectedVariantId === vId ? prevApp.selectedElementId : undefined,
                selectedElementTitle: prevApp.selectedVariantId === vId ? prevApp.selectedElementTitle : undefined,
                amateurLicenseData: currentAmateur ? { ...currentAmateur, appType } : undefined,
                radioCertData: currentRadio ? { ...currentRadio, appType } : undefined,
              };
            });
            handleDynamicFieldChange(FIELD_ID_APP_TYPE, "Application Type", vName);
            handleDynamicFieldChange("typeOfCertificate", "Type of Certificate", vName);
            handleDynamicFieldChange("permitType", "Permit Type", vName);
          }}
          selectedElementId={activeApplicant.selectedElementId}
          onElementChange={(elemId, elemTitle) => {
            updateActiveApplicant({
              selectedElementId: elemId,
              selectedElementTitle: elemTitle,
            });
            handleDynamicFieldChange(FIELD_ID_ELEMENTS, "Exam Elements / Classification", elemTitle);
            handleDynamicFieldChange(FIELD_ID_CLASS_OF_STATION, "Class of Station", elemTitle);
            handleDynamicFieldChange("classOfStation", "Class of Station", elemTitle);
            handleDynamicFieldChange("elements", "Elements", elemTitle);
          }}
          noOfYears={currentNoOfYears}
          onNoOfYearsChange={(y) => handleDynamicFieldChange(FIELD_ID_NO_OF_YEARS, "Number of Years", y)}
          variants={variants}
          variantElements={variantElements}
          applicantType={activeApplicant.applicantType}
          errors={errors}
          appMode={appMode}
          isBulk={appMode === "BULK"}
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
