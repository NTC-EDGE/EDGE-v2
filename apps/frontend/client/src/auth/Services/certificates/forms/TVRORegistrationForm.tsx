import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import {
  TVRORegistrationData,
  TVROEquipmentItem,
  TVROAntennaItem,
  TVROSignalItem,
} from "../types/certificateTypes";
import { certStyles } from "./CertificateFormStyles";

interface TVRORegistrationFormProps {
  data: TVRORegistrationData;
  onChange: (fields: Partial<TVRORegistrationData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

export function TVRORegistrationForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: TVRORegistrationFormProps) {
  // ── Equipment Handlers ──────────────────────────────────────────────────────
  const handleAddEquipment = () => {
    const newEq: TVROEquipmentItem = {
      id: `eq-${Date.now()}`,
      type: "TVRO Satellite Receiver",
      makeTypeModel: "",
      serialNo: "",
      frequencyRange: "",
    };
    onChange({ particularsEquipment: [...data.particularsEquipment, newEq] });
  };

  const handleRemoveEquipment = (index: number) => {
    if (data.particularsEquipment.length <= 1) return;
    const updated = data.particularsEquipment.filter((_, i) => i !== index);
    onChange({ particularsEquipment: updated });
  };

  const handleEquipmentChange = (index: number, fields: Partial<TVROEquipmentItem>) => {
    const updated = [...data.particularsEquipment];
    const target = updated[index];
    if (target !== undefined) {
      updated[index] = { ...target, ...fields };
      onChange({ particularsEquipment: updated });
    }
  };

  // ── Antenna Handlers ────────────────────────────────────────────────────────
  const handleAddAntenna = () => {
    const newAnt: TVROAntennaItem = {
      id: `ant-${Date.now()}`,
      makeTypeModel: "",
      dishDiameter: "",
      polarization: "",
      azimuth: "",
    };
    onChange({ particularsOfAntennaSystem: [...data.particularsOfAntennaSystem, newAnt] });
  };

  const handleRemoveAntenna = (index: number) => {
    if (data.particularsOfAntennaSystem.length <= 1) return;
    const updated = data.particularsOfAntennaSystem.filter((_, i) => i !== index);
    onChange({ particularsOfAntennaSystem: updated });
  };

  const handleAntennaChange = (index: number, fields: Partial<TVROAntennaItem>) => {
    const updated = [...data.particularsOfAntennaSystem];
    const target = updated[index];
    if (target !== undefined) {
      updated[index] = { ...target, ...fields };
      onChange({ particularsOfAntennaSystem: updated });
    }
  };

  // ── Signal Handlers ─────────────────────────────────────────────────────────
  const handleAddSignal = () => {
    const newSig: TVROSignalItem = {
      id: `sig-${Date.now()}`,
      satellite: "",
      receivedFrequency: "",
      polarization: "",
      nameOfPrograms: "",
    };
    onChange({ particularsOfSignalToBeReceived: [...data.particularsOfSignalToBeReceived, newSig] });
  };

  const handleRemoveSignal = (index: number) => {
    if (data.particularsOfSignalToBeReceived.length <= 1) return;
    const updated = data.particularsOfSignalToBeReceived.filter((_, i) => i !== index);
    onChange({ particularsOfSignalToBeReceived: updated });
  };

  const handleSignalChange = (index: number, fields: Partial<TVROSignalItem>) => {
    const updated = [...data.particularsOfSignalToBeReceived];
    const target = updated[index];
    if (target !== undefined) {
      updated[index] = { ...target, ...fields };
      onChange({ particularsOfSignalToBeReceived: updated });
    }
  };

  return (
    <View style={certStyles.container}>
      {/* TVRO Classification */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>TVRO Registration Details</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Classification of Applicant*</Text>
            <Select
              value={data.classification}
              onValueChange={(val) => onChange({ classification: val as "Commercial" | "Non-Commercial" })}
              options={[
                { label: "Commercial TVRO Station", value: "Commercial" },
                { label: "Non-Commercial / Private TVRO Station", value: "Non-Commercial" },
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
              ]}
            />
          </View>
        </View>
      </View>

      {/* Applicant / Business Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Applicant / Entity Information</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Applicant Name / Company Name"
              placeholder="e.g. Broadcast Media Corporation"
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
              placeholder="station@domain.com"
              value={data.email}
              onChangeText={(val) => onChange({ email: val })}
              error={errors.email}
              touched={touched.email}
              required
            />
          </View>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Station Location Address"
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

      {/* Section 4: Location */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>4. Location</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Service Area"
              placeholder="e.g. Metro Manila, Region IV-A, Nationwide"
              value={data.serviceArea}
              onChangeText={(val) => onChange({ serviceArea: val })}
              error={errors.serviceArea}
              touched={touched.serviceArea}
              required
            />
          </View>
          <View style={certStyles.formCol12}>
            <ValidatedInput
              label="Exact Location of TVRO System"
              placeholder="e.g. Rooftop Broadcast Tower, 5th Floor Media Complex, Agham Rd, Diliman, Quezon City"
              value={data.exactLocation}
              onChangeText={(val) => onChange({ exactLocation: val })}
              error={errors.exactLocation}
              touched={touched.exactLocation}
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Longitude (deg-min-sec)"
              placeholder={`e.g. 121° 02' 45" E`}
              value={data.longitude}
              onChangeText={(val) => onChange({ longitude: val })}
              error={errors.longitude}
              touched={touched.longitude}
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Latitude (deg-min-sec)"
              placeholder={`e.g. 14° 39' 12" N`}
              value={data.latitude}
              onChangeText={(val) => onChange({ latitude: val })}
              error={errors.latitude}
              touched={touched.latitude}
            />
          </View>
        </View>
      </View>

      {/* Section 5: Particulars of Equipment */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>5. Particulars of Equipment</Text>
        {data.particularsEquipment.map((eq, idx) => (
          <View key={eq.id} style={certStyles.cardRepeater}>
            <View style={certStyles.repeaterHeader}>
              <Text style={certStyles.repeaterTitle}>Equipment Unit #{idx + 1}</Text>
              {data.particularsEquipment.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveEquipment(idx)}>
                  <Text style={certStyles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={certStyles.formGrid}>
              <View style={certStyles.formCol6}>
                <Text style={certStyles.selectLabel}>Type*</Text>
                <Select
                  value={eq.type}
                  onValueChange={(val) => handleEquipmentChange(idx, { type: val })}
                  options={[
                    { label: "LNA/LNB", value: "LNA/LNB" },
                    { label: "Receivers", value: "Receivers" },
                    { label: "Combiner/s", value: "Combiner/s" },
                    { label: "Modulators", value: "Modulators" },
                  ]}
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Make/Type/Model"
                  placeholder="e.g. Harmonic ProView 7100"
                  value={eq.makeTypeModel}
                  onChangeText={(val) => handleEquipmentChange(idx, { makeTypeModel: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Serial Number"
                  placeholder="e.g. SN-8920194"
                  value={eq.serialNo}
                  onChangeText={(val) => handleEquipmentChange(idx, { serialNo: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Frequency Range"
                  placeholder="e.g. 3.7 - 4.2 GHz (C-Band)"
                  value={eq.frequencyRange}
                  onChangeText={(val) => handleEquipmentChange(idx, { frequencyRange: val })}
                  required
                />
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={handleAddEquipment} style={certStyles.addButton}>
          <Icon name="plus" size={16} color="#2563eb" />
          <Text style={certStyles.addButtonText}>Add Equipment Unit</Text>
        </TouchableOpacity>
      </View>

      {/* Section 6: Particulars of Antenna System */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>6. Particulars of Antenna System</Text>
        {data.particularsOfAntennaSystem.map((ant, idx) => (
          <View key={ant.id} style={certStyles.cardRepeater}>
            <View style={certStyles.repeaterHeader}>
              <Text style={certStyles.repeaterTitle}>Antenna Dish #{idx + 1}</Text>
              {data.particularsOfAntennaSystem.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveAntenna(idx)}>
                  <Text style={certStyles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={certStyles.formGrid}>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Make/Type/Model"
                  placeholder="e.g. Patriot 3.8m Prime Focus"
                  value={ant.makeTypeModel}
                  onChangeText={(val) => handleAntennaChange(idx, { makeTypeModel: val })}
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Dish Diameter"
                  placeholder="e.g. 3.8 meters"
                  value={ant.dishDiameter}
                  onChangeText={(val) => handleAntennaChange(idx, { dishDiameter: val })}
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Polarization"
                  placeholder="e.g. Dual Linear (H/V) / Circular"
                  value={ant.polarization}
                  onChangeText={(val) => handleAntennaChange(idx, { polarization: val })}
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Azimuth"
                  placeholder="e.g. 142.5° True"
                  value={ant.azimuth}
                  onChangeText={(val) => handleAntennaChange(idx, { azimuth: val })}
                />
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={handleAddAntenna} style={certStyles.addButton}>
          <Icon name="plus" size={16} color="#2563eb" />
          <Text style={certStyles.addButtonText}>Add Antenna System</Text>
        </TouchableOpacity>
      </View>

      {/* Section 7: Particulars of Signal to be Received */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>7. Particulars of Signal to be Received</Text>
        {data.particularsOfSignalToBeReceived.map((sig, idx) => (
          <View key={sig.id} style={certStyles.cardRepeater}>
            <View style={certStyles.repeaterHeader}>
              <Text style={certStyles.repeaterTitle}>Satellite Signal Channel #{idx + 1}</Text>
              {data.particularsOfSignalToBeReceived.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveSignal(idx)}>
                  <Text style={certStyles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={certStyles.formGrid}>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Satellite"
                  placeholder="e.g. Asiasat 7 (105.5°E)"
                  value={sig.satellite}
                  onChangeText={(val) => handleSignalChange(idx, { satellite: val })}
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Received Frequency"
                  placeholder="e.g. 3840 MHz"
                  value={sig.receivedFrequency}
                  onChangeText={(val) => handleSignalChange(idx, { receivedFrequency: val })}
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Polarization"
                  placeholder="e.g. Vertical / Horizontal"
                  value={sig.polarization}
                  onChangeText={(val) => handleSignalChange(idx, { polarization: val })}
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Name of Programs"
                  placeholder="e.g. News, International Feeds, Educational Broadcasts"
                  value={sig.nameOfPrograms}
                  onChangeText={(val) => handleSignalChange(idx, { nameOfPrograms: val })}
                />
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={handleAddSignal} style={certStyles.addButton}>
          <Icon name="plus" size={16} color="#2563eb" />
          <Text style={certStyles.addButtonText}>Add Signal Channel</Text>
        </TouchableOpacity>
      </View>

      {/* Section 8: BSD (Broadcast Services Division) */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>8. Broadcast Services Division (BSD)</Text>
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderWidth: 1,
            borderColor: "#CBD5E1",
            borderRadius: 10,
            padding: 16,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: "Inter", fontSize: 13, fontWeight: "700", color: "#334155" }}>
              BSD No.
            </Text>
            <View
              style={{
                backgroundColor: "#EFF6FF",
                borderWidth: 1,
                borderColor: "#BFDBFE",
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontFamily: "Inter", fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
                OFFICIAL NTC ASSIGNMENT
              </Text>
            </View>
          </View>
          <ValidatedInput
            label="BSD Number"
            value="TO BE ASSIGNED BY NTC"
            editable={false}
            onChangeText={() => {}}
          />
          <Text style={{ fontFamily: "Inter", fontSize: 11.5, color: "#64748B", fontStyle: "italic", marginTop: 2 }}>
            * Note: BSD No. is designated and assigned exclusively by the National Telecommunications Commission (NTC) upon review and verification.
          </Text>
        </View>
      </View>
    </View>
  );
}
