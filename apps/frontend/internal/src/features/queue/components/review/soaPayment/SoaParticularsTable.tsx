import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import { useTheme, COLORS, RADIUS, TYPOGRAPHY, Icon as Lucide, DatePickerInput, toast } from "@edge/ui";
import {
  extractOrNumbers,
  useTenantConfig,
  useSoaNotes,
  applicationService,
  mutateApplications,
  CreateSoaLineItemRequest,
  IssuedToTypeDto,
} from "@edge/api";
import { ApplicationData, SoaItem, SoaRecordSummary } from "../../../../../types/application";
import { formatAmount, amountToWords, formatDisplayDueDate, formatDisplayDateTime } from "../reviewFormatters";
import { resolveParticularNumber } from "../../../utils/soaReportGenerator";
import { normalizeYmd, resolveInitialAddress, resolveInitialName, resolveInitialType } from "../../../utils/soaModalHelpers";
import { reviewStyles as styles } from "../reviewStyles";

interface SoaParticularsTableProps {
  app: ApplicationData;
  isEditable: boolean;
  hasPayment: boolean;
  isForAccountant: boolean;
  isSoaReturned: boolean;
  onOpenGenerateSoa: () => void;
  onPreviewReport: (reportType: 'soa' | 'op' | 'or') => void;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
}

