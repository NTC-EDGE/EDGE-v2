import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import {
  AmateurPermitData,
  PermitApplicationType,
  PermitEquipmentItem,
  StationClassType,
  BandwidthUnitType,
} from "../types/permitTypes";
import { permitStyles } from "./PermitFormStyles";

interface AmateurPermitFormProps {
  data: AmateurPermitData;
  onChange: (fields: Partial<AmateurPermitData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

export function AmateurPermitForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: AmateurPermitFormProps) {
  const isStoragePermit =
    data.applicationType === "Possess for storage" ||
    data.applicationType === "Possess";

  const handleAddEquipment = () => {
    const newItem: PermitEquipmentItem = {
      id: `eq-${Date.now()}-${data.equipments.length + 1}`,
      serialNumber: "",
      frequencyRange: "",
    };
    onChange({
      equipments: [...data.equipments, newItem],
    });
  };

  const handleRemoveEquipment = (index: number) => {
    if (data.equipments.length <= 1) return;
    const updated = data.equipments.filter((_, i) => i !== index);
    onChange({ equipments: updated });
  };

  const handleEquipmentChange = (
    index: number,
    field: keyof PermitEquipmentItem,
    value: string
  ) => {
    const updated = [...data.equipments];
    const current = updated[index];
    if (current !== undefined) {
      updated[index] = { ...current, [field]: value };
      onChange({ equipments: updated });
    }
  };

  return (
    <View style={permitStyles.container}>
      {/* Read-Only Application Type Context Banner */}
      <View style={permitStyles.noticeBanner}>
        <Icon name="file-text" size={18} color="#1E40AF" />
        <Text style={permitStyles.noticeBannerText}>
          Filing Permit Application: <Text style={{ fontWeight: "700" }}>{data.applicationType || "Possess for Storage"}</Text> (NTC Form 1-09)
          {isStoragePermit ? " — Please specify storage location under Section 7 (Intended Use)." : ""}
        </Text>
      </View>

      {/* 1. Basic Information & Contact */}
      <View style={permitStyles.formSection}>
        <View style={permitStyles.formSectionHeaderRow}>
          <Text style={permitStyles.formSectionHeading}>1. Basic Information & Contact</Text>
          <View style={permitStyles.formSectionBadge}>
            <Text style={permitStyles.formSectionBadgeText}>{data.applicationType || "Possess for storage"}</Text>
          </View>
        </View>

        <View style={permitStyles.formGrid}>
          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Applicant Name / Call Sign Holder*"
              placeholder="e.g. Juan Dela Cruz / Club Representative"
              value={data.applicant}
              onChangeText={(val) => onChange({ applicant: val })}
              error={touched.applicant ? errors.applicant : undefined}
              required
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Call Sign"
              placeholder="e.g. DU1ABC, 4D1XYZ"
              value={data.callSign}
              onChangeText={(val) => onChange({ callSign: val.toUpperCase() })}
              error={touched.callSign ? errors.callSign : undefined}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Contact Number*"
              placeholder="0917XXXXXXX / (02) 8XXX-XXXX"
              value={data.contactNo}
              onChangeText={(val) => onChange({ contactNo: val })}
              error={touched.contactNo ? errors.contactNo : undefined}
              required
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Email Address*"
              placeholder="applicant@example.com"
              value={data.email}
              onChangeText={(val) => onChange({ email: val })}
              error={touched.email ? errors.email : undefined}
              required
            />
          </View>
        </View>
      </View>

      {/* 2. Address Information */}
      <View style={permitStyles.formSection}>
        <View style={permitStyles.formSectionHeaderRow}>
          <Text style={permitStyles.formSectionHeading}>2. Address Information</Text>
        </View>

        <View style={permitStyles.formGrid}>
          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="Region*"
              placeholder="e.g. NCR - National Capital Region"
              value={data.region}
              onChangeText={(val) => onChange({ region: val })}
              error={touched.region ? errors.region : undefined}
              required
            />
          </View>

          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="Province*"
              placeholder="e.g. Metro Manila / Cavite"
              value={data.province}
              onChangeText={(val) => onChange({ province: val })}
              error={touched.province ? errors.province : undefined}
              required
            />
          </View>

          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="City / Municipality*"
              placeholder="e.g. Quezon City"
              value={data.city}
              onChangeText={(val) => onChange({ city: val })}
              error={touched.city ? errors.city : undefined}
              required
            />
          </View>

          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="Barangay*"
              placeholder="e.g. Barangay Central"
              value={data.barangay}
              onChangeText={(val) => onChange({ barangay: val })}
              error={touched.barangay ? errors.barangay : undefined}
              required
            />
          </View>

          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="Street Address*"
              placeholder="e.g. 123 Agham Road"
              value={data.street}
              onChangeText={(val) => onChange({ street: val })}
              error={touched.street ? errors.street : undefined}
              required
            />
          </View>

          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="Room / Unit / Bldg"
              placeholder="e.g. Unit 402, Tower 1"
              value={data.room}
              onChangeText={(val) => onChange({ room: val })}
            />
          </View>

          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="Zip Code*"
              placeholder="e.g. 1100"
              value={data.zipCode}
              onChangeText={(val) => onChange({ zipCode: val })}
              error={touched.zipCode ? errors.zipCode : undefined}
              required
            />
          </View>
        </View>
      </View>

      {/* 3. Station & Technical Equipment */}
      <View style={permitStyles.formSection}>
        <View style={permitStyles.formSectionHeaderRow}>
          <Text style={permitStyles.formSectionHeading}>3. Station Equipment & Operating Parameters</Text>
        </View>

        <View style={permitStyles.formGrid}>
          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Service Area / Points of Communication"
              placeholder="e.g. Nationwide, Regional, Fixed Point"
              value={data.serviceArea}
              onChangeText={(val) => onChange({ serviceArea: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Assigned Frequency / Band"
              placeholder="e.g. 144.000 - 146.000 MHz (2m Band)"
              value={data.frequency}
              onChangeText={(val) => onChange({ frequency: val })}
            />
          </View>

          {/* Bandwidth & Unit */}
          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="Bandwidth"
              placeholder="e.g. 16, 25, 200"
              value={data.bandwidth}
              onChangeText={(val) => onChange({ bandwidth: val })}
            />
          </View>

          <View style={permitStyles.formCol4}>
            <Text style={permitStyles.selectLabel}>Bandwidth Unit</Text>
            <Select
              value={data.unit}
              onValueChange={(val) => onChange({ unit: val as BandwidthUnitType })}
              options={[
                { label: "KHz", value: "KHz" },
                { label: "MHz", value: "MHz" },
                { label: "GHz", value: "GHz" },
              ]}
            />
          </View>

          <View style={permitStyles.formCol4}>
            <ValidatedInput
              label="Emission Designator"
              placeholder="e.g. 16K0F3E, 200KF8E, A3E"
              value={data.emission}
              onChangeText={(val) => onChange({ emission: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Power Output (Watts)"
              placeholder="e.g. 50W, 100W"
              value={data.powerOutput}
              onChangeText={(val) => onChange({ powerOutput: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Hours of Operation"
              placeholder="e.g. 24 Hours / H24, Intermittent"
              value={data.hoursOfOperation}
              onChangeText={(val) => onChange({ hoursOfOperation: val })}
            />
          </View>
        </View>
      </View>

      {/* 4. Class of Station & Location Particulars */}
      <View style={permitStyles.formSection}>
        <View style={permitStyles.formSectionHeaderRow}>
          <Text style={permitStyles.formSectionHeading}>4. Class of Station & Station Particulars</Text>
        </View>

        <View style={permitStyles.formGrid}>
          {/* Station Class Selector */}
          <View style={permitStyles.formCol12}>
            <Text style={permitStyles.selectLabel}>Station Class (RT, FX, FB, FX/FB)*</Text>
            <View style={permitStyles.pillsRow}>
              {(["RT", "FX", "FB", "FX/FB"] as const).map((cls) => {
                const isSelected = data.stationClass === cls;
                return (
                  <TouchableOpacity
                    key={cls}
                    style={[permitStyles.pillBtn, isSelected && permitStyles.pillBtnActive]}
                    onPress={() => onChange({ stationClass: cls })}
                    activeOpacity={0.7}
                  >
                    <Text style={[permitStyles.pillText, isSelected && permitStyles.pillTextActive]}>
                      {cls}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={permitStyles.formCol12}>
            <ValidatedInput
              label="Exact Location of Station*"
              placeholder="e.g. Specific address or transmitter site coordinates"
              value={data.exactLocation}
              onChangeText={(val) => onChange({ exactLocation: val })}
              required
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Longitude"
              placeholder="e.g. 121° 02' 35'' E"
              value={data.longitude}
              onChangeText={(val) => onChange({ longitude: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Latitude"
              placeholder="e.g. 14° 38' 20'' N"
              value={data.latitude}
              onChangeText={(val) => onChange({ latitude: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Configuration"
              placeholder="e.g. Simplex, Semi-Duplex, Duplex, Repeater"
              value={data.configuration}
              onChangeText={(val) => onChange({ configuration: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Data Rate"
              placeholder="e.g. 1200 bps, 9600 bps, N/A"
              value={data.dataRate}
              onChangeText={(val) => onChange({ dataRate: val })}
            />
          </View>

          <View style={permitStyles.formCol12}>
            <ValidatedInput
              label="Remarks / Additional Notes"
              placeholder="e.g. High altitude location, backup emergency transceiver"
              value={data.remarks}
              onChangeText={(val) => onChange({ remarks: val })}
            />
          </View>
        </View>
      </View>

      {/* 5. Particulars of Equipment (Repeater) */}
      <View style={permitStyles.formSection}>
        <View style={permitStyles.formSectionHeaderRow}>
          <Text style={permitStyles.formSectionHeading}>5. Particulars of Equipment</Text>
          <View style={permitStyles.formSectionBadge}>
            <Text style={permitStyles.formSectionBadgeText}>{data.equipments.length} Item(s)</Text>
          </View>
        </View>

        {data.equipments.map((eq, idx) => (
          <View key={eq.id || `eq-${idx}`} style={permitStyles.equipmentCard}>
            <View style={permitStyles.equipmentHeader}>
              <Text style={permitStyles.equipmentTitle}>Equipment #{idx + 1}</Text>
              {data.equipments.length > 1 && (
                <TouchableOpacity
                  style={permitStyles.removeBtn}
                  onPress={() => handleRemoveEquipment(idx)}
                >
                  <Text style={permitStyles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={permitStyles.formGrid}>
              <View style={permitStyles.formCol6}>
                <ValidatedInput
                  label="Serial Number*"
                  placeholder="e.g. SN-89213478"
                  value={eq.serialNumber}
                  onChangeText={(val) => handleEquipmentChange(idx, "serialNumber", val)}
                  required
                />
              </View>

              <View style={permitStyles.formCol6}>
                <ValidatedInput
                  label="Frequency Range*"
                  placeholder="e.g. 144 - 148 MHz, 430 - 440 MHz"
                  value={eq.frequencyRange}
                  onChangeText={(val) => handleEquipmentChange(idx, "frequencyRange", val)}
                  required
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={permitStyles.addBtn} onPress={handleAddEquipment} activeOpacity={0.7}>
          <Icon name="plus" size={16} color="#1E40AF" />
          <Text style={permitStyles.addBtnText}>Add Equipment Item</Text>
        </TouchableOpacity>
      </View>

      {/* 6. Source of Equipment */}
      <View style={permitStyles.formSection}>
        <View style={permitStyles.formSectionHeaderRow}>
          <Text style={permitStyles.formSectionHeading}>6. Source of Equipment</Text>
        </View>

        <View style={permitStyles.formGrid}>
          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Name of Dealer"
              placeholder="e.g. Authorized NTC Radio Dealer Inc."
              value={data.nameOfDealer}
              onChangeText={(val) => onChange({ nameOfDealer: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Authorized Seller / Buyer"
              placeholder="e.g. Licensed Amateur Transferor / Seller"
              value={data.authorizedSellerBuyer}
              onChangeText={(val) => onChange({ authorizedSellerBuyer: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Official Receipt (OR) / Invoice No."
              placeholder="e.g. OR-2024-991203"
              value={data.orInvoiceNo}
              onChangeText={(val) => onChange({ orInvoiceNo: val })}
            />
          </View>

          <View style={permitStyles.formCol6}>
            <ValidatedInput
              label="Permit / RSL No."
              placeholder="e.g. RSL-AMA-2023-00129"
              value={data.permitRslNo}
              onChangeText={(val) => onChange({ permitRslNo: val })}
            />
          </View>
        </View>
      </View>

      {/* 7. Intended Use of Equipment */}
      <View style={permitStyles.formSection}>
        <View style={permitStyles.formSectionHeaderRow}>
          <Text style={permitStyles.formSectionHeading}>7. Intended Use of Equipment</Text>
        </View>

        <View style={{ gap: 12 }}>
          {/* Storage At (Highlighted for Possess for Storage) */}
          <View
            style={[
              permitStyles.intendedUseCard,
              data.intendedUseStorageAt && permitStyles.intendedUseCardActive,
            ]}
          >
            <TouchableOpacity
              style={permitStyles.checkboxRow}
              onPress={() => onChange({ intendedUseStorageAt: !data.intendedUseStorageAt })}
              activeOpacity={0.7}
            >
              <View
                style={[
                  permitStyles.checkboxBox,
                  data.intendedUseStorageAt && permitStyles.checkboxBoxActive,
                ]}
              >
                {data.intendedUseStorageAt && <Icon name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={permitStyles.checkboxLabel}>
                Storage At (Please specify storage address / location)
              </Text>
            </TouchableOpacity>

            {data.intendedUseStorageAt && (
              <View style={{ marginTop: 8 }}>
                <ValidatedInput
                  label="Storage Location / Warehouse / Facility Address*"
                  placeholder="e.g. Unit 10, Storage Facility, Pasig City / Home Address Storage"
                  value={data.storageAtSpecify}
                  onChangeText={(val) => onChange({ storageAtSpecify: val })}
                  required
                />
              </View>
            )}
          </View>

          {/* Additional Radio Equipment */}
          <View
            style={[
              permitStyles.intendedUseCard,
              data.intendedUseAdditionalRadioEquipment && permitStyles.intendedUseCardActive,
            ]}
          >
            <TouchableOpacity
              style={permitStyles.checkboxRow}
              onPress={() =>
                onChange({
                  intendedUseAdditionalRadioEquipment: !data.intendedUseAdditionalRadioEquipment,
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  permitStyles.checkboxBox,
                  data.intendedUseAdditionalRadioEquipment && permitStyles.checkboxBoxActive,
                ]}
              >
                {data.intendedUseAdditionalRadioEquipment && (
                  <Icon name="check" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={permitStyles.checkboxLabel}>Additional Radio Equipment</Text>
            </TouchableOpacity>
          </View>

          {/* New Radio Station */}
          <View
            style={[
              permitStyles.intendedUseCard,
              data.intendedUseNewRadioStation && permitStyles.intendedUseCardActive,
            ]}
          >
            <TouchableOpacity
              style={permitStyles.checkboxRow}
              onPress={() =>
                onChange({
                  intendedUseNewRadioStation: !data.intendedUseNewRadioStation,
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  permitStyles.checkboxBox,
                  data.intendedUseNewRadioStation && permitStyles.checkboxBoxActive,
                ]}
              >
                {data.intendedUseNewRadioStation && <Icon name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={permitStyles.checkboxLabel}>
                New Radio Station (Please specify)
              </Text>
            </TouchableOpacity>

            {data.intendedUseNewRadioStation && (
              <View style={{ marginTop: 8 }}>
                <ValidatedInput
                  label="New Station Details"
                  placeholder="e.g. Newly constructed base station in Tagaytay"
                  value={data.newRadioStationSpecify}
                  onChangeText={(val) => onChange({ newRadioStationSpecify: val })}
                />
              </View>
            )}
          </View>

          {/* Change of Equipment */}
          <View
            style={[
              permitStyles.intendedUseCard,
              data.intendedUseChangeOfEquipment && permitStyles.intendedUseCardActive,
            ]}
          >
            <TouchableOpacity
              style={permitStyles.checkboxRow}
              onPress={() =>
                onChange({
                  intendedUseChangeOfEquipment: !data.intendedUseChangeOfEquipment,
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  permitStyles.checkboxBox,
                  data.intendedUseChangeOfEquipment && permitStyles.checkboxBoxActive,
                ]}
              >
                {data.intendedUseChangeOfEquipment && (
                  <Icon name="check" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={permitStyles.checkboxLabel}>Change of Equipment</Text>
            </TouchableOpacity>
          </View>

          {/* Others */}
          <View
            style={[
              permitStyles.intendedUseCard,
              data.intendedUseOthers && permitStyles.intendedUseCardActive,
            ]}
          >
            <TouchableOpacity
              style={permitStyles.checkboxRow}
              onPress={() =>
                onChange({
                  intendedUseOthers: !data.intendedUseOthers,
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  permitStyles.checkboxBox,
                  data.intendedUseOthers && permitStyles.checkboxBoxActive,
                ]}
              >
                {data.intendedUseOthers && <Icon name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={permitStyles.checkboxLabel}>Others (Please specify)</Text>
            </TouchableOpacity>

            {data.intendedUseOthers && (
              <View style={{ marginTop: 8 }}>
                <ValidatedInput
                  label="Specify Intended Use"
                  placeholder="e.g. Experimental testing, demonstration, club activity"
                  value={data.othersSpecify}
                  onChangeText={(val) => onChange({ othersSpecify: val })}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
