import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { DeviceRegistrationData, EquipmentParticularItem } from "../types/certificateTypes";
import { certStyles } from "./CertificateFormStyles";

interface DeviceRegistrationFormProps {
  data: DeviceRegistrationData;
  onChange: (fields: Partial<DeviceRegistrationData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

export function DeviceRegistrationForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: DeviceRegistrationFormProps) {
  const isNonDealer = data.registrationType === "Non-Dealers";

  const handleAddParticular = () => {
    const newParticular: EquipmentParticularItem = {
      id: `part-${Date.now()}`,
      typeOfEquipmentDevice: "Wireless Data Network (WDN) - Indoor",
      nameTypeModel: "",
      equipmentSerials: [{ id: `serial-${Date.now()}`, serialNumber: "" }],
    };
    onChange({ particulars: [...data.particulars, newParticular] });
  };

  const handleRemoveParticular = (index: number) => {
    if (data.particulars.length <= 1) return;
    const updated = data.particulars.filter((_, i) => i !== index);
    onChange({ particulars: updated });
  };

  const handleParticularChange = (index: number, fields: Partial<EquipmentParticularItem>) => {
    const updated = [...data.particulars];
    const target = updated[index];
    if (target !== undefined) {
      updated[index] = { ...target, ...fields };
      onChange({ particulars: updated });
    }
  };

  const handleAddSerial = (particularIndex: number) => {
    const updated = [...data.particulars];
    const target = updated[particularIndex];
    if (target !== undefined) {
      target.equipmentSerials.push({
        id: `serial-${Date.now()}-${target.equipmentSerials.length}`,
        serialNumber: "",
      });
      onChange({ particulars: updated });
    }
  };

  const handleRemoveSerial = (particularIndex: number, serialIndex: number) => {
    const updated = [...data.particulars];
    const target = updated[particularIndex];
    if (target !== undefined && target.equipmentSerials.length > 1) {
      target.equipmentSerials = target.equipmentSerials.filter((_, si) => si !== serialIndex);
      onChange({ particulars: updated });
    }
  };

  const handleSerialChange = (particularIndex: number, serialIndex: number, text: string) => {
    const updated = [...data.particulars];
    const target = updated[particularIndex];
    if (target !== undefined) {
      const serialItem = target.equipmentSerials[serialIndex];
      if (serialItem !== undefined) {
        serialItem.serialNumber = text;
        onChange({ particulars: updated });
      }
    }
  };

  return (
    <View style={certStyles.container}>
      {/* Registration Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Registration Profile</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Registration Type*</Text>
            <Select
              value={data.registrationType}
              onValueChange={(val) => {
                const nextType = val as "Dealers" | "Non-Dealers";
                onChange({
                  registrationType: nextType,
                  invoiceNo: nextType === "Dealers" ? "" : data.invoiceNo,
                });
              }}
              options={[
                { label: "Dealers", value: "Dealers" },
                { label: "Non-Dealers", value: "Non-Dealers" },
              ]}
            />
          </View>

          {isNonDealer && (
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Invoice Number"
                placeholder="Commercial Invoice / Sales Receipt No."
                value={data.invoiceNo}
                onChangeText={(val) => onChange({ invoiceNo: val })}
                error={errors.invoiceNo}
                touched={touched.invoiceNo}
                required
              />
            </View>
          )}
        </View>
      </View>

      {/* Applicant / Business Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Applicant & Business Information</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Business / Registered Name"
              placeholder="e.g. Acme Technologies Inc."
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
              value={data.entityType}
              onValueChange={(val) => onChange({ entityType: val })}
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
              label="SEC / DTI Registration No."
              placeholder="Registration Number"
              value={data.dtiSecNo}
              onChangeText={(val) => onChange({ dtiSecNo: val })}
              error={errors.dtiSecNo}
              touched={touched.dtiSecNo}
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Contact Number"
              placeholder="09171234567"
              value={data.contactNo}
              keyboardType="phone-pad"
              maxLength={13}
              onChangeText={(val) => onChange({ contactNo: val })}
              error={errors.contactNo}
              touched={touched.contactNo}
              required
            />
          </View>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Email Address"
              placeholder="regulatory@domain.com"
              value={data.email}
              onChangeText={(val) => onChange({ email: val })}
              error={errors.email}
              touched={touched.email}
              required
            />
          </View>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Complete Business Address"
              placeholder="Building, Street, Barangay, City, Province"
              value={data.address}
              onChangeText={(val) => onChange({ address: val })}
              error={errors.address}
              touched={touched.address}
              required
            />
          </View>
        </View>
      </View>

      {/* Equipment Particulars (Nested Repeatable Table) */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Equipment Particulars</Text>
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
          Specify device types, models, and serial numbers to be registered under this certificate.
        </Text>

        {data.particulars.map((item, index) => (
          <View key={item.id} style={certStyles.cardRepeater}>
            <View style={certStyles.repeaterHeader}>
              <Text style={certStyles.repeaterTitle}>Device Group #{index + 1}</Text>
              {data.particulars.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveParticular(index)}>
                  <Text style={certStyles.removeButtonText}>Remove Group</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={certStyles.formGrid}>
              <View style={certStyles.formCol6}>
                <Text style={certStyles.selectLabel}>Type of Equipment / Device*</Text>
                <Select
                  value={item.typeOfEquipmentDevice}
                  onValueChange={(val) => handleParticularChange(index, { typeOfEquipmentDevice: val })}
                  options={[
                    { label: "Wireless Data Network (WDN) - Indoor", value: "Wireless Data Network (WDN) - Indoor" },
                    { label: "Short Range Devices (SRD)", value: "Short Range Devices (SRD)" },
                    { label: "Radio Frequency Identification (RFID) Devices", value: "Radio Frequency Identification (RFID) Devices" },
                    { label: "Short Range Radio Services (SRRS) Devices", value: "Short Range Radio Services (SRRS) Devices" },
                    { label: "Public Trunked Radio Equipment (Mobile/Portable)", value: "Public Trunked Radio Equipment (Mobile/Portable)" },
                  ]}
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Make / Type / Model"
                  placeholder="e.g. Cisco Catalyst 9120AX"
                  value={item.nameTypeModel}
                  onChangeText={(val) => handleParticularChange(index, { nameTypeModel: val })}
                  required
                />
              </View>

              {/* Nested Equipment Serials List */}
              <View style={certStyles.formCol12}>
                <Text style={[certStyles.selectLabel, { marginTop: 8 }]}>Equipment Serial Numbers*</Text>
                {item.equipmentSerials.map((s, sIdx) => (
                  <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <ValidatedInput
                        placeholder={`Serial No. ${sIdx + 1}`}
                        value={s.serialNumber}
                        onChangeText={(text) => handleSerialChange(index, sIdx, text)}
                        style={{ marginBottom: 0 }}
                      />
                    </View>
                    {item.equipmentSerials.length > 1 && (
                      <TouchableOpacity onPress={() => handleRemoveSerial(index, sIdx)} style={{ padding: 8 }}>
                        <Icon name="trash" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => handleAddSerial(index)}
                  style={{ alignSelf: "flex-start", marginTop: 4, paddingVertical: 4 }}
                >
                  <Text style={{ fontSize: 12, color: "#2563eb", fontWeight: "600" }}>+ Add Serial Number</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleAddParticular} style={certStyles.addButton}>
          <Icon name="plus" size={16} color="#2563eb" />
          <Text style={certStyles.addButtonText}>Add Another Equipment Device Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