export function SoaParticularsTable({
  app,
  isEditable,
  hasPayment,
  isForAccountant,
  isSoaReturned,
  onOpenGenerateSoa,
  onPreviewReport,
  updateApplication,
}: SoaParticularsTableProps) {
  const { colors, isDark } = useTheme();
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [dueDraft, setDueDraft] = useState(app.dueDate);
  const [optimisticDueDate, setOptimisticDueDate] = useState<string | null>(null);
  const [isSavingDueDate, setIsSavingDueDate] = useState(false);

  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarksDraft, setRemarksDraft] = useState("");
  const [selectedNoteIdDraft, setSelectedNoteIdDraft] = useState<string | null>(null);
  const [optimisticRemarks, setOptimisticRemarks] = useState<string | null>(null);
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);

  const { config: tenantConfig } = useTenantConfig(app.tenantId);
  const { notes: tenantSoaNotes } = useSoaNotes({ tenantId: app.tenantId, enabled: editingRemarks });
  const allowManualSoaNumber = tenantConfig.allowManualSoaNumber === true;
  const [editingSoaNumber, setEditingSoaNumber] = useState(false);
  const [soaNumberDraft, setSoaNumberDraft] = useState("");
  const [isSavingSoaNumber, setIsSavingSoaNumber] = useState(false);

  const isIndividualSoaMode =
    app.soaBillingMode === 'INDIVIDUAL' &&
    app.soasList !== undefined &&
    app.soasList.length > 0;

  const [selectedSoaId, setSelectedSoaId] = useState<string | null>(
    app.soasList && app.soasList.length > 0 ? (app.soasList[0]?.id ?? null) : null
  );

  useEffect(() => {
    if (app.soasList && app.soasList.length > 0) {
      const stillExists = app.soasList.some((s) => s.id === selectedSoaId);
      if (!stillExists) {
        setSelectedSoaId(app.soasList[0]?.id ?? null);
      }
    } else {
      setSelectedSoaId(null);
    }
  }, [app.soasList, selectedSoaId]);

  useEffect(() => {
    setOptimisticDueDate(null);
    setOptimisticRemarks(null);
    setEditingDueDate(false);
    setEditingRemarks(false);
  }, [app.id, selectedSoaId]);

  useEffect(() => {
    if (optimisticDueDate !== null) {
      const serverDue = normalizeYmd(activeSoaRecord?.dueDate || app.soaDueDate || app.dueDate);
      if (serverDue === optimisticDueDate) {
        setOptimisticDueDate(null);
      }
    }
  }, [app.dueDate, app.soaDueDate, optimisticDueDate]);

  useEffect(() => {
    if (optimisticRemarks !== null) {
      const serverRemarks = (activeSoaRecord?.remarks || activeSoaRecord?.soaNoteText || app.soaRemarks || app.soaNoteText || app.remarks || "").trim();
      if (serverRemarks === optimisticRemarks) {
        setOptimisticRemarks(null);
      }
    }
  }, [app.soaRemarks, app.soaNoteText, app.remarks, optimisticRemarks]);

  const activeSoaRecord = isIndividualSoaMode && app.soasList
    ? (app.soasList.find((s) => s.id === selectedSoaId) ?? app.soasList[0])
    : undefined;

  const displayedSoaNumber = activeSoaRecord?.soaNumber ?? app.soaNumber;
  const displayedSoaItems = activeSoaRecord?.items && activeSoaRecord.items.length > 0
    ? activeSoaRecord.items
    : app.soaItems;
  const displayedSoaTotal = activeSoaRecord !== undefined
    ? activeSoaRecord.totalAmount
    : app.totalAmountDue;

  const rawServerDueDate = activeSoaRecord?.dueDate || app.soaDueDate || app.dueDate || "";
  const displayedDueDate = optimisticDueDate ?? rawServerDueDate;

  const rawServerRemarks =
    activeSoaRecord?.remarks ||
    activeSoaRecord?.soaNoteText ||
    app.soaRemarks ||
    app.soaNoteText ||
    app.remarks ||
    "";
  const displayedRemarks = optimisticRemarks !== null ? optimisticRemarks : rawServerRemarks;

  useEffect(() => {
    if (!editingDueDate) {
      const normalized = normalizeYmd(displayedDueDate);
      setDueDraft(normalized || displayedDueDate);
    }
  }, [displayedDueDate, editingDueDate]);

  const persistSoaUpdate = async (overrides: {
    dueDate?: string;
    remarks?: string;
    soaNoteId?: string | null;
  }): Promise<boolean> => {
    const resolvedDue =
      normalizeYmd(overrides.dueDate ?? displayedDueDate) ||
      (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split("T")[0] ?? "";
      })();

    const resolvedRemarks =
      overrides.remarks !== undefined ? overrides.remarks : displayedRemarks;
    const resolvedNoteId =
      overrides.soaNoteId !== undefined
        ? overrides.soaNoteId
        : (activeSoaRecord?.soaNoteId ?? app.soaNoteId ?? null);

    const buildLineItemsPayload = (items: SoaItem[]): CreateSoaLineItemRequest[] =>
      items.map((item) => ({
        particular: item.particular.trim(),
        itemCode: (item.code || "FEE").trim(),
        validityYears: item.validityYears || 0,
        noOfUnits: item.noOfUnits || 1,
        feeRate: typeof item.fees === "number" ? item.fees : Number(item.fees) || 0,
        amount: item.amount || 0,
      }));

    if (isIndividualSoaMode && app.soasList && app.soasList.length > 0) {
      const targetRecords: SoaRecordSummary[] =
        overrides.dueDate !== undefined
          ? app.soasList
          : (activeSoaRecord ? [activeSoaRecord] : app.soasList);

      for (const rec of targetRecords) {
        const recItems = rec.items && rec.items.length > 0 ? rec.items : displayedSoaItems;
        const [, err] = await applicationService.createSoa(app.id, {
          applicantId: rec.applicantId,
          noOfUnits: 1,
          issuedToType: rec.issuedToType || "Individual",
          issuedToName: rec.issuedToName || resolveInitialName(app),
          issuedToAddress: rec.issuedToAddress || resolveInitialAddress(app),
          dueDate: resolvedDue,
          lineItems: recItems.length > 0 ? buildLineItemsPayload(recItems) : undefined,
          remarks: resolvedRemarks.trim() || undefined,
          soaNoteId: resolvedNoteId || undefined,
        });
        if (err !== null) {
          return false;
        }
      }
      return true;
    }

    const issuedToType: IssuedToTypeDto =
      app.soaIssuedToType ?? resolveInitialType(app);
    const issuedToName =
      (app.soaIssuedToName && app.soaIssuedToName.trim().length > 0
        ? app.soaIssuedToName.trim()
        : resolveInitialName(app)) || "Applicant";
    const issuedToAddress =
      (app.soaIssuedToAddress && app.soaIssuedToAddress.trim().length > 0
        ? app.soaIssuedToAddress.trim()
        : resolveInitialAddress(app)) || "N/A";
    const eligibleCount =
      app.applicantsList && app.applicantsList.length > 0
        ? Math.max(
            app.applicantsList.filter(
              (a) => a.status !== "Incomplete" && a.status !== "ForEndorsement"
            ).length,
            1
          )
        : 1;

    const [, err] = await applicationService.createSoa(app.id, {
      applicantId: undefined,
      noOfUnits: app.applicationType === "BULK" ? eligibleCount : 1,
      issuedToType,
      issuedToName,
      issuedToAddress,
      dueDate: resolvedDue,
      lineItems:
        displayedSoaItems.length > 0
          ? buildLineItemsPayload(displayedSoaItems)
          : undefined,
      remarks: resolvedRemarks.trim() || undefined,
      soaNoteId: resolvedNoteId || undefined,
    });

    return err === null;
  };

  const amountWords = amountToWords(displayedSoaTotal);

  return (
    <View
      style={[
        styles.billingContainer,
        {
          borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={[styles.billingLabel, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>OFFICIAL BILLING RECORD</Text>
          <Text style={[styles.billingTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Statement of Account</Text>
          {displayedSoaNumber !== null && displayedSoaNumber !== undefined && displayedSoaNumber.trim().length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              {editingSoaNumber ? (
                <View style={styles.inlineEditRow}>
                  <TextInput
                    style={[styles.inlineEditInput, { minWidth: 160, color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
                    value={soaNumberDraft}
                    onChangeText={setSoaNumberDraft}
                    autoFocus
                    placeholder="Enter SOA Number"
                    placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  />
                  <Pressable
                    disabled={isSavingSoaNumber}
                    onPress={async () => {
                      const targetSoaId = activeSoaRecord?.id ?? app.soaId;
                      const cleanNumber = soaNumberDraft.trim();
                      if (!cleanNumber) {
                        toast.error("SOA number cannot be empty.");
                        return;
                      }
                      if (!targetSoaId) {
                        setEditingSoaNumber(false);
                        updateApplication(app.id, { soaNumber: cleanNumber });
                        return;
                      }
                      setIsSavingSoaNumber(true);
                      const [res, err] = await applicationService.updateSoaNumber(targetSoaId, cleanNumber);
                      setIsSavingSoaNumber(false);
                      if (err !== null || !res?.succeeded) {
                        toast.error(err || res?.message || "Failed to update SOA number.");
                        return;
                      }
                      setEditingSoaNumber(false);
                      updateApplication(app.id, { soaNumber: cleanNumber });
                      toast.success("SOA number updated.");
                      void mutateApplications(app.id);
                    }}
                  >
                    <Text style={[styles.inlineEditSave, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                      {isSavingSoaNumber ? "Saving..." : "Save"}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setEditingSoaNumber(false)}>
                    <Text style={[styles.inlineEditSave, { color: colors.textMuted, marginLeft: 4 }]}>Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? colors.brand[400] : colors.brand[700], fontFamily: TYPOGRAPHY.fonts.mono }}>
                    {displayedSoaNumber}
                  </Text>
                  {allowManualSoaNumber && (
                    <Pressable
                      onPress={() => {
                        setSoaNumberDraft(displayedSoaNumber);
                        setEditingSoaNumber(true);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: RADIUS.xs,
                        borderWidth: 1,
                        borderColor: isDark ? colors.brand[500] : colors.brand[600],
                        backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF',
                      }}
                    >
                      <Lucide name="edit-2" size={10} color={isDark ? colors.brand[400] : colors.brand[700]} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? colors.brand[400] : colors.brand[700] }}>
                        EDIT SOA #
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
              {app.applicationType === 'BULK' && (
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    backgroundColor: isIndividualSoaMode
                      ? (isDark ? '#1e3a8a' : '#dbeafe')
                      : (isDark ? '#312e81' : '#e0e7ff'),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      color: isIndividualSoaMode
                        ? (isDark ? '#93c5fd' : '#1d4ed8')
                        : (isDark ? '#c7d2fe' : '#4338ca'),
                    }}
                  >
                    {isIndividualSoaMode
                      ? `Individual SOA (${app.soasList?.length ?? 1} of ${app.applicantsList?.length ?? 1} Applicant(s))`
                      : 'Bulk Consolidated SOA'}
                  </Text>
                </View>
              )}
              {Boolean(resolveParticularNumber(app)) && (
                <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? colors.neutral[300] : colors.neutral[600] }}>
                  • Particular: <Text style={{ fontFamily: TYPOGRAPHY.fonts.mono, fontWeight: '700', color: isDark ? colors.brand[300] : colors.brand[700] }}>{resolveParticularNumber(app)}</Text>
                </Text>
              )}
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  backgroundColor:
                    app.soaStatus === 'ForOrderOfPayment' || isForAccountant
                      ? (isDark ? '#312e81' : '#e0e7ff')
                      : app.soaStatus === 'Approved' || app.status === 'PendingPayment'
                      ? (isDark ? '#064e3b' : '#dcfce7')
                      : isSoaReturned || app.soaStatus === 'Returned'
                      ? (isDark ? '#451a03' : '#fef3c7')
                      : (isDark ? '#1f2937' : '#f3f4f6'),
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    color:
                      app.soaStatus === 'ForOrderOfPayment' || isForAccountant
                        ? (isDark ? '#c7d2fe' : '#4338ca')
                        : app.soaStatus === 'Approved' || app.status === 'PendingPayment'
                        ? (isDark ? '#86efac' : '#15803d')
                        : isSoaReturned || app.soaStatus === 'Returned'
                        ? (isDark ? '#fde68a' : '#b45309')
                        : (isDark ? '#9ca3af' : '#4b5563'),
                  }}
                >
                  {app.soaStatus === 'ForOrderOfPayment' || isForAccountant
                    ? 'FOR Order of Payment'
                    : app.soaStatus === 'Approved' || app.status === 'PendingPayment'
                    ? 'FOR Payment'
                    : isSoaReturned || app.soaStatus === 'Returned'
                    ? 'Returned'
                    : 'Pending'}
                </Text>
              </View>
              {app.soaCreatedAt !== null && app.soaCreatedAt !== undefined && app.soaCreatedAt.trim().length > 0 ? (
                <Text style={{ fontSize: 12, color: isDark ? colors.neutral[400] : colors.neutral[500] }}>
                  • Generated {formatDisplayDateTime(app.soaCreatedAt)}
                </Text>
              ) : null}
            </View>
          ) : null}
          <Text style={[styles.billingSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500], marginTop: 2 }]}>
            Review the billing particulars, charges, and due date below.
          </Text>
        </View>

        {/* Consolidated Action buttons toolbar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {isEditable && !hasPayment && !isForAccountant && (app.status === 'Evaluating' || app.status === 'Returned' || isSoaReturned) ? (
            <Pressable
              style={[
                styles.soaActionBtn,
                {
                  backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                },
              ]}
              onPress={onOpenGenerateSoa}
            >
              <Lucide name="edit-3" size={13} color={isDark ? colors.brand[300] : colors.brand[700]} />
              <Text style={[styles.soaActionBtnText, { color: isDark ? colors.brand[300] : colors.brand[700] }]}>
                Edit / Recalculate SOA
              </Text>
            </Pressable>
          ) : hasPayment ? (
            <View
              style={[
                styles.soaActionBtn,
                {
                  backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
                  borderColor: isDark ? '#059669' : '#10b981',
                },
              ]}
            >
              <Lucide name="lock" size={13} color={isDark ? '#34d399' : '#059669'} />
              <Text style={[styles.soaActionBtnText, { color: isDark ? '#34d399' : '#059669' }]}>
                SOA (Locked)
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.soaActionBtn,
              {
                backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                borderColor: isDark ? colors.brand[500] : colors.brand[600],
                gap: 6,
              },
            ]}
            onPress={() => onPreviewReport(hasPayment ? 'or' : 'soa')}
          >
            <Lucide name="file-text" size={13} color={isDark ? colors.brand[300] : colors.brand[700]} />
            <Text style={[styles.soaActionBtnText, { color: isDark ? colors.brand[300] : colors.brand[700], fontWeight: '700' }]}>
              {hasPayment ? 'View Application Reports (SOA • OP • OR)' : 'View Application Reports (SOA • OP)'}
            </Text>
            {hasPayment && app.payment.orNumber.trim().length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: RADIUS.xs,
                  backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
                  borderWidth: 1,
                  borderColor: isDark ? '#059669' : '#a7f3d0',
                }}
              >
                <Lucide name="check-circle" size={10} color={isDark ? '#34d399' : '#059669'} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
                    color: isDark ? '#34d399' : '#059669',
                  }}
                >
                  {(() => {
                    const list = extractOrNumbers(app.payment.orNumbers, app.orNumbers, app.payment.orNumber);
                    if (list.length === 0) return '';
                    if (list.length > 1) return list.join(', ');
                    const single = list[0] ?? '';
                    return single.toUpperCase().startsWith('OR') ? single : `OR #${single}`;
                  })()}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {isIndividualSoaMode && app.soasList && app.soasList.length > 0 && (
        <View
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: RADIUS.card,
            backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
            borderWidth: 1,
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? colors.neutral[200] : colors.neutral[800] }}>
              Individual Statements of Account by Applicant ({app.soasList.length})
            </Text>
            {activeSoaRecord?.issuedToName ? (
              <Text style={{ fontSize: 12, color: isDark ? colors.brand[300] : colors.brand[700], fontWeight: '600' }}>
                Viewing: {activeSoaRecord.issuedToName}
              </Text>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {app.soasList.map((soaRec, idx) => {
              const isSelected = activeSoaRecord?.id === soaRec.id;
              const matchedApp = app.applicantsList?.find((a) => a.id === soaRec.applicantId);
              const displayName = matchedApp?.name || soaRec.issuedToName || `Applicant #${idx + 1}`;
              return (
                <Pressable
                  key={soaRec.id}
                  onPress={() => setSelectedSoaId(soaRec.id)}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: RADIUS.sm,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? (isDark ? colors.brand[400] : colors.brand[600])
                        : (isDark ? colors.neutral[700] : colors.neutral[300]),
                      backgroundColor: isSelected
                        ? (isDark ? colors.brand[900] : colors.brand[50])
                        : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                    },
                    Platform.select({ web: { cursor: 'pointer' } as object }),
                  ]}
                >
                  <Lucide
                    name="file-text"
                    size={12}
                    color={isSelected ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[500])}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? (isDark ? colors.brand[200] : colors.brand[900]) : (isDark ? colors.neutral[300] : colors.neutral[700]),
                    }}
                  >
                    {displayName} • {soaRec.soaNumber} ({formatAmount(soaRec.totalAmount)})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={[styles.feeTable, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
        <View style={[styles.feeTableHeader, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
          {["Particular", "No. of Years", "%", "No. of Units", "Fees", "Amount"].map((col) => (
            <Text
              key={col}
              style={[
                styles.feeTableHeaderCell,
                { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                col === "Particular" ? { flex: 2 } : { flex: 1, textAlign: "right" },
              ]}
            >
              {col}
            </Text>
          ))}
        </View>
        <View style={[styles.feeTableDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />

        {displayedSoaItems.map((item: SoaItem, idx: number) => (
          <View key={idx} style={[styles.feeTableRow, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <View style={{ flex: 2 }}>
              <Text style={[styles.feeParticularName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{item.particular}</Text>
              {item.validityYears > 0 && (
                <Text style={[styles.feeParticularSub, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                  Validity • {item.validityYears} Year(s)
                </Text>
              )}
              <Text style={[styles.feeParticularSub, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>Code: {item.code}</Text>
            </View>
            <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
              {item.validityYears > 0 ? item.validityYears : '—'}
            </Text>
            <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
              {item.percentage}
            </Text>
            <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
              {item.noOfUnits}
            </Text>
            <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
              {typeof item.fees === 'number' ? formatAmount(item.fees) : (item.fees || '₱0.00')}
            </Text>
            <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
              {formatAmount(item.amount)}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.totalBox,
          {
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
          },
        ]}
      >
        <View style={styles.totalRight}>
          <Text style={[styles.totalLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {isIndividualSoaMode ? 'SELECTED APPLICANT SOA AMOUNT DUE' : 'TOTAL AMOUNT DUE'}
          </Text>
          <Text style={[styles.totalAmount, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
            {formatAmount(displayedSoaTotal)}
          </Text>
          <Text style={[styles.totalWords, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{amountWords.toUpperCase()}</Text>
          {isIndividualSoaMode && app.soasList && app.soasList.length > 1 && (
            <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 4 }}>
              Combined Cohort Total ({app.soasList.length} Individual SOAs): {formatAmount(app.totalAmountDue)}
            </Text>
          )}

          {/* Enhanced Due Date Banner Card */}
          <View
            style={[
              styles.dueDateHighlightCard,
              {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
              },
            ]}
          >
            <View style={styles.dueDateHeaderRow}>
              <View style={styles.dueDateLabelGroup}>
                <Lucide name="calendar" size={15} color={isDark ? colors.brand[400] : colors.brand[600]} />
                <Text style={[styles.dueDateHighlightLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  TO BE PAID ON OR BEFORE:
                </Text>
              </View>

              {isEditable && !hasPayment && !isForAccountant && !editingDueDate && (
                <Pressable
                  style={[
                    styles.editDueDateBtn,
                    {
                      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200],
                      borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                    },
                    Platform.select({ web: { cursor: 'pointer' } as object }),
                  ]}
                  onPress={() => {
                    const normalized = normalizeYmd(displayedDueDate);
                    const fallbackDue = (() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      return d.toISOString().split("T")[0] ?? "";
                    })();
                    setDueDraft(normalized || fallbackDue);
                    setEditingDueDate(true);
                  }}
                >
                  <Lucide name="edit-2" size={12} color={isDark ? colors.brand[400] : colors.brand[700]} />
                  <Text style={[styles.editDueDateBtnText, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                    Change Date
                  </Text>
                </Pressable>
              )}
            </View>

            {editingDueDate ? (
              <View style={styles.inlineEditDueDateContainer}>
                <DatePickerInput
                  value={dueDraft}
                  onChangeText={(nextVal) => setDueDraft(nextVal)}
                  placeholder="YYYY-MM-DD"
                  containerStyle={{ flex: 1 }}
                />
                <View style={styles.inlineEditActions}>
                  <Pressable
                    disabled={isSavingDueDate}
                    style={[
                      styles.inlineSaveBtn,
                      { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] },
                      isSavingDueDate && { opacity: 0.6 },
                    ]}
                    onPress={async () => {
                      const cleanDue = normalizeYmd(dueDraft) || dueDraft.trim();
                      if (!cleanDue) {
                        toast.error("Please select a valid payment due date.");
                        return;
                      }
                      setIsSavingDueDate(true);
                      setOptimisticDueDate(cleanDue);
                      setEditingDueDate(false);
                      const ok = await persistSoaUpdate({ dueDate: cleanDue });
                      setIsSavingDueDate(false);
                      if (!ok) {
                        setOptimisticDueDate(null);
                        toast.error("Failed to update SOA payment due date.");
                        return;
                      }
                      toast.success("SOA payment due date updated.");
                      await mutateApplications(app.id);
                      updateApplication(app.id, {});
                    }}
                  >
                    <Text style={styles.inlineSaveBtnText}>
                      {isSavingDueDate ? "Saving..." : "Save"}
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={isSavingDueDate}
                    style={[
                      styles.inlineCancelBtn,
                      {
                        borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                        backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      },
                    ]}
                    onPress={() => {
                      const normalized = normalizeYmd(displayedDueDate);
                      setDueDraft(normalized || displayedDueDate);
                      setEditingDueDate(false);
                    }}
                  >
                    <Text style={[styles.inlineCancelBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.dueDateValueRow}>
                <Text style={[styles.dueDateHighlightValue, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                  {formatDisplayDueDate(displayedDueDate)}
                </Text>
              </View>
            )}
          </View>

          {/* Enhanced Official SOA Remarks Banner Card (Inline Editable) */}
          <View
            style={[
              styles.dueDateHighlightCard,
              {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                marginTop: 10,
              },
            ]}
          >
            <View style={styles.dueDateHeaderRow}>
              <View style={styles.dueDateLabelGroup}>
                <Lucide name="file-text" size={15} color={isDark ? colors.brand[400] : colors.brand[600]} />
                <Text style={[styles.dueDateHighlightLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  SOA REMARKS & INSTRUCTIONS:
                </Text>
              </View>

              {isEditable && !hasPayment && !isForAccountant && !editingRemarks && (
                <Pressable
                  style={[
                    styles.editDueDateBtn,
                    {
                      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200],
                      borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                    },
                    Platform.select({ web: { cursor: 'pointer' } as object }),
                  ]}
                  onPress={() => {
                    setRemarksDraft(displayedRemarks);
                    setSelectedNoteIdDraft(activeSoaRecord?.soaNoteId ?? app.soaNoteId ?? null);
                    setEditingRemarks(true);
                  }}
                >
                  <Lucide name="edit-2" size={12} color={isDark ? colors.brand[400] : colors.brand[700]} />
                  <Text style={[styles.editDueDateBtnText, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                    Edit Remarks
                  </Text>
                </Pressable>
              )}
            </View>

            {editingRemarks ? (
              <View style={styles.inlineEditDueDateContainer}>
                {tenantSoaNotes.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                    {tenantSoaNotes.map((note) => {
                      const isSelected = selectedNoteIdDraft === note.id;
                      return (
                        <Pressable
                          key={note.id}
                          onPress={() => {
                            setSelectedNoteIdDraft(note.id);
                            if (note.notes) {
                              setRemarksDraft(note.notes);
                            }
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: RADIUS.xs,
                            borderWidth: 1,
                            borderColor: isSelected
                              ? (isDark ? colors.brand[400] : colors.brand[600])
                              : (isDark ? colors.neutral[600] : colors.neutral[300]),
                            backgroundColor: isSelected
                              ? (isDark ? colors.brand[900] : '#EFF6FF')
                              : (isDark ? colors.neutral[900] : COLORS.neutral.white),
                          }}
                        >
                          <Lucide
                            name={isSelected ? "check-circle" : "file-text"}
                            size={11}
                            color={isSelected ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[500])}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: isSelected ? '700' : '600',
                              color: isSelected ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[300] : colors.neutral[700]),
                            }}
                          >
                            {note.title || note.code || 'Regional Note'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <TextInput
                  style={[
                    styles.remarksInputCompact,
                    {
                      minHeight: 68,
                      textAlignVertical: 'top',
                      backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                      borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                    },
                  ]}
                  multiline
                  numberOfLines={3}
                  value={remarksDraft}
                  onChangeText={setRemarksDraft}
                  placeholder="Enter SOA remarks or payment instructions..."
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  autoFocus
                />

                <View style={styles.inlineEditActions}>
                  <Pressable
                    disabled={isSavingRemarks}
                    style={[
                      styles.inlineSaveBtn,
                      { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] },
                      isSavingRemarks && { opacity: 0.6 },
                    ]}
                    onPress={async () => {
                      const cleanRemarks = remarksDraft.trim();
                      setIsSavingRemarks(true);
                      setOptimisticRemarks(cleanRemarks);
                      setEditingRemarks(false);
                      const ok = await persistSoaUpdate({
                        remarks: cleanRemarks,
                        soaNoteId: selectedNoteIdDraft,
                      });
                      setIsSavingRemarks(false);
                      if (!ok) {
                        setOptimisticRemarks(null);
                        toast.error("Failed to update SOA remarks.");
                        return;
                      }
                      toast.success("SOA remarks and instructions updated.");
                      await mutateApplications(app.id);
                      updateApplication(app.id, {});
                    }}
                  >
                    <Text style={styles.inlineSaveBtnText}>
                      {isSavingRemarks ? "Saving..." : "Save"}
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={isSavingRemarks}
                    style={[
                      styles.inlineCancelBtn,
                      {
                        borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                        backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      },
                    ]}
                    onPress={() => {
                      setRemarksDraft(displayedRemarks);
                      setSelectedNoteIdDraft(activeSoaRecord?.soaNoteId ?? app.soaNoteId ?? null);
                      setEditingRemarks(false);
                    }}
                  >
                    <Text style={[styles.inlineCancelBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 6, paddingHorizontal: 2 }}>
                {displayedRemarks ? (
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 18,
                      color: isDark ? colors.neutral[200] : colors.neutral[800],
                      fontFamily: TYPOGRAPHY.fonts.primary,
                    }}
                  >
                    {displayedRemarks}
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 18,
                      fontStyle: 'italic',
                      color: isDark ? colors.neutral[500] : colors.neutral[400],
                      fontFamily: TYPOGRAPHY.fonts.primary,
                    }}
                  >
                    No remarks recorded
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
