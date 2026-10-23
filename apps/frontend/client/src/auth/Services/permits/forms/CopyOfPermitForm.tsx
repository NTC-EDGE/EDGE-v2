import React from "react";
import { View, Text } from "react-native";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { CopyOfPermitData } from "../types/permitTypes";
import { permitStyles } from "./PermitFormStyles";
import { usePermitServicesQuery } from "../hooks/usePermitServicesQuery";

import {
  PERMIT_DETAILS_SERVICE_OPTIONS,
  PERMIT_TYPES_BY_SERVICE,
  resolvePermitTypes,
  formatPermitServiceLabel,
} from "../../../../shared/components/dynamic-form/dynamicFormConstants";

export {
  PERMIT_DETAILS_SERVICE_OPTIONS,
  PERMIT_TYPES_BY_SERVICE,
  resolvePermitTypes,
  formatPermitServiceLabel,
};

export const PERMIT_COPIES_OPTIONS = [
  { label: "1 Copy", value: "1" },
  { label: "2 Copies", value: "2" },
  { label: "3 Copies", value: "3" },
  { label: "4 Copies", value: "4" },
  { label: "5 Copies", value: "5" },
  { label: "10 Copies", value: "10" },
];

interface CopyOfPermitFormProps {
  data: CopyOfPermitData;
  onChange: (fields: Partial<CopyOfPermitData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

export function CopyOfPermitForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: CopyOfPermitFormProps) {
  const isDuplicate = data.copyType === "DUPLICATE";
  const { serviceOptions, getTypesForService } = usePermitServicesQuery();
  const currentService = data.detailsService || serviceOptions[0]?.value || "";
  const typeOptions = getTypesForService(currentService);

  return (
    <View style={permitStyles.container}>
      {/* Request Classification */}
      <View style={permitStyles.formSection}>
        <Text style={permitStyles.formSectionHeading}>Request Classification</Text>
        <View style={permitStyles.formGrid}>
          <View style={permitStyles.formCol12}>
            <Text style={permitStyles.selectLabel}>Type of Copy*</Text>
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

      {/* Permit Details */}
      <View style={permitStyles.formSection}>
        <Text style={permitStyles.formSectionHeading}>
          {isDuplicate ? "Duplicate Copy Details" : "Certified True Copy Details"}
        </Text>
        <View style={permitStyles.formGrid}>
          <View style={permitStyles.formCol6}>
            <Text style={permitStyles.selectLabel}>DetailsService*</Text>
            <Select
              value={data.detailsService || (serviceOptions[0]?.value ?? "")}
              onValueChange={(val) => {
                const availableTypes = getTypesForService(val);
                onChange({
                  detailsService: val,
                  targetPermitType: availableTypes[0]?.value || "",
                });
              }}
              options={serviceOptions}
              placeholder="Select Service..."
            />
          </View>

          <View style={permitStyles.formCol6}>
            <Text style={permitStyles.selectLabel}>Type*</Text>
            <Select
              value={data.targetPermitType || (typeOptions[0]?.value ?? "")}
              onValueChange={(val) => onChange({ targetPermitType: val })}
              options={typeOptions}
              placeholder={typeOptions.length === 0 ? "Select Service first..." : "Select Permit Type..."}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Permit no."
              placeholder="e.g. PR-2023-00123"
              value={data.permitNo || ""}
              onChangeText={(val) => onChange({ permitNo: val })}
              error={errors.permitNo}
              touched={touched.permitNo}
              required
            />
          </View>

          {!isDuplicate && (
            <View style={permitStyles.formCol6}>
              <Text style={permitStyles.selectLabel}>No. of Copies*</Text>
              <Select
                value={data.numberOfCopies || "1"}
                onValueChange={(val) => onChange({ numberOfCopies: val })}
                options={PERMIT_COPIES_OPTIONS}
              />
            </View>
          )}

          {isDuplicate && (
            <View style={permitStyles.formCol12}>
              <ValidatedInput
                label="Circumstances Relating to Lost/Mutilation of Permit"
                placeholder="State the circumstances leading to the loss or mutilation..."
                value={data.circumstances || ""}
                onChangeText={(val) => onChange({ circumstances: val })}
                multiline
                numberOfLines={3}
                error={errors.circumstances}
                touched={touched.circumstances}
                required
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
