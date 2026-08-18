import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, Icon } from "@edge/ui";
import { Input } from "../../../shared/components/Input";
import { Select } from "../../../shared/components/Select";
import { DatePickerInput } from "../../../shared/components/DatePickerInput";
import { Button } from "../../../shared/components/Button";
import { useGeographicLocations } from "../../../shared/hooks/useGeographicLocations";
import {
  UserProfileSettings,
  UserAddressSettings,
  UserCompanySettings,
} from "../hooks/useClientSettings";

interface ProfileSettingsTabProps {
  profile: UserProfileSettings;
  onUpdateProfile: (fields: Partial<UserProfileSettings>) => void;
  onUpdateAddress: (fields: Partial<UserAddressSettings>) => void;
  onUpdateCompany: (fields: Partial<UserCompanySettings>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ProfileSettingsTab({
  profile,
  onUpdateProfile,
  onUpdateAddress,
  onUpdateCompany,
  onSave,
  isSaving,
}: ProfileSettingsTabProps) {
  const {
    regions,
    provinces,
    municipalities,
    barangays,
    loadingRegions,
    loadingProvinces,
    loadingMunicipalities,
    loadingBarangays,
  } = useGeographicLocations(
    profile.address.regionId,
    profile.address.provinceId,
    profile.address.municipalityId
  );

  const effectiveRegionId =
    profile.address.regionId ||
    regions.find((r) => r.name.toLowerCase() === (profile.address.region || "").toLowerCase())?.id ||
    "";
  const effectiveProvinceId =
    profile.address.provinceId ||
    provinces.find((p) => p.name.toLowerCase() === (profile.address.province || "").toLowerCase())?.id ||
    "";
  const effectiveMunicipalityId =
    profile.address.municipalityId ||
    municipalities.find((m) => m.name.toLowerCase() === (profile.address.city || "").toLowerCase())?.id ||
    "";
  const effectiveBarangayId =
    profile.address.barangayId ||
    barangays.find((b) => b.name.toLowerCase() === (profile.address.barangay || "").toLowerCase())?.id ||
    "";

  return (
    <View style={styles.container}>
      {/* ── 1. Personal & Biographical Information Card ─────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="user" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Personal & Biographical Information</Text>
            <Text style={styles.cardSubtitle}>
              Biographical details and physical descriptors pre-filled in your permit, certificate, and license filings.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col6}>
            <Input
              label="First Name*"
              placeholder="e.g. Juan"
              value={profile.firstName}
              onChangeText={(val) => onUpdateProfile({ firstName: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Middle Name"
              placeholder="e.g. Santos"
              value={profile.middleName}
              onChangeText={(val) => onUpdateProfile({ middleName: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Last Name*"
              placeholder="e.g. Dela Cruz"
              value={profile.lastName}
              onChangeText={(val) => onUpdateProfile({ lastName: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Suffix / Extension"
              placeholder="e.g. Jr., III"
              value={profile.extensionName}
              onChangeText={(val) => onUpdateProfile({ extensionName: val })}
            />
          </View>

          <View style={styles.col6}>
            <DatePickerInput
              label="Date of Birth"
              placeholder="MM/DD/YYYY"
              value={profile.dob}
              onChangeText={(val) => onUpdateProfile({ dob: val })}
            />
          </View>

          <View style={styles.col6}>
            <Text style={styles.selectLabel}>Sex / Gender</Text>
            <Select
              value={profile.sex}
              onValueChange={(val) => onUpdateProfile({ sex: val })}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
              ]}
              placeholder="Select Sex..."
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Nationality"
              placeholder="e.g. Filipino"
              value={profile.nationality}
              onChangeText={(val) => onUpdateProfile({ nationality: val })}
            />
          </View>

          <View style={styles.col6}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Height (cm)"
                  placeholder="e.g. 175"
                  value={profile.height || ""}
                  onChangeText={(val) => onUpdateProfile({ height: val })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Weight (kg)"
                  placeholder="e.g. 70"
                  value={profile.weight || ""}
                  onChangeText={(val) => onUpdateProfile({ weight: val })}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── 2. Contact Details Card ────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="mail" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Contact Details</Text>
            <Text style={styles.cardSubtitle}>
              Primary contact channels used for billing, filing confirmations, and OTPs.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col6}>
            <Input
              label="Primary Email Address"
              placeholder="e.g. user@domain.com"
              value={profile.email}
              editable={false}
            />
            <Text style={styles.fieldHint}>Email is linked and managed via your security account.</Text>
          </View>

          <View style={styles.col6}>
            <Input
              label="Phone / Mobile Number"
              placeholder="e.g. 09171234567"
              value={profile.phone}
              onChangeText={(val) => onUpdateProfile({ phone: val })}
            />
          </View>
        </View>
      </View>

      {/* ── 3. Educational & Professional Background Card ──────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="award" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Educational & Professional Background</Text>
            <Text style={styles.cardSubtitle}>
              Academic qualifications used for examination filing, operator certificates, and accreditation.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col12}>
            <Input
              label="School / Institution Attended"
              placeholder="e.g. University of the Philippines"
              value={profile.schoolAttended || ""}
              onChangeText={(val) => onUpdateProfile({ schoolAttended: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Course / Degree Taken"
              placeholder="e.g. BS Electronics Engineering (ECE)"
              value={profile.courseTaken || ""}
              onChangeText={(val) => onUpdateProfile({ courseTaken: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Year Graduated"
              placeholder="e.g. 2022"
              value={profile.yearGraduated || ""}
              onChangeText={(val) => onUpdateProfile({ yearGraduated: val })}
            />
          </View>
        </View>
      </View>

      {/* ── 4. Default Address Card ────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="map-pin" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Default Residential / Station Address</Text>
            <Text style={styles.cardSubtitle}>
              Default address used when creating applications for permits, stations, or examination filings.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col6}>
            <Input
              label="Street / Building"
              placeholder="e.g. 123 Mahogany St."
              value={profile.address.street}
              onChangeText={(val) => onUpdateAddress({ street: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Unit / Floor / Room"
              placeholder="e.g. Unit 4B, 2nd Floor"
              value={profile.address.unit || ""}
              onChangeText={(val) => onUpdateAddress({ unit: val })}
            />
          </View>

          {/* Cascading Region Dropdown */}
          <View style={styles.col6}>
            <Text style={styles.selectLabel}>Region</Text>
            <Select
              label=""
              placeholder={loadingRegions ? "Loading regions..." : "Select Region..."}
              value={effectiveRegionId}
              onValueChange={(val) => {
                const selected = regions.find((r) => r.id === val);
                onUpdateAddress({
                  regionId: val,
                  region: selected ? selected.name : "",
                  provinceId: "",
                  province: "",
                  municipalityId: "",
                  city: "",
                  barangayId: "",
                  barangay: "",
                });
              }}
              options={regions.map((r) => ({
                label: r.code ? `${r.name} (${r.code})` : r.name,
                value: r.id,
              }))}
            />
          </View>

          {/* Cascading Province Dropdown */}
          <View style={styles.col6}>
            <Text style={styles.selectLabel}>Province</Text>
            <Select
              label=""
              placeholder={
                loadingProvinces
                  ? "Loading provinces..."
                  : !effectiveRegionId
                  ? "Select Region first..."
                  : "Select Province..."
              }
              value={effectiveProvinceId}
              onValueChange={(val) => {
                const selected = provinces.find((p) => p.id === val);
                onUpdateAddress({
                  provinceId: val,
                  province: selected ? selected.name : "",
                  municipalityId: "",
                  city: "",
                  barangayId: "",
                  barangay: "",
                });
              }}
              options={provinces.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
            />
          </View>

          {/* Cascading Municipality / City Dropdown */}
          <View style={styles.col6}>
            <Text style={styles.selectLabel}>City / Municipality</Text>
            <Select
              label=""
              placeholder={
                loadingMunicipalities
                  ? "Loading cities..."
                  : !effectiveProvinceId
                  ? "Select Province first..."
                  : "Select City / Municipality..."
              }
              value={effectiveMunicipalityId}
              onValueChange={(val) => {
                const selected = municipalities.find((m) => m.id === val);
                onUpdateAddress({
                  municipalityId: val,
                  city: selected ? selected.name : "",
                  barangayId: "",
                  barangay: "",
                });
              }}
              options={municipalities.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
            />
          </View>

          {/* Cascading Barangay Dropdown */}
          <View style={styles.col6}>
            <Text style={styles.selectLabel}>Barangay</Text>
            <Select
              label=""
              placeholder={
                loadingBarangays
                  ? "Loading barangays..."
                  : !effectiveMunicipalityId
                  ? "Select City first..."
                  : "Select Barangay..."
              }
              value={effectiveBarangayId}
              onValueChange={(val) => {
                const selected = barangays.find((b) => b.id === val);
                onUpdateAddress({
                  barangayId: val,
                  barangay: selected ? selected.name : "",
                });
              }}
              options={barangays.map((b) => ({
                label: b.name,
                value: b.id,
              }))}
            />
          </View>

          <View style={styles.col12}>
            <Input
              label="ZIP Code"
              placeholder="e.g. 1100"
              value={profile.address.zipCode}
              onChangeText={(val) => onUpdateAddress({ zipCode: val })}
            />
          </View>
        </View>
      </View>

      {/* ── 5. Corporate / Business Profile Card ───────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="briefcase" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Corporate & Business Information (Optional)</Text>
            <Text style={styles.cardSubtitle}>
              Registered company and commercial entity details used when filing on behalf of an enterprise or station licensee.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col6}>
            <Input
              label="Company / Enterprise Name"
              placeholder="e.g. Acme Communications Corp."
              value={profile.company.name}
              onChangeText={(val) => onUpdateCompany({ name: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="SEC / DTI Registration Number"
              placeholder="e.g. CS202012345"
              value={profile.company.registrationNumber}
              onChangeText={(val) => onUpdateCompany({ registrationNumber: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Tax Identification Number (TIN)"
              placeholder="e.g. 123-456-789-000"
              value={profile.company.tinNumber}
              onChangeText={(val) => onUpdateCompany({ tinNumber: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Company Contact Number"
              placeholder="e.g. 02-8123-4567"
              value={profile.company.contactNumber}
              onChangeText={(val) => onUpdateCompany({ contactNumber: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Company Official Email"
              placeholder="e.g. legal@acme.com"
              value={profile.company.email}
              onChangeText={(val) => onUpdateCompany({ email: val })}
            />
          </View>

          <View style={styles.col6}>
            <Input
              label="Company Business Address"
              placeholder="e.g. 500 Corporate Ave., BGC, Taguig"
              value={profile.company.address}
              onChangeText={(val) => onUpdateCompany({ address: val })}
            />
          </View>
        </View>
      </View>

      {/* Save Action Footer */}
      <View style={styles.footerActionRow}>
        <Button
          variant="primary"
          onPress={onSave}
          loading={isSaving}
          icon={<Icon name="check" size={16} color="#FFFFFF" />}
        >
          Save All Profile Changes
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[20],
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING[20],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: SPACING[20],
    paddingBottom: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F2C59",
  },
  cardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    rowGap: 14,
  },
  col12: {
    width: "100%",
    paddingHorizontal: 8,
  },
  col6: {
    width: "50%",
    paddingHorizontal: 8,
    minWidth: 260,
  },
  selectLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  fieldHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },
  footerActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: SPACING[8],
  },
});
