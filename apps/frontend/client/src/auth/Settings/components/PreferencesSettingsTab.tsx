import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, Icon } from "@edge/ui";
import { Select } from "../../../shared/components/Select";
import { Button } from "../../../shared/components/Button";
import { UserFilingPreferences } from "../hooks/useClientSettings";

interface PreferencesSettingsTabProps {
  preferences: UserFilingPreferences;
  onUpdatePreferences: (fields: Partial<UserFilingPreferences>) => void;
  tenants: Array<{ id: string; name: string }>;
  offices: Array<{ id: string; name: string }>;
  loadingTenants: boolean;
  onSave: () => void;
  isSaving: boolean;
}

export function PreferencesSettingsTab({
  preferences,
  onUpdatePreferences,
  tenants,
  offices,
  loadingTenants,
  onSave,
  isSaving,
}: PreferencesSettingsTabProps) {
  return (
    <View style={styles.container}>
      {/* ── 1. Default Regional Routing Card ────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="compass" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Default NTC Jurisdiction & Office</Text>
            <Text style={styles.cardSubtitle}>
              Default regional office automatically pre-selected when creating new license, exam, or permit filings.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col6}>
            <Text style={styles.selectLabel}>Default NTC Region</Text>
            <Select
              placeholder={loadingTenants ? "Loading Regions..." : "Select default region..."}
              value={preferences.defaultRegionId}
              onValueChange={(val) =>
                onUpdatePreferences({ defaultRegionId: val, defaultOfficeId: "" })
              }
              options={tenants.map((t) => ({ label: t.name, value: t.id }))}
              iconName="map-pin"
            />
          </View>

          <View style={styles.col6}>
            <Text style={styles.selectLabel}>Default Field Office</Text>
            <Select
              placeholder={
                preferences.defaultRegionId
                  ? "Select field office..."
                  : "Select region first..."
              }
              value={preferences.defaultOfficeId}
              onValueChange={(val) => onUpdatePreferences({ defaultOfficeId: val })}
              options={offices.map((o) => ({ label: o.name, value: o.id }))}
              iconName="home"
            />
          </View>
        </View>
      </View>

      {/* ── 2. Application Defaults Card ────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="file-text" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Filing Mode & Automation</Text>
            <Text style={styles.cardSubtitle}>
              Configure how the client wizard behaves when starting and completing applications.
            </Text>
          </View>
        </View>

        <View style={styles.optionsList}>
          {/* Mode Selection */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Default Filing Mode</Text>
              <Text style={styles.optionSubtitle}>
                Choose whether you primarily file as an Individual Applicant or on behalf of a Corporate Entity.
              </Text>
            </View>
            <View style={styles.pillGroup}>
              <TouchableOpacity
                onPress={() => onUpdatePreferences({ defaultAppMode: "individual" })}
                style={[
                  styles.pillButton,
                  preferences.defaultAppMode === "individual" && styles.pillButtonActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillButtonText,
                    preferences.defaultAppMode === "individual" && styles.pillButtonTextActive,
                  ]}
                >
                  Individual
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onUpdatePreferences({ defaultAppMode: "corporate" })}
                style={[
                  styles.pillButton,
                  preferences.defaultAppMode === "corporate" && styles.pillButtonActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillButtonText,
                    preferences.defaultAppMode === "corporate" && styles.pillButtonTextActive,
                  ]}
                >
                  Corporate
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Auto-Save Drafts */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Automatic Draft Saving</Text>
              <Text style={styles.optionSubtitle}>
                Save application step inputs locally and remotely to prevent loss of progress during connection disruptions.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                onUpdatePreferences({ autoSaveDrafts: !preferences.autoSaveDrafts })
              }
              style={[
                styles.toggleTrack,
                preferences.autoSaveDrafts && styles.toggleTrackActive,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  preferences.autoSaveDrafts && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Confirm before leave */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Unsaved Changes Confirmation</Text>
              <Text style={styles.optionSubtitle}>
                Prompt a confirmation dialog when navigating away from an active, unsaved application form.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                onUpdatePreferences({
                  confirmBeforeLeave: !preferences.confirmBeforeLeave,
                })
              }
              style={[
                styles.toggleTrack,
                preferences.confirmBeforeLeave && styles.toggleTrackActive,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  preferences.confirmBeforeLeave && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
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
          Save Preferences
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
  optionsList: {
    gap: 14,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  optionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  optionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  pillGroup: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 3,
    gap: 3,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pillButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pillButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  pillButtonTextActive: {
    color: "#0F2C59",
    fontWeight: "700",
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    padding: 2,
    justifyContent: "center",
  },
  toggleTrackActive: {
    backgroundColor: "#0F2C59",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  footerActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: SPACING[8],
  },
});
