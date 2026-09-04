import React from "react";
import { View, Text } from "react-native";
import { TYPOGRAPHY } from "@edge/ui";
import { FieldDto } from "./dynamicFormTypes";
import { FormCol } from "../FormGrid";
import { ValidatedInput } from "../ValidatedInput";
import { Select } from "../Select";
import { DatePickerInput } from "../DatePickerInput";
import { FormRepeaterTable } from "../FormRepeaterTable";
import { ApplicantNameField, StructuredNameData } from "../ApplicantNameField";
import { DeclarationCheckbox } from "../DeclarationCheckbox";
import { FormSignatureInput } from "../FormSignatureInput";
import { IntendedUseCheckboxGroup } from "../IntendedUseCheckboxGroup";
import { VasServicesCheckboxGroup } from "../VasServicesCheckboxGroup";

export interface DynamicFormFieldProps {
  field: FieldDto;
  targetId: string;
  val: string;
  err?: string;
  displayLabel: string;
  isRequired: boolean;
  span: 12 | 8 | 6 | 4 | 3;
  dropdownOptions: Array<{ label: string; value: string }>;
  placeholder: string;
  isNameField: boolean;
  isRepeaterField: boolean;
  isBsdField: boolean;
  isVasRegField: boolean;
  isIntendedUseField: boolean;
  isVasServicesField: boolean;
  isSignature: boolean;
  isCheckbox: boolean;
  isDropdown: boolean;
  isDate: boolean;
  isNumber: boolean;
  isContactField: boolean;
  isEmailField: boolean;
  isNonIndividualEntity: boolean;
  isAmateurPermitService: boolean;
  isIndividualVar: boolean;
  isForeignVisitor?: boolean;
  isVanityOrSpecialEvent?: boolean;
  showCallSign?: boolean;
  structuredNameData?: Partial<StructuredNameData>;
  applicantName?: string;
  isBulk?: boolean;
  appMode?: "SINGLE" | "BULK" | "";
  parentMakeTypeModel?: string;
  onChange: (fieldId: string, label: string, value: string) => void;
  onStructuredNameChange?: (data: StructuredNameData) => void;
  onDropdownChange: (val: string) => void;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  targetId,
  val,
  err,
  displayLabel,
  isRequired,
  span,
  dropdownOptions,
  placeholder,
  isNameField,
  isRepeaterField,
  isBsdField,
  isVasRegField,
  isIntendedUseField,
  isVasServicesField,
  isSignature,
  isCheckbox,
  isDropdown,
  isDate,
  isNumber,
  isContactField,
  isEmailField,
  isNonIndividualEntity,
  isAmateurPermitService,
  isIndividualVar,
  isForeignVisitor = false,
  isVanityOrSpecialEvent,
  showCallSign = false,
  structuredNameData,
  applicantName,
  isBulk,
  appMode,
  parentMakeTypeModel,
  onChange,
  onStructuredNameChange,
  onDropdownChange,
}) => {
  return (
    <FormCol key={targetId} span={span} compact={field.isCompact}>
      {isNameField ? (
        <ApplicantNameField
          label={isNonIndividualEntity ? "Applicant Name" : (isAmateurPermitService && !isVanityOrSpecialEvent) ? "Applicant Name" : displayLabel}
          isRequired={isRequired}
          value={val}
          structuredValue={
            isIndividualVar
              ? structuredNameData ? { ...structuredNameData, applicantType: "individual" } : undefined
              : structuredNameData ? { ...structuredNameData, applicantType: "company" } : { applicantType: "company", firstName: "", middleName: "", lastName: "", suffix: "", companyName: val }
          }
          allowCompany={false}
          unifiedInput={false}
          seamless={true}
          onChange={(combined) => onChange(targetId, displayLabel, combined)}
          onStructuredChange={onStructuredNameChange}
          error={err}
        />
      ) : isRepeaterField ? (
        <View style={{ width: "100%" }}>
          <FormRepeaterTable
            label={displayLabel}
            isRequired={isRequired}
            value={val}
            fieldKey={targetId}
            parentMakeTypeModel={parentMakeTypeModel}
            showCallSign={showCallSign || isForeignVisitor}
            onChange={(json) => onChange(targetId, displayLabel, json)}
            error={err}
          />
        </View>
      ) : isBsdField || isVasRegField ? (
        <View style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 14, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
              {isVasRegField ? "VAS REGISTRATION : TO BE ASSIGNED BY NTC" : displayLabel}
            </Text>
            <View style={{ backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10.5, fontWeight: "700", color: "#1D4ED8" }}>OFFICIAL NTC ASSIGNMENT</Text>
            </View>
          </View>
          <ValidatedInput value="TO BE ASSIGNED BY NTC" editable={false} onChangeText={() => {}} />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#64748B", fontStyle: "italic" }}>
            * Note: {isVasRegField ? "VAS Registration Number" : "BSD No."} is designated and assigned exclusively by the NTC upon evaluation and approval.
          </Text>
        </View>
      ) : isIntendedUseField ? (
        <IntendedUseCheckboxGroup label={displayLabel} required={isRequired} value={val} onChange={(newVal) => onChange(targetId, displayLabel, newVal)} error={err} />
      ) : isVasServicesField ? (
        <VasServicesCheckboxGroup label={displayLabel} required={isRequired} value={val} onChange={(newVal) => onChange(targetId, displayLabel, newVal)} error={err} />
      ) : isSignature ? (
        <FormSignatureInput label={displayLabel} isRequired={isRequired} value={val} onChange={(sig) => onChange(targetId, displayLabel, sig)} applicantName={applicantName || val} isBulk={isBulk} appMode={appMode} error={err} />
      ) : isCheckbox ? (
        <DeclarationCheckbox label={displayLabel} isRequired={isRequired} value={val} onChange={(chk) => onChange(targetId, displayLabel, chk)} error={err} />
      ) : isDropdown ? (
        <View style={{ width: "100%" }}>
          {isAmateurPermitService && (targetId === "stationClass" || targetId.toLowerCase() === "stationclass") && (
            <View style={{ width: "100%", marginBottom: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 12 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, fontWeight: "700", color: "#1E293B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Particulars of Station
              </Text>
            </View>
          )}
          <Select label={displayLabel} required={isRequired} value={val} onValueChange={onDropdownChange} options={dropdownOptions} placeholder={placeholder} error={err} />
        </View>
      ) : isDate ? (
        <DatePickerInput label={displayLabel} required={isRequired} value={val} onChangeText={(v) => onChange(targetId, displayLabel, v)} error={err} />
      ) : (
        <ValidatedInput
          label={displayLabel}
          required={isRequired}
          value={val}
          onChangeText={(v) => {
            onChange(targetId, displayLabel, v);
            const targetLower = targetId.toLowerCase();
            if (targetLower === "applicantname" || targetLower === "companyname") {
              onStructuredNameChange?.({
                applicantType: "company",
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                companyName: v,
                representativeName: structuredNameData?.representativeName,
              });
            } else if (targetLower === "representativename") {
              onStructuredNameChange?.({
                applicantType: "company",
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                companyName: structuredNameData?.companyName || "",
                representativeName: v,
              });
            }
          }}
          placeholder={field.placeholder || (isContactField ? "09XXXXXXXXX or +639XXXXXXXXX" : isEmailField ? "user@example.com" : `Enter ${displayLabel}...`)}
          keyboardType={isContactField ? "phone-pad" : isEmailField ? "email-address" : isNumber ? "numeric" : "default"}
          autoCapitalize={isEmailField ? "none" : undefined}
          maxLength={isContactField ? 13 : undefined}
          error={err}
        />
      )}
    </FormCol>
  );
};
