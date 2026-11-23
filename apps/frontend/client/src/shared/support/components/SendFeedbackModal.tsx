import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Icon as Lucide } from "@edge/ui";
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from "../../theme/tokens";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import {
  FEEDBACK_CATEGORIES,
  FeedbackCategory,
} from "../schemas/feedbackSchema";
import { useClientSupportModals } from "../hooks/useClientSupportModals";

export interface SendFeedbackModalProps {
  support: ReturnType<typeof useClientSupportModals>;
}

const RATING_LABELS: Record<number, string> = {
  1: "1/5 • Poor — Significant issues",
  2: "2/5 • Fair — Below expectations",
  3: "3/5 • Good — Acceptable service",
  4: "4/5 • Very Good — Smooth & helpful",
  5: "5/5 • Excellent — Fast & outstanding",
};

export function SendFeedbackModal({
  support,
}: SendFeedbackModalProps): React.ReactElement | null {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  if (!support.isFeedbackOpen) return null;

  const {
    regionalOffices,
    isLoadingOffices,
    officesError,
    refetchRegionalOffices,
    selectedOffice,
    selectedTenantId,
    handleSelectTenant,
    category,
    setCategory,
    subject,
    setSubject,
    message,
    setMessage,
    rating,
    setRating,
    isAnonymous,
    setIsAnonymous,
    senderName,
    setSenderName,
    senderEmail,
    setSenderEmail,
    fieldErrors,
    submitError,
    isSubmitting,
    submittedReceipt,
    closeFeedbackModal,
    openHelpCenterModal,
    resetFeedbackForm,
    handleSubmitFeedback,
  } = support;

  const modalMaxHeight = Math.max(420, height - (isMobile ? 24 : 48));

  return (
    <Modal
      visible={support.isFeedbackOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={closeFeedbackModal}
    >
      <View style={[styles.overlay, isMobile && { padding: SPACING[12] }]}>
        <View
          style={[
            styles.modalCard,
            SHADOWS.modal,
            {
              maxWidth: isMobile ? 440 : isTablet ? 680 : 740,
              maxHeight: modalMaxHeight,
              borderRadius: isMobile ? 18 : 22,
            },
          ]}
        >
          {/* Sticky Window Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.windowDotsRow}>
              <View style={[styles.windowDot, { backgroundColor: "#EF4444" }]} />
              <View style={[styles.windowDot, { backgroundColor: "#F59E0B" }]} />
              <View style={[styles.windowDot, { backgroundColor: "#10B981" }]} />
            </View>
            <View style={styles.headerBadge}>
              <Lucide name="message-square" size={12} color={COLORS.brand[800]} />
              <Text style={styles.headerBadgeText}>
                NTC Regional Feedback Channel
              </Text>
            </View>
            <TouchableOpacity
              onPress={closeFeedbackModal}
              style={styles.closeBtn}
              disabled={isSubmitting}
            >
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* Sticky Title Sub-Header */}
          {submittedReceipt === null ? (
            <View
              style={[
                styles.titleHeaderBox,
                isMobile && { paddingHorizontal: 16, paddingVertical: 12 },
              ]}
            >
              <View style={styles.titleIconCircle}>
                <Lucide
                  name="message-square"
                  size={18}
                  color={COLORS.brand[800]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.modalTitle, isMobile && { fontSize: 17 }]}
                >
                  Send Regional Feedback
                </Text>
                <Text style={styles.modalSubtitle}>
                  Address your feedback, inquiry, or service suggestion directly
                  to the appropriate NTC Regional Office.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.helpDirectoryBtn}
                onPress={() => openHelpCenterModal(selectedTenantId)}
              >
                <Lucide name="phone" size={12} color={COLORS.brand[800]} />
                <Text style={styles.viewDirectoryLink}>Office Contacts</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Scrollable Form / Receipt Body */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.bodyContent,
              isMobile && { padding: 16 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {submittedReceipt !== null ? (
              /* Confirmation Receipt State */
              <View style={styles.receiptContainer}>
                <View style={styles.receiptIconCircle}>
                  <Lucide
                    name="check-circle"
                    size={34}
                    color={COLORS.semantic.success}
                  />
                </View>

                <Text style={styles.receiptTitle}>
                  Feedback Delivered to Regional Office
                </Text>
                <Text style={styles.receiptSubtitle}>
                  Thank you for helping improve NTC-EDGE public services. Your
                  submission has been routed directly to the selected Regional
                  Office for review.
                </Text>

                <View style={styles.receiptSummaryCard}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Addressed To</Text>
                    <Text style={styles.receiptValueHighlight}>
                      {submittedReceipt.tenantName ??
                        selectedOffice?.name ??
                        "NTC Regional Office"}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Subject</Text>
                    <Text style={styles.receiptValue}>
                      {submittedReceipt.subject}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Experience Rating</Text>
                    <Text style={styles.receiptValue}>
                      {submittedReceipt.rating} / 5 Stars
                    </Text>
                  </View>
                  <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.receiptLabel}>Submission Mode</Text>
                    <Text style={styles.receiptValue}>
                      {submittedReceipt.isAnonymous
                        ? "Anonymous Submission"
                        : `${submittedReceipt.senderName} (${submittedReceipt.senderEmail})`}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.receiptActionsRow,
                    isMobile && { flexDirection: "column" },
                  ]}
                >
                  <Button
                    title="Submit Another Feedback"
                    variant="outline"
                    onPress={resetFeedbackForm}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Done"
                    onPress={closeFeedbackModal}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ) : (
              /* Compact & Fully Visible Regional Feedback Form */
              <View>
                {submitError.length > 0 ? (
                  <View style={styles.errorBanner}>
                    <Lucide
                      name="alert-circle"
                      size={16}
                      color={COLORS.semantic.error}
                    />
                    <Text style={styles.errorBannerText}>{submitError}</Text>
                  </View>
                ) : null}

                {/* Row 1: Target NTC Regional Office + Experience Star Rating (2 columns on Desktop/Tablet) */}
                <View
                  style={[
                    styles.topGridRow,
                    isMobile && { flexDirection: "column" },
                  ]}
                >
                  {/* Column A: Addressed To (NTC Regional Office) */}
                  <View style={styles.topGridColLeft}>
                    <Select
                      label="Addressed To (NTC Regional Office)"
                      required={true}
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
                      error={fieldErrors.tenantId}
                      iconName="map-pin"
                      disabled={isLoadingOffices}
                      style={{ marginBottom: 6 }}
                    />

                    {selectedOffice ? (
                      <View style={styles.selectedOfficeMetaBar}>
                        <View style={styles.regionCodeBadge}>
                          <Text style={styles.regionCodeBadgeText}>
                            {selectedOffice.code ||
                              selectedOffice.regionCode ||
                              "NTC"}
                          </Text>
                        </View>
                        <Text style={styles.dropdownSubMeta}>
                          {[
                            selectedOffice.description || selectedOffice.name,
                            selectedOffice.primaryEmail,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </Text>
                      </View>
                    ) : null}

                    {officesError.length > 0 ? (
                      <View style={styles.retryRow}>
                        <Text
                          style={[
                            styles.fieldErrorText,
                            { flex: 1, marginTop: 0 },
                          ]}
                        >
                          {officesError}
                        </Text>
                        <TouchableOpacity onPress={refetchRegionalOffices}>
                          <Text style={styles.viewDirectoryLink}>Retry</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>

                  {/* Column B: Overall Experience Rating */}
                  <View style={styles.topGridColRight}>
                    <Text style={styles.fieldLabel}>
                      Overall Experience Rating *
                    </Text>
                    <View style={styles.ratingBox}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((starValue) => {
                          const isFilled = starValue <= rating;
                          return (
                            <TouchableOpacity
                              key={starValue}
                              onPress={() => setRating(starValue)}
                              style={[
                                styles.starButton,
                                isFilled && styles.starButtonActive,
                              ]}
                              activeOpacity={0.75}
                            >
                              <Lucide
                                name="star"
                                size={18}
                                color={
                                  isFilled ? "#F59E0B" : COLORS.neutral[300]
                                }
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      <Text style={styles.ratingDescText}>
                        {RATING_LABELS[rating] ?? "Select a rating"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Row 2: Feedback Category Pills */}
                <View style={styles.fieldGroupCompact}>
                  <Text style={styles.fieldLabel}>Feedback Topic *</Text>
                  <View style={styles.categoryPillsRow}>
                    {FEEDBACK_CATEGORIES.map((cat: FeedbackCategory) => {
                      const isSelected = cat === category;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryPill,
                            isSelected && styles.categoryPillActive,
                          ]}
                          onPress={() => setCategory(cat)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.categoryPillText,
                              isSelected && styles.categoryPillTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Row 3: Subject */}
                <Input
                  label="Subject / Summary *"
                  placeholder="e.g. Fast SOA assessment at NTC regional evaluation desk"
                  value={subject}
                  onChangeText={setSubject}
                  error={fieldErrors.subject}
                  autoCapitalize="sentences"
                  iconName="file-text"
                  style={{ marginBottom: 12 }}
                />

                {/* Row 4: Detailed Message */}
                <View style={styles.fieldGroupCompact}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.fieldLabel, { marginBottom: 0 }]}>
                      Detailed Message *
                    </Text>
                    <Text style={styles.charCountText}>
                      {message.length} / 2000
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textArea,
                      fieldErrors.message ? styles.textAreaError : null,
                    ]}
                    placeholder="Describe your experience, application reference number (if applicable), or suggestion for the selected NTC Regional Office..."
                    placeholderTextColor={COLORS.neutral[400]}
                    value={message}
                    onChangeText={setMessage}
                    multiline={true}
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={2000}
                  />
                  {fieldErrors.message ? (
                    <Text style={styles.fieldErrorText}>
                      {fieldErrors.message}
                    </Text>
                  ) : null}
                </View>

                {/* Row 5: Anonymous vs. Identified Submission */}
                <Pressable
                  style={[
                    styles.anonymousToggleCard,
                    isAnonymous && styles.anonymousToggleCardActive,
                  ]}
                  onPress={() => setIsAnonymous(!isAnonymous)}
                >
                  <View style={styles.anonymousIconBox}>
                    <Lucide
                      name={isAnonymous ? "user-x" : "user-check"}
                      size={16}
                      color={
                        isAnonymous ? COLORS.brand[800] : COLORS.neutral[600]
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.anonymousTitle}>
                      Submit Anonymously
                    </Text>
                    <Text style={styles.anonymousDesc}>
                      {isAnonymous
                        ? "Your name and email will be hidden from regional staff."
                        : "Include your contact details so the Regional Office can follow up by email."}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkboxCircle,
                      isAnonymous && styles.checkboxCircleActive,
                    ]}
                  >
                    {isAnonymous ? (
                      <Lucide
                        name="check"
                        size={12}
                        color={COLORS.neutral.white}
                      />
                    ) : null}
                  </View>
                </Pressable>

                {!isAnonymous ? (
                  <View
                    style={[
                      styles.senderFieldsRow,
                      isMobile && { flexDirection: "column", gap: 0 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Your Name *"
                        placeholder="Juan Dela Cruz"
                        value={senderName}
                        onChangeText={setSenderName}
                        error={fieldErrors.senderName}
                        autoCapitalize="words"
                        iconName="user"
                        style={{ marginBottom: isMobile ? 10 : 4 }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Your Email Address *"
                        placeholder="juan@domain.com"
                        value={senderEmail}
                        onChangeText={setSenderEmail}
                        error={fieldErrors.senderEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        iconName="mail"
                        style={{ marginBottom: 4 }}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Action Footer (Always Visible) */}
          {submittedReceipt === null ? (
            <View
              style={[
                styles.stickyFooterBar,
                isMobile && {
                  flexDirection: "column",
                  alignItems: "stretch",
                  paddingHorizontal: 16,
                },
              ]}
            >
              {!isMobile ? (
                <View style={styles.footerTargetInfo}>
                  <Lucide name="map-pin" size={13} color={COLORS.brand[800]} />
                  <Text style={styles.footerTargetText} numberOfLines={1}>
                    Routing to:{" "}
                    <Text style={{ fontWeight: "700", color: COLORS.neutral[800] }}>
                      {selectedOffice?.name || "Select Regional Office"}
                    </Text>
                  </Text>
                </View>
              ) : null}

              <View
                style={[
                  styles.submitButtonsGroup,
                  isMobile && { width: "100%" },
                ]}
              >
                <Button
                  title="Cancel"
                  variant="outline"
                  size="sm"
                  onPress={closeFeedbackModal}
                  disabled={isSubmitting}
                  style={{ minWidth: 96, height: 42 }}
                />
                <Button
                  title={
                    isSubmitting
                      ? "Sending..."
                      : `Send Feedback${selectedOffice?.code
                        ? ` (${selectedOffice.code})`
                        : ""
                      }`
                  }
                  size="sm"
                  onPress={handleSubmitFeedback}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={
                    isMobile
                      ? { flex: 1, height: 42 }
                      : { minWidth: 190, height: 42 }
                  }
                  icon={
                    !isSubmitting ? (
                      <Lucide
                        name="send"
                        size={14}
                        color={COLORS.neutral.white}
                      />
                    ) : undefined
                  }
                />
              </View>
            </View>
          ) : null}
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
    padding: SPACING[16],
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1.5,
    borderColor: "rgba(18, 54, 168, 0.14)",
    overflow: "hidden",
    alignSelf: "center",
    flexDirection: "column",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 18,
    paddingVertical: 10,
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
  titleHeaderBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  titleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.neutral[900],
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    lineHeight: 17,
    marginTop: 1,
  },
  helpDirectoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: RADIUS.circle,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scrollArea: {
    flexShrink: 1,
  },
  bodyContent: {
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.semantic.errorBg,
    borderColor: COLORS.semantic.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
  },
  topGridRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    marginBottom: 12,
  },
  topGridColLeft: {
    flex: 1.35,
  },
  topGridColRight: {
    flex: 1,
  },
  fieldGroupCompact: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 6,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.neutral[700],
    marginBottom: 6,
  },
  viewDirectoryLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.brand[800],
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 64,
    gap: 8,
  },
  dropdownButtonFocused: {
    borderColor: COLORS.brand[800],
    backgroundColor: COLORS.neutral.white,
  },
  dropdownButtonError: {
    borderColor: COLORS.semantic.error,
  },
  dropdownSelectedInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedOfficeMetaBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
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
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.neutral[900],
    lineHeight: 18,
  },
  dropdownSubMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    marginTop: 2,
    lineHeight: 15,
  },
  retryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 8,
  },
  dropdownListContainer: {
    marginBottom: 14,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.brand[800],
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#C7D2FE",
  },
  dropdownListHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.brand[800],
  },
  dropdownOptionsGrid: {
    maxHeight: 220,
    overflow: "scroll",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    gap: 10,
  },
  dropdownOptionSelected: {
    backgroundColor: "#F0F7FF",
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
  ratingBox: {
    backgroundColor: "#F8FAFC",
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  starButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },
  starButtonActive: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
  },
  ratingDescText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.neutral[600],
    textAlign: "center",
  },
  categoryPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryPill: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: RADIUS.circle,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  categoryPillActive: {
    backgroundColor: "#EEF2FF",
    borderColor: COLORS.brand[800],
  },
  categoryPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.neutral[600],
  },
  categoryPillTextActive: {
    color: COLORS.brand[800],
    fontWeight: "700",
  },
  charCountText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
  },
  textArea: {
    minHeight: 74,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[900],
    ...(Platform.OS === "web"
      ? {
        outlineWidth: 0,
        outlineColor: "transparent",
      }
      : {}),
  },
  textAreaError: {
    borderColor: COLORS.semantic.error,
  },
  fieldErrorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.semantic.error,
    marginTop: 4,
  },
  anonymousToggleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
    gap: 10,
  },
  anonymousToggleCardActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },
  anonymousIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  anonymousTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.neutral[800],
  },
  anonymousDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    lineHeight: 15,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCircleActive: {
    backgroundColor: COLORS.brand[800],
    borderColor: COLORS.brand[800],
  },
  senderFieldsRow: {
    flexDirection: "row",
    gap: 12,
  },
  stickyFooterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingHorizontal: 22,
    paddingVertical: 12,
    gap: 12,
  },
  footerTargetInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerTargetText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  submitButtonsGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  receiptContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  receiptIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  receiptTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.neutral[900],
    textAlign: "center",
    marginBottom: 6,
  },
  receiptSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },
  receiptSummaryCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  receiptLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.neutral[500],
  },
  receiptValue: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.neutral[800],
    textAlign: "right",
  },
  receiptValueHighlight: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.brand[800],
    textAlign: "right",
  },
  receiptActionsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
});
