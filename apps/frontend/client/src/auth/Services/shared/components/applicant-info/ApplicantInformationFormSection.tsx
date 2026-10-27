import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { ValidatedInput } from "../../../../../shared/components/ValidatedInput";
import { Select } from "../../../../../shared/components/Select";
import { FormGrid, FormCol } from "../../../../../shared/components/FormGrid";
import { useLocationData } from "../../../../../shared/components/dynamic-form/useLocationData";
import { FormSignatureInput } from "../../../../../shared/components/FormSignatureInput";
import { GeneralApplicantData } from "../../hooks/useGeneralServiceWizard";

export interface ApplicantInformationFormSectionProps {
  applicant: GeneralApplicantData;
  onChange: (fields: Partial<GeneralApplicantData>) => void;
  allowCompany?: boolean;
  isExamService?: boolean;
  includeSignature?: boolean;
  errors?: Record<string, string>;
  title?: string;
}

const SUFFIX_OPTIONS = [
  { label: "None", value: "" },
  { label: "Jr.", value: "Jr." },
  { label: "Sr.", value: "Sr." },
  { label: "II", value: "II" },
  { label: "III", value: "III" },
  { label: "IV", value: "IV" },
  { label: "V", value: "V" },
];

const SEX_OPTIONS = [
  { label: "Select Sex...", value: "" },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const CIVIL_STATUS_OPTIONS = [
  { label: "Select Civil Status...", value: "" },
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
  { label: "Widowed", value: "Widowed" },
  { label: "Separated", value: "Separated" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function ApplicantInformationFormSection({
  applicant,
  onChange,
  allowCompany = true,
  isExamService = false,
  includeSignature = true,
  errors = {},
  title = "Applicant Details",
}: ApplicantInformationFormSectionProps) {
  const isCompany = applicant.applicantType === "company";

  // Cascading Philippine Locations
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>();
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | undefined>();
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | undefined>();

  const { regions, provinces, municipalities, barangays } = useLocationData(
    selectedRegionId,
    selectedProvinceId,
    selectedMunicipalityId
  );

  // Auto-sync location IDs from existing values on load
  useEffect(() => {
    if (applicant.region && regions.length > 0 && !selectedRegionId) {
      const match = regions.find((r) => r.name.toLowerCase() === applicant.region?.toLowerCase() || r.id === applicant.region);
      if (match) setSelectedRegionId(match.id);
    }
  }, [applicant.region, regions, selectedRegionId]);

  useEffect(() => {
    if (applicant.province && provinces.length > 0 && !selectedProvinceId) {
      const match = provinces.find((p) => p.name.toLowerCase() === applicant.province?.toLowerCase() || p.id === applicant.province);
      if (match) setSelectedProvinceId(match.id);
    }
  }, [applicant.province, provinces, selectedProvinceId]);

  useEffect(() => {
    if (applicant.city && municipalities.length > 0 && !selectedMunicipalityId) {
      const match = municipalities.find((m) => m.name.toLowerCase() === applicant.city?.toLowerCase() || m.id === applicant.city);
      if (match) setSelectedMunicipalityId(match.id);
    }
  }, [applicant.city, municipalities, selectedMunicipalityId]);

  // Auto-sync representative name parts from existing representativeName if present
  useEffect(() => {
    if (isCompany && applicant.representativeName && !applicant.representativeFirstName && !applicant.representativeLastName) {
      const parts = applicant.representativeName.trim().split(/\s+/);
      if (parts.length === 1) {
        onChange({ representativeFirstName: parts[0] });
      } else if (parts.length === 2) {
        onChange({ representativeFirstName: parts[0], representativeLastName: parts[1] });
      } else if (parts.length >= 3) {
        onChange({
          representativeFirstName: parts[0],
          representativeMiddleName: parts.slice(1, -1).join(" "),
          representativeLastName: parts[parts.length - 1],
        });
      }
    }
  }, [isCompany, applicant.representativeName, applicant.representativeFirstName, applicant.representativeLastName, onChange]);

  const regionOptions = regions.map((r) => ({ label: r.name, value: r.name }));
  const provinceOptions = provinces.map((p) => ({ label: p.name, value: p.name }));
  const municipalityOptions = municipalities.map((m) => ({ label: m.name, value: m.name }));
  const barangayOptions = barangays.map((b) => ({ label: b.name, value: b.name }));

  const birthMonthOptions = MONTHS.map((m) => ({ label: m, value: m }));
  const birthDayOptions = Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }));
  const currentYear = new Date().getFullYear();
  const birthYearOptions = Array.from({ length: 100 }, (_, i) => ({
    label: `${currentYear - 10 - i}`,
    value: `${currentYear - 10 - i}`,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Icon name={isCompany ? "briefcase" : "user"} size={20} color={COLORS.brand[700]} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionSubtitle}>
              {isCompany
                ? "Official entity, contact details, and authorized representative."
                : "Personal identity, demographic background, and permanent address."}
            </Text>
          </View>
        </View>

        {allowCompany && (
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[styles.toggleBtn, !isCompany && styles.toggleBtnActive]}
              onPress={() => onChange({ applicantType: "individual" })}
              activeOpacity={0.8}
            >
              <Icon name="user" size={14} color={!isCompany ? COLORS.brand[700] : COLORS.neutral[500]} />
              <Text style={[styles.toggleText, !isCompany && styles.toggleTextActive]}>Individual</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, isCompany && styles.toggleBtnActive]}
              onPress={() => onChange({ applicantType: "company" })}
              activeOpacity={0.8}
            >
              <Icon name="briefcase" size={14} color={isCompany ? COLORS.brand[700] : COLORS.neutral[500]} />
              <Text style={[styles.toggleText, isCompany && styles.toggleTextActive]}>Company</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* 1. Identity Particulars */}
      {isCompany ? (
        <>
          <FormGrid>
            <FormCol span={8}>
              <ValidatedInput
                label="Registered Business / Company Name"
                required
                placeholder="e.g. Globe Telecom, Inc."
                value={applicant.companyName || ""}
                error={errors["companyName"]}
                onChangeText={(val) => onChange({ companyName: val })}
              />
            </FormCol>
            <FormCol span={4}>
              <ValidatedInput
                label="SEC / DTI Registration No."
                placeholder="e.g. CS201512345"
                value={applicant.dtiSecRegistration || ""}
                error={errors["dtiSecRegistration"]}
                onChangeText={(val) => onChange({ dtiSecRegistration: val })}
              />
            </FormCol>
          </FormGrid>

          <View style={{ marginTop: 14 }}>
            <Text style={styles.subheading}>Authorized Representative Particulars</Text>
            <FormGrid>
              <FormCol span={3}>
                <ValidatedInput
                  label="First Name"
                  required
                  placeholder="e.g. Juan"
                  value={applicant.representativeFirstName || ""}
                  error={errors["representativeFirstName"]}
                  onChangeText={(val) => {
                    const fullName = [val, applicant.representativeMiddleName, applicant.representativeLastName, applicant.representativeSuffix].filter(Boolean).join(" ");
                    onChange({ representativeFirstName: val, representativeName: fullName });
                  }}
                />
              </FormCol>
              <FormCol span={3}>
                <ValidatedInput
                  label="Middle Name"
                  placeholder="e.g. Protacio"
                  value={applicant.representativeMiddleName || ""}
                  error={errors["representativeMiddleName"]}
                  onChangeText={(val) => {
                    const fullName = [applicant.representativeFirstName, val, applicant.representativeLastName, applicant.representativeSuffix].filter(Boolean).join(" ");
                    onChange({ representativeMiddleName: val, representativeName: fullName });
                  }}
                />
              </FormCol>
              <FormCol span={3}>
                <ValidatedInput
                  label="Last Name"
                  required
                  placeholder="e.g. Dela Cruz"
                  value={applicant.representativeLastName || ""}
                  error={errors["representativeLastName"]}
                  onChangeText={(val) => {
                    const fullName = [applicant.representativeFirstName, applicant.representativeMiddleName, val, applicant.representativeSuffix].filter(Boolean).join(" ");
                    onChange({ representativeLastName: val, representativeName: fullName });
                  }}
                />
              </FormCol>
              <FormCol span={3}>
                <Select
                  label="Suffix"
                  options={SUFFIX_OPTIONS}
                  value={applicant.representativeSuffix || ""}
                  onValueChange={(val) => {
                    const fullName = [applicant.representativeFirstName, applicant.representativeMiddleName, applicant.representativeLastName, val].filter(Boolean).join(" ");
                    onChange({ representativeSuffix: val, representativeName: fullName });
                  }}
                />
              </FormCol>
              <FormCol span={12}>
                <ValidatedInput
                  label="Representative Position / Designation"
                  required
                  placeholder="e.g. Chief Operating Officer / Authorized Liaison Officer"
                  value={applicant.representativePosition || ""}
                  error={errors["representativePosition"]}
                  onChangeText={(val) => onChange({ representativePosition: val })}
                />
              </FormCol>
            </FormGrid>
          </View>
        </>
      ) : (
        <FormGrid>
          <FormCol span={3}>
            <ValidatedInput
              label="First Name"
              required
              placeholder="e.g. Juan"
              value={applicant.firstName || ""}
              error={errors["firstName"]}
              onChangeText={(val) => onChange({ firstName: val })}
            />
          </FormCol>
          <FormCol span={3}>
            <ValidatedInput
              label="Middle Name"
              placeholder="e.g. Protacio"
              value={applicant.middleName || ""}
              error={errors["middleName"]}
              onChangeText={(val) => onChange({ middleName: val })}
            />
          </FormCol>
          <FormCol span={3}>
            <ValidatedInput
              label="Last Name"
              required
              placeholder="e.g. Dela Cruz"
              value={applicant.lastName || ""}
              error={errors["lastName"]}
              onChangeText={(val) => onChange({ lastName: val })}
            />
          </FormCol>
          <FormCol span={3}>
            <Select
              label="Suffix"
              options={SUFFIX_OPTIONS}
              value={applicant.suffix || ""}
              onValueChange={(val) => onChange({ suffix: val })}
            />
          </FormCol>

          {/* Demographic Data */}
          <FormCol span={3}>
            <Select
              label="Birth Month"
              required
              options={birthMonthOptions}
              value={applicant.birthMonth || "January"}
              onValueChange={(val) => onChange({ birthMonth: val })}
              error={errors["birthMonth"] || errors["birthDate"]}
            />
          </FormCol>
          <FormCol span={3}>
            <Select
              label="Day"
              required
              options={birthDayOptions}
              value={applicant.birthDay || "1"}
              onValueChange={(val) => onChange({ birthDay: val })}
              error={errors["birthDay"] || errors["birthDate"]}
            />
          </FormCol>
          <FormCol span={3}>
            <Select
              label="Year"
              required
              options={birthYearOptions}
              value={applicant.birthYear || "2000"}
              onValueChange={(val) => onChange({ birthYear: val })}
              error={errors["birthYear"] || errors["birthDate"]}
            />
          </FormCol>
          <FormCol span={3}>
            <Select
              label="Sex"
              required
              options={SEX_OPTIONS}
              value={applicant.sex || ""}
              onValueChange={(val) => onChange({ sex: val })}
              error={errors["sex"]}
            />
          </FormCol>
          <FormCol span={6}>
            <Select
              label="Civil Status"
              required
              options={CIVIL_STATUS_OPTIONS}
              value={applicant.civilStatus || ""}
              onValueChange={(val) => onChange({ civilStatus: val })}
              error={errors["civilStatus"]}
            />
          </FormCol>
          <FormCol span={6}>
            <ValidatedInput
              label="Nationality"
              placeholder="e.g. Filipino"
              value={applicant.nationality || "Filipino"}
              onChangeText={(val) => onChange({ nationality: val })}
            />
          </FormCol>
        </FormGrid>
      )}

      {/* 2. Contact Particulars */}
      <View style={{ marginTop: 14 }}>
        <FormGrid>
          <FormCol span={6}>
            <ValidatedInput
              label="Mobile / Contact Number"
              required
              placeholder="e.g. 09171234567 or +639171234567"
              value={applicant.contactNo || ""}
              error={errors["contactNo"]}
              onChangeText={(val) => onChange({ contactNo: val })}
              keyboardType="phone-pad"
              maxLength={13}
            />
          </FormCol>
          <FormCol span={6}>
            <ValidatedInput
              label="Email Address"
              required
              placeholder="e.g. applicant@example.com"
              value={applicant.email || ""}
              error={errors["email"]}
              onChangeText={(val) => onChange({ email: val })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </FormCol>
        </FormGrid>
      </View>

      {/* 3. Permanent / Residential Address */}
      <View style={{ marginTop: 14 }}>
        <Text style={styles.subheading}>Permanent / Physical Address</Text>
        <FormGrid>
          <FormCol span={3}>
            <Select
              label="Region"
              required
              options={regionOptions}
              value={applicant.region || ""}
              error={errors["region"]}
              onValueChange={(val) => {
                onChange({ region: val, province: "", city: "", barangay: "" });
                const found = regions.find((r) => r.name.toLowerCase() === val.toLowerCase() || r.id === val);
                setSelectedRegionId(found?.id);
                setSelectedProvinceId(undefined);
                setSelectedMunicipalityId(undefined);
              }}
            />
          </FormCol>
          <FormCol span={3}>
            <Select
              label="Province"
              required
              options={provinceOptions}
              value={applicant.province || ""}
              error={errors["province"]}
              onValueChange={(val) => {
                onChange({ province: val, city: "", barangay: "" });
                const found = provinces.find((p) => p.name.toLowerCase() === val.toLowerCase() || p.id === val);
                setSelectedProvinceId(found?.id);
                setSelectedMunicipalityId(undefined);
              }}
            />
          </FormCol>
          <FormCol span={3}>
            <Select
              label="City / Municipality"
              required
              options={municipalityOptions}
              value={applicant.city || ""}
              error={errors["city"] || errors["cityMunicipality"]}
              onValueChange={(val) => {
                onChange({ city: val, barangay: "" });
                const found = municipalities.find((m) => m.name.toLowerCase() === val.toLowerCase() || m.id === val);
                setSelectedMunicipalityId(found?.id);
              }}
            />
          </FormCol>
          <FormCol span={3}>
            <Select
              label="Barangay"
              required
              options={barangayOptions}
              value={applicant.barangay || ""}
              error={errors["barangay"]}
              onValueChange={(val) => onChange({ barangay: val })}
            />
          </FormCol>
          <FormCol span={8}>
            <ValidatedInput
              label="Street Address / Building / Unit No."
              required
              placeholder="e.g. Unit 402, Sunshine Tower, 123 Rizal Ave"
              value={applicant.street || applicant.address || ""}
              error={errors["address"] || errors["street"]}
              onChangeText={(val) => onChange({ street: val, address: val })}
            />
          </FormCol>
          <FormCol span={4}>
            <ValidatedInput
              label="Zip / Postal Code"
              placeholder="e.g. 1100"
              value={applicant.zipCode || ""}
              error={errors["zipCode"]}
              onChangeText={(val) => onChange({ zipCode: val })}
            />
          </FormCol>
        </FormGrid>
      </View>

      {/* 4. Academic Background (Exam Services) */}
      {isExamService && (
        <View style={{ marginTop: 14 }}>
          <Text style={styles.subheading}>Academic Background</Text>
          <FormGrid>
            <FormCol span={4}>
              <ValidatedInput
                label="School / University Attended"
                placeholder="e.g. University of the Philippines"
                value={applicant.schoolName || ""}
                onChangeText={(val) => onChange({ schoolName: val })}
              />
            </FormCol>
            <FormCol span={4}>
              <ValidatedInput
                label="Course / Degree Program"
                placeholder="e.g. BS Electronics Engineering"
                value={applicant.courseDegree || ""}
                onChangeText={(val) => onChange({ courseDegree: val })}
              />
            </FormCol>
            <FormCol span={4}>
              <ValidatedInput
                label="Year Graduated"
                placeholder="e.g. 2020"
                value={applicant.yearGraduated || ""}
                onChangeText={(val) => onChange({ yearGraduated: val })}
              />
            </FormCol>
          </FormGrid>
        </View>
      )}

      {/* 5. Applicant Signature */}
      {includeSignature && (
        <View style={{ marginTop: 14 }}>
          <Text style={styles.subheading}>Applicant Signature</Text>
          <FormSignatureInput
            label="Digital Signature / E-Signature"
            value={applicant.signatureUrl || ""}
            onChange={(sigUrl) => onChange({ signatureUrl: sigUrl })}
            applicantName={
              isCompany
                ? applicant.representativeName || applicant.companyName || "Representative"
                : `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant"
            }
            error={errors["signatureUrl"] || errors["signature"]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    marginBottom: 20,
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.brand.light,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.neutral[900],
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  subheading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.neutral[700],
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  toggleWrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.neutral.white,
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.neutral[600],
  },
  toggleTextActive: {
    fontWeight: "700",
    color: COLORS.brand[700],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
    marginVertical: 16,
  },
});
