import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { AmateurRadioStationLicenseData, EquipmentMakeModelGroup, SerialFrequencyItem } from "../types/licenseTypes";
import { licenseStyles } from "./LicenseFormStyles";

interface AmateurRadioStationLicenseFormProps {
  data: AmateurRadioStationLicenseData;
  onChange: (fields: Partial<AmateurRadioStationLicenseData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

export function AmateurRadioStationLicenseForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: AmateurRadioStationLicenseFormProps) {
  const isRenewalOrMod = data.appType === "RENEWAL" || data.appType === "MODIFICATION";
  const isModification = data.appType === "MODIFICATION";

  // Helpers for Equipment Make/Model Particulars
  const handleAddEquipmentGroup = () => {
    const nextGroup: EquipmentMakeModelGroup = {
      id: `eq-group-${Date.now()}`,
      makeTypeModel: "",
      equipments: [
        { id: `eq-item-${Date.now()}`, serialNo: "", frequencyRange: "", powerOutput: "" },
      ],
    };
    onChange({
      particularsEquipment: [...data.particularsEquipment, nextGroup],
    });
  };

  const handleRemoveEquipmentGroup = (groupIdx: number) => {
    const updated = data.particularsEquipment.filter((_, idx) => idx !== groupIdx);
    onChange({ particularsEquipment: updated });
  };

  const handleGroupMakeModelChange = (groupIdx: number, text: string) => {
    const updated = [...data.particularsEquipment];
    const group = updated[groupIdx];
    if (group) {
      updated[groupIdx] = { ...group, makeTypeModel: text };
      onChange({ particularsEquipment: updated });
    }
  };

  const handleAddSerialItem = (groupIdx: number) => {
    const updated = [...data.particularsEquipment];
    const group = updated[groupIdx];
    if (group) {
      const newItem: SerialFrequencyItem = {
        id: `eq-item-${Date.now()}`,
        serialNo: "",
        frequencyRange: "",
        powerOutput: "",
      };
      updated[groupIdx] = {
        ...group,
        equipments: [...group.equipments, newItem],
      };
      onChange({ particularsEquipment: updated });
    }
  };

  const handleRemoveSerialItem = (groupIdx: number, itemIdx: number) => {
    const updated = [...data.particularsEquipment];
    const group = updated[groupIdx];
    if (group) {
      const updatedEquipments = group.equipments.filter((_, idx) => idx !== itemIdx);
      updated[groupIdx] = { ...group, equipments: updatedEquipments };
      onChange({ particularsEquipment: updated });
    }
  };

  const handleSerialItemChange = (
    groupIdx: number,
    itemIdx: number,
    field: keyof SerialFrequencyItem,
    val: string
  ) => {
    const updated = [...data.particularsEquipment];
    const group = updated[groupIdx];
    if (group && group.equipments[itemIdx]) {
      const updatedEquipments = [...group.equipments];
      updatedEquipments[itemIdx] = {
        ...updatedEquipments[itemIdx],
        [field]: val,
      };
      updated[groupIdx] = { ...group, equipments: updatedEquipments };
      onChange({ particularsEquipment: updated });
    }
  };

  return (
    <View style={licenseStyles.container}>
      {/* Section 1: Application Transaction & License Options */}
      <View style={licenseStyles.formSection}>
        <View style={licenseStyles.formSectionHeaderRow}>
          <Text style={licenseStyles.formSectionHeading}>1. Transaction & License Options</Text>
          <View style={licenseStyles.formSectionBadge}>
            <Text style={licenseStyles.formSectionBadgeText}>Station License</Text>
          </View>
        </View>

        <View style={licenseStyles.formGrid}>
          <View style={licenseStyles.formCol4}>
            <Text style={licenseStyles.selectLabel}>Application Type*</Text>
            <Select
              value={data.appType}
              onValueChange={(val) => onChange({ appType: val as any })}
              options={[
                { label: "New Application (NEW)", value: "NEW" },
                { label: "Renewal (RENEWAL)", value: "RENEWAL" },
                { label: "Modification (MODIFICATION)", value: "MODIFICATION" },
              ]}
            />
          </View>

          <View style={licenseStyles.formCol4}>
            <Text style={licenseStyles.selectLabel}>Class of Station*</Text>
            <Select
              value={data.classOfStation}
              onValueChange={(val) => onChange({ classOfStation: val })}
              options={[
                { label: "Class A (Advanced)", value: "Class A" },
                { label: "Class B (General)", value: "Class B" },
                { label: "Class C (Novice)", value: "Class C" },
                { label: "Class D (Foundation)", value: "Class D" },
              ]}
            />
          </View>

          <View style={licenseStyles.formCol4}>
            <Text style={licenseStyles.selectLabel}>Number of Years*</Text>
            <Select
              value={data.noOfYears}
              onValueChange={(val) => onChange({ noOfYears: val })}
              options={[
                { label: "1 Year", value: "1" },
                { label: "2 Years", value: "2" },
                { label: "3 Years", value: "3" },
                { label: "5 Years", value: "5" },
              ]}
            />
          </View>

          {/* Conditional Renewal & Modification Fields positioned directly above Basic Info */}
          {isRenewalOrMod && (
            <View style={{ width: "100%", backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, borderRadius: 10, padding: 16, marginTop: 8 }}>
              <Text style={{ fontFamily: "System", fontSize: 13, fontWeight: "700", color: "#92400E", marginBottom: 12 }}>
                Existing License Details ({data.appType})
              </Text>
              <View style={licenseStyles.formGrid}>
                <View style={licenseStyles.formCol6}>
                  <ValidatedInput
                    label="License No.*"
                    placeholder="e.g. ARSL-2022-00456"
                    value={data.licenseNo}
                    onChangeText={(val) => onChange({ licenseNo: val })}
                    error={errors.licenseNo}
                    touched={touched.licenseNo}
                    required
                  />
                </View>

                <View style={licenseStyles.formCol6}>
                  <ValidatedInput
                    label="Date of Expiry*"
                    placeholder="MM/DD/YYYY"
                    value={data.dateOfExpiry}
                    onChangeText={(val) => onChange({ dateOfExpiry: val })}
                    error={errors.dateOfExpiry}
                    touched={touched.dateOfExpiry}
                    required
                  />
                </View>

                {isModification && (
                  <View style={licenseStyles.formCol12}>
                    <Text style={licenseStyles.selectLabel}>Modification Due To*</Text>
                    <Select
                      value={data.modificationDueTo}
                      onValueChange={(val) => onChange({ modificationDueTo: val })}
                      options={[
                        { label: "Change of Station Location", value: "Change of Station Location" },
                        { label: "Change / Additional Equipment", value: "Change / Additional Equipment" },
                        { label: "Upgrade of Class of Station", value: "Upgrade of Class of Station" },
                        { label: "Change of Call Sign", value: "Change of Call Sign" },
                        { label: "Change of Name / Personal Info", value: "Change of Name / Personal Info" },
                      ]}
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Section 2: Basic Information */}
      <View style={licenseStyles.formSection}>
        <Text style={licenseStyles.formSectionHeading}>2. Basic Applicant Information</Text>
        <View style={licenseStyles.formGrid}>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="First Name"
              placeholder="e.g. Juan"
              value={data.firstName}
              onChangeText={(val) => onChange({ firstName: val })}
              error={errors.firstName}
              touched={touched.firstName}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Last Name"
              placeholder="e.g. Dela Cruz"
              value={data.lastName}
              onChangeText={(val) => onChange({ lastName: val })}
              error={errors.lastName}
              touched={touched.lastName}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Middle Name"
              placeholder="e.g. Santos"
              value={data.middleName}
              onChangeText={(val) => onChange({ middleName: val })}
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Suffix"
              placeholder="e.g. Jr., III (Optional)"
              value={data.suffix}
              onChangeText={(val) => onChange({ suffix: val })}
            />
          </View>

          <View style={licenseStyles.formCol12}>
            <Text style={licenseStyles.selectLabel}>Date of Birth*</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 2 }}>
                <Select
                  placeholder="Month"
                  value={data.birthMonth}
                  onValueChange={(val) => onChange({ birthMonth: val })}
                  options={months.map((m) => ({ label: m, value: m }))}
                />
              </View>
              <View style={{ flex: 1.2 }}>
                <Select
                  placeholder="Day"
                  value={data.birthDay}
                  onValueChange={(val) => onChange({ birthDay: val })}
                  options={days.map((d) => ({ label: d, value: d }))}
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Select
                  placeholder="Year"
                  value={data.birthYear}
                  onValueChange={(val) => onChange({ birthYear: val })}
                  options={years.map((y) => ({ label: y, value: y }))}
                />
              </View>
            </View>
          </View>

          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Contact Number"
              placeholder="e.g. 09171234567"
              value={data.contactNo}
              onChangeText={(val) => onChange({ contactNo: val })}
              error={errors.contactNo}
              touched={touched.contactNo}
              required
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Email Address"
              placeholder="e.g. applicant@domain.com"
              value={data.email}
              onChangeText={(val) => onChange({ email: val })}
              error={errors.email}
              touched={touched.email}
              required
            />
          </View>

          <View style={licenseStyles.formCol12}>
            <ValidatedInput
              label="Permanent Address"
              placeholder="House/Unit No., Street, Barangay, City/Municipality, Province"
              value={data.address}
              onChangeText={(val) => onChange({ address: val })}
              error={errors.address}
              touched={touched.address}
              required
            />
          </View>

          <View style={licenseStyles.formCol12}>
            <ValidatedInput
              label="Station Location / Installation Address"
              placeholder="Exact physical location of the radio station (if different from permanent address)"
              value={data.location}
              onChangeText={(val) => onChange({ location: val })}
              error={errors.location}
              touched={touched.location}
              required
            />
          </View>

          <View style={licenseStyles.formCol12}>
            <ValidatedInput
              label="Call Sign"
              placeholder={data.appType === "NEW" ? "To be assigned by NTC" : "e.g. DW1AAA"}
              value={data.callSign}
              onChangeText={(val) => onChange({ callSign: val })}
              editable={data.appType !== "NEW"}
            />
            {data.appType === "NEW" && (
              <View style={licenseStyles.callSignBanner}>
                <Icon name="info" size={14} color="#1E40AF" />
                <Text style={licenseStyles.callSignBannerText}>
                  Call Sign for NEW station applications will be officially assigned by NTC upon approval.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Section 3: Examination / Seminar Background */}
      <View style={licenseStyles.formSection}>
        <Text style={licenseStyles.formSectionHeading}>3. Examination / Seminar Background</Text>
        <View style={licenseStyles.formGrid}>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Place of Exam / Seminar"
              placeholder="e.g. NTC Central Office / Regional Office"
              value={data.placeOfExamSeminar}
              onChangeText={(val) => onChange({ placeOfExamSeminar: val })}
            />
          </View>
          <View style={licenseStyles.formCol6}>
            <ValidatedInput
              label="Date of Exam / Seminar"
              placeholder="MM/DD/YYYY"
              value={data.dateOfExamSeminar}
              onChangeText={(val) => onChange({ dateOfExamSeminar: val })}
            />
          </View>
          <View style={licenseStyles.formCol12}>
            <ValidatedInput
              label="Ratings / Exam Score Details"
              placeholder="e.g. Element 2 (85%), Element 3 (90%)"
              value={data.ratings}
              onChangeText={(val) => onChange({ ratings: val })}
            />
          </View>
        </View>
      </View>

      {/* Section 4: Particulars of Radio Equipment */}
      <View style={licenseStyles.formSection}>
        <View style={licenseStyles.formSectionHeaderRow}>
          <Text style={licenseStyles.formSectionHeading}>4. Particulars of Radio Equipment</Text>
          <TouchableOpacity onPress={handleAddEquipmentGroup} style={licenseStyles.addBtn}>
            <Icon name="plus" size={14} color="#1E40AF" />
            <Text style={licenseStyles.addBtnText}>Add Make / Model</Text>
          </TouchableOpacity>
        </View>

        {data.particularsEquipment.map((group, groupIdx) => (
          <View key={group.id || groupIdx} style={licenseStyles.equipmentGroupCard}>
            <View style={licenseStyles.equipmentGroupHeader}>
              <Text style={licenseStyles.equipmentGroupTitle}>
                Equipment Group #{groupIdx + 1}
              </Text>
              {data.particularsEquipment.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveEquipmentGroup(groupIdx)}
                  style={licenseStyles.removeBtn}
                >
                  <Text style={licenseStyles.removeBtnText}>Remove Group</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ marginBottom: 12 }}>
              <ValidatedInput
                label="Make / Type / Model"
                placeholder="e.g. Yaesu FT-891 / Icom IC-7300"
                value={group.makeTypeModel}
                onChangeText={(val) => handleGroupMakeModelChange(groupIdx, val)}
                required
              />
            </View>

            {/* Nested Equipment Items */}
            <Text style={{ fontFamily: "System", fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 8 }}>
              Serial Numbers & Frequency Ranges:
            </Text>
            {group.equipments.map((equip, itemIdx) => (
              <View key={equip.id || itemIdx} style={licenseStyles.subItemCard}>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <View style={{ flex: 1.5 }}>
                    <ValidatedInput
                      label="Serial Number"
                      placeholder="e.g. SN-8910234"
                      value={equip.serialNo}
                      onChangeText={(val) =>
                        handleSerialItemChange(groupIdx, itemIdx, "serialNo", val)
                      }
                      required
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <ValidatedInput
                      label="Frequency Range"
                      placeholder="e.g. 144.00 - 148.00 MHz"
                      value={equip.frequencyRange}
                      onChangeText={(val) =>
                        handleSerialItemChange(groupIdx, itemIdx, "frequencyRange", val)
                      }
                      required
                    />
                  </View>
                  {group.equipments.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveSerialItem(groupIdx, itemIdx)}
                      style={[licenseStyles.removeBtn, { marginTop: 18 }]}
                    >
                      <Icon name="trash-2" size={14} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => handleAddSerialItem(groupIdx)}
              style={[licenseStyles.addBtn, { alignSelf: "flex-start", marginTop: 4 }]}
            >
              <Icon name="plus" size={12} color="#1E40AF" />
              <Text style={[licenseStyles.addBtnText, { fontSize: 12 }]}>Add Serial / Frequency</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}
