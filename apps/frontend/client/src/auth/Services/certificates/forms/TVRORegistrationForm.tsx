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

      {/* Section 1: Particulars of Equipment */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>1. Particulars of Equipment</Text>
        {data.particularsEquipment.map((eq, idx) => (
          <View key={eq.id} style={certStyles.cardRepeater}>
            <View style={certStyles.repeaterHeader}>
              <Text style={certStyles.repeaterTitle}>Equipment #{idx + 1}</Text>
              {data.particularsEquipment.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveEquipment(idx)}>
                  <Text style={certStyles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={certStyles.formGrid}>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Type of Equipment"
                  placeholder="e.g. Satellite Receiver / LNB"
                  value={eq.type}
                  onChangeText={(val) => handleEquipmentChange(idx, { type: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Make / Type / Model"
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
                  placeholder="e.g. 3.7 - 4.2 GHz"
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

      {/* Section 2: Particulars of Antenna System */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>2. Particulars of Antenna System</Text>
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
                  label="Make / Type / Model"
                  placeholder="e.g. Patriot 3.8m Prime Focus"
                  value={ant.makeTypeModel}
                  onChangeText={(val) => handleAntennaChange(idx, { makeTypeModel: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Dish Diameter"
                  placeholder="e.g. 3.8 meters"
                  value={ant.dishDiameter}
                  onChangeText={(val) => handleAntennaChange(idx, { dishDiameter: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Polarization"
                  placeholder="e.g. Dual Linear (H/V)"
                  value={ant.polarization}
                  onChangeText={(val) => handleAntennaChange(idx, { polarization: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Azimuth / Elevation"
                  placeholder="e.g. 142.5° / 58.2°"
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

      {/* Section 3: Particulars of Signal to be Received */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>3. Particulars of Signal to be Received</Text>
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
                  label="Satellite Name / Position"
                  placeholder="e.g. Asiasat 7 (105.5°E)"
                  value={sig.satellite}
                  onChangeText={(val) => handleSignalChange(idx, { satellite: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Received Frequency (Downlink)"
                  placeholder="e.g. 3840 MHz"
                  value={sig.receivedFrequency}
                  onChangeText={(val) => handleSignalChange(idx, { receivedFrequency: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Signal Polarization"
                  placeholder="e.g. Vertical"
                  value={sig.polarization}
                  onChangeText={(val) => handleSignalChange(idx, { polarization: val })}
                  required
                />
              </View>
              <View style={certStyles.formCol6}>
                <ValidatedInput
                  label="Names of Programs / Broadcasts"
                  placeholder="e.g. News, Educational Channels"
                  value={sig.nameOfPrograms}
                  onChangeText={(val) => handleSignalChange(idx, { nameOfPrograms: val })}
                  required
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
    </View>
  );
}
