import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import {
  useTheme,
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Icon as Lucide,
  DatePickerInput,
} from "@edge/ui";
import { SoaPaymentTabProps } from "./reviewTypes";
import { formatAmount, amountToWords, formatDisplayDueDate } from "./reviewFormatters";
import { reviewStyles as styles } from "./reviewStyles";
import { AuditTrailEntry, SoaItem, ApplicantItem } from "../../../../types/application";

export function SoaPaymentTab({
  app,
  isEditable,
  updateApplication,
  onOpenGenerateSoa,
  onPrintSoa,
  onPrintOp,
  onPreviewReport,
}: SoaPaymentTabProps) {
  const { colors, isDark } = useTheme();
  const [editingOrNumber, setEditingOrNumber] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [orDraft, setOrDraft] = useState(app.payment.orNumber);
  const [dueDraft, setDueDraft] = useState(app.dueDate);

  useEffect(() => {
    if (!editingOrNumber) {
      setOrDraft(app.payment.orNumber);
    }
  }, [app.payment.orNumber, editingOrNumber]);

  useEffect(() => {
    if (!editingDueDate) {
      setDueDraft(app.dueDate);
    }
  }, [app.dueDate, editingDueDate]);

  const hasSoa = app.soaItems.length > 0 || app.totalAmountDue > 0;
  const hasPayment = app.payment.amountReceived > 0 || app.payment.orNumber.trim().length > 0;
  const excess = app.payment.amountReceived - app.totalAmountDue;
  const amountWords = amountToWords(app.totalAmountDue);

  const hasIncompleteApplicants = app.applicantsList?.some((a: ApplicantItem) => a.status === 'Incomplete') ?? false;
  const isEvaluationApproved =
    (app.status === 'Approved' ||
      app.status === 'Evaluating' ||
      ((app.applicantsList?.length ?? 0) > 0 && !hasIncompleteApplicants)) &&
    !hasIncompleteApplicants &&
    app.status !== 'Draft' &&
    app.status !== 'Returned';

  const canGenerateSoa = isEditable && isEvaluationApproved && app.status !== 'ForAccountant' && app.status !== 'PendingPayment' && app.status !== 'Completed';

  if (!hasSoa) {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.billingContainer,
            {
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
              padding: SPACING[20],
              alignItems: 'center',
              gap: SPACING[12],
            },
          ]}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: isEvaluationApproved
                ? (isDark ? colors.brand[900] : colors.brand[50])
                : (isDark ? '#451a03' : '#fef3c7'),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lucide
              name={isEvaluationApproved ? "file-plus" : "lock"}
              size={26}
              color={isEvaluationApproved ? (isDark ? colors.brand[400] : colors.brand[600]) : (isDark ? '#fbbf24' : '#d97706')}
            />
          </View>

          <Text
            style={[
              styles.billingTitle,
              {
                color: isDark ? colors.neutral[100] : colors.neutral[900],
                fontSize: 17,
                textAlign: 'center',
              },
            ]}
          >
            {isEvaluationApproved
              ? 'Generate Statement of Account'
              : 'Statement of Account (Evaluation Required)'}
          </Text>

          <Text
            style={[
              styles.billingSubtitle,
              {
                color: isDark ? colors.neutral[400] : colors.neutral[500],
                textAlign: 'center',
                maxWidth: 480,
                lineHeight: 18,
              },
            ]}
          >
            {isEvaluationApproved
              ? 'Generate the SOA to compute statutory fees before forwarding to the Accountant.'
              : 'Complete applicant evaluation to generate the SOA.'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: RADIUS.xs,
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
                borderWidth: 1,
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              }}
            >
              <Text style={{ fontSize: 11, color: isDark ? colors.neutral[300] : colors.neutral[600], fontFamily: TYPOGRAPHY.fonts.primary }}>
                Service: <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>{app.serviceName || app.category}</Text>
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: RADIUS.xs,
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
                borderWidth: 1,
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              }}
            >
              <Text style={{ fontSize: 11, color: isDark ? colors.neutral[300] : colors.neutral[600], fontFamily: TYPOGRAPHY.fonts.primary }}>
                Applicants: <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>{app.applicantsList?.length || 1} unit(s)</Text>
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: RADIUS.xs,
                backgroundColor: isEvaluationApproved
                  ? (isDark ? '#064e3b' : '#ecfdf5')
                  : (isDark ? '#451a03' : '#fffbeb'),
                borderWidth: 1,
                borderColor: isEvaluationApproved
                  ? (isDark ? '#059669' : '#10b981')
                  : (isDark ? '#b45309' : '#f59e0b'),
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: TYPOGRAPHY.weights.bold,
                  color: isEvaluationApproved
                    ? (isDark ? '#34d399' : '#059669')
                    : (isDark ? '#fbbf24' : '#d97706'),
                  fontFamily: TYPOGRAPHY.fonts.primary,
                }}
              >
                {isEvaluationApproved ? '✓ Evaluation Approved' : '⚠ Evaluation Pending'}
              </Text>
            </View>
          </View>

          {isEditable && (
            <Pressable
              style={[
                styles.soaActionBtn,
                {
                  backgroundColor: canGenerateSoa
                    ? (isDark ? colors.brand[500] : colors.brand[700])
                    : (isDark ? colors.neutral[800] : colors.neutral[200]),
                  borderColor: canGenerateSoa
                    ? (isDark ? colors.brand[400] : colors.brand[800])
                    : (isDark ? colors.neutral[700] : colors.neutral[300]),
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  marginTop: SPACING[8],
                },
                !canGenerateSoa && { opacity: 0.6 },
                Platform.select({ web: { cursor: canGenerateSoa ? 'pointer' : 'not-allowed' } as object }),
              ]}
              disabled={!canGenerateSoa}
              onPress={() => {
                if (canGenerateSoa) {
                  onOpenGenerateSoa();
                }
              }}
            >
              <Lucide
                name={canGenerateSoa ? "file-plus" : "lock"}
                size={16}
                color={canGenerateSoa ? COLORS.neutral.white : (isDark ? colors.neutral[400] : colors.neutral[500])}
              />
              <Text
                style={[
                  styles.soaActionBtnText,
                  {
                    color: canGenerateSoa ? COLORS.neutral.white : (isDark ? colors.neutral[400] : colors.neutral[500]),
                    fontSize: 13,
                    fontWeight: TYPOGRAPHY.weights.bold,
                  },
                ]}
              >
                {canGenerateSoa ? 'Generate Statement of Account' : 'Evaluation Required to Generate SOA'}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    );
  }

  const isForAccountant = app.status === 'ForAccountant';
  const isPendingPayment = app.status === 'PendingPayment';
  const isPaymentSubmitted = Boolean(
    (app.payment && (app.payment.amountReceived > 0 || app.payment.orNumber.trim().length > 0 || (app.payment.checkNumber && app.payment.checkNumber.trim().length > 0))) ||
    (app.note && (app.note.toLowerCase().includes('payment submitted') || app.note.toLowerCase().includes('ref:'))) ||
    (app.history && app.history.some((h: AuditTrailEntry) => h.action.toLowerCase().includes('payment submitted') || h.action.toLowerCase().includes('submit payment')))
  );
  const isSoaReturned = (app.note !== undefined && (app.note.includes('SOA returned') || app.note.includes('Returned by Accountant'))) || (app.status === 'Evaluating' && app.correctionAuditTrail.some(c => c.action.includes('Returned by Accountant') || c.action.includes('SOA Returned')));

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Accountant Verification Banner */}
      {isForAccountant && (
        <View
          style={{
            padding: 12,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#1e1b4b' : '#eef2ff',
            borderColor: isDark ? '#4338ca' : '#c7d2fe',
            borderWidth: 1,
            marginBottom: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Lucide name="file-text" size={18} color={isDark ? '#a5b4fc' : '#4f46e5'} />
          <Text style={{ flex: 1, fontSize: 12, color: isDark ? '#e0e7ff' : '#3730a3', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>SOA Verification:</Text> Verify fee calculations. Click <Text style={{ fontWeight: '700' }}>Approve SOA</Text> to issue Order of Payment, or <Text style={{ fontWeight: '700' }}>Return</Text> if corrections are needed.
          </Text>
        </View>
      )}

      {/* Cashier Payment Status Banner */}
      {isPendingPayment && isPaymentSubmitted && (
        <View
          style={{
            padding: 12,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
            borderColor: isDark ? '#059669' : '#10b981',
            borderWidth: 1,
            marginBottom: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Lucide name="check-circle" size={18} color={isDark ? '#34d399' : '#059669'} />
          <Text style={{ flex: 1, fontSize: 12, color: isDark ? '#d1fae5' : '#065f46', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>Payment Submitted:</Text> Client submitted payment reference. Ready for Cashier OR issuance.
          </Text>
        </View>
      )}

      {isPendingPayment && !isPaymentSubmitted && (
        <View
          style={{
            padding: 12,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#451a03' : '#fffbeb',
            borderColor: isDark ? '#b45309' : '#f59e0b',
            borderWidth: 1,
            marginBottom: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Lucide name="lock" size={18} color={isDark ? '#fbbf24' : '#d97706'} />
          <Text style={{ flex: 1, fontSize: 12, color: isDark ? '#fde68a' : '#92400e', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>Awaiting Payment:</Text> Client has not paid. Cashier cannot issue OR until payment is made.
          </Text>
        </View>
      )}

      {/* Returned from Accountant Alert */}
      {isSoaReturned && (
        <View
          style={{
            padding: 12,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#451a03' : '#fef3c7',
            borderColor: isDark ? '#b45309' : '#f59e0b',
            borderWidth: 1,
            marginBottom: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Lucide name="alert-triangle" size={18} color={isDark ? '#fbbf24' : '#d97706'} />
          <Text style={{ flex: 1, fontSize: 12, color: isDark ? '#fde68a' : '#92400e', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>SOA Returned:</Text> {app.note || 'Review findings and adjust calculations.'} Click <Text style={{ fontWeight: '700' }}>Edit SOA</Text> to revise and resubmit.
          </Text>
        </View>
      )}

      <View style={[styles.billingContainer, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1, minWidth: 220 }}>
            <Text style={[styles.billingLabel, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>OFFICIAL BILLING RECORD</Text>
            <Text style={[styles.billingTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Statement of Account</Text>
            <Text style={[styles.billingSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              Review the billing particulars, charges, and due date below.
            </Text>
          </View>

          {/* Action buttons toolbar for SOA & OP */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {isEditable && !hasPayment && !isForAccountant && (app.status === 'Evaluating' || app.status === 'Submitted' || isSoaReturned || app.status === 'Draft') ? (
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
                <Lucide name="refresh-cw" size={13} color={isDark ? colors.brand[300] : colors.brand[700]} />
                <Text style={[styles.soaActionBtnText, { color: isDark ? colors.brand[300] : colors.brand[700] }]}>
                  {isSoaReturned ? 'Edit SOA' : 'Recalculate / Edit SOA'}
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
                  SOA Paid (Locked)
                </Text>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.soaActionBtn,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                },
              ]}
              onPress={onPrintSoa}
            >
              <Lucide name="printer" size={13} color={isDark ? colors.neutral[200] : colors.neutral[800]} />
              <Text style={[styles.soaActionBtnText, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>
                Print SOA
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.soaActionBtn,
                {
                  backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
                  borderColor: isDark ? '#059669' : '#10b981',
                },
              ]}
              onPress={onPrintOp}
            >
              <Lucide name="credit-card" size={13} color={isDark ? '#34d399' : '#059669'} />
              <Text style={[styles.soaActionBtnText, { color: isDark ? '#34d399' : '#059669' }]}>
                Print OP
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.soaActionBtn,
                {
                  backgroundColor: isDark ? '#312e81' : '#eef2ff',
                  borderColor: isDark ? '#6366f1' : '#818cf8',
                },
              ]}
              onPress={() => onPreviewReport('soa')}
            >
              <Lucide name="eye" size={13} color={isDark ? '#a5b4fc' : '#4f46e5'} />
              <Text style={[styles.soaActionBtnText, { color: isDark ? '#a5b4fc' : '#4f46e5' }]}>
                Preview Report
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.feeTable, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
          <View style={[styles.feeTableHeader, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {[
              "Particular",
              "No. of Years",
              "%",
              "No. of Units",
              "Fees",
              "Amount",
            ].map((col) => (
              <Text
                key={col}
                style={[
                  styles.feeTableHeaderCell,
                  { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                  col === "Particular"
                    ? { flex: 2 }
                    : { flex: 1, textAlign: "right" },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          <View style={[styles.feeTableDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />

          {app.soaItems.map((item: SoaItem, idx: number) => (
            <View key={idx} style={[styles.feeTableRow, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.feeParticularName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{item.particular}</Text>
                <Text style={[styles.feeParticularSub, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                  Validity • {item.validityYears} Year(s)
                </Text>
                <Text style={[styles.feeParticularSub, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>Code: {item.code}</Text>
              </View>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {item.validityYears}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {item.percentage}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {item.noOfUnits}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {item.fees}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {formatAmount(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.totalBox, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
          <View style={styles.totalRight}>
            <Text style={[styles.totalLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>TOTAL AMOUNT DUE</Text>
            <Text style={[styles.totalAmount, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              {formatAmount(app.totalAmountDue)}
            </Text>
            <Text style={[styles.totalWords, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{amountWords.toUpperCase()}</Text>
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
                  <Lucide
                    name="calendar"
                    size={15}
                    color={isDark ? colors.brand[400] : colors.brand[600]}
                  />
                  <Text
                    style={[
                      styles.dueDateHighlightLabel,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    TO BE PAID ON OR BEFORE:
                  </Text>
                </View>

                {isEditable && !editingDueDate && (
                  <Pressable
                    style={[
                      styles.editDueDateBtn,
                      {
                        backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200],
                        borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                      },
                    ]}
                    onPress={() => {
                      setDueDraft(app.dueDate);
                      setEditingDueDate(true);
                    }}
                  >
                    <Lucide
                      name="edit-2"
                      size={12}
                      color={isDark ? colors.brand[400] : colors.brand[700]}
                    />
                    <Text
                      style={[
                        styles.editDueDateBtnText,
                        { color: isDark ? colors.brand[400] : colors.brand[700] },
                      ]}
                    >
                      Change Date
                    </Text>
                  </Pressable>
                )}
              </View>

              {editingDueDate ? (
                <View style={styles.inlineEditDueDateContainer}>
                  <DatePickerInput
                    value={dueDraft}
                    onChangeText={setDueDraft}
                    placeholder="YYYY-MM-DD"
                    containerStyle={{ flex: 1 }}
                  />
                  <View style={styles.inlineEditActions}>
                    <Pressable
                      style={[
                        styles.inlineSaveBtn,
                        { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] },
                      ]}
                      onPress={() => {
                        setEditingDueDate(false);
                        updateApplication(app.id, { dueDate: dueDraft });
                      }}
                    >
                      <Text style={styles.inlineSaveBtnText}>Save</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.inlineCancelBtn,
                        {
                          borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                        },
                      ]}
                      onPress={() => {
                        setDueDraft(app.dueDate);
                        setEditingDueDate(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.inlineCancelBtnText,
                          { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                        ]}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.dueDateValueRow}>
                  <Text
                    style={[
                      styles.dueDateHighlightValue,
                      { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                    ]}
                  >
                    {formatDisplayDueDate(app.dueDate)}
                  </Text>
                  {app.dueDate && app.dueDate.includes('-') && (
                    <View
                      style={[
                        styles.dueDateIsoBadge,
                        {
                          backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200],
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dueDateIsoText,
                          { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                        ]}
                      >
                        {app.dueDate}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Unpaid SOA Recalculation Alert Banner */}
        {!hasPayment && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: SPACING[12],
              marginTop: SPACING[12],
              borderRadius: RADIUS.card,
              backgroundColor: isDark ? colors.neutral[900] : colors.brand[50],
              borderColor: isDark ? colors.brand[900] : colors.brand[200],
              borderWidth: 1,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 240 }}>
              <Lucide
                name="refresh-cw"
                size={18}
                color={isDark ? colors.brand[400] : colors.brand[700]}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: TYPOGRAPHY.weights.semibold,
                    color: isDark ? colors.neutral[100] : colors.brand[900],
                    fontFamily: TYPOGRAPHY.fonts.primary,
                  }}
                >
                  Unpaid Statement of Account
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: isDark ? colors.neutral[400] : colors.neutral[600],
                    marginTop: 2,
                    fontFamily: TYPOGRAPHY.fonts.primary,
                  }}
                >
                  Statutory fees can be recalculated if applicant parameters, units, or validity periods have changed before payment.
                </Text>
              </View>
            </View>

            {isEditable && (
              <Pressable
                style={[
                  styles.soaActionBtn,
                  {
                    backgroundColor: isDark ? colors.brand[500] : colors.brand[700],
                    borderColor: isDark ? colors.brand[400] : colors.brand[800],
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  },
                ]}
                onPress={onOpenGenerateSoa}
              >
                <Lucide name="refresh-cw" size={13} color={COLORS.neutral.white} />
                <Text
                  style={[
                    styles.soaActionBtnText,
                    { color: COLORS.neutral.white, fontSize: 12, fontWeight: TYPOGRAPHY.weights.bold },
                  ]}
                >
                  Recalculate Fees
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={[styles.paymentSection, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
        <View style={styles.paymentSectionHeader}>
          <View style={[styles.paymentSectionIcon, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <Lucide name="credit-card" size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
          </View>
          <Text style={[styles.paymentSectionTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Payment Summary</Text>
        </View>

        {hasPayment ? (
          <View style={styles.paymentRow}>
            <View style={[styles.amountReceivedCard, { backgroundColor: isDark ? colors.brand[500] : colors.brand[800] }]}>
              <Text style={styles.amountReceivedLabel}>AMOUNT RECEIVED</Text>
              <Text style={[styles.amountReceivedValue, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
                PHP {app.payment.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              {excess > 0 && (
                <View style={styles.excessBadge}>
                  <Text style={[styles.excessBadgeText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
                    Excess: PHP {excess.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              )}
              <View style={styles.paymentMethodBlock}>
                <Text style={styles.paymentMethodLabel}>PAYMENT METHOD</Text>
                <Text style={[styles.paymentMethodValue, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
                  {app.payment.method.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.orColumn}>
              <Text style={[styles.orLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>OFFICIAL RECEIPT (OR) NUMBER</Text>
              {editingOrNumber ? (
                <View style={styles.inlineEditRow}>
                  <TextInput
                    style={[styles.inlineEditInput, { flex: 1, color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
                    value={orDraft}
                    onChangeText={setOrDraft}
                    autoFocus
                    placeholder="Enter OR Number"
                    placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  />
                  <Pressable
                    onPress={() => {
                      setEditingOrNumber(false);
                      updateApplication(app.id, {
                        payment: { ...app.payment, orNumber: orDraft },
                      });
                    }}
                  >
                    <Text style={[styles.inlineEditSave, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Save</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.orValueRow}>
                  <Text style={[styles.orValue, { color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                    {app.payment.orNumber.length > 0 ? app.payment.orNumber : "—"}
                  </Text>
                  {isEditable && (
                    <Pressable
                      style={[styles.orEditBtn, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF', borderColor: isDark ? colors.brand[500] : colors.brand[600] }]}
                      onPress={() => {
                        setOrDraft(app.payment.orNumber);
                        setEditingOrNumber(true);
                      }}
                    >
                      <Lucide name="edit-2" size={12} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
                      <Text style={[styles.orEditText, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>EDIT</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {app.payment.method === "check" && (
                <View style={{ marginTop: SPACING[16] }}>
                  <Text style={[styles.orLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>CHECK DETAILS</Text>
                  <Text style={[styles.checkInfoText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    No: {app.payment.checkNumber || "—"}
                  </Text>
                  <Text style={[styles.checkInfoText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    Bank: {app.payment.checkName || "—"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View
            style={{
              padding: SPACING[16],
              borderRadius: RADIUS.card,
              backgroundColor: isPaymentSubmitted
                ? (isDark ? '#064e3b' : '#ecfdf5')
                : (isDark ? '#451a03' : '#fffbeb'),
              borderWidth: 1,
              borderColor: isPaymentSubmitted
                ? (isDark ? '#059669' : '#10b981')
                : (isDark ? '#b45309' : '#f59e0b'),
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Lucide
              name={isPaymentSubmitted ? 'check-circle' : 'lock'}
              size={22}
              color={isPaymentSubmitted ? (isDark ? '#34d399' : '#059669') : (isDark ? '#fbbf24' : '#d97706')}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 13,
                  fontWeight: TYPOGRAPHY.weights.bold,
                  color: isPaymentSubmitted
                    ? (isDark ? '#d1fae5' : '#065f46')
                    : (isDark ? '#fde68a' : '#92400e'),
                }}
              >
                {isPaymentSubmitted
                  ? 'Payment Submitted'
                  : 'Awaiting Client Payment'}
              </Text>
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 12,
                  color: isPaymentSubmitted
                    ? (isDark ? '#a7f3d0' : '#047857')
                    : (isDark ? '#fde68a' : '#b45309'),
                  marginTop: 2,
                  lineHeight: 16,
                }}
              >
                {isPaymentSubmitted
                  ? 'Payment reference submitted. Ready for Cashier OR issuance.'
                  : 'Client has not paid. Cashier cannot issue OR until payment is made.'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}
