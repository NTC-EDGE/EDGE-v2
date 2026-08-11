import React from "react";
import { View, Text, TextInput } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { Select } from "../../../../shared/components/Select";
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

interface GeneralFilingDetailsStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (fields: Partial<GeneralApplicantData>) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

export function GeneralFilingDetailsStep({
  service,
  activeApplicant,
  updateActiveApplicant,
}: GeneralFilingDetailsStepProps) {
  const serviceCode = (service.code || "").toUpperCase();
  const serviceTitle = (service.title || "").toUpperCase();

  // 1. NTC 1-02: Commercial Radio Operator Certificates
  if (serviceCode === "NTC_1_02" || serviceTitle.includes("RADIO OPERATOR CERTIFICATES (ROC)")) {
    const radioData = activeApplicant.radioCertData || initialRadioOperatorCertData(activeApplicant.id);
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

  // 2. NTC 1-03: Certificates in the Amateur Service
  if (serviceCode === "NTC_1_03" || serviceCode === "NTC_AMA_LICENSES" || serviceTitle.includes("CERTIFICATES IN THE AMATEUR SERVICE")) {
    const radioData = activeApplicant.radioCertData || initialRadioOperatorCertData(activeApplicant.id);
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

  // 3. NTC 1-19: RFID, SRD, WDN Devices - Indoor
  if (serviceCode === "NTC_1_19" || serviceTitle.includes("RFID") || serviceTitle.includes("WDN")) {
    const deviceData = activeApplicant.deviceRegData || initialDeviceRegistrationData(activeApplicant.id);
    return (
      <DeviceRegistrationForm
        data={deviceData}
        onChange={(fields) =>
          updateActiveApplicant({
            deviceRegData: { ...deviceData, ...fields },
            firstName: fields.businessName !== undefined ? fields.businessName : activeApplicant.firstName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 4. NTC 1-22: TVRO Registration Certificate
  if (serviceCode === "NTC_1_22" || serviceCode === "NTC_TVRO_CATV_LICENSES" || serviceTitle.includes("TVRO")) {
    const tvroData = activeApplicant.tvroRegData || initialTVRORegistrationData(activeApplicant.id);
    return (
      <TVRORegistrationForm
        data={tvroData}
        onChange={(fields) =>
          updateActiveApplicant({
            tvroRegData: { ...tvroData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName : activeApplicant.firstName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 5. NTC 1-20: Value-Added Service (VAS) Provider
  if (serviceCode === "NTC_1_20" || serviceTitle.includes("VALUE-ADDED") || serviceTitle.includes("VAS")) {
    const vasData = activeApplicant.vasData || initialVASProviderData(activeApplicant.id);
    return (
      <VASProviderForm
        data={vasData}
        onChange={(fields) =>
          updateActiveApplicant({
            vasData: { ...vasData, ...fields },
            firstName: fields.businessName !== undefined ? fields.businessName : activeApplicant.firstName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // 6. NTC 1-21: Copy of Certificates
  if (serviceCode === "NTC_1_21" || serviceTitle.includes("COPY OF CERTIFICATES") || serviceTitle.includes("COPY OF LICENSES")) {
    const copyData = activeApplicant.copyOfCertData || initialCopyOfCertificateData(activeApplicant.id);
    return (
      <CopyOfCertificateForm
        data={copyData}
        onChange={(fields) =>
          updateActiveApplicant({
            copyOfCertData: { ...copyData, ...fields },
            firstName: fields.applicantName !== undefined ? fields.applicantName : activeApplicant.firstName,
            email: fields.email !== undefined ? fields.email : activeApplicant.email,
            contactNo: fields.contactNo !== undefined ? fields.contactNo : activeApplicant.contactNo,
            address: fields.address !== undefined ? fields.address : activeApplicant.address,
          })
        }
      />
    );
  }

  // Default Generic Form
  return (
    <View>
      <ValidatedInput
        label="First Name"
        value={activeApplicant.firstName}
        onChangeText={(text) => updateActiveApplicant({ firstName: text })}
        required
      />
      <ValidatedInput
        label="Last Name"
        value={activeApplicant.lastName}
        onChangeText={(text) => updateActiveApplicant({ lastName: text })}
        required
      />
      <ValidatedInput
        label="Email Address"
        value={activeApplicant.email}
        onChangeText={(text) => updateActiveApplicant({ email: text })}
        keyboardType="email-address"
        required
      />
      <ValidatedInput
        label="Contact Number"
        value={activeApplicant.contactNo}
        onChangeText={(text) => updateActiveApplicant({ contactNo: text })}
        keyboardType="phone-pad"
        required
      />
      <ValidatedInput
        label="Physical Address"
        value={activeApplicant.address}
        onChangeText={(text) => updateActiveApplicant({ address: text })}
      />

      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[700], marginTop: 16, marginBottom: 8 }}>Birth Date</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 2 }}>
          <Select
            placeholder="Month"
            value={activeApplicant.birthMonth}
            onValueChange={(val) => updateActiveApplicant({ birthMonth: val })}
            options={months.map((m) => ({ label: m, value: m }))}
          />
        </View>
        <View style={{ flex: 1.2 }}>
          <Select
            placeholder="Day"
            value={activeApplicant.birthDay}
            onValueChange={(val) => updateActiveApplicant({ birthDay: val })}
            options={days.map((d) => ({ label: d, value: d }))}
          />
        </View>
        <View style={{ flex: 1.5 }}>
          <Select
            placeholder="Year"
            value={activeApplicant.birthYear}
            onValueChange={(val) => updateActiveApplicant({ birthYear: val })}
            options={years.map((y) => ({ label: y, value: y }))}
          />
        </View>
      </View>

      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[700], marginTop: 20, marginBottom: 8 }}>Filing Notes / Special Concerns</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: COLORS.neutral[300],
          borderRadius: 8,
          padding: 12,
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 14,
          backgroundColor: COLORS.neutral.white,
          minHeight: 80,
          textAlignVertical: "top",
        }}
        placeholder="Provide specifications or support queries here..."
        multiline
        value={activeApplicant.notes}
        onChangeText={(text) => updateActiveApplicant({ notes: text })}
      />
    </View>
  );
}
