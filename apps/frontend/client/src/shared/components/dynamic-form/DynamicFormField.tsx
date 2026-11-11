import React from "react";
import { View, Text } from "react-native";
import { TYPOGRAPHY } from "@edge/ui";
import { FieldDto } from "./dynamicFormTypes";
import { FormCol } from "../FormGrid";
import { ValidatedInput } from "../ValidatedInput";
import { Select } from "../Select";
import { DatePickerInput } from "../DatePickerInput";
import { FormRepeaterTable, FormRepeaterColumn } from "../FormRepeaterTable";
import { ApplicantNameField, StructuredNameData } from "../ApplicantNameField";
import { DeclarationCheckbox } from "../DeclarationCheckbox";
import { CheckboxGroup } from "../CheckboxGroup";
import { FormSignatureInput } from "../FormSignatureInput";
import { IntendedUseCheckboxGroup } from "../IntendedUseCheckboxGroup";
import { VasServicesCheckboxGroup } from "../VasServicesCheckboxGroup";
import { NatureOfComplaintCheckboxGroup } from "../NatureOfComplaintCheckboxGroup";
import { HourAmPmInput } from "../HourAmPmInput";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeColumnType(rawType: unknown): "text" | "number" | "select" | "date" | "serials" | "equipments" | "file" {
  if (typeof rawType !== "string") return "text";
  const lower = rawType.toLowerCase().trim();
  if (lower === "file" || lower === "attachment" || lower === "upload") return "file";
  if (lower === "number" || lower === "numeric") return "number";
  if (lower === "select" || lower === "dropdown") return "select";
  if (lower === "date") return "date";
  if (lower === "serials") return "serials";
  if (lower === "equipments") return "equipments";
  return "text";
}

function normalizeRepeaterColumn(value: unknown, index: number): FormRepeaterColumn | null {
  if (!isRecord(value)) return null;

  const rawKey =
    typeof value.key === "string" && value.key.trim().length > 0
      ? value.key.trim()
      : typeof value.id === "string" && value.id.trim().length > 0
      ? value.id.trim()
      : typeof value.name === "string" && value.name.trim().length > 0
      ? value.name.trim()
      : typeof value.label === "string" && value.label.trim().length > 0
      ? value.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")
      : `col_${index + 1}`;

  const rawLabel =
    typeof value.label === "string" && value.label.trim().length > 0
      ? value.label.trim()
      : typeof value.name === "string" && value.name.trim().length > 0
      ? value.name.trim()
      : rawKey;

  const type = normalizeColumnType(value.type);
  const placeholder = typeof value.placeholder === "string" ? value.placeholder : undefined;
  const required = typeof value.required === "boolean" ? value.required : undefined;

  let options: Array<{ label: string; value: string }> | undefined;
  if (Array.isArray(value.options)) {
    const parsedOptions: Array<{ label: string; value: string }> = [];
    value.options.forEach((opt) => {
      if (isRecord(opt)) {
        const l = typeof opt.label === "string" ? opt.label : typeof opt.value === "string" ? opt.value : "";
        const v = typeof opt.value === "string" ? opt.value : typeof opt.label === "string" ? opt.label : "";
        if (l.length > 0 || v.length > 0) {
          parsedOptions.push({ label: l || v, value: v || l });
        }
      } else if (typeof opt === "string" && opt.trim().length > 0) {
        parsedOptions.push({ label: opt.trim(), value: opt.trim() });
      }
    });
    if (parsedOptions.length > 0) {
      options = parsedOptions;
    }
  }

  return {
    key: rawKey,
    label: rawLabel,
    type,
    placeholder,
    required,
    options,
  };
}

