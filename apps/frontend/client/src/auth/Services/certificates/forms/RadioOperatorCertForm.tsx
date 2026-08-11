import React from "react";
import { View, Text } from "react-native";
import { Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { DatePickerInput } from "../../../../shared/components/DatePickerInput";
import { RadioOperatorCertData } from "../types/certificateTypes";
import { certStyles } from "./CertificateFormStyles";

interface RadioOperatorCertFormProps {
  data: RadioOperatorCertData;
  onChange: (fields: Partial<RadioOperatorCertData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  isAmateurService?: boolean;
}

export function RadioOperatorCertForm({
  data,
  onChange,
  errors = {},
  touched = {},
  isAmateurService = false,
}: RadioOperatorCertFormProps) {
  const isRenewalOrMod = data.appType === "RENEWAL" || data.appType === "MODIFICATION";
  const isModification = data.appType === "MODIFICATION";

  const certTypeDisplay = isAmateurService
    ? (data.classOfStation || "Class A (Advanced)")
    : (data.typeOfCertificate || "GROC - General Radio Operator Certificate");

  return (
    <View style={certStyles.container}>
      {/* Application Details */}
      <View style={certStyles.formSection}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={certStyles.formSectionHeading}>Application Details</Text>
          <View style={{ backgroundColor: "#EFF6FF", borderColor: "#3B82F6", borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ fontFamily: "System", fontSize: 10, fontWeight: "700", color: "#1E40AF" }}>
              Selected in Step 3
            </Text>
          </View>
        </View>

        <View style={certStyles.formGrid}>
          {/* Read-only Application Type Badge */}
          <View style={certStyles.formCol6}>
            <Text style={{ fontFamily: "System", fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 }}>
              Application Type
            </Text>
            <View style={{ height: 44, backgroundColor: "#F1F5F9", borderColor: "#CBD5E1", borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, justifyContent: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Icon name="check-circle" size={14} color="#0F2C59" />
                <Text style={{ fontFamily: "System", fontSize: 13, fontWeight: "700", color: "#0F2C59" }}>
                  {data.appType === "NEW" ? "New Application" : data.appType === "RENEWAL" ? "Renewal" : "Modification"}
                </Text>
              </View>
            </View>
          </View>

          {/* Editable License / Cert Duration */}
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Number of Years*</Text>
            <Select
              value={data.years}
              onValueChange={(val) => onChange({ years: val })}
              options={[
                { label: "1 Year", value: "1" },
                { label: "2 Years", value: "2" },
                { label: "3 Years", value: "3" },
                { label: "5 Years", value: "5" },
              ]}
            />
          </View>

          {/* Read-only Class / Element / Certificate Badge */}
          <View style={certStyles.formCol12}>
            <Text style={{ fontFamily: "System", fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 }}>
              {isAmateurService ? "Class of Station" : "Type of Certificate"}
            </Text>
            <View style={{ height: 44, backgroundColor: "#F1F5F9", borderColor: "#CBD5E1", borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, justifyContent: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Icon name="award" size={14} color="#1E40AF" />
                <Text style={{ fontFamily: "System", fontSize: 13, fontWeight: "700", color: "#1E40AF" }}>
                  {certTypeDisplay}
                </Text>
              </View>
            </View>
          </View>

          {/* Conditional Renewal & Modification Fields */}
          {isRenewalOrMod && (
            <>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Existing Certificate No."
                  placeholder="e.g. ROC-2022-00123"
                  value={data.certificateNo}
                  onChangeText={(val) => onChange({ certificateNo: val })}
                  error={errors.certificateNo}
                  touched={touched.certificateNo}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <DatePickerInput
                  label="Date of Expiry"
                  placeholder="MM/DD/YYYY"
                  value={data.dateOfExpiry}
                  onChangeText={(val) => onChange({ dateOfExpiry: val })}
                  error={errors.dateOfExpiry}
                  touched={touched.dateOfExpiry}
                  required
                />
              </View>
            </>
          )}

          {isModification && (
            <View style={certStyles.formCol12}>
              <ValidatedInput
                label="Modification Due To"
                placeholder="Reason / Details of certificate amendment"
                value={data.modificationDueTo}
                onChangeText={(val) => onChange({ modificationDueTo: val })}
                error={errors.modificationDueTo}
                touched={touched.modificationDueTo}
                required
              />
            </View>
          )}
        </View>
      </View>

      {/* Basic Applicant Information */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Basic Information</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Applicant Name / Business Name"
              placeholder="Enter full legal name or registered entity"
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
              placeholder="e.g. 09171234567"
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
              placeholder="e.g. operator@domain.com"
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
              placeholder="House/Unit, Street, Barangay, City, Province"
              value={data.address}
              onChangeText={(val) => onChange({ address: val })}
              error={errors.address}
              touched={touched.address}
              required
            />
          </View>
        </View>
      </View>

      {/* Employment & Physical Attributes (Commercial ROC) */}
      {!isAmateurService && (
        <View style={certStyles.formSection}>
          <Text style={certStyles.formSectionHeading}>Employment & Qualifications</Text>
          <View style={certStyles.formGrid}>
            <View style={certStyles.formCol6}>
              <Text style={certStyles.selectLabel}>Employment Status</Text>
              <Select
                value={data.employmentStatus}
                onValueChange={(val) => onChange({ employmentStatus: val })}
                options={[
                  { label: "Employed", value: "Employed" },
                  { label: "Self-Employed", value: "Self-Employed" },
                  { label: "Unemployed", value: "Unemployed" },
                  { label: "Student", value: "Student" },
                ]}
              />
            </View>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Employment Location"
                placeholder="Company / Ship Name & Station"
                value={data.employmentLocation}
                onChangeText={(val) => onChange({ employmentLocation: val })}
              />
            </View>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Weight (kg)"
                placeholder="e.g. 65"
                value={data.weightKg}
                onChangeText={(val) => onChange({ weightKg: val })}
              />
            </View>
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Height (cm)"
                placeholder="e.g. 170"
                value={data.heightCm}
                onChangeText={(val) => onChange({ heightCm: val })}
              />
            </View>
          </View>
        </View>
      )}

      {/* Exam / Seminar History & Ratings */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Exam / Seminar Background</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Place of Exam / Seminar"
              placeholder="e.g. NTC Central Office / Online"
              value={data.placeOfExamSeminar}
              onChangeText={(val) => onChange({ placeOfExamSeminar: val })}
            />
          </View>
          <View style={certStyles.formCol6}>
            <DatePickerInput
              label="Exam / Seminar Date"
              placeholder="MM/DD/YYYY"
              value={data.examDate}
              onChangeText={(val) => onChange({ examDate: val })}
            />
          </View>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Examination Ratings / Remarks"
              placeholder="Passed Element 1, 2, 3 (Rating: 85%)"
              value={data.ratings}
              onChangeText={(val) => onChange({ ratings: val })}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
