import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, Icon } from "@edge/ui";
import { ClientAppLayout } from "../../shared/components/ClientAppLayout";
import { useToast } from "../../shared/components/Toast";
import { useClientSettings } from "./hooks/useClientSettings";
import { ProfileSettingsTab } from "./components/ProfileSettingsTab";
import { SignatureSettingsTab } from "./components/SignatureSettingsTab";
import { PreferencesSettingsTab } from "./components/PreferencesSettingsTab";
import { NotificationSettingsTab } from "./components/NotificationSettingsTab";
import { SecuritySettingsTab } from "./components/SecuritySettingsTab";

type SettingsTabKey = "profile" | "signature" | "preferences" | "notifications" | "security";

interface TabItem {
  key: SettingsTabKey;
  label: string;
  icon: string;
  description: string;
}

const SETTINGS_TABS: TabItem[] = [
  {
    key: "profile",
    label: "Profile & Address",
    icon: "user",
    description: "Biographical details & auto-fill address",
  },
  {
    key: "signature",
    label: "Default Signature",
    icon: "edit-3",
    description: "Saved digital declaration signature",
  },
  {
    key: "preferences",
    label: "Filing Preferences",
    icon: "sliders",
    description: "Default region, office & filing mode",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "bell",
    description: "Application updates & renewal alerts",
  },
  {
    key: "security",
    label: "Security & Data",
    icon: "shield",
    description: "Account credentials & cached data",
  },
];

export function Settings() {
  const { width } = useWindowDimensions();
  const isCompact = width < 860;
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("profile");
  const toast = useToast();

  const {
    profile,
    updateProfile,
    updateAddress,
    updateCompany,
    preferences,
    updatePreferences,
    notifications,
    updateNotifications,
    savedSignature,
    updateSignature,
    clearSignature,
    tenants,
    offices,
    loadingTenants,
    isSaving,
    saveSuccess,
    saveError,
    saveAllSettings,
    clearLocalDraftCache,
    clerkUser,
  } = useClientSettings();

  useEffect(() => {
    if (saveSuccess) {
      toast.success("Settings Saved", saveSuccess);
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (saveError) {
      toast.error("Settings Error", saveError);
    }
  }, [saveError]);

  const applicantFullName =
    `${profile.firstName} ${profile.lastName}`.trim() || clerkUser?.fullName || "";

  return (
    <ClientAppLayout activeTab="settings">
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainWrapper}>
          {/* ── Page Header ─────────────────────────────────────────── */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderBadge}>
              <Icon name="settings" size={14} color="#0F2C59" />
              <Text style={styles.pageHeaderBadgeText}>Client Portal Settings</Text>
            </View>
            <Text style={styles.pageTitle}>Account & System Settings</Text>
            <Text style={styles.pageSubtitle}>
              Manage your personal information, default declaration signature, filing jurisdiction preferences, and notifications.
            </Text>
          </View>

          {/* ── Main Settings Layout (Sidebar Navigation + Tab Content) ── */}
          <View style={[styles.layoutRow, isCompact && styles.layoutRowCompact]}>
            {/* Navigation Tabs Menu */}
            <View style={[styles.sidebarNav, isCompact && styles.sidebarNavCompact]}>
              {SETTINGS_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.navItemIconContainer,
                        isActive && styles.navItemIconContainerActive,
                      ]}
                    >
                      <Icon
                        name={tab.icon}
                        size={18}
                        color={isActive ? "#FFFFFF" : "#64748B"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.navItemLabel,
                          isActive && styles.navItemLabelActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                      {!isCompact && (
                        <Text
                          style={[
                            styles.navItemDesc,
                            isActive && styles.navItemDescActive,
                          ]}
                          numberOfLines={1}
                        >
                          {tab.description}
                        </Text>
                      )}
                    </View>
                    <Icon
                      name="chevron-right"
                      size={16}
                      color={isActive ? "#0F2C59" : "#CBD5E1"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tab Content Panel */}
            <View style={styles.tabContentPanel}>
              {activeTab === "profile" && (
                <ProfileSettingsTab
                  profile={profile}
                  onUpdateProfile={updateProfile}
                  onUpdateAddress={updateAddress}
                  onUpdateCompany={updateCompany}
                  onSave={() => saveAllSettings()}
                  isSaving={isSaving}
                />
              )}

              {activeTab === "signature" && (
                <SignatureSettingsTab
                  savedSignature={savedSignature}
                  applicantName={applicantFullName}
                  onUpdateSignature={updateSignature}
                  onClearSignature={clearSignature}
                  isSaving={isSaving}
                />
              )}

              {activeTab === "preferences" && (
                <PreferencesSettingsTab
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                  tenants={tenants}
                  offices={offices}
                  loadingTenants={loadingTenants}
                  onSave={() => saveAllSettings()}
                  isSaving={isSaving}
                />
              )}

              {activeTab === "notifications" && (
                <NotificationSettingsTab
                  notifications={notifications}
                  onUpdateNotifications={updateNotifications}
                  onSave={() => saveAllSettings()}
                  isSaving={isSaving}
                />
              )}

              {activeTab === "security" && (
                <SecuritySettingsTab
                  clerkUser={clerkUser}
                  onClearLocalDraftCache={clearLocalDraftCache}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </ClientAppLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingVertical: SPACING[24],
    paddingHorizontal: SPACING[20],
  },
  mainWrapper: {
    width: "100%",
    maxWidth: 1140,
    alignSelf: "center",
  },
  pageHeader: {
    marginBottom: SPACING[24],
  },
  pageHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  pageHeaderBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#0F2C59",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 26,
    fontWeight: "800",
    color: "#0F2C59",
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 20,
    maxWidth: 720,
  },
  layoutRow: {
    flexDirection: "row",
    gap: SPACING[24],
    alignItems: "flex-start",
  },
  layoutRowCompact: {
    flexDirection: "column",
  },
  sidebarNav: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING[8],
    gap: 4,
  },
  sidebarNavCompact: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING[6],
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  navItemIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  navItemIconContainerActive: {
    backgroundColor: "#0F2C59",
  },
  navItemLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  navItemLabelActive: {
    color: "#0F2C59",
    fontWeight: "700",
  },
  navItemDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  navItemDescActive: {
    color: "#64748B",
  },
  tabContentPanel: {
    flex: 1,
    minWidth: 0,
  },
});
