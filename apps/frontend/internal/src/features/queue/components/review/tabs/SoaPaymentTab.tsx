import React, { useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
  SHADOWS,
} from "@edge/ui";
import {
  applicationService,
  AddSoaLineItemRequest,
  UpdateSoaLineItemRequest,
} from "@edge/api";
import {
  ApplicationData,
  SoaItem,
  StatementOfAccountItem,
} from "../../../../../types/application";
import { amountToWords, formatAmount } from "../common/reviewUtils";
import { computeConsolidatedSoa } from "../../../mappers/financialMapper";
import { AddSoaLineItemModal } from "../../modals/AddSoaLineItemModal";
import { EditSoaLineItemModal } from "../../modals/EditSoaLineItemModal";

export interface SoaPaymentTabProps {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
}

export function SoaPaymentTab({
  app,
  isEditable,
  updateApplication,
}: SoaPaymentTabProps) {
  const { colors, isDark } = useTheme();

  const soas = useMemo(() => app.statementsOfAccount ?? [], [app.statementsOfAccount]);
  const hasSoas = soas.length > 0;

  // Dynamic Consolidated SOA
  const consolidatedSoa = useMemo(() => {
    return computeConsolidatedSoa(
      soas,
      app.applicationNumber,
      app.companyDetails?.name || app.applicant
    );
  }, [soas, app.applicationNumber, app.companyDetails?.name, app.applicant]);

  // Selected SOA view: 'consolidated' or specific SOA ID
  const [selectedSoaId, setSelectedSoaId] = useState<string>("consolidated");

  // Keep selection valid
  useEffect(() => {
    if (soas.length === 1 && selectedSoaId === "consolidated") {
      setSelectedSoaId(soas[0].id);
    } else if (soas.length > 1 && selectedSoaId !== "consolidated" && !soas.some((s) => s.id === selectedSoaId)) {
      setSelectedSoaId("consolidated");
    }
  }, [soas, selectedSoaId]);

  const activeSoa: StatementOfAccountItem = useMemo(() => {
    if (selectedSoaId === "consolidated") {
      return consolidatedSoa;
    }
    const found = soas.find((s) => s.id === selectedSoaId);
    return found ?? consolidatedSoa;
  }, [selectedSoaId, soas, consolidatedSoa]);

  const isConsolidatedView = selectedSoaId === "consolidated";

  // When application is Approved, the SOA must be editable unless SOA status is Approved
  const isSoaEditable = activeSoa.status !== "Approved";

  // Local state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [editingOrNumber, setEditingOrNumber] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [orDraft, setOrDraft] = useState(app.payment.orNumber);
  const [dueDraft, setDueDraft] = useState(activeSoa.dueDate || app.dueDate);

  // Modals state
  const [showAddLineItem, setShowAddLineItem] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<SoaItem | null>(null);

  useEffect(() => {
    setDueDraft(activeSoa.dueDate || app.dueDate);
  }, [activeSoa.dueDate, app.dueDate]);

  const excess = app.payment.amountReceived - activeSoa.totalAmount;
  const amountWords = amountToWords(activeSoa.totalAmount);

  // SOA Generation Handler
  const handleGenerateSoa = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    const [res, err] = await applicationService.generateSoa(app.id);
    if (err !== null) {
      setGenerateError(err);
    } else if (res !== null) {
      updateApplication(app.id, {});
    }
    setIsGenerating(false);
  };

  // Add Line Item
  const handleAddLineItemConfirm = async (payload: AddSoaLineItemRequest) => {
    if (isConsolidatedView) return;
    const [res, err] = await applicationService.addSoaLineItem(activeSoa.id, payload);
    if (err !== null) {
      throw new Error(err);
    }
    if (res !== null) {
      setShowAddLineItem(false);
      updateApplication(app.id, {});
    }
  };

  // Edit Line Item
  const handleEditLineItemConfirm = async (
    lineItemId: string,
    payload: UpdateSoaLineItemRequest
  ) => {
    if (isConsolidatedView) return;
    const [res, err] = await applicationService.updateSoaLineItem(
      activeSoa.id,
      lineItemId,
      payload
    );
    if (err !== null) {
      throw new Error(err);
    }
    if (res !== null) {
      setEditingLineItem(null);
      updateApplication(app.id, {});
    }
  };

  // Delete Line Item
  const handleDeleteLineItem = (item: SoaItem) => {
    if (isConsolidatedView || item.id === undefined) return;
    const lineItemId = item.id;
    Alert.alert(
      "Remove Line Item",
      `Are you sure you want to remove "${item.particular}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const [res, err] = await applicationService.deleteSoaLineItem(
              activeSoa.id,
              lineItemId
            );
            if (err !== null) {
              Alert.alert("Error", err);
            } else if (res !== null) {
              updateApplication(app.id, {});
            }
          },
        },
      ]
    );
  };

  // Save Due Date using dedicated SOA endpoint
  const handleSaveDueDate = async () => {
    if (!isConsolidatedView && activeSoa.id !== "consolidated") {
      let isoDate: string | undefined = undefined;

      if (dueDraft && dueDraft.trim().length > 0) {
        const trimmed = dueDraft.trim();
        const parsed = new Date(trimmed);

        if (isNaN(parsed.getTime())) {
          Alert.alert(
            "Invalid Date",
            "Please enter a valid date format (e.g. YYYY-MM-DD, MM/DD/YYYY, or Month DD, YYYY)."
          );
          return;
        }

        // Validate that YYYY-MM-DD matches actual calendar days (e.g. Sept 31 is invalid)
        const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (match) {
          const y = parseInt(match[1], 10);
          const m = parseInt(match[2], 10) - 1;
          const d = parseInt(match[3], 10);
          const checkDate = new Date(Date.UTC(y, m, d));
          if (
            checkDate.getUTCFullYear() !== y ||
            checkDate.getUTCMonth() !== m ||
            checkDate.getUTCDate() !== d
          ) {
            Alert.alert(
              "Invalid Calendar Date",
              `The date ${trimmed} does not exist on the calendar. Please enter a valid date.`
            );
            return;
          }
          isoDate = checkDate.toISOString();
        } else {
          isoDate = parsed.toISOString();
        }
      }

      setEditingDueDate(false);
      const [res, err] = await applicationService.updateSoa(activeSoa.id, {
        dueDate: isoDate,
      });
      if (err !== null) {
        Alert.alert("Error", err);
      } else {
        updateApplication(app.id, {});
      }
    } else {
      setEditingDueDate(false);
      updateApplication(app.id, {});
    }
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* ── NO SOA YET & READY TO GENERATE BANNER ── */}
      {!hasSoas && (
        <View
          style={[
            styles.generateBanner,
            {
              backgroundColor: isDark ? colors.brand[900] : "#EFF6FF",
              borderColor: isDark ? colors.brand[700] : colors.brand[300],
            },
          ]}
        >
          <View style={styles.generateBannerHeader}>
            <View
              style={[
                styles.generateIconWrapper,
                { backgroundColor: isDark ? colors.brand[800] : "#DBEAFE" },
              ]}
            >
              <Lucide
                name="file-text"
                size={28}
                color={isDark ? colors.brand[300] : COLORS.brand[700]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerTagRow}>
                <Text
                  style={[
                    styles.generateBannerTag,
                    {
                      color: isDark ? colors.brand[400] : COLORS.brand[700],
                      backgroundColor: isDark ? colors.brand[900] : "#EFF6FF",
                      borderColor: isDark ? colors.brand[700] : colors.brand[200],
                    },
                  ]}
                >
                  BILLING & PAYMENT INITIATION
                </Text>
              </View>
              <Text
                style={[
                  styles.generateBannerTitle,
                  { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                ]}
              >
                Statement of Account Generation
              </Text>
              <Text
                style={[
                  styles.generateBannerSubtitle,
                  { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                ]}
              >
                {app.status === "Approved"
                  ? "All applicants are complete and the application is approved. Generate individual Statements of Account to compute official billing line items based on configured fees."
                  : "Statement of Account (SOA) will be generated once all applicants have been evaluated and the application status is Approved."}
              </Text>
            </View>
          </View>

          {generateError !== null && generateError.length > 0 && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: isDark ? "#451A1A" : "#FEF2F2" },
              ]}
            >
              <Lucide name="alert-circle" size={16} color={COLORS.semantic.error} />
              <Text style={[styles.errorText, { color: COLORS.semantic.error }]}>
                {generateError}
              </Text>
            </View>
          )}

          {app.status === "Approved" && (
            <View style={styles.generateBtnContainer}>
              <Pressable
                style={[
                  styles.generateBtn,
                  {
                    backgroundColor: isDark ? colors.brand[500] : COLORS.brand[700],
                    opacity: isGenerating ? 0.7 : 1,
                  },
                ]}
                onPress={handleGenerateSoa}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color={COLORS.neutral.white} />
                ) : (
                  <>
                    <Lucide name="zap" size={18} color={COLORS.neutral.white} />
                    <Text style={styles.generateBtnText}>
                      Generate Statement of Account (SOA)
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* ── SOA SWITCHER (CONSOLIDATED & APPLICANT SOAS) ── */}
      {hasSoas && (
        <View style={styles.switcherContainer}>
          <Text
            style={[
              styles.switcherLabel,
              { color: isDark ? colors.neutral[400] : colors.neutral[500] },
            ]}
          >
            VIEW STATEMENT OF ACCOUNT:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.switcherPillsRow}
          >
            {/* Consolidated SOA Pill (Always available when multiple SOAs exist) */}
            {soas.length > 1 && (
              <Pressable
                style={[
                  styles.switcherPill,
                  isConsolidatedView
                    ? [
                        styles.switcherPillActive,
                        {
                          backgroundColor: isDark ? colors.brand[600] : COLORS.brand[700],
                          borderColor: isDark ? colors.brand[500] : COLORS.brand[700],
                        },
                      ]
                    : [
                        styles.switcherPillInactive,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                          borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                        },
                      ],
                ]}
                onPress={() => setSelectedSoaId("consolidated")}
              >
                <Lucide
                  name="layers"
                  size={14}
                  color={
                    isConsolidatedView
                      ? COLORS.neutral.white
                      : isDark
                      ? colors.neutral[300]
                      : colors.neutral[700]
                  }
                />
                <Text
                  style={[
                    styles.switcherPillText,
                    isConsolidatedView
                      ? { color: COLORS.neutral.white }
                      : { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                  ]}
                >
                  Consolidated SOA
                </Text>
                <View
                  style={[
                    styles.switcherAmountBadge,
                    {
                      backgroundColor: isConsolidatedView
                        ? "rgba(255, 255, 255, 0.2)"
                        : isDark
                        ? colors.neutral[700]
                        : colors.neutral[200],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.switcherAmountText,
                      isConsolidatedView
                        ? { color: COLORS.neutral.white }
                        : { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    {formatAmount(consolidatedSoa.totalAmount)}
                  </Text>
                </View>
              </Pressable>
            )}

            {/* Individual Applicant SOAs */}
            {soas.map((s, idx) => {
              const isSelected = selectedSoaId === s.id;
              const displayName = s.applicantName || s.issuedToName || `Applicant ${idx + 1}`;
              return (
                <Pressable
                  key={s.id}
                  style={[
                    styles.switcherPill,
                    isSelected
                      ? [
                          styles.switcherPillActive,
                          {
                            backgroundColor: isDark ? colors.brand[600] : COLORS.brand[700],
                            borderColor: isDark ? colors.brand[500] : COLORS.brand[700],
                          },
                        ]
                      : [
                          styles.switcherPillInactive,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                          },
                        ],
                  ]}
                  onPress={() => setSelectedSoaId(s.id)}
                >
                  <Lucide
                    name="user"
                    size={14}
                    color={
                      isSelected
                        ? COLORS.neutral.white
                        : isDark
                        ? colors.neutral[300]
                        : colors.neutral[700]
                    }
                  />
                  <Text
                    style={[
                      styles.switcherPillText,
                      isSelected
                        ? { color: COLORS.neutral.white }
                        : { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                    ]}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  <View
                    style={[
                      styles.switcherAmountBadge,
                      {
                        backgroundColor: isSelected
                          ? "rgba(255, 255, 255, 0.2)"
                          : isDark
                          ? colors.neutral[700]
                          : colors.neutral[200],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.switcherAmountText,
                        isSelected
                          ? { color: COLORS.neutral.white }
                          : { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                      ]}
                    >
                      {formatAmount(s.totalAmount)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── OFFICIAL BILLING RECORD CARD ── */}
      {hasSoas && (
        <View
          style={[
            styles.billingContainer,
            {
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              backgroundColor: isDark
                ? colors.neutral[800]
                : COLORS.neutral.white,
            },
          ]}
        >
          {/* Header & Meta */}
          <View style={styles.billingHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.billingLabel,
                  { color: isDark ? colors.brand[400] : colors.brand[700] },
                ]}
              >
                OFFICIAL BILLING RECORD {isConsolidatedView && "• (CONSOLIDATED)"}
              </Text>
              <Text
                style={[
                  styles.billingTitle,
                  { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                ]}
              >
                {activeSoa.soaNumber}
              </Text>
              <Text
                style={[
                  styles.billingSubtitle,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                Issued To: <Text style={{ fontWeight: "600" }}>{activeSoa.issuedToName}</Text>
                {activeSoa.issuedToAddress ? ` • ${activeSoa.issuedToAddress}` : ""}
              </Text>
            </View>

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                activeSoa.status === "Approved"
                  ? { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" }
                  : activeSoa.status === "Returned"
                  ? { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }
                  : { backgroundColor: "#FEF3C7", borderColor: "#FCD34D" },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  activeSoa.status === "Approved"
                    ? { color: "#166534" }
                    : activeSoa.status === "Returned"
                    ? { color: "#991B1B" }
                    : { color: "#92400E" },
                ]}
              >
                {activeSoa.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Fee table */}
          <View
            style={[
              styles.feeTable,
              {
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.feeTableHeader,
                {
                  backgroundColor: isDark
                    ? colors.neutral[900]
                    : colors.neutral[50],
                },
              ]}
            >
              {[
                "Particular",
                "No. of Years",
                "%",
                "No. of Units",
                "Fees",
                "Amount",
                ...(isSoaEditable && !isConsolidatedView ? ["Actions"] : []),
              ].map((col) => (
                <Text
                  key={col}
                  style={[
                    styles.feeTableHeaderCell,
                    { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                    col === "Particular"
                      ? { flex: 2 }
                      : col === "Actions"
                      ? { width: 80, textAlign: "center" }
                      : { flex: 1, textAlign: "right" },
                  ]}
                >
                  {col}
                </Text>
              ))}
            </View>
            <View
              style={[
                styles.feeTableDivider,
                {
                  backgroundColor: isDark
                    ? colors.neutral[700]
                    : colors.neutral[200],
                },
              ]}
            />

            {/* Line Items Rows */}
            {activeSoa.lineItems.length === 0 ? (
              <View style={styles.emptyTableState}>
                <Lucide
                  name="inbox"
                  size={24}
                  color={isDark ? colors.neutral[500] : colors.neutral[400]}
                />
                <Text
                  style={[
                    styles.emptyTableText,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                >
                  No line items configured for this Statement of Account.
                </Text>
              </View>
            ) : (
              activeSoa.lineItems.map((item, idx) => (
                <View
                  key={item.id ?? idx}
                  style={[
                    styles.feeTableRow,
                    {
                      borderTopColor: isDark
                        ? colors.neutral[800]
                        : colors.neutral[100],
                    },
                  ]}
                >
                  <View style={{ flex: 2 }}>
                    <Text
                      style={[
                        styles.feeParticularName,
                        {
                          color: isDark
                            ? colors.neutral[100]
                            : colors.neutral[900],
                        },
                      ]}
                    >
                      {item.particular}
                    </Text>
                    {isConsolidatedView && Boolean(item.applicantName) && (
                      <Text
                        style={[
                          styles.feeApplicantTag,
                          { color: isDark ? colors.brand[400] : COLORS.brand[700] },
                        ]}
                      >
                        Applicant: {item.applicantName}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.feeParticularSub,
                        {
                          color: isDark
                            ? colors.neutral[400]
                            : colors.neutral[500],
                        },
                      ]}
                    >
                      Validity • {item.validityYears} Year(s) | Code: {item.code}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.feeTableCell,
                      {
                        flex: 1,
                        color: isDark ? colors.neutral[200] : colors.neutral[700],
                      },
                    ]}
                  >
                    {item.validityYears}
                  </Text>
                  <Text
                    style={[
                      styles.feeTableCell,
                      {
                        flex: 1,
                        color: isDark ? colors.neutral[200] : colors.neutral[700],
                      },
                    ]}
                  >
                    {item.percentage}
                  </Text>
                  <Text
                    style={[
                      styles.feeTableCell,
                      {
                        flex: 1,
                        color: isDark ? colors.neutral[200] : colors.neutral[700],
                      },
                    ]}
                  >
                    {item.noOfUnits}
                  </Text>
                  <Text
                    style={[
                      styles.feeTableCell,
                      {
                        flex: 1,
                        color: isDark ? colors.neutral[200] : colors.neutral[700],
                      },
                    ]}
                  >
                    {formatAmount(item.fees)}
                  </Text>
                  <Text
                    style={[
                      styles.feeTableCell,
                      {
                        flex: 1,
                        fontWeight: "600",
                        color: isDark ? colors.neutral[100] : colors.neutral[900],
                      },
                    ]}
                  >
                    {formatAmount(item.amount)}
                  </Text>

                  {/* Edit / Delete actions for individual SOA view when SOA is editable */}
                  {isSoaEditable && !isConsolidatedView && (
                    <View style={styles.rowActions}>
                      <Pressable
                        style={styles.actionIconBtn}
                        onPress={() => setEditingLineItem(item)}
                        hitSlop={6}
                      >
                        <Lucide
                          name="edit-2"
                          size={14}
                          color={isDark ? colors.brand[400] : COLORS.brand[700]}
                        />
                      </Pressable>
                      <Pressable
                        style={styles.actionIconBtn}
                        onPress={() => handleDeleteLineItem(item)}
                        hitSlop={6}
                      >
                        <Lucide
                          name="trash-2"
                          size={14}
                          color={COLORS.semantic.error}
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Add Line Item Button (For individual applicant SOAs when SOA is editable) */}
          {isSoaEditable && !isConsolidatedView && (
            <View style={styles.addFeeContainer}>
              <Pressable
                style={[
                  styles.addFeeBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : "#F0FDF4",
                    borderColor: isDark ? colors.neutral[700] : "#BBF7D0",
                  },
                ]}
                onPress={() => setShowAddLineItem(true)}
              >
                <Lucide name="plus" size={16} color={COLORS.semantic.success} />
                <Text style={styles.addFeeBtnText}>Add Fee / Line Item</Text>
              </Pressable>
            </View>
          )}

          {/* Total Amount Due */}
          <View
            style={[
              styles.totalBox,
              {
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                backgroundColor: isDark
                  ? colors.neutral[900]
                  : colors.neutral[50],
              },
            ]}
          >
            <View style={styles.totalRight}>
              <Text
                style={[
                  styles.totalLabel,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                TOTAL AMOUNT DUE
              </Text>
              <Text
                style={[
                  styles.totalAmount,
                  { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                ]}
              >
                {formatAmount(activeSoa.totalAmount)}
              </Text>
              <Text
                style={[
                  styles.totalWords,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                {amountWords.toUpperCase()}
              </Text>
              <View style={styles.totalDueDateRow}>
                <Text
                  style={[
                    styles.totalDueDateLabel,
                    {
                      color: isDark ? colors.neutral[400] : colors.neutral[500],
                    },
                  ]}
                >
                  To be paid on or before:
                </Text>
                {editingDueDate ? (
                  <View style={styles.inlineEditRow}>
                    <TextInput
                      style={[
                        styles.inlineEditInput,
                        {
                          color: isDark
                            ? colors.neutral[100]
                            : colors.neutral[900],
                          backgroundColor: isDark
                            ? colors.neutral[800]
                            : COLORS.neutral.white,
                          borderColor: isDark
                            ? colors.brand[500]
                            : colors.brand[500],
                        },
                      ]}
                      value={dueDraft}
                      onChangeText={setDueDraft}
                      autoFocus
                    />
                    <Pressable onPress={handleSaveDueDate}>
                      <Text
                        style={[
                          styles.inlineEditSave,
                          {
                            color: isDark
                              ? colors.brand[500]
                              : colors.brand[700],
                          },
                        ]}
                      >
                        Save
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.totalDueDate,
                      {
                        color: isDark ? colors.neutral[100] : colors.neutral[900],
                      },
                    ]}
                  >
                    {activeSoa.dueDate || "—"}
                  </Text>
                )}
              </View>
              {isSoaEditable && !editingDueDate && (
                <Pressable
                  style={styles.editLinkRow}
                  onPress={() => {
                    setDueDraft(activeSoa.dueDate || app.dueDate);
                    setEditingDueDate(true);
                  }}
                >
                  <Lucide
                    name="edit-2"
                    size={12}
                    color={isDark ? colors.brand[500] : COLORS.brand[700]}
                  />
                  <Text
                    style={[
                      styles.editLinkBlue,
                      { color: isDark ? colors.brand[500] : colors.brand[700] },
                    ]}
                  >
                    Edit Due Date
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      {/* ── PAYMENT SUMMARY SECTION ── */}
      <View
        style={[
          styles.paymentSection,
          {
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            backgroundColor: isDark
              ? colors.neutral[800]
              : COLORS.neutral.white,
          },
        ]}
      >
        <View style={styles.paymentSectionHeader}>
          <View
            style={[
              styles.paymentSectionIcon,
              {
                backgroundColor: isDark
                  ? colors.neutral[800]
                  : colors.neutral[100],
              },
            ]}
          >
            <Lucide
              name="credit-card"
              size={20}
              color={isDark ? colors.neutral[400] : colors.neutral[500]}
            />
          </View>
          <Text
            style={[
              styles.paymentSectionTitle,
              { color: isDark ? colors.neutral[100] : colors.neutral[900] },
            ]}
          >
            Payment Summary
          </Text>
        </View>

        <View style={styles.paymentRow}>
          {/* Amount Received blue card */}
          <View
            style={[
              styles.amountReceivedCard,
              {
                backgroundColor: isDark
                  ? colors.brand[600]
                  : colors.brand[800],
              },
            ]}
          >
            <Text style={styles.amountReceivedLabel}>AMOUNT RECEIVED</Text>
            <Text
              style={[
                styles.amountReceivedValue,
                { color: COLORS.neutral.white },
              ]}
            >
              {formatAmount(app.payment.amountReceived)}
            </Text>
            {excess > 0 && (
              <View style={styles.excessBadge}>
                <Text style={styles.excessBadgeText}>
                  Excess: {formatAmount(excess)}
                </Text>
              </View>
            )}
            <View style={styles.paymentMethodBlock}>
              <Text style={styles.paymentMethodLabel}>PAYMENT METHOD</Text>
              <Text style={styles.paymentMethodValue}>
                {app.payment.method.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* OR Number column */}
          <View style={styles.orColumn}>
            <Text
              style={[
                styles.orLabel,
                { color: isDark ? colors.neutral[400] : colors.neutral[500] },
              ]}
            >
              OFFICIAL RECEIPT (OR) NUMBER
            </Text>
            {editingOrNumber ? (
              <View style={styles.inlineEditRow}>
                <TextInput
                  style={[
                    styles.inlineEditInput,
                    {
                      flex: 1,
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                    },
                  ]}
                  value={orDraft}
                  onChangeText={setOrDraft}
                  autoFocus
                  placeholder="Enter OR Number"
                  placeholderTextColor={
                    isDark ? colors.neutral[500] : colors.neutral[400]
                  }
                />
                <Pressable
                  onPress={() => {
                    setEditingOrNumber(false);
                    updateApplication(app.id, {
                      payment: { ...app.payment, orNumber: orDraft },
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.inlineEditSave,
                      {
                        color: isDark ? colors.brand[500] : colors.brand[700],
                      },
                    ]}
                  >
                    Save
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.orValueRow}>
                <Text
                  style={[
                    styles.orValue,
                    {
                      color: isDark ? colors.neutral[200] : colors.neutral[700],
                    },
                  ]}
                >
                  {app.payment.orNumber.length > 0
                    ? app.payment.orNumber
                    : "—"}
                </Text>
                {isSoaEditable && (
                  <Pressable
                    style={[
                      styles.orEditBtn,
                      {
                        backgroundColor: isDark
                          ? colors.neutral[800]
                          : "#EFF6FF",
                        borderColor: isDark
                          ? colors.brand[500]
                          : colors.brand[600],
                      },
                    ]}
                    onPress={() => {
                      setOrDraft(app.payment.orNumber);
                      setEditingOrNumber(true);
                    }}
                  >
                    <Lucide
                      name="edit-2"
                      size={12}
                      color={isDark ? colors.brand[500] : COLORS.brand[700]}
                    />
                    <Text
                      style={[
                        styles.orEditText,
                        {
                          color: isDark ? colors.brand[500] : colors.brand[700],
                        },
                      ]}
                    >
                      EDIT
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Additional Payment Info for Checks */}
            {app.payment.method === "check" && (
              <View style={{ marginTop: SPACING[16] }}>
                <Text
                  style={[
                    styles.orLabel,
                    {
                      color: isDark ? colors.neutral[400] : colors.neutral[500],
                    },
                  ]}
                >
                  CHECK DETAILS
                </Text>
                <Text
                  style={[
                    styles.checkInfoText,
                    {
                      color: isDark ? colors.neutral[300] : colors.neutral[600],
                    },
                  ]}
                >
                  No: {app.payment.checkNumber || "—"}
                </Text>
                <Text
                  style={[
                    styles.checkInfoText,
                    {
                      color: isDark ? colors.neutral[300] : colors.neutral[600],
                    },
                  ]}
                >
                  Bank: {app.payment.checkName || "—"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── CORRECTION AUDIT TRAIL ── */}
      <Pressable
        style={[
          styles.auditHeader,
          {
            borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200],
          },
        ]}
        onPress={() => setAuditOpen((p) => !p)}
      >
        <View style={styles.auditHeaderLeft}>
          <Lucide
            name="refresh-cw"
            size={14}
            color={isDark ? colors.neutral[500] : colors.neutral[500]}
          />
          <Text
            style={[
              styles.auditTitle,
              { color: isDark ? colors.neutral[400] : colors.neutral[500] },
            ]}
          >
            CORRECTION AUDIT TRAIL ({activeSoa.histories.length + app.correctionAuditTrail.length})
          </Text>
        </View>
        <Lucide
          name={auditOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={isDark ? colors.neutral[500] : colors.neutral[500]}
        />
      </Pressable>

      {auditOpen && (
        <View style={styles.auditList}>
          {activeSoa.histories.length === 0 && app.correctionAuditTrail.length === 0 ? (
            <Text
              style={[
                styles.auditEmpty,
                { color: isDark ? colors.neutral[500] : colors.neutral[400] },
              ]}
            >
              No audit trail entries.
            </Text>
          ) : (
            [...activeSoa.histories, ...app.correctionAuditTrail].map((entry, i) => (
              <View
                key={entry.id || i}
                style={[
                  styles.auditEntry,
                  {
                    borderBottomColor: isDark
                      ? colors.neutral[800]
                      : colors.neutral[100],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.auditDesc,
                    {
                      color: isDark ? colors.neutral[200] : colors.neutral[700],
                    },
                  ]}
                >
                  {entry.action}
                </Text>
                <Text
                  style={[
                    styles.auditMeta,
                    {
                      color: isDark ? colors.neutral[500] : colors.neutral[400],
                    },
                  ]}
                >
                  By {entry.staff} • {entry.timestamp}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* ── MODALS ── */}
      <AddSoaLineItemModal
        visible={showAddLineItem}
        targetName={activeSoa.issuedToName}
        onConfirm={handleAddLineItemConfirm}
        onCancel={() => setShowAddLineItem(false)}
      />

      <EditSoaLineItemModal
        visible={editingLineItem !== null}
        item={editingLineItem}
        onConfirm={handleEditLineItemConfirm}
        onCancel={() => setEditingLineItem(null)}
      />

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: SPACING[16],
  },
  // Generate SOA Banner
  generateBanner: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[20],
    marginBottom: SPACING[16],
    ...SHADOWS.card,
  },
  generateBannerHeader: {
    flexDirection: "row",
    gap: SPACING[16],
    alignItems: "flex-start",
  },
  generateIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTagRow: {
    flexDirection: "row",
    marginBottom: SPACING[4],
  },
  generateBannerTag: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  generateBannerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING[4],
  },
  generateBannerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    lineHeight: 18,
  },
  generateBtnContainer: {
    marginTop: SPACING[16],
    alignItems: "flex-start",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    ...SHADOWS.card,
  },
  generateBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    padding: SPACING[10],
    borderRadius: RADIUS.input,
    marginTop: SPACING[12],
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },

  // Switcher Pills
  switcherContainer: {
    marginBottom: SPACING[16],
  },
  switcherLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: SPACING[8],
  },
  switcherPillsRow: {
    flexDirection: "row",
    gap: SPACING[8],
  },
  switcherPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  switcherPillActive: {},
  switcherPillInactive: {},
  switcherPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  switcherAmountBadge: {
    paddingHorizontal: SPACING[6],
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  switcherAmountText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Billing Container
  billingContainer: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    marginBottom: SPACING[16],
  },
  billingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING[12],
  },
  billingLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: SPACING[2],
  },
  billingTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.heading,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING[2],
  },
  billingSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  statusBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Fee Table
  feeTable: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    overflow: "hidden",
    marginBottom: SPACING[12],
  },
  feeTableHeader: {
    flexDirection: "row",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  feeTableHeaderCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  feeTableDivider: {
    height: 1,
  },
  feeTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderTopWidth: 1,
  },
  feeParticularName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  feeApplicantTag: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 1,
  },
  feeParticularSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
  feeTableCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    textAlign: "right",
  },
  rowActions: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[8],
  },
  actionIconBtn: {
    padding: SPACING[4],
  },
  emptyTableState: {
    padding: SPACING[24],
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[8],
  },
  emptyTableText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },

  // Add Fee
  addFeeContainer: {
    marginBottom: SPACING[16],
    alignItems: "flex-start",
  },
  addFeeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  addFeeBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.success,
  },

  // Total Box
  totalBox: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[16],
    alignItems: "flex-end",
  },
  totalRight: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: SPACING[2],
  },
  totalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING[2],
  },
  totalWords: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: "right",
    marginBottom: SPACING[12],
  },
  totalDueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  totalDueDateLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  totalDueDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  inlineEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
  },
  inlineEditInput: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    fontSize: 12,
    minWidth: 100,
  },
  inlineEditSave: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  editLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    marginTop: SPACING[4],
  },
  editLinkBlue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Payment Section
  paymentSection: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    marginBottom: SPACING[16],
  },
  paymentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[10],
    marginBottom: SPACING[16],
  },
  paymentSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  paymentRow: {
    flexDirection: "row",
    gap: SPACING[16],
    flexWrap: "wrap",
  },
  amountReceivedCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: RADIUS.input,
    padding: SPACING[16],
  },
  amountReceivedLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.5,
    marginBottom: SPACING[4],
  },
  amountReceivedValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING[4],
  },
  excessBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: RADIUS.circle,
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: SPACING[12],
  },
  excessBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  paymentMethodBlock: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    paddingTop: SPACING[8],
    marginTop: SPACING[4],
  },
  paymentMethodLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.5,
  },
  paymentMethodValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    marginTop: 2,
  },

  // OR Column
  orColumn: {
    flex: 1,
    minWidth: 200,
    justifyContent: "center",
  },
  orLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: SPACING[4],
  },
  orValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[10],
  },
  orValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  orEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  orEditText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  checkInfoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },

  // Audit Trail
  auditHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: SPACING[16],
    marginBottom: SPACING[8],
  },
  auditHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  auditTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  auditList: {
    gap: SPACING[8],
    marginBottom: SPACING[16],
  },
  auditEmpty: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontStyle: "italic",
  },
  auditEntry: {
    borderBottomWidth: 1,
    paddingBottom: SPACING[8],
  },
  auditDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  auditMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
});