function parseRepeaterRules(
  rules?: unknown,
  directColumns?: unknown
): {
  columns?: FormRepeaterColumn[];
  addButtonLabel?: string;
  minRows?: number;
  maxRows?: number;
  helpText?: string;
} {
  const result: {
    columns?: FormRepeaterColumn[];
    addButtonLabel?: string;
    minRows?: number;
    maxRows?: number;
    helpText?: string;
  } = {};

  let parsed: unknown = null;

  if (isRecord(rules)) {
    parsed = rules;
  } else if (typeof rules === "string" && rules.trim().length > 0) {
    try {
      parsed = JSON.parse(rules);
    } catch {
      parsed = null;
    }
  }

  if (isRecord(parsed)) {
    if (typeof parsed.addButtonLabel === "string" && parsed.addButtonLabel.trim().length > 0) {
      result.addButtonLabel = parsed.addButtonLabel.trim();
    }
    if (typeof parsed.helpText === "string" && parsed.helpText.trim().length > 0) {
      result.helpText = parsed.helpText.trim();
    }
    if (typeof parsed.minRows === "number") result.minRows = parsed.minRows;
    if (typeof parsed.maxRows === "number") result.maxRows = parsed.maxRows;

    const rawCols = Array.isArray(parsed.repeaterColumns)
      ? parsed.repeaterColumns
      : Array.isArray(parsed.columns)
      ? parsed.columns
      : null;

    if (rawCols !== null) {
      const validCols: FormRepeaterColumn[] = [];
      rawCols.forEach((col, idx) => {
        const norm = normalizeRepeaterColumn(col, idx);
        if (norm !== null) validCols.push(norm);
      });
      if (validCols.length > 0) {
        result.columns = validCols;
      }
    }
  }

  // Fallback to directColumns on field if columns were not defined in validationRules
  if (!result.columns && Array.isArray(directColumns)) {
    const validCols: FormRepeaterColumn[] = [];
    directColumns.forEach((col, idx) => {
      const norm = normalizeRepeaterColumn(col, idx);
      if (norm !== null) validCols.push(norm);
    });
    if (validCols.length > 0) {
      result.columns = validCols;
    }
  }

  return result;
}

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
  helpText?: string;
  maxLength?: number;
  isNameField: boolean;
  isRepeaterField: boolean;
  isBsdField: boolean;
  isVasRegField: boolean;
  isIntendedUseField: boolean;
  isVasServicesField: boolean;
  isNatureOfComplaintField?: boolean;
  hideInlineOthersSpecify?: boolean;
  isTimeField?: boolean;
  othersSpecifyValue?: string;
  onOthersSpecifyChange?: (text: string) => void;
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
  hideAddButton?: boolean;
  maxRows?: number;
  disabled?: boolean;
  customRepeaterColumns?: FormRepeaterColumn[];
  customAddButtonLabel?: string;
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
  helpText,
  maxLength,
  isNameField,
  isRepeaterField,
  isBsdField,
  isVasRegField,
  isIntendedUseField,
  isVasServicesField,
  isNatureOfComplaintField = false,
  hideInlineOthersSpecify = false,
  isTimeField = false,
  othersSpecifyValue,
  onOthersSpecifyChange,
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
  hideAddButton,
  maxRows,
  disabled = false,
  customRepeaterColumns,
  customAddButtonLabel,
  onChange,
  onStructuredNameChange,
  onDropdownChange,
}) => {
  const repeaterRules = isRepeaterField ? parseRepeaterRules(field.validationRules, field.repeaterColumns) : undefined;

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
            columns={repeaterRules?.columns || customRepeaterColumns}
            addButtonLabel={repeaterRules?.addButtonLabel || customAddButtonLabel}
            instruction={repeaterRules?.helpText || helpText || field.placeholder || ""}
            minRows={repeaterRules?.minRows}
            maxRows={repeaterRules?.maxRows || maxRows}
            parentMakeTypeModel={parentMakeTypeModel}
            showCallSign={showCallSign}
            hideAddButton={hideAddButton}
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
        <IntendedUseCheckboxGroup
          label={displayLabel}
          required={isRequired}
          value={val}
          options={dropdownOptions.length > 0 ? dropdownOptions : undefined}
          onChange={(newVal) => onChange(targetId, displayLabel, newVal)}
          error={err}
        />
      ) : isNatureOfComplaintField ? (
        <NatureOfComplaintCheckboxGroup
          label={displayLabel}
          required={isRequired}
          value={val}
          options={dropdownOptions.length > 0 ? dropdownOptions : field.options}
          onChange={(newVal) => onChange(targetId, displayLabel, newVal)}
          onOthersSpecifyChange={onOthersSpecifyChange}
          othersSpecifyValue={othersSpecifyValue}
          hideInlineSpecify={hideInlineOthersSpecify}
          error={err}
        />
      ) : isTimeField ? (
        <HourAmPmInput
          label={displayLabel}
          required={isRequired}
          value={val}
          onChangeText={(newVal) => onChange(targetId, displayLabel, newVal)}
          error={err}
          disabled={disabled}
        />
      ) : isVasServicesField ? (
        <VasServicesCheckboxGroup
          label={displayLabel}
          required={isRequired}
          value={val}
          options={dropdownOptions.length > 0 ? dropdownOptions : undefined}
          onChange={(newVal) => onChange(targetId, displayLabel, newVal)}
          error={err}
        />
      ) : isSignature ? (
        <FormSignatureInput label={displayLabel} isRequired={isRequired} value={val} onChange={(sig) => onChange(targetId, displayLabel, sig)} applicantName={applicantName || val} isBulk={isBulk} appMode={appMode} error={err} />
      ) : isCheckbox ? (
        dropdownOptions.length > 0 ? (
          <CheckboxGroup
            label={displayLabel}
            required={isRequired}
            value={val}
            options={dropdownOptions}
            onChange={(newVal) => onChange(targetId, displayLabel, newVal)}
            error={err}
            disabled={disabled}
          />
        ) : (
          <DeclarationCheckbox label={displayLabel} isRequired={isRequired} value={val} onChange={(chk) => onChange(targetId, displayLabel, chk)} error={err} />
        )
      ) : isDropdown ? (
        <View style={{ width: "100%" }}>
          <Select label={displayLabel} required={isRequired} value={val} onValueChange={onDropdownChange} options={dropdownOptions} placeholder={placeholder} error={err} disabled={disabled} />
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
          placeholder={placeholder || field.placeholder || (isContactField ? "09XXXXXXXXX or +639XXXXXXXXX" : isEmailField ? "user@example.com" : `Enter ${displayLabel}...`)}
          keyboardType={isContactField ? "phone-pad" : isEmailField ? "email-address" : isNumber ? "numeric" : "default"}
          autoCapitalize={isEmailField ? "none" : undefined}
          maxLength={maxLength ?? (isContactField ? 13 : undefined)}
          error={err}
        />
      )}
      {!isRepeaterField && Boolean(helpText && helpText.trim().length > 0) && (
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#64748B", marginTop: 4 }}>
          {helpText}
        </Text>
      )}
    </FormCol>
  );
};
