import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { VASProviderData } from "../types/certificateTypes";
import { certStyles } from "./CertificateFormStyles";

interface VASProviderFormProps {
  data: VASProviderData;
  onChange: (fields: Partial<VASProviderData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

const AVAILABLE_VAS_SERVICES = [
  "Messaging service",
  "Audio conferencing",
  "Audio and Video Conferencing",
  "Voice mail service",
  "Electronic mail service",
  "Information service",
  "Application service",
  "Content and Program service",
  "Audiotext service",
  "Facsimile service",
  "Virtual Private Network (VPN) service",
  "Hosting service",
  "Electronic Gaming Services (except gambling)",
  "Other Value-Added Services",
];

export function VASProviderForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: VASProviderFormProps) {
  const isRenewalOrMod = data.appType === "RENEWAL" || data.appType === "MODIFICATION";

  const toggleVasService = (serviceName: string) => {
    const exists = data.valueAddedServices.includes(serviceName);
    if (exists) {
      onChange({ valueAddedServices: data.valueAddedServices.filter((s) => s !== serviceName) });
    } else {
      onChange({ valueAddedServices: [...data.valueAddedServices, serviceName] });
    }
  };

  return (
    <View style={certStyles.container}>
      {/* Registration Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>VAS Registration Profile</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Application Type*</Text>
            <Select
              value={data.appType}
              onValueChange={(val) => onChange({ appType: val as any })}
              options={[
                { label: "New VAS Registration", value: "NEW" },
                { label: "Renewal of Certificate", value: "RENEWAL" },
                { label: "Modification of Services", value: "MODIFICATION" },
              ]}
            />
          </View>
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

          {isRenewalOrMod && (
            <>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Existing COR / VAS Number"
                  placeholder="e.g. COR-VAS-2022-0045"
                  value={data.certificateNumber}
                  onChangeText={(val) => onChange({ certificateNumber: val })}
                  error={errors.certificateNumber}
                  touched={touched.certificateNumber}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="COR / VAS Expiry Date"
                  placeholder="MM/DD/YYYY"
                  value={data.expiryDate}
                  onChangeText={(val) => onChange({ expiryDate: val })}
                  error={errors.expiryDate}
                  touched={touched.expiryDate}
                  required
                />
              </View>
            </>
          )}
        </View>
      </View>

      {/* Applicant / Company Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Entity Information</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Applicant / Company Name"
              placeholder="e.g. Globe Telecom, Inc."
              value={data.businessName}
              onChangeText={(val) => onChange({ businessName: val })}
              error={errors.businessName}
              touched={touched.businessName}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Business Entity Type</Text>
            <Select
              value={data.serviceType}
              onValueChange={(val) => onChange({ serviceType: val as any })}
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
              placeholder="regulatory@company.com"
              value={data.email}
              onChangeText={(val) => onChange({ email: val })}
              error={errors.email}
              touched={touched.email}
              required
            />
          </View>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Principal Office Address"
              placeholder="Floor, Building, Street, Barangay, City, Province"
              value={data.address}
              onChangeText={(val) => onChange({ address: val })}
              error={errors.address}
              touched={touched.address}
              required
            />
          </View>
        </View>
      </View>

      {/* Regulatory Authority Section */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Carrier / Operating Authority</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="CPCN / PA / CA License No."
              placeholder="e.g. CPCN No. 2020-0012"
              value={data.serviceNo}
              onChangeText={(val) => onChange({ serviceNo: val })}
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="CPCN / PA / CA Expiration Date"
              placeholder="MM/DD/YYYY"
              value={data.cpcnPaCaDateOfExpiry}
              onChangeText={(val) => onChange({ cpcnPaCaDateOfExpiry: val })}
            />
          </View>

          <View style={certStyles.formCol12}>
            <TouchableOpacity
              onPress={() => onChange({ isKnownByOtherName: !data.isKnownByOtherName })}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 4 }}
            >
              <View style={[certStyles.checkboxBox, data.isKnownByOtherName && certStyles.checkboxBoxSelected]}>
                {data.isKnownByOtherName && <Icon name="check" size={12} color="#ffffff" />}
              </View>
              <Text style={certStyles.checkboxLabel}>Operating under a Trade Name / DBA (Doing Business As)</Text>
            </TouchableOpacity>

            {data.isKnownByOtherName && (
              <ValidatedInput
                label="Registered Trade Name"
                placeholder="e.g. Acme Cloud Connect"
                value={data.otherTradeName}
                onChangeText={(val) => onChange({ otherTradeName: val })}
                required
              />
            )}
          </View>
        </View>
      </View>

      {/* Scope of Value-Added Services */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Scope of Value-Added Services</Text>
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
          Select all services to be offered under this registration certificate:
        </Text>
        <View style={certStyles.checkboxGrid}>
          {AVAILABLE_VAS_SERVICES.map((vas) => {
            const isSelected = data.valueAddedServices.includes(vas);
            return (
              <TouchableOpacity
                key={vas}
                onPress={() => toggleVasService(vas)}
                style={certStyles.checkboxItem}
              >
                <View style={[certStyles.checkboxBox, isSelected && certStyles.checkboxBoxSelected]}>
                  {isSelected && <Icon name="check" size={12} color="#ffffff" />}
                </View>
                <Text style={certStyles.checkboxLabel}>{vas}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
