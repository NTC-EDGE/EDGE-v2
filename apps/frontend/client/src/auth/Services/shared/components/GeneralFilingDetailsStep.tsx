import React from "react";
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { Select } from "../../../../shared/components/Select";
import { DynamicFormRenderer } from "../../../../shared/components/DynamicFormRenderer";
import { useServiceForm } from "../hooks/useServiceForm";
import {
  RadioOperatorCertForm,
  DeviceRegistrationForm,
  TVRORegistrationForm,
  VASProviderForm,
  CopyOfCertificateForm,
  initialRadioOperatorCertData,
  initialDeviceRegistrationData,
  initialTVRORegistrationData,
  initialVASProviderData,
  initialCopyOfCertificateData,
} from "../../certificates";
import {
  AmateurRadioStationLicenseForm,
  LifetimeAmateurLicenseForm,
  initialAmateurRadioStationLicenseData,
  initialLifetimeAmateurLicenseData,
} from "../../licenses";

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
}

const deriveAppTypeFromStep3 = (variantStr?: string): "NEW" | "RENEWAL" | "MODIFICATION" => {
  const upper = (variantStr || "").toUpperCase();
  if (upper.includes("RENEWAL") || upper.includes("REN")) return "RENEWAL";
  if (upper.includes("MODIFICATION") || upper.includes("MOD")) return "MODIFICATION";
  return "NEW";
};

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
        .flatMap((section) => section.fields)
        .filter((field) => field.isRequired === true)
        .map((field) => field.id);
      onRequiredFieldsChange?.(requiredIds);
    } else {
      onRequiredFieldsChange?.([]);
    }
  }, [loading, form]);

  const serviceCode = (service.code || "").toUpperCase();
  const serviceTitle = (service.title || "").toUpperCase();
  const serviceCategory = (service.category || "").toUpperCase();

  const step3AppType = deriveAppTypeFromStep3(activeApplicant.selectedVariantId);

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

  // 1. Lifetime Amateur Radio Station License for Class A
  if (
    serviceTitle.includes("LIFETIME") ||
    serviceCode.includes("LIFETIME") ||
    (activeApplicant.selectedVariantId && activeApplicant.selectedVariantId.toLowerCase().includes("life"))
  ) {
    const rawData = activeApplicant.lifetimeLicenseData || initialLifetimeAmateurLicenseData(activeApplicant.id);
    const lifetimeData = {
      ...rawData,
      firstName: activeApplicant.firstName || rawData.firstName,
      lastName: activeApplicant.lastName || rawData.lastName,
      email: activeApplicant.email || rawData.email,
      contactNo: activeApplicant.contactNo || rawData.contactNo,
      address: activeApplicant.address || rawData.address,
    };
    return (
      <LifetimeAmateurLicenseForm
        data={lifetimeData}
        onChange={(fields) =>
          updateActiveApplicant({
            lifetimeLicenseData: { ...lifetimeData, ...fields },
            firstName: fields.firstName !== undefined ? fields.firstName : activeApplicant.firstName,
            lastName: fields.lastName !== undefined ? fields.lastName : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 2. Amateur Radio Station License (NEW, RENEWAL, MODIFICATION)
  if (
    serviceTitle.includes("AMATEUR") ||
    serviceTitle.includes("STATION") ||
    serviceTitle.includes("LICENSE") ||
    serviceCategory.includes("LICENSE") ||
    serviceCode.includes("LICENSE") ||
    serviceCode === "NTC_AMA_STATION_LICENSE"
  ) {
    const rawData = activeApplicant.amateurLicenseData || initialAmateurRadioStationLicenseData(activeApplicant.id);
    const amateurData = {
      ...rawData,
      appType: step3AppType,
      firstName: activeApplicant.firstName || rawData.firstName,
      lastName: activeApplicant.lastName || rawData.lastName,
      email: activeApplicant.email || rawData.email,
      contactNo: activeApplicant.contactNo || rawData.contactNo,
      address: activeApplicant.address || rawData.address,
    };

    return (
      <AmateurRadioStationLicenseForm
        data={amateurData}
        onChange={(fields) =>
          updateActiveApplicant({
            amateurLicenseData: { ...amateurData, ...fields },
            firstName: fields.firstName !== undefined ? fields.firstName : activeApplicant.firstName,
            lastName: fields.lastName !== undefined ? fields.lastName : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 3. NTC 1-02: Commercial Radio Operator Certificates
  if (serviceCode === "NTC_1_02" || serviceTitle.includes("RADIO OPERATOR CERTIFICATES (ROC)")) {
    const rawData = activeApplicant.radioCertData || initialRadioOperatorCertData(activeApplicant.id);
    const radioData = { ...rawData, appType: step3AppType };
    return (
      <RadioOperatorCertForm
        data={radioData}
        onChange={(fields) =>
          updateActiveApplicant({
            radioCertData: { ...radioData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName.split(" ")[0] || "" : activeApplicant.firstName,
            lastName: fields.applicantName !== undefined ? fields.applicantName.split(" ").slice(1).join(" ") : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
        isAmateurService={false}
      />
    );
  }

  // 4. NTC 1-03: Certificates in the Amateur Service
  if (serviceCode === "NTC_1_03" || serviceCode === "NTC_AMA_LICENSES" || serviceTitle.includes("CERTIFICATES IN THE AMATEUR SERVICE")) {
    const rawData = activeApplicant.radioCertData || initialRadioOperatorCertData(activeApplicant.id);
    const radioData = { ...rawData, appType: step3AppType };
    return (
      <RadioOperatorCertForm
        data={radioData}
        onChange={(fields) =>
          updateActiveApplicant({
            radioCertData: { ...radioData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName.split(" ")[0] || "" : activeApplicant.firstName,
            lastName: fields.applicantName !== undefined ? fields.applicantName.split(" ").slice(1).join(" ") : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
        isAmateurService={true}
      />
    );
  }

  // 5. NTC 1-07: Registration of Radio Transceivers / Receiver
  if (serviceCode === "NTC_1_07" || serviceTitle.includes("RADIO TRANSCEIVER") || serviceTitle.includes("RECEIVER")) {
    const deviceData = activeApplicant.deviceRegData || initialDeviceRegistrationData(activeApplicant.id);
    return (
      <DeviceRegistrationForm
        data={deviceData}
        onChange={(fields) =>
          updateActiveApplicant({
            deviceRegData: { ...deviceData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName.split(" ")[0] || "" : activeApplicant.firstName,
            lastName: fields.applicantName !== undefined ? fields.applicantName.split(" ").slice(1).join(" ") : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 6. NTC 1-13: TVRO Station Registration
  if (serviceCode === "NTC_1_13" || serviceTitle.includes("TVRO")) {
    const tvroData = activeApplicant.tvroRegData || initialTVRORegistrationData(activeApplicant.id);
    return (
      <TVRORegistrationForm
        data={tvroData}
        onChange={(fields) =>
          updateActiveApplicant({
            tvroRegData: { ...tvroData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName.split(" ")[0] || "" : activeApplicant.firstName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 7. NTC 1-14: Value Added Services (VAS) Registration
  if (serviceCode === "NTC_1_14" || serviceTitle.includes("VALUE ADDED") || serviceTitle.includes("VAS")) {
    const vasData = activeApplicant.vasData || initialVASProviderData(activeApplicant.id);
    return (
      <VASProviderForm
        data={vasData}
        onChange={(fields) =>
          updateActiveApplicant({
            vasData: { ...vasData, ...fields },
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 8. NTC 1-19: Duplicate / Certified True Copy of Permit / License
  if (serviceCode === "NTC_1_19" || serviceTitle.includes("DUPLICATE") || serviceTitle.includes("CERTIFIED TRUE COPY")) {
    const copyData = activeApplicant.copyOfCertData || initialCopyOfCertificateData(activeApplicant.id);
    return (
      <CopyOfCertificateForm
        data={copyData}
        onChange={(fields) =>
          updateActiveApplicant({
            copyOfCertData: { ...copyData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName.split(" ")[0] || "" : activeApplicant.firstName,
            lastName: fields.applicantName !== undefined ? fields.applicantName.split(" ").slice(1).join(" ") : activeApplicant.lastName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // Fallback Generic Form
  return (
    <View style={{ gap: 14 }}>
      {renderBulkCohortBanner()}
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600] }}>
        Generic Application Form for {service.title} ({service.code})
      </Text>
      <ValidatedInput
        label="First Name"
        placeholder="First Name"
        value={activeApplicant.firstName}
        onChangeText={(val) => updateActiveApplicant({ firstName: val })}
        required
      />
      <ValidatedInput
        label="Last Name"
        placeholder="Last Name"
        value={activeApplicant.lastName}
        onChangeText={(val) => updateActiveApplicant({ lastName: val })}
        required
      />
      <ValidatedInput
        label="Email Address"
        placeholder="email@example.com"
        value={activeApplicant.email}
        onChangeText={(val) => updateActiveApplicant({ email: val })}
        required
      />
      <ValidatedInput
        label="Contact Number"
        placeholder="0917XXXXXXX"
        value={activeApplicant.contactNo}
        onChangeText={(val) => updateActiveApplicant({ contactNo: val })}
        required
      />
    </View>
  );
}
