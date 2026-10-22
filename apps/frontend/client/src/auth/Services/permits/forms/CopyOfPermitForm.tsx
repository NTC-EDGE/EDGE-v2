import React from "react";
import { View, Text } from "react-native";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { CopyOfPermitData } from "../types/permitTypes";
import { permitStyles } from "./PermitFormStyles";
import { usePermitServicesQuery } from "../hooks/usePermitServicesQuery";

export const PERMIT_DETAILS_SERVICE_OPTIONS = [
  {
    label: "Permits in AMateur",
    value: "Permits in AMateur",
  },
  {
    label: "Permits Aeronotical",
    value: "Permits Aeronotical",
  },
  {
    label: "PErmits in Maritime",
    value: "PErmits in Maritime",
  },
  {
    label: "Permits for Government and Private Radio Stations, in the Fixed and Land MObile Service",
    value: "Permits for Government and Private Radio Stations, in the Fixed and Land MObile Service",
  },
];

export const PERMIT_TYPES_BY_SERVICE: Record<string, Array<{ label: string; value: string }>> = {
  "Permits in AMateur": [
    { label: "Amateur Radio Station Permit to Purchase", value: "Amateur Radio Station Permit to Purchase" },
    { label: "Amateur Radio Station Permit to Possess for Storage", value: "Amateur Radio Station Permit to Possess for Storage" },
    { label: "Amateur Radio Station Permit to Purchase/Possess", value: "Amateur Radio Station Permit to Purchase/Possess" },
    { label: "Amateur Radio Station Permit to Sell/Transfer", value: "Amateur Radio Station Permit to Sell/Transfer" },
    { label: "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor", value: "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor" },
    { label: "Special Permit for Use of Vanity Call Sign", value: "Special Permit for Use of Vanity Call Sign" },
    { label: "Special Permit for the Use of Special Event Call Sign", value: "Special Permit for the Use of Special Event Call Sign" },
  ],
  "Permits Aeronotical": [
    { label: "Aeronautical Station Permit to Purchase", value: "Aeronautical Station Permit to Purchase" },
    { label: "Aeronautical Station Permit to Possess", value: "Aeronautical Station Permit to Possess" },
    { label: "Aeronautical Station Permit to Purchase/Possess", value: "Aeronautical Station Permit to Purchase/Possess" },
    { label: "Permit to Possess for Storage", value: "Permit to Possess for Storage" },
    { label: "Aeronautical Station Permit to Sell/Transfer", value: "Aeronautical Station Permit to Sell/Transfer" },
    { label: "Aircraft Station Permit to Purchase", value: "Aircraft Station Permit to Purchase" },
    { label: "Aircraft Station Permit to Possess", value: "Aircraft Station Permit to Possess" },
    { label: "Aircraft Station Permit to Purchase/Possess", value: "Aircraft Station Permit to Purchase/Possess" },
    { label: "Aircraft Station Permit to Sell/Transfer", value: "Aircraft Station Permit to Sell/Transfer" },
  ],
  "PErmits in Maritime": [
    { label: "Ship Station Permit to Purchase (Domestic Trade)", value: "Ship Station Permit to Purchase (Domestic Trade)" },
    { label: "Ship Station Permit to Possess (Domestic Trade)", value: "Ship Station Permit to Possess (Domestic Trade)" },
    { label: "Ship Station Permit to Possess (Storage)", value: "Ship Station Permit to Possess (Storage)" },
    { label: "Ship Station Permit to Purchase/Possess (Domestic Trade)", value: "Ship Station Permit to Purchase/Possess (Domestic Trade)" },
    { label: "Ship Station Permit to Sell/Transfer", value: "Ship Station Permit to Sell/Transfer" },
    { label: "Private Coastal Station Permit to Purchase", value: "Private Coastal Station Permit to Purchase" },
    { label: "Private Coastal Station Permit to Possess", value: "Private Coastal Station Permit to Possess" },
    { label: "Private Coastal Station Permit to Purchase/Possess", value: "Private Coastal Station Permit to Purchase/Possess" },
    { label: "Public Coastal Station Permit to Purchase", value: "Public Coastal Station Permit to Purchase" },
    { label: "Public Coastal Station Permit to Possess", value: "Public Coastal Station Permit to Possess" },
    { label: "Public Coastal Station Permit to Purchase/Possess", value: "Public Coastal Station Permit to Purchase/Possess" },
    { label: "Public Coastal Station Permit to Sell/Transfer", value: "Public Coastal Station Permit to Sell/Transfer" },
  ],
  "Permits for Government and Private Radio Stations, in the Fixed and Land MObile Service": [
    { label: "Permit to Purchase (VSAT)", value: "Permit to Purchase (VSAT)" },
    { label: "Permit to Purchase (Private)", value: "Permit to Purchase (Private)" },
    { label: "Permit to Purchase (Civic Action Group)", value: "Permit to Purchase (Civic Action Group)" },
    { label: "Permit to Purchase (Government)", value: "Permit to Purchase (Government)" },
    { label: "Permit to Possess (VSAT)", value: "Permit to Possess (VSAT)" },
    { label: "Permit to Possess (Private)", value: "Permit to Possess (Private)" },
    { label: "Permit to Possess (Civic Action Group)", value: "Permit to Possess (Civic Action Group)" },
    { label: "Permit to Possess (Government)", value: "Permit to Possess (Government)" },
    { label: "Permit to Purchase/Possess (VSAT)", value: "Permit to Purchase/Possess (VSAT)" },
    { label: "Permit to Purchase/Possess (Private)", value: "Permit to Purchase/Possess (Private)" },
    { label: "Permit to Purchase/Possess (Civic Action Group)", value: "Permit to Purchase/Possess (Civic Action Group)" },
    { label: "Permit to Purchase/Possess (Government)", value: "Permit to Purchase/Possess (Government)" },
    { label: "Permit to Possess for Storage", value: "Permit to Possess for Storage" },
    { label: "Permit to Sell/Transfer", value: "Permit to Sell/Transfer" },
    { label: "Construction Permit", value: "Construction Permit" },
    { label: "Temporary Permit to Demonstrate and Propagate", value: "Temporary Permit to Demonstrate and Propagate" },
  ],
};

export function resolvePermitTypes(serviceName?: string): Array<{ label: string; value: string }> {
  const defaultTypes = PERMIT_TYPES_BY_SERVICE["Permits in AMateur"] ?? [];
  if (!serviceName) return defaultTypes;

  const sLower = serviceName.toLowerCase();
  if (sLower.includes("amateur") || sLower.includes("1_09") || sLower.includes("1-09")) {
    return PERMIT_TYPES_BY_SERVICE["Permits in AMateur"] ?? defaultTypes;
  }
  if (sLower.includes("aero")) {
    return PERMIT_TYPES_BY_SERVICE["Permits Aeronotical"] ?? defaultTypes;
  }
  if (sLower.includes("maritime") || sLower.includes("ship") || sLower.includes("coastal")) {
    return PERMIT_TYPES_BY_SERVICE["PErmits in Maritime"] ?? defaultTypes;
  }
  if (
    sLower.includes("fixed") ||
    sLower.includes("mobile") ||
    sLower.includes("government") ||
    sLower.includes("flm")
  ) {
    return (
      PERMIT_TYPES_BY_SERVICE[
        "Permits for Government and Private Radio Stations, in the Fixed and Land MObile Service"
      ] ?? defaultTypes
    );
  }

  const directMatch = PERMIT_TYPES_BY_SERVICE[serviceName];
  if (directMatch) return directMatch;

  return defaultTypes;
}

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
