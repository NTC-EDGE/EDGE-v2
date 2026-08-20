import React from "react";
import { View, Text } from "react-native";
import { Select } from "../../../../../../shared/components/Select";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
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
            <Text style={certStyles.selectLabel}>Validity Period (No. of Years)*</Text>
            <Select
              value={activeApplicant.years || "1"}
              onValueChange={(val) => updateActiveApplicant({ years: val })}
              options={[
                { label: "1 Year", value: "1" },
                { label: "2 Years", value: "2" },
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

      {/* Section 2: Business & Applicant Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>2. Applicant & Entity Information</Text>
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
            <Text style={certStyles.selectLabel}>Business Entity Type*</Text>
            <Select
              value={activeApplicant.entityType || "Corporation"}
              onValueChange={(val) => updateActiveApplicant({ entityType: val })}
              options={[
                { label: "Corporation", value: "Corporation" },
                { label: "Partnership", value: "Partnership" },
                { label: "Single Proprietorship", value: "Single Proprietorship" },
                { label: "Others", value: "Others" },
              ]}
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="DTI / SEC Registration No."
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

      {/* Section 3: Physical Address */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>3. Registered Office Physical Address</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Unit / Bldg No."
              placeholder="Unit / Floor / Building"
              value={activeApplicant.unitBldgNo}
              onChangeText={(val) => handleFieldChange("unitBldgNo", val)}
              error={errors.unitBldgNo}
              touched={touched.unitBldgNo}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Street / Zone"
              placeholder="Street / Zone"
              value={activeApplicant.street}
              onChangeText={(val) => handleFieldChange("street", val)}
              error={errors.street}
              touched={touched.street}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Barangay"
              placeholder="Barangay"
              value={activeApplicant.barangay}
              onChangeText={(val) => handleFieldChange("barangay", val)}
              error={errors.barangay}
              touched={touched.barangay}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="City / Municipality"
              placeholder="City / Municipality"
              value={activeApplicant.city}
              onChangeText={(val) => handleFieldChange("city", val)}
              error={errors.city}
              touched={touched.city}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Province"
              placeholder="Province"
              value={activeApplicant.province}
              onChangeText={(val) => handleFieldChange("province", val)}
              error={errors.province}
              touched={touched.province}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Zip Code"
              placeholder="e.g. 1101"
              value={activeApplicant.zipCode}
              onChangeText={(val) => handleFieldChange("zipCode", val)}
              error={errors.zipCode}
              touched={touched.zipCode}
              required
            />
          </View>
        </View>
      </View>

      {/* Section 4: Licensed Technical Personnel */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>4. Licensed Technical Personnel</Text>
        
        {/* Supervising Engineer */}
        <View style={certStyles.cardRepeater}>
          <Text style={certStyles.repeaterTitle}>Supervising Engineer</Text>
          <View style={[certStyles.formGrid, { marginTop: 8 }]}>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Full Name"
                placeholder="Engr. Full Name"
                value={activeApplicant.engineerName}
                onChangeText={(val) => handleFieldChange("engineerName", val)}
                error={errors.engineerName}
                touched={touched.engineerName}
                required
              />
            </View>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="ECE / PECE License No."
                placeholder="e.g. PECE-0012948"
                value={activeApplicant.eceNo}
                onChangeText={(val) => handleFieldChange("eceNo", val)}
                error={errors.eceNo}
                touched={touched.eceNo}
                required
              />
            </View>
          </View>
        </View>

        {/* Radio Technician */}
        <View style={[certStyles.cardRepeater, { marginTop: 12 }]}>
          <Text style={certStyles.repeaterTitle}>Radio Technician</Text>
          <View style={[certStyles.formGrid, { marginTop: 8 }]}>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Full Name"
                placeholder="Technician Full Name"
                value={activeApplicant.technicianName}
                onChangeText={(val) => handleFieldChange("technicianName", val)}
                error={errors.technicianName}
                touched={touched.technicianName}
                required
              />
            </View>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="RCT / ECT License No."
                placeholder="e.g. ECT-009812"
                value={activeApplicant.ectNo}
                onChangeText={(val) => handleFieldChange("ectNo", val)}
                error={errors.ectNo}
                touched={touched.ectNo}
                required
              />
            </View>
          </View>
        </View>
      </View>

      {/* Section 5: Target Expiration Date */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>5. Requested Expiration Date</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol4}>
            <Text style={certStyles.selectLabel}>Month</Text>
            <Select
              value={activeApplicant.expiryMonth || "January"}
              onValueChange={(val) => updateActiveApplicant({ expiryMonth: val })}
              options={[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((m) => ({ label: m, value: m }))}
            />
          </View>
          <View style={certStyles.formCol4}>
            <Text style={certStyles.selectLabel}>Day</Text>
            <Select
              value={activeApplicant.expiryDate || "1"}
              onValueChange={(val) => updateActiveApplicant({ expiryDate: val })}
              options={Array.from({ length: 31 }, (_, i) => ({
                label: (i + 1).toString(),
                value: (i + 1).toString(),
              }))}
            />
          </View>
          <View style={certStyles.formCol4}>
            <Text style={certStyles.selectLabel}>Year</Text>
            <Select
              value={activeApplicant.expiryYear || "2026"}
              onValueChange={(val) => updateActiveApplicant({ expiryYear: val })}
              options={[
                { label: "2026", value: "2026" },
                { label: "2027", value: "2027" },
                { label: "2028", value: "2028" },
                { label: "2029", value: "2029" },
                { label: "2030", value: "2030" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Section 6: Acknowledgement & Applicant Signature */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>6. Acknowledgement & Applicant Signature</Text>
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
