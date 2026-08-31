import React from "react";
import { View, Text } from "react-native";
import { Select } from "../../../../../../shared/components/Select";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
import { DatePickerInput } from "../../../../../../shared/components/DatePickerInput";
import { FormSignatureInput } from "../../../../../../shared/components/FormSignatureInput";
import { ApplicantData } from "../../types/cpeTypes";
import { certStyles } from "../../../../certificates/forms/CertificateFormStyles";

interface CPEStep5ApplicationFormProps {
  activeApplicant: ApplicantData;
  updateActiveApplicant: (fields: Partial<ApplicantData>) => void;
  handleFieldChange: (field: keyof ApplicantData, value: string) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleScrollToSection?: (offset: number) => void;
  styles?: any;
  appMode?: "SINGLE" | "BULK" | "";
}

export function CPEStep5ApplicationForm({
  activeApplicant,
  updateActiveApplicant,
  handleFieldChange,
  errors,
  touched,
  appMode,
}: CPEStep5ApplicationFormProps) {
  const isRenewalOrMod = activeApplicant.appType === "RENEWAL" || activeApplicant.appType === "MODIFICATION";

  return (
    <View style={certStyles.container}>
      {/* Section 1: Accreditation Profile */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>1. Accreditation Profile & Scope</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Application Type*</Text>
            <Select
              value={activeApplicant.appType || "NEW"}
              onValueChange={(val) => updateActiveApplicant({ appType: val as any })}
              options={[
                { label: "New Accreditation", value: "NEW" },
                { label: "Renewal of Accreditation", value: "RENEWAL" },
                { label: "Modification of Scope", value: "MODIFICATION" },
              ]}
            />
          </View>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Number of Years*</Text>
            <Select
              value={activeApplicant.years || "1"}
              onValueChange={(val) => updateActiveApplicant({ years: val })}
              options={[
                { label: "1 Year", value: "1" },
                { label: "3 Years", value: "3" },
              ]}
            />
          </View>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Equipment Variation*</Text>
            <Select
              value={activeApplicant.variation || "Mobile"}
              onValueChange={(val) => updateActiveApplicant({ variation: val })}
              options={[
                { label: "Mobile CPE Supplier", value: "Mobile" },
                { label: "Non-Mobile / Fixed Premises", value: "Non-Mobile" },
              ]}
            />
          </View>

          {isRenewalOrMod && (
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Existing Accreditation No."
                placeholder="e.g. CPE-2023-00481"
                value={activeApplicant.accreditationNo}
                onChangeText={(val) => handleFieldChange("accreditationNo", val)}
                error={errors.accreditationNo}
                touched={touched.accreditationNo}
                required
              />
            </View>
          )}
        </View>
      </View>

      {/* Section 2: Applicant Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>2. Applicant Details</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Business / Registered Entity Name"
              placeholder="e.g. Acme Communications Philippines Corp."
              value={activeApplicant.businessName}
              onChangeText={(val) => handleFieldChange("businessName", val)}
              error={errors.businessName}
              touched={touched.businessName}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Entity Type*</Text>
            <Select
              value={activeApplicant.entityType || "Corporation"}
              onValueChange={(val) => updateActiveApplicant({ entityType: val })}
              options={[
                { label: "Corporation", value: "Corporation" },
                { label: "Single Proprietorship", value: "Single Proprietorship" },
                { label: "Partnership", value: "Partnership" },
                { label: "Others", value: "Others" },
              ]}
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="SEC/DTI Registration Number"
              placeholder="Registration Number"
              value={activeApplicant.dtiNo}
              onChangeText={(val) => handleFieldChange("dtiNo", val)}
              error={errors.dtiNo}
              touched={touched.dtiNo}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Contact Number"
              placeholder="09171234567"
              value={activeApplicant.contactNo}
              onChangeText={(val) => handleFieldChange("contactNo", val)}
              error={errors.contactNo}
              touched={touched.contactNo}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Email Address"
              placeholder="regulatory@domain.com"
              value={activeApplicant.email}
              onChangeText={(val) => handleFieldChange("email", val)}
              error={errors.email}
              touched={touched.email}
              required
            />
          </View>
        </View>
      </View>

      {/* Section 3: Technical Personnel */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>3. Technical Personnel</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Name"
              placeholder="Full Name"
              value={activeApplicant.technicianName || activeApplicant.engineerName || ""}
              onChangeText={(val) => {
                handleFieldChange("technicianName", val);
                handleFieldChange("engineerName", val);
              }}
              error={errors.technicianName}
              touched={touched.technicianName}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Certificate/ECT No."
              placeholder="Certificate / ECT Number"
              value={activeApplicant.ectNo || activeApplicant.eceNo || ""}
              onChangeText={(val) => {
                handleFieldChange("ectNo", val);
                handleFieldChange("eceNo", val);
              }}
              error={errors.ectNo}
              touched={touched.ectNo}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <DatePickerInput
              label="Certificate/ECT No. Date of Expiry"
              placeholder="MM/DD/YYYY"
              value={activeApplicant.expiryDate || ""}
              onChangeText={(val) => handleFieldChange("expiryDate", val)}
              error={errors.expiryDate}
              touched={touched.expiryDate}
              required
            />
          </View>
        </View>
      </View>

      {/* Section 4: Acknowledgement & Applicant Signature */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>4. Acknowledgement & Applicant Signature</Text>
        <FormSignatureInput
          label="Applicant / Authorized Representative Signature"
          isRequired={true}
          value={activeApplicant.signature || ""}
          onChange={(sig) => updateActiveApplicant({ signature: sig })}
          applicantName={activeApplicant.businessName || activeApplicant.engineerName}
          isBulk={appMode === "BULK"}
          appMode={appMode}
          error={errors.signature}
        />
      </View>
    </View>
  );
}
