import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Icon as Lucide } from "@edge/ui";
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from "../../theme/tokens";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { HELP_CENTER_GUIDES } from "../schemas/feedbackSchema";
import { useClientSupportModals } from "../hooks/useClientSupportModals";

export interface HelpCenterModalProps {
  support: ReturnType<typeof useClientSupportModals>;
}

export function HelpCenterModal({
  support,
}: HelpCenterModalProps): React.ReactElement | null {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const modalMaxHeight = Math.max(420, height - (isMobile ? 24 : 48));

  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(
    HELP_CENTER_GUIDES[0]?.id ?? null,
  );

  if (!support.isHelpCenterOpen) return null;

  const {
    regionalOffices,
    isLoadingOffices,
    officesError,
    refetchRegionalOffices,
    selectedOffice,
    selectedTenantId,
    handleSelectTenant,
    closeHelpCenterModal,
    openFeedbackModal,
  } = support;

  const fieldOffices = selectedOffice?.fieldOffices ?? [];

  return (
    <Modal
      visible={support.isHelpCenterOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={closeHelpCenterModal}
    >
      <View style={[styles.overlay, isMobile && { padding: SPACING[12] }]}>
        <View
          style={[
            styles.modalCard,
            SHADOWS.modal,
            {
              maxWidth: isMobile ? 440 : isTablet ? 680 : 780,
              maxHeight: modalMaxHeight,
              borderRadius: isMobile ? 20 : 24,
            },
          ]}
        >
          {/* Window Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.windowDotsRow}>
              <View style={[styles.windowDot, { backgroundColor: "#EF4444" }]} />
              <View style={[styles.windowDot, { backgroundColor: "#F59E0B" }]} />
              <View style={[styles.windowDot, { backgroundColor: "#10B981" }]} />
            </View>
            <View style={styles.headerBadge}>
              <Lucide name="help-circle" size={12} color={COLORS.brand[800]} />
              <Text style={styles.headerBadgeText}>
                NTC Regional Help Center & Directory
              </Text>
            </View>
            <TouchableOpacity
              onPress={closeHelpCenterModal}
              style={styles.closeBtn}
            >
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={[
              styles.bodyContent,
              isMobile && { padding: 20 },
            ]}
            showsVerticalScrollIndicator={true}
          >
            {/* Title Section */}
            <View style={styles.titleRow}>
              <View style={styles.titleIconCircle}>
                <Lucide name="headphones" size={20} color={COLORS.brand[800]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.modalTitle, isMobile && { fontSize: 19 }]}
                >
                  NTC Help Center & Regional Support
                </Text>
                <Text style={styles.modalSubtitle}>
                  Select your NTC Regional Office to view official regional
                  hotlines, field office addresses, and step-by-step filing
                  guides.
                </Text>
              </View>
            </View>

            {/* 1. Regional Office (Tenant) Selector */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>
                SELECT NTC REGIONAL OFFICE (TENANT JURISDICTION)
              </Text>

              <Select
                placeholder={
                  isLoadingOffices
                    ? "Loading NTC Regional Offices..."
                    : "Select NTC Regional Office..."
                }
                emptyText={
                  isLoadingOffices
                    ? "Loading NTC Regional Offices..."
                    : "No Regional Offices loaded. Click Retry below."
                }
                value={selectedTenantId}
                onValueChange={(val: string) => handleSelectTenant(val)}
                options={regionalOffices.map((office) => ({
                  label: office.name,
                  value: office.id,
                }))}
                iconName="map-pin"
                disabled={isLoadingOffices}
                style={{ marginBottom: 4 }}
              />

              {officesError.length > 0 ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 8,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: COLORS.semantic.error,
                    }}
                  >
                    {officesError}
                  </Text>
                  <TouchableOpacity onPress={refetchRegionalOffices}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: COLORS.brand[800],
                      }}
                    >
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Selected Regional Office Contact Card */}
              {selectedOffice ? (
                <View style={styles.regionalContactCard}>
                  <View style={styles.regionalCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.regionalOfficeTitle}>
                        {selectedOffice.name}
                      </Text>
                      <Text style={styles.regionalOfficeDesc}>
                        {selectedOffice.description ||
                          `Official NTC Regional Support Desk for ${selectedOffice.regionName}`}
                      </Text>
                    </View>
                    <View style={styles.hoursBadge}>
                      <Lucide name="clock" size={11} color="#059669" />
                      <Text style={styles.hoursBadgeText}>
                        Mon–Fri • 8:00 AM – 5:00 PM
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.contactGrid,
                      isMobile && { flexDirection: "column" },
                    ]}
                  >
                    <View style={styles.contactItemBox}>
                      <Lucide
                        name="map-pin"
                        size={15}
                        color={COLORS.brand[800]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.contactItemLabel}>
                          Regional Office Address
                        </Text>
                        <Text style={styles.contactItemValue}>
                          {selectedOffice.primaryAddress}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.contactItemBox}>
                      <Lucide
                        name="phone"
                        size={15}
                        color={COLORS.brand[800]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.contactItemLabel}>
                          Telephone / Hotline
                        </Text>
                        <Text style={styles.contactItemValue}>
                          {selectedOffice.primaryPhone}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.contactItemBox}>
                      <Lucide name="mail" size={15} color={COLORS.brand[800]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.contactItemLabel}>
                          Official Support Email
                        </Text>
                        <Text style={styles.contactItemValueHighlight}>
                          {selectedOffice.primaryEmail}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Field Offices List under this Regional Tenant */}
                  {fieldOffices.length > 0 ? (
                    <View style={styles.fieldOfficesSection}>
                      <Text style={styles.fieldOfficesTitle}>
                        MAIN & DISTRICT FIELD OFFICES ({fieldOffices.length})
                      </Text>
                      {fieldOffices.map((fo) => (
                        <View key={fo.id} style={styles.fieldOfficeCard}>
                          <View style={styles.fieldOfficeHeaderRow}>
                            <View style={styles.foCategoryBadge}>
                              <Text style={styles.foCategoryBadgeText}>
                                {fo.category.toUpperCase()} OFFICE
                              </Text>
                            </View>
                            <Text style={styles.fieldOfficeName}>
                              {fo.name}
                            </Text>
                          </View>

                          <Text style={styles.fieldOfficeAddress}>
                            {fo.address}
                          </Text>

                          <View style={styles.fieldOfficeMetaRow}>
                            {fo.contactPhone ? (
                              <View style={styles.foMetaChip}>
                                <Lucide
                                  name="phone"
                                  size={11}
                                  color={COLORS.neutral[600]}
                                />
                                <Text style={styles.foMetaChipText}>
                                  {fo.contactPhone}
                                </Text>
                              </View>
                            ) : null}

                            {fo.contactEmail ? (
                              <View style={styles.foMetaChip}>
                                <Lucide
                                  name="mail"
                                  size={11}
                                  color={COLORS.neutral[600]}
                                />
                                <Text style={styles.foMetaChipText}>
                                  {fo.contactEmail}
                                </Text>
                              </View>
                            ) : null}

                            {fo.officeHead ? (
                              <View style={styles.foMetaChip}>
                                <Lucide
                                  name="user"
                                  size={11}
                                  color={COLORS.neutral[600]}
                                />
                                <Text style={styles.foMetaChipText}>
                                  {fo.officeHead}
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          <View style={styles.capabilityBadgesRow}>
                            {fo.allowPermitIssuance ? (
                              <View style={styles.capabilityPill}>
                                <Lucide
                                  name="check-circle"
                                  size={10}
                                  color="#059669"
                                />
                                <Text style={styles.capabilityPillText}>
                                  Permit & License Issuance
                                </Text>
                              </View>
                            ) : null}
                            {fo.allowComplaintReception ? (
                              <View style={styles.capabilityPill}>
                                <Lucide
                                  name="check-circle"
                                  size={10}
                                  color="#059669"
                                />
                                <Text style={styles.capabilityPillText}>
                                  Consumer Requests & Complaints
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* Direct CTA to Send Feedback pre-addressed to this Regional Office */}
                  <View style={styles.regionalCtaRow}>
                    <Button
                      title={`Send Feedback to ${selectedOffice.name}`}
                      onPress={() => openFeedbackModal(selectedOffice.id)}
                      style={{ width: "100%" }}
                      icon={
                        <Lucide
                          name="message-square"
                          size={15}
                          color={COLORS.neutral.white}
                        />
                      }
                    />
                  </View>
                </View>
              ) : null}
            </View>

            {/* 2. Self-Service Guides & FAQs */}
            <View style={styles.guidesSection}>
              <Text style={styles.sectionLabel}>
                SELF-SERVICE PORTAL GUIDES & WORKFLOW FAQS
              </Text>

              {HELP_CENTER_GUIDES.map((guide) => {
                const isExpanded = expandedGuideId === guide.id;
                return (
                  <View
                    key={guide.id}
                    style={[
                      styles.guideCard,
                      isExpanded && styles.guideCardExpanded,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.guideHeader}
                      onPress={() =>
                        setExpandedGuideId(isExpanded ? null : guide.id)
                      }
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.guideCategoryTag}>
                          {guide.category.toUpperCase()}
                        </Text>
                        <Text style={styles.guideTitle}>{guide.title}</Text>
                      </View>
                      <View
                        style={[
                          styles.guideChevronCircle,
                          isExpanded && styles.guideChevronCircleActive,
                        ]}
                      >
                        <Lucide
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={15}
                          color={
                            isExpanded ? COLORS.neutral.white : COLORS.brand[800]
                          }
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded ? (
                      <View style={styles.guideBody}>
                        <Text style={styles.guideSummary}>{guide.summary}</Text>
                        {guide.steps.map((stepText, idx) => (
                          <View key={idx} style={styles.guideStepRow}>
                            <View style={styles.guideStepBullet}>
                              <Text style={styles.guideStepBulletText}>
                                {idx + 1}
                              </Text>
                            </View>
                            <Text style={styles.guideStepText}>{stepText}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[20],
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1.5,
    borderColor: "rgba(18, 54, 168, 0.14)",
    overflow: "hidden",
    alignSelf: "center",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  windowDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  windowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.neutral[600],
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
  },
  bodyContent: {
    padding: 28,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: SPACING[20],
  },
  titleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    lineHeight: 19,
  },
  sectionBox: {
    marginBottom: SPACING[24],
  },
  sectionLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.brand[800],
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  dropdownButtonFocused: {
    borderColor: COLORS.brand[800],
    backgroundColor: COLORS.neutral.white,
  },
  dropdownSelectedInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  regionCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  regionCodeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.brand[800],
  },
  dropdownTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.neutral[900],
  },
  dropdownSubMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  dropdownListContainer: {
    marginTop: 6,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    gap: 10,
  },
  dropdownOptionSelected: {
    backgroundColor: "#EEF2FF",
  },
  dropdownOptionName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.neutral[800],
  },
  dropdownOptionNameSelected: {
    color: COLORS.brand[800],
    fontWeight: "700",
  },
  dropdownOptionMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  regionalContactCard: {
    marginTop: 14,
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
  },
  regionalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  regionalOfficeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.neutral[900],
  },
  regionalOfficeDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  hoursBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderRadius: RADIUS.circle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  hoursBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  contactItemBox: {
    flex: 1,
    minWidth: 180,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.neutral.white,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  contactItemLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.neutral[500],
    marginBottom: 2,
  },
  contactItemValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.neutral[800],
    lineHeight: 17,
  },
  contactItemValueHighlight: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.brand[800],
    lineHeight: 17,
  },
  fieldOfficesSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  fieldOfficesTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.neutral[500],
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  fieldOfficeCard: {
    backgroundColor: COLORS.neutral.white,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  fieldOfficeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  foCategoryBadge: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  foCategoryBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.brand[800],
  },
  fieldOfficeName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.neutral[900],
  },
  fieldOfficeAddress: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    marginBottom: 8,
  },
  fieldOfficeMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  foMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  foMetaChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[600],
  },
  capabilityBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  capabilityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  capabilityPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "600",
    color: "#059669",
  },
  regionalCtaRow: {
    marginTop: 4,
  },
  guidesSection: {
    marginTop: 4,
  },
  guideCard: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  guideCardExpanded: {
    borderColor: COLORS.brand[800],
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  guideCategoryTag: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.brand[800],
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  guideTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.neutral[900],
  },
  guideChevronCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  guideChevronCircleActive: {
    backgroundColor: COLORS.brand[800],
  },
  guideBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    paddingTop: 12,
  },
  guideSummary: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 19,
    marginBottom: 12,
  },
  guideStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  guideStepBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  guideStepBulletText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.brand[800],
  },
  guideStepText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
    lineHeight: 19,
  },
});
