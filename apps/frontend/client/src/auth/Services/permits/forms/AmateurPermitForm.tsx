import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import {
  AmateurPermitData,
  PermitEquipmentItem,
  PermitPurchaseEquipmentItem,
  PermitStationParticularItem,
  StationClassType,
  PurchaseClassOfStationType,
  BandwidthUnitType,
  initialStationParticularItem,
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
  const isPurchaseMode =
    data.applicationType === "Permit to Purchase" ||
    data.applicationType === "Purchase to Possess";

  const isSellTransferMode =
    data.applicationType === "Permit to Sell/Transfer";

  const isStorageMode =
    data.applicationType === "Possess for storage";

  // Handlers for Purchase Equipments
  const handleAddPurchaseEquipment = () => {
    const newItem: PermitPurchaseEquipmentItem = {
      id: `peq-${Date.now()}-${data.purchaseEquipments.length + 1}`,
      classOfStation: "RT",
    };
    onChange({ purchaseEquipments: [...data.purchaseEquipments, newItem] });
  };

  const handleRemovePurchaseEquipment = (index: number) => {
    if (data.purchaseEquipments.length <= 1) return;
    const updated = data.purchaseEquipments.filter((_, i) => i !== index);
    onChange({ purchaseEquipments: updated });
  };

  const handlePurchaseEquipmentChange = (
    index: number,
    classOfStation: PurchaseClassOfStationType
  ) => {
    const updated = [...data.purchaseEquipments];
    const current = updated[index];
    if (current !== undefined) {
      updated[index] = { ...current, classOfStation };
      onChange({ purchaseEquipments: updated });
    }
  };

  // Handlers for Storage Equipments
  const handleAddStorageEquipment = () => {
    const newItem: PermitEquipmentItem = {
      id: `eq-${Date.now()}-${data.equipments.length + 1}`,
      serialNumber: "",
      frequencyRange: "",
    };
    onChange({ equipments: [...data.equipments, newItem] });
  };

  const handleRemoveStorageEquipment = (index: number) => {
    if (data.equipments.length <= 1) return;
    const updated = data.equipments.filter((_, i) => i !== index);
    onChange({ equipments: updated });
  };

  const handleStorageEquipmentChange = (
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

  // Handlers for Sell/Transfer Station Particulars
  const handleAddStationParticular = () => {
    const newItem = initialStationParticularItem(
      `${data.stationParticulars.length + 1}`
    );
    onChange({ stationParticulars: [...data.stationParticulars, newItem] });
  };

  const handleRemoveStationParticular = (index: number) => {
    if (data.stationParticulars.length <= 1) return;
    const updated = data.stationParticulars.filter((_, i) => i !== index);
    onChange({ stationParticulars: updated });
  };

  const handleStationParticularChange = (
    index: number,
    fields: Partial<PermitStationParticularItem>
  ) => {
    const updated = [...data.stationParticulars];
    const current = updated[index];
    if (current !== undefined) {
      updated[index] = { ...current, ...fields };
      onChange({ stationParticulars: updated });
    }
  };

  const handleAddStationSubEquipment = (stationIdx: number) => {
    const updated = [...data.stationParticulars];
    const current = updated[stationIdx];
    if (current !== undefined) {
      const newItem: PermitEquipmentItem = {
        id: `seq-${Date.now()}-${current.equipments.length + 1}`,
        serialNumber: "",
        frequencyRange: "",
      };
      updated[stationIdx] = {
        ...current,
        equipments: [...current.equipments, newItem],
      };
      onChange({ stationParticulars: updated });
    }
  };

  const handleRemoveStationSubEquipment = (
    stationIdx: number,
    eqIdx: number
  ) => {
    const updated = [...data.stationParticulars];
    const current = updated[stationIdx];
    if (current !== undefined && current.equipments.length > 1) {
      const updatedEquipments = current.equipments.filter((_, i) => i !== eqIdx);
      updated[stationIdx] = { ...current, equipments: updatedEquipments };
      onChange({ stationParticulars: updated });
    }
  };

  const handleStationSubEquipmentChange = (
    stationIdx: number,
    eqIdx: number,
    field: keyof PermitEquipmentItem,
    value: string
  ) => {
    const updated = [...data.stationParticulars];
    const current = updated[stationIdx];
    if (current !== undefined) {
      const updatedEquipments = [...current.equipments];
      const eqItem = updatedEquipments[eqIdx];
      if (eqItem !== undefined) {
        updatedEquipments[eqIdx] = { ...eqItem, [field]: value };
        updated[stationIdx] = { ...current, equipments: updatedEquipments };
        onChange({ stationParticulars: updated });
      }
    }
  };

  // Reusable Intended Use Block
  const renderIntendedUseSection = (sectionNumber: number) => (
    <View style={permitStyles.formSection}>
      <View style={permitStyles.formSectionHeaderRow}>
        <Text style={permitStyles.formSectionHeading}>
          {sectionNumber}. Intended Use of Equipment
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {/* Storage At */}
        <View
          style={[
            permitStyles.intendedUseCard,
            data.intendedUseStorageAt && permitStyles.intendedUseCardActive,
          ]}
        >
          <TouchableOpacity
            style={permitStyles.checkboxRow}
            onPress={() =>
              onChange({ intendedUseStorageAt: !data.intendedUseStorageAt })
            }
            activeOpacity={0.7}
          >
            <View
              style={[
                permitStyles.checkboxBox,
                data.intendedUseStorageAt && permitStyles.checkboxBoxActive,
              ]}
            >
              {data.intendedUseStorageAt && (
                <Icon name="check" size={14} color="#FFFFFF" />
              )}
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
            data.intendedUseAdditionalRadioEquipment &&
              permitStyles.intendedUseCardActive,
          ]}
        >
          <TouchableOpacity
            style={permitStyles.checkboxRow}
            onPress={() =>
              onChange({
                intendedUseAdditionalRadioEquipment:
                  !data.intendedUseAdditionalRadioEquipment,
              })
            }
            activeOpacity={0.7}
          >
            <View
              style={[
                permitStyles.checkboxBox,
                data.intendedUseAdditionalRadioEquipment &&
                  permitStyles.checkboxBoxActive,
              ]}
            >
              {data.intendedUseAdditionalRadioEquipment && (
                <Icon name="check" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={permitStyles.checkboxLabel}>
              Additional Radio Equipment
            </Text>
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
              {data.intendedUseNewRadioStation && (
                <Icon name="check" size={14} color="#FFFFFF" />
              )}
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
            data.intendedUseChangeOfEquipment &&
              permitStyles.intendedUseCardActive,
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
                data.intendedUseChangeOfEquipment &&
                  permitStyles.checkboxBoxActive,
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
              {data.intendedUseOthers && (
                <Icon name="check" size={14} color="#FFFFFF" />
              )}
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
  );

  return (
    <View style={permitStyles.container}>
      {/* Application Context Banner */}
      <View style={permitStyles.noticeBanner}>
        <Icon name="file-text" size={18} color="#1E40AF" />
        <Text style={permitStyles.noticeBannerText}>
          Filing Permit Application: <Text style={{ fontWeight: "700" }}>{data.applicationType || "Permits in the Amateur Service"}</Text> (NTC Form 1-09)
          {isStorageMode
            ? " — Please specify storage location under Section 7 (Intended Use)."
            : ""}
        </Text>
      </View>

      {/* ── SECTION 1: Basic Information & Contact ── */}
      <View style={permitStyles.formSection}>
        <View style={permitStyles.formSectionHeaderRow}>
          <Text style={permitStyles.formSectionHeading}>1. Basic Information & Contact</Text>
          <View style={permitStyles.formSectionBadge}>
            <Text style={permitStyles.formSectionBadgeText}>{data.applicationType || "Amateur Permit"}</Text>
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

          {isPurchaseMode && (
            <View style={permitStyles.formCol12}>
              <ValidatedInput
                label="Frequency(ies)*"
                placeholder="e.g. 144.000 - 146.000 MHz (2m Band), 7.000 - 7.200 MHz (40m Band)"
                value={data.frequency}
                onChangeText={(val) => onChange({ frequency: val })}
                required
              />
            </View>
          )}
        </View>
      </View>

      {/* ── SECTION 2: Address Information ── */}
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

      {/* ── CONDITIONAL SECTIONS FOR PERMIT TO PURCHASE / PURCHASE TO POSSESS ── */}
      {isPurchaseMode && (
        <>
          {/* Section 3: Particulars of Equipment (Class of Station only) */}
          <View style={permitStyles.formSection}>
            <View style={permitStyles.formSectionHeaderRow}>
              <Text style={permitStyles.formSectionHeading}>3. Particulars of Equipment</Text>
              <View style={permitStyles.formSectionBadge}>
                <Text style={permitStyles.formSectionBadgeText}>
                  {data.purchaseEquipments.length} Equipment(s)
                </Text>
              </View>
            </View>

            {data.purchaseEquipments.map((peq, idx) => (
              <View key={peq.id || `peq-${idx}`} style={permitStyles.equipmentCard}>
                <View style={permitStyles.equipmentHeader}>
                  <Text style={permitStyles.equipmentTitle}>Equipment Item #{idx + 1}</Text>
                  {data.purchaseEquipments.length > 1 && (
                    <TouchableOpacity
                      style={permitStyles.removeBtn}
                      onPress={() => handleRemovePurchaseEquipment(idx)}
                    >
                      <Text style={permitStyles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={permitStyles.formGrid}>
                  <View style={permitStyles.formCol12}>
                    <Text style={permitStyles.selectLabel}>
                      Class of Station (RT, FX, FB, ML)*
                    </Text>
                    <View style={permitStyles.pillsRow}>
                      {(["RT", "FX", "FB", "ML"] as const).map((cls) => {
                        const isSelected = peq.classOfStation === cls;
                        return (
                          <TouchableOpacity
                            key={cls}
                            style={[
                              permitStyles.pillBtn,
                              isSelected && permitStyles.pillBtnActive,
                            ]}
                            onPress={() =>
                              handlePurchaseEquipmentChange(idx, cls)
                            }
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                permitStyles.pillText,
                                isSelected && permitStyles.pillTextActive,
                              ]}
                            >
                              {cls}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={permitStyles.addBtn}
              onPress={handleAddPurchaseEquipment}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={16} color="#1E40AF" />
              <Text style={permitStyles.addBtnText}>Add Equipment Particular</Text>
            </TouchableOpacity>
          </View>

          {/* Section 4: Intended Use of Equipment */}
          {renderIntendedUseSection(4)}
        </>
      )}

      {/* ── STANDARD / STORAGE / TEMPORARY PERMIT SECTIONS ── */}
      {!isPurchaseMode && !isSellTransferMode && (
        <>
          {/* Section 3: Station Equipment & Operating Specs */}
          <View style={permitStyles.formSection}>
            <View style={permitStyles.formSectionHeaderRow}>
              <Text style={permitStyles.formSectionHeading}>
                3. Station Equipment & Operating Parameters
              </Text>
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
                  onValueChange={(val) =>
                    onChange({ unit: val as BandwidthUnitType })
                  }
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

          {/* Section 4: Class of Station & Station Particulars */}
          <View style={permitStyles.formSection}>
            <View style={permitStyles.formSectionHeaderRow}>
              <Text style={permitStyles.formSectionHeading}>
                4. Class of Station & Station Particulars
              </Text>
            </View>

            <View style={permitStyles.formGrid}>
              <View style={permitStyles.formCol12}>
                <Text style={permitStyles.selectLabel}>
                  Station Class (RT, FX, FB, FX/FB)*
                </Text>
                <View style={permitStyles.pillsRow}>
                  {(["RT", "FX", "FB", "FX/FB"] as const).map((cls) => {
                    const isSelected = data.stationClass === cls;
                    return (
                      <TouchableOpacity
                        key={cls}
                        style={[
                          permitStyles.pillBtn,
                          isSelected && permitStyles.pillBtnActive,
                        ]}
                        onPress={() => onChange({ stationClass: cls })}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            permitStyles.pillText,
                            isSelected && permitStyles.pillTextActive,
                          ]}
                        >
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

          {/* Section 5: Particulars of Equipment */}
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
                      onPress={() => handleRemoveStorageEquipment(idx)}
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
                      onChangeText={(val) =>
                        handleStorageEquipmentChange(idx, "serialNumber", val)
                      }
                      required
                    />
                  </View>

                  <View style={permitStyles.formCol6}>
                    <ValidatedInput
                      label="Frequency Range*"
                      placeholder="e.g. 144 - 148 MHz, 430 - 440 MHz"
                      value={eq.frequencyRange}
                      onChangeText={(val) =>
                        handleStorageEquipmentChange(idx, "frequencyRange", val)
                      }
                      required
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={permitStyles.addBtn}
              onPress={handleAddStorageEquipment}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={16} color="#1E40AF" />
              <Text style={permitStyles.addBtnText}>Add Equipment Item</Text>
            </TouchableOpacity>
          </View>

          {/* Section 6: Source of Equipment */}
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

          {/* Section 7: Intended Use of Equipment */}
          {renderIntendedUseSection(7)}
        </>
      )}

      {/* ── CONDITIONAL SECTIONS FOR PERMIT TO SELL / TRANSFER ── */}
      {isSellTransferMode && (
        <>
          {/* Section 3: Station Equipment & Operating Parameters */}
          <View style={permitStyles.formSection}>
            <View style={permitStyles.formSectionHeaderRow}>
              <Text style={permitStyles.formSectionHeading}>
                3. Station Equipment & Operating Parameters
              </Text>
            </View>

            <View style={permitStyles.formGrid}>
              <View style={permitStyles.formCol12}>
                <ValidatedInput
                  label="Frequency (within authorized amateur band)*"
                  placeholder="e.g. 144.000 - 146.000 MHz, 430.000 - 440.000 MHz"
                  value={data.frequency}
                  onChangeText={(val) => onChange({ frequency: val })}
                  required
                />
              </View>

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
                  onValueChange={(val) =>
                    onChange({ unit: val as BandwidthUnitType })
                  }
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
                  label="Power Output (Watts)*"
                  placeholder="e.g. 50W, 100W"
                  value={data.powerOutput}
                  onChangeText={(val) => onChange({ powerOutput: val })}
                  required
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

          {/* Section 4: Particulars (Station Particulars + Equipment + Antenna List) */}
          <View style={permitStyles.formSection}>
            <View style={permitStyles.formSectionHeaderRow}>
              <Text style={permitStyles.formSectionHeading}>
                4. Particulars of Station, Equipment & Antenna
              </Text>
              <View style={permitStyles.formSectionBadge}>
                <Text style={permitStyles.formSectionBadgeText}>
                  {data.stationParticulars.length} Station Profile(s)
                </Text>
              </View>
            </View>

            {data.stationParticulars.map((station, sIdx) => (
              <View key={station.id || `stn-${sIdx}`} style={permitStyles.stationParticularCard}>
                <View style={permitStyles.equipmentHeader}>
                  <Text style={permitStyles.equipmentTitle}>Station Profile #{sIdx + 1}</Text>
                  {data.stationParticulars.length > 1 && (
                    <TouchableOpacity
                      style={permitStyles.removeBtn}
                      onPress={() => handleRemoveStationParticular(sIdx)}
                    >
                      <Text style={permitStyles.removeBtnText}>Remove Station</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Station Class */}
                <View style={permitStyles.formGrid}>
                  <View style={permitStyles.formCol12}>
                    <Text style={permitStyles.selectLabel}>
                      Station Class (RT, FX, FB, FX/FB)*
                    </Text>
                    <View style={permitStyles.pillsRow}>
                      {(["RT", "FX", "FB", "FX/FB"] as const).map((cls) => {
                        const isSelected = station.stationClass === cls;
                        return (
                          <TouchableOpacity
                            key={cls}
                            style={[
                              permitStyles.pillBtn,
                              isSelected && permitStyles.pillBtnActive,
                            ]}
                            onPress={() =>
                              handleStationParticularChange(sIdx, {
                                stationClass: cls,
                              })
                            }
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                permitStyles.pillText,
                                isSelected && permitStyles.pillTextActive,
                              ]}
                            >
                              {cls}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Particulars of Station */}
                  <View style={permitStyles.formCol12}>
                    <ValidatedInput
                      label="Exact Location*"
                      placeholder="e.g. Transmitter site or fixed amateur station address"
                      value={station.exactLocation}
                      onChangeText={(val) =>
                        handleStationParticularChange(sIdx, { exactLocation: val })
                      }
                      required
                    />
                  </View>

                  <View style={permitStyles.formCol6}>
                    <ValidatedInput
                      label="Longitude"
                      placeholder="e.g. 121° 02' 35'' E"
                      value={station.longitude}
                      onChangeText={(val) =>
                        handleStationParticularChange(sIdx, { longitude: val })
                      }
                    />
                  </View>

                  <View style={permitStyles.formCol6}>
                    <ValidatedInput
                      label="Latitude"
                      placeholder="e.g. 14° 38' 20'' N"
                      value={station.latitude}
                      onChangeText={(val) =>
                        handleStationParticularChange(sIdx, { latitude: val })
                      }
                    />
                  </View>

                  <View style={permitStyles.formCol6}>
                    <ValidatedInput
                      label="Configuration"
                      placeholder="e.g. Simplex, Duplex, Repeater"
                      value={station.configuration}
                      onChangeText={(val) =>
                        handleStationParticularChange(sIdx, { configuration: val })
                      }
                    />
                  </View>

                  <View style={permitStyles.formCol6}>
                    <ValidatedInput
                      label="Data Rate"
                      placeholder="e.g. 1200 bps, 9600 bps, N/A"
                      value={station.dataRate}
                      onChangeText={(val) =>
                        handleStationParticularChange(sIdx, { dataRate: val })
                      }
                    />
                  </View>

                  <View style={permitStyles.formCol12}>
                    <ValidatedInput
                      label="Remarks"
                      placeholder="e.g. Station remarks and particulars"
                      value={station.remarks}
                      onChangeText={(val) =>
                        handleStationParticularChange(sIdx, { remarks: val })
                      }
                    />
                  </View>
                </View>

                {/* Sub-Box 1: Particulars of Equipment */}
                <View style={permitStyles.subSectionBox}>
                  <Text style={permitStyles.subSectionTitle}>Particulars of Equipment</Text>
                  {station.equipments.map((eq, eqIdx) => (
                    <View key={eq.id || `eq-${eqIdx}`} style={{ marginBottom: 8 }}>
                      <View style={permitStyles.formGrid}>
                        <View style={permitStyles.formCol6}>
                          <ValidatedInput
                            label={`Equipment #${eqIdx + 1} Serial Number*`}
                            placeholder="e.g. SN-9982312"
                            value={eq.serialNumber}
                            onChangeText={(val) =>
                              handleStationSubEquipmentChange(
                                sIdx,
                                eqIdx,
                                "serialNumber",
                                val
                              )
                            }
                            required
                          />
                        </View>

                        <View style={permitStyles.formCol6}>
                          <ValidatedInput
                            label="Frequency Range*"
                            placeholder="e.g. 144 - 148 MHz"
                            value={eq.frequencyRange}
                            onChangeText={(val) =>
                              handleStationSubEquipmentChange(
                                sIdx,
                                eqIdx,
                                "frequencyRange",
                                val
                              )
                            }
                            required
                          />
                        </View>
                      </View>
                      {station.equipments.length > 1 && (
                        <TouchableOpacity
                          style={[permitStyles.removeBtn, { alignSelf: "flex-end", marginTop: 4 }]}
                          onPress={() => handleRemoveStationSubEquipment(sIdx, eqIdx)}
                        >
                          <Text style={permitStyles.removeBtnText}>Remove Equipment</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  <TouchableOpacity
                    style={permitStyles.addBtn}
                    onPress={() => handleAddStationSubEquipment(sIdx)}
                  >
                    <Icon name="plus" size={14} color="#1E40AF" />
                    <Text style={permitStyles.addBtnText}>Add Equipment</Text>
                  </TouchableOpacity>
                </View>

                {/* Sub-Box 2: Particulars of Antenna */}
                <View style={permitStyles.subSectionBox}>
                  <Text style={permitStyles.subSectionTitle}>Particulars of Antenna</Text>
                  <View style={permitStyles.formGrid}>
                    <View style={permitStyles.formCol6}>
                      <ValidatedInput
                        label="Antenna Type"
                        placeholder="e.g. Yagi, Omni, Dipole"
                        value={station.antenna.type}
                        onChangeText={(val) =>
                          handleStationParticularChange(sIdx, {
                            antenna: { ...station.antenna, type: val },
                          })
                        }
                      />
                    </View>

                    <View style={permitStyles.formCol6}>
                      <ValidatedInput
                        label="Height (cm)"
                        placeholder="e.g. 1500"
                        value={station.antenna.heightCm}
                        onChangeText={(val) =>
                          handleStationParticularChange(sIdx, {
                            antenna: { ...station.antenna, heightCm: val },
                          })
                        }
                      />
                    </View>

                    <View style={permitStyles.formCol4}>
                      <ValidatedInput
                        label="Gain (dB)"
                        placeholder="e.g. 12 dB"
                        value={station.antenna.gainDb}
                        onChangeText={(val) =>
                          handleStationParticularChange(sIdx, {
                            antenna: { ...station.antenna, gainDb: val },
                          })
                        }
                      />
                    </View>

                    <View style={permitStyles.formCol4}>
                      <ValidatedInput
                        label="Directivity"
                        placeholder="e.g. Directional, Omni"
                        value={station.antenna.directivity}
                        onChangeText={(val) =>
                          handleStationParticularChange(sIdx, {
                            antenna: { ...station.antenna, directivity: val },
                          })
                        }
                      />
                    </View>

                    <View style={permitStyles.formCol4}>
                      <ValidatedInput
                        label="Diameter"
                        placeholder="e.g. 1.2m, N/A"
                        value={station.antenna.diameter}
                        onChangeText={(val) =>
                          handleStationParticularChange(sIdx, {
                            antenna: { ...station.antenna, diameter: val },
                          })
                        }
                      />
                    </View>

                    <View style={permitStyles.formCol4}>
                      <ValidatedInput
                        label="Polarization"
                        placeholder="e.g. Vertical, Horizontal"
                        value={station.antenna.polarization}
                        onChangeText={(val) =>
                          handleStationParticularChange(sIdx, {
                            antenna: { ...station.antenna, polarization: val },
                          })
                        }
                      />
                    </View>

                    <View style={permitStyles.formCol4}>
                      <ValidatedInput
                        label="Beamwidth"
                        placeholder="e.g. 60 deg"
                        value={station.antenna.beamwidth}
                        onChangeText={(val) =>
                          handleStationParticularChange(sIdx, {
                            antenna: { ...station.antenna, beamwidth: val },
                          })
                        }
                      />
                    </View>

                    <View style={permitStyles.formCol4}>
                      <ValidatedInput
                        label="Antenna Remarks"
                        placeholder="e.g. Mast mounted"
                        value={station.antenna.remarks}
                        onChangeText={(val) =>
                          handleStationParticularChange(sIdx, {
                            antenna: { ...station.antenna, remarks: val },
                          })
                        }
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={permitStyles.addBtn}
              onPress={handleAddStationParticular}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={16} color="#1E40AF" />
              <Text style={permitStyles.addBtnText}>Add Station Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Section 5: Source of Equipment (Sell/Transfer specific fields) */}
          <View style={permitStyles.formSection}>
            <View style={permitStyles.formSectionHeaderRow}>
              <Text style={permitStyles.formSectionHeading}>5. Source of Equipment</Text>
            </View>

            <View style={permitStyles.formGrid}>
              <View style={permitStyles.formCol6}>
                <ValidatedInput
                  label="Name of Dealer / Seller*"
                  placeholder="e.g. Licensed Amateur Transferor / Seller Name"
                  value={data.nameOfDealerOrSeller}
                  onChangeText={(val) => onChange({ nameOfDealerOrSeller: val })}
                  required
                />
              </View>

              <View style={permitStyles.formCol6}>
                <ValidatedInput
                  label="Amateur License No. / Permit to Possess No.*"
                  placeholder="e.g. ARSL-2022-00912 / POP-2023-0182"
                  value={data.amateurLicenseNoOrPermitToPossessNo}
                  onChangeText={(val) =>
                    onChange({ amateurLicenseNoOrPermitToPossessNo: val })
                  }
                  required
                />
              </View>

              <View style={permitStyles.formCol12}>
                <ValidatedInput
                  label="Seller Address*"
                  placeholder="e.g. 456 Quezon Avenue, Quezon City, Metro Manila"
                  value={data.sellerAddress}
                  onChangeText={(val) => onChange({ sellerAddress: val })}
                  required
                />
              </View>
            </View>
          </View>

          {/* Section 6: Intended Use of Equipment */}
          {renderIntendedUseSection(6)}
        </>
      )}
    </View>
  );
}
