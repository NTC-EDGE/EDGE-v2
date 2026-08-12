import React from "react";
import { View, Text } from "react-native";
import { Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { DatePickerInput } from "../../../../shared/components/DatePickerInput";
import { LifetimeAmateurLicenseData } from "../types/licenseTypes";
import { licenseStyles } from "./LicenseFormStyles";

interface LifetimeAmateurLicenseFormProps {
  data: LifetimeAmateurLicenseData;
  onChange: (fields: Partial<LifetimeAmateurLicenseData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

export function LifetimeAmateurLicenseForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: LifetimeAmateurLicenseFormProps) {
  return (
    <View style={licenseStyles.container}>
      {/* Overview Notice */}
      <View style={licenseStyles.requirementsCard}>
        <Text style={licenseStyles.requirementsTitle}>
          Lifetime Amateur Radio Station License (Class A) Eligibility & Requirements
        </Text>
        <Text style={{ fontFamily: "System", fontSize: 12, color: "#78350F", marginBottom: 10, lineHeight: 17 }}>
          Pursuant to NTC Regulations, Class A Radio Amateurs who are at least 60 years of age and have rendered at least fifteen (15) consecutive years of active amateur service are eligible to apply for a Lifetime Radio Station License.
        </Text>

        <View style={licenseStyles.requirementItem}>
          <Icon name="check-circle" size={14} color="#D97706" />
          <Text style={licenseStyles.requirementItemText}>
            Letter request for Issuance of a Lifetime Radio Station License.
          </Text>
        </View>
        <View style={licenseStyles.requirementItem}>
          <Icon name="check-circle" size={14} color="#D97706" />
          <Text style={licenseStyles.requirementItemText}>
            Certificate of Good Standing as a Member from an NTC-registered amateur club/association.*
          </Text>
        </View>
        <View style={licenseStyles.requirementItem}>
          <Icon name="check-circle" size={14} color="#D97706" />
          <Text style={licenseStyles.requirementItemText}>
            Valid Government ID (Birth Certificate / Passport / PRC License / Driver's License).*
            {"\n"}<Text style={{ fontWeight: "700" }}>Note 1:</Text> Show Original upon inspection. <Text style={{ fontWeight: "700" }}>Note 2:</Text> Applicant must be at least 60 years of age.
          </Text>
        </View>
        <View style={licenseStyles.requirementItem}>
          <Icon name="check-circle" size={14} color="#D97706" />
          <Text style={licenseStyles.requirementItemText}>
            Valid Amateur Class 'A' Radio Station License.*
          </Text>
        </View>
        <View style={licenseStyles.requirementItem}>
          <Icon name="check-circle" size={14} color="#D97706" />
          <Text style={licenseStyles.requirementItemText}>
            Proof of active amateur service of at least fifteen (15) consecutive years.*
          </Text>
        </View>
        <View style={licenseStyles.requirementItem}>
          <Icon name="check-circle" size={14} color="#D97706" />
          <Text style={licenseStyles.requirementItemText}>
            Clear 1x1 ID picture taken within the last six (6) months.*
          </Text>
        </View>
      </View>

      {/* Section 1: Basic Information */}
      <View style={licenseStyles.formSection}>
        <Text style={licenseStyles.formSectionHeading}>1. Applicant Information (Class A Amateur)</Text>
        <View style={licenseStyles.formGrid}>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="First Name"
              placeholder="e.g. Maria"
              value={data.firstName}
              onChangeText={(val) => onChange({ firstName: val })}
              error={errors.firstName}
              touched={touched.firstName}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Last Name"
              placeholder="e.g. Santos"
              value={data.lastName}
              onChangeText={(val) => onChange({ lastName: val })}
              error={errors.lastName}
              touched={touched.lastName}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Middle Name"
              placeholder="e.g. Reyes"
              value={data.middleName}
              onChangeText={(val) => onChange({ middleName: val })}
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Suffix"
              placeholder="e.g. Jr., III (Optional)"
              value={data.suffix}
              onChangeText={(val) => onChange({ suffix: val })}
            />
          </View>

          <View style={licenseStyles.formCol12}>
            <Text style={licenseStyles.selectLabel}>Date of Birth* (Applicant must be at least 60 years old)</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 2 }}>
                <Select
                  placeholder="Month"
                  value={data.birthMonth}
                  onValueChange={(val) => onChange({ birthMonth: val })}
                  options={months.map((m) => ({ label: m, value: m }))}
                />
              </View>
              <View style={{ flex: 1.2 }}>
                <Select
                  placeholder="Day"
                  value={data.birthDay}
                  onValueChange={(val) => onChange({ birthDay: val })}
                  options={days.map((d) => ({ label: d, value: d }))}
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Select
                  placeholder="Year"
                  value={data.birthYear}
                  onValueChange={(val) => onChange({ birthYear: val })}
                  options={years.map((y) => ({ label: y, value: y }))}
                />
              </View>
            </View>
          </View>

          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Contact Number"
              placeholder="e.g. 09181234567"
              value={data.contactNo}
              onChangeText={(val) => onChange({ contactNo: val })}
              error={errors.contactNo}
              touched={touched.contactNo}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Email Address"
              placeholder="e.g. amateur@domain.com"
              value={data.email}
              onChangeText={(val) => onChange({ email: val })}
              error={errors.email}
              touched={touched.email}
              required
            />
          </View>

          <View style={licenseStyles.formCol12}>
            <ValidatedInput
              label="Permanent Address"
              placeholder="House/Unit No., Street, Barangay, City/Municipality, Province"
              value={data.address}
              onChangeText={(val) => onChange({ address: val })}
              error={errors.address}
              touched={touched.address}
              required
            />
          </View>

          <View style={licenseStyles.formCol12}>
            <ValidatedInput
              label="Station Installation Location"
              placeholder="Exact physical address of Class A Station"
              value={data.location}
              onChangeText={(val) => onChange({ location: val })}
              error={errors.location}
              touched={touched.location}
              required
            />
          </View>
        </View>
      </View>

      {/* Section 2: Class A Credentials & Amateur Service History */}
      <View style={licenseStyles.formSection}>
        <Text style={licenseStyles.formSectionHeading}>2. Class A Credentials & Service History</Text>
        <View style={licenseStyles.formGrid}>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Class A Call Sign*"
              placeholder="e.g. DU1AAA"
              value={data.callSign}
              onChangeText={(val) => onChange({ callSign: val })}
              error={errors.callSign}
              touched={touched.callSign}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Years of Consecutive Service*"
              placeholder="e.g. 15 (Minimum 15 years required)"
              value={data.yearsOfAmateurService}
              onChangeText={(val) => onChange({ yearsOfAmateurService: val })}
              keyboardType="number-pad"
              error={errors.yearsOfAmateurService}
              touched={touched.yearsOfAmateurService}
              required
            />
          </View>

          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Existing Class A License No.*"
              placeholder="e.g. ARSL-A-2015-0987"
              value={data.existingClassALicenseNo}
              onChangeText={(val) => onChange({ existingClassALicenseNo: val })}
              error={errors.existingClassALicenseNo}
              touched={touched.existingClassALicenseNo}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <DatePickerInput
              label="License Date of Expiry"
              placeholder="MM/DD/YYYY"
              value={data.licenseExpiryDate}
              onChangeText={(val) => onChange({ licenseExpiryDate: val })}
            />
          </View>

          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="NTC-Registered Amateur Club / Association*"
              placeholder="e.g. Philippine Amateur Radio Association (PARA)"
              value={data.memberClubName}
              onChangeText={(val) => onChange({ memberClubName: val })}
              error={errors.memberClubName}
              touched={touched.memberClubName}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Cert. of Good Standing Control No.*"
              placeholder="e.g. CGS-2026-0042"
              value={data.certOfGoodStandingNo}
              onChangeText={(val) => onChange({ certOfGoodStandingNo: val })}
              error={errors.certOfGoodStandingNo}
              touched={touched.certOfGoodStandingNo}
              required
            />
          </View>
        </View>
      </View>
    </View>
  );
}
