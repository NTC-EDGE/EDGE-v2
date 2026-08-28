import React from "react";
import { View, Text } from "react-native";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { CopyOfCertificateData } from "../types/certificateTypes";
import { certStyles } from "./CertificateFormStyles";
import { useCertificateServicesQuery } from "../hooks/useCertificateServicesQuery";

export const CERTIFICATE_SERVICES_OPTIONS = [
  { label: "Radio Operator Certificates (ROC) excluding Amateur ROC", value: "Radio Operator Certificates (ROC) excluding Amateur ROC" },
  { label: "Certificates in the Amateur Service", value: "Certificates in the Amateur Service" },
  { label: "Certificate of Registration for RFID, SRD, WDN, Devices- Indoor", value: "Certificate of Registration for RFID, SRD, WDN, Devices- Indoor" },
  { label: "Certificate of Registration as a Value-Added Service (VAS) Provider", value: "Certificate of Registration as a Value-Added Service (VAS) Provider" },
  { label: "TVRO Registration Certificate", value: "TVRO Registration Certificate" },
];

export const CERTIFICATE_TYPES_BY_SERVICE: Record<string, Array<{ label: string; value: string }>> = {
  "Radio Operator Certificates (ROC) excluding Amateur ROC": [
    { label: "First Class Radiotelegraph Operator (1RTG)", value: "1RTG" },
    { label: "Second Class Radiotelegraph Operator (2RTG)", value: "2RTG" },
    { label: "Third Class Radiotelegraph Operator (3RTG)", value: "3RTG" },
    { label: "First Class Radiotelephone Operator (1PHN)", value: "1PHN" },
    { label: "Second Class Radiotelephone Operator (2PHN)", value: "2PHN" },
    { label: "Third Class Radiotelephone Operator (3PHN)", value: "3PHN" },
    { label: "Special Radio Operator (SROP)", value: "SROP" },
    { label: "Restricted Radiotelephone Operator - Land Mobile (RROC-Land Mobile)", value: "RROC-Land Mobile" },
    { label: "Restricted Radiotelephone Operator - Aircraft (RROC-Aircraft)", value: "RROC-Aircraft" },
    { label: "General Radio Operator Certificate (GROC)", value: "GROC" },
    { label: "Temporary Permit RROC-Aircraft (TP RROC-Aircraft)", value: "TP RROC-Aircraft" },
    { label: "Other Commercial Radio Operator", value: "Other" },
  ],
  "Certificates in the Amateur Service": [
    { label: "Amateur Radio Operator Certificate - Class A", value: "Class A" },
    { label: "Amateur Radio Operator Certificate - Class B", value: "Class B" },
    { label: "Amateur Radio Operator Certificate - Class C", value: "Class C" },
    { label: "Amateur Radio Operator Certificate - Class D (Foundation)", value: "Class D" },
    { label: "Lifetime Amateur Radio Station Supplementary Certificate", value: "Lifetime Supplementary Certificate" },
  ],
  "Certificate of Registration for RFID, SRD, WDN, Devices- Indoor": [
    { label: "Wireless Data Network (WDN) Devices - Indoor", value: "Wireless Data Network (WDN) Devices - Indoor" },
    { label: "Wireless Data Network (WDN) Devices - Outdoor", value: "Wireless Data Network (WDN) Devices - Outdoor" },
    { label: "Short Range Devices (SRD)", value: "Short Range Devices (SRD)" },
    { label: "Radio Frequency Identification (RFID) Devices", value: "Radio Frequency Identification (RFID) Devices" },
    { label: "Bluetooth / Wi-Fi Access Points", value: "Bluetooth / Wi-Fi Access Points" },
    { label: "Short Range Radio Services", value: "Short Range Radio Services" },
    { label: "For Dealers", value: "For Dealers" },
    { label: "For Non-Dealers", value: "For Non-Dealers" },
  ],
  "Certificate of Registration as a Value-Added Service (VAS) Provider": [
    { label: "VALUE-ADDED SERVICE (VAS) PROVIDER", value: "VALUE-ADDED SERVICE (VAS) PROVIDER" },
    { label: "PUBLIC CALLING STATION/OFFICE/TELECENTER SERVICE PROVIDER (PCSOTSP)", value: "PUBLIC CALLING STATION/OFFICE/TELECENTER SERVICE PROVIDER (PCSOTSP)" },
    { label: "RESELLER", value: "RESELLER" },
    { label: "VOICE OVER INTERNET PROTOCOL (VOIP) PROVIDER", value: "VOICE OVER INTERNET PROTOCOL (VOIP) PROVIDER" },
    { label: "Others", value: "Others" },
  ],
  "TVRO Registration Certificate": [
    { label: "Commercial TVRO Registration", value: "Commercial" },
    { label: "Non-Commercial TVRO Registration", value: "Non-Commercial" },
    { label: "CATV Station Registration", value: "CATV" },
  ],
};

