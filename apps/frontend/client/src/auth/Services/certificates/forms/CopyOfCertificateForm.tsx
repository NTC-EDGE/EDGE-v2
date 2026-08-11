import React from "react";
import { View, Text } from "react-native";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { CopyOfCertificateData } from "../types/certificateTypes";
import { certStyles } from "./CertificateFormStyles";

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
  const isDuplicate = data.copyType === "DUPLICATE";

  return (
    <View style={certStyles.container}>
      {/* Request Type */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Request Classification</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Type of Copy*</Text>
            <Select
              value={data.copyType}
              onValueChange={(val) => onChange({ copyType: val as any })}
              options={[
                { label: "Certified True Copy", value: "CERTIFIED_TRUE_COPY" },
                { label: "Duplicate Copy (Lost/Damaged)", value: "DUPLICATE" },
              ]}
            />
          </View>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Target Certificate Service*</Text>
            <Select
              value={data.targetService}
              onValueChange={(val) => onChange({ targetService: val })}
              options={[
                { label: "Radio Operator Certificates (ROC)", value: "Radio Operator Certificates (ROC)" },
                { label: "Certificates in the Amateur Service", value: "Certificates in the Amateur Service" },
                { label: "TVRO Registration Certificate", value: "TVRO Registration Certificate" },
                { label: "Value-Added Service (VAS) Provider", value: "Value-Added Service (VAS) Provider" },
                { label: "RFID, SRD, WDN Devices Certificate", value: "RFID, SRD, WDN Devices Certificate" },
              ]}
            />
          </View>

          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Original Certificate Number"
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
              <Text style={certStyles.selectLabel}>Number of Copies*</Text>
              <Select
                value={data.numberOfCopies}
                onValueChange={(val) => onChange({ numberOfCopies: val })}
                options={[
                  { label: "1 Copy", value: "1" },
                  { label: "2 Copies", value: "2" },
                  { label: "3 Copies", value: "3" },
                  { label: "5 Copies", value: "5" },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      {/* Duplicate Copy: Applicant & Circumstances */}
      {isDuplicate && (
        <View style={certStyles.formSection}>
          <Text style={certStyles.formSectionHeading}>Applicant & Circumstances of Loss</Text>
          <View style={certStyles.formGrid}>
            <View style={certStyles.formCol12}>
              <ValidatedInput
                label="Applicant / Business Name"
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
                label="Address"
                placeholder="Complete address"
                value={data.address}
                onChangeText={(val) => onChange({ address: val })}
                error={errors.address}
                touched={touched.address}
                required
              />
            </View>
            <View style={certStyles.formCol12}>
              <ValidatedInput
                label="Circumstances of Loss / Damage"
                placeholder="Describe how the original certificate was lost, destroyed, or mutilated"
                value={data.circumstancesOfLoss}
                onChangeText={(val) => onChange({ circumstancesOfLoss: val })}
                error={errors.circumstancesOfLoss}
                touched={touched.circumstancesOfLoss}
                required
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