export function resolveCertificateTypes(serviceName?: string): Array<{ label: string; value: string }> {
  if (!serviceName) return CERTIFICATE_TYPES_BY_SERVICE["Radio Operator Certificates (ROC) excluding Amateur ROC"] || [];
  const sLower = serviceName.toLowerCase();
  if (sLower.includes("radio operator") || sLower.includes("roc")) {
    return CERTIFICATE_TYPES_BY_SERVICE["Radio Operator Certificates (ROC) excluding Amateur ROC"] || [];
  }
  if (sLower.includes("amateur")) {
    return CERTIFICATE_TYPES_BY_SERVICE["Certificates in the Amateur Service"] || [];
  }
  if (sLower.includes("rfid") || sLower.includes("srd") || sLower.includes("wdn")) {
    return CERTIFICATE_TYPES_BY_SERVICE["Certificate of Registration for RFID, SRD, WDN, Devices- Indoor"] || [];
  }
  if (sLower.includes("vas") || sLower.includes("value-added") || sLower.includes("value added")) {
    return CERTIFICATE_TYPES_BY_SERVICE["Certificate of Registration as a Value-Added Service (VAS) Provider"] || [];
  }
  if (sLower.includes("tvro") || sLower.includes("catv")) {
    return CERTIFICATE_TYPES_BY_SERVICE["TVRO Registration Certificate"] || [];
  }
  return CERTIFICATE_TYPES_BY_SERVICE[serviceName] || Object.values(CERTIFICATE_TYPES_BY_SERVICE)[0] || [];
}

interface CopyOfCertificateFormProps {
  data: CopyOfCertificateData;
  onChange: (fields: Partial<CopyOfCertificateData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

export function CopyOfCertificateForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: CopyOfCertificateFormProps) {
  const { serviceOptions, getTypesForService } = useCertificateServicesQuery();
  const isDuplicate = data.copyType === "DUPLICATE";
  const currentService = data.targetService || serviceOptions[0]?.value || "";
  const typeOptions = getTypesForService(currentService);

  return (
    <View style={certStyles.container}>
      {/* Request Classification */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Request Classification</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol12}>
            <Text style={certStyles.selectLabel}>Type of Copy*</Text>
            <Select
              value={data.copyType}
              onValueChange={(val) => {
                const nextCopyType = val === "DUPLICATE" ? "DUPLICATE" : "CERTIFIED_TRUE_COPY";
                onChange({ copyType: nextCopyType });
              }}
              options={[
                { label: "Certified True Copy", value: "CERTIFIED_TRUE_COPY" },
                { label: "Duplicate Copy (Lost/Damaged)", value: "DUPLICATE" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Certificate Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>
          {isDuplicate ? "Duplicate Copy Details" : "Certified True Copy Details"}
        </Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Service*</Text>
            <Select
              value={data.targetService || (serviceOptions[0]?.value ?? "")}
              onValueChange={(val) => {
                const availableTypes = getTypesForService(val);
                onChange({
                  targetService: val,
                  targetCertificateType: availableTypes[0]?.value || "",
                });
              }}
              options={serviceOptions}
              placeholder="Select Certificate Service..."
            />
          </View>

          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Type*</Text>
            <Select
              value={data.targetCertificateType || (typeOptions[0]?.value ?? "")}
              onValueChange={(val) => onChange({ targetCertificateType: val })}
              options={typeOptions}
              placeholder={typeOptions.length === 0 ? "Select Service first..." : "Select Certificate Type..."}
            />
          </View>

          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Certificate Number"
              placeholder="e.g. ROC-2021-9982"
              value={data.certificateNo}
              onChangeText={(val) => onChange({ certificateNo: val })}
              error={errors.certificateNo}
              touched={touched.certificateNo}
              required
            />
          </View>

          {!isDuplicate && (
            <View style={certStyles.formCol6}>
              <Text style={certStyles.selectLabel}>No. of Copies*</Text>
              <Select
                value={data.numberOfCopies || "1"}
                onValueChange={(val) => onChange({ numberOfCopies: val })}
                options={[
                  { label: "1 Copy", value: "1" },
                  { label: "2 Copies", value: "2" },
                  { label: "3 Copies", value: "3" },
                  { label: "4 Copies", value: "4" },
                  { label: "5 Copies", value: "5" },
                  { label: "10 Copies", value: "10" },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      {/* Duplicate Copy: Applicant Details */}
      {isDuplicate && (
        <View style={certStyles.formSection}>
          <Text style={certStyles.formSectionHeading}>Applicant Information</Text>
          <View style={certStyles.formGrid}>
            <View style={certStyles.formCol12}>
              <ValidatedInput
                label="Full Name / Applicant Name"
                placeholder="Full legal name of certificate holder"
                value={data.applicantName}
                onChangeText={(val) => onChange({ applicantName: val })}
                error={errors.applicantName}
                touched={touched.applicantName}
                required
              />
            </View>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Contact Number"
                placeholder="09171234567"
                value={data.contactNo}
                keyboardType="phone-pad"
                maxLength={13}
                onChangeText={(val) => onChange({ contactNo: val })}
                error={errors.contactNo}
                touched={touched.contactNo}
                required
              />
            </View>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Email Address"
                placeholder="holder@domain.com"
                value={data.email}
                onChangeText={(val) => onChange({ email: val })}
                error={errors.email}
                touched={touched.email}
                required
              />
            </View>
            <View style={certStyles.formCol12}>
              <ValidatedInput
                label="Complete Address"
                placeholder="Building, Street, Barangay, City, Province"
                value={data.address}
                onChangeText={(val) => onChange({ address: val })}
                error={errors.address}
                touched={touched.address}
                required
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
