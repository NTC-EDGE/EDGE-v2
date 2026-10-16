import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide } from "@edge/ui";
import { ApplicationData } from "../../../../../types/application";
import { parsePaymentBreakdown } from "@edge/api";
import { formatDisplayDateTime } from "../reviewFormatters";
import { reviewStyles as styles } from "../reviewStyles";

interface SoaPaymentSummaryProps {
  app: ApplicationData;
  isEditable: boolean;
  hasPayment: boolean;
  isPaymentSubmitted: boolean;
  isForAccountant?: boolean;
  onPreviewReport?: (reportType: 'soa' | 'op' | 'or') => void;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
}

export function SoaPaymentSummary({
  app,
  isEditable,
  hasPayment,
  isPaymentSubmitted,
  isForAccountant,
  onPreviewReport,
  updateApplication,
}: SoaPaymentSummaryProps) {
  const { colors, isDark } = useTheme();
  const [editingOrNumber, setEditingOrNumber] = useState(false);
  const [orDraft, setOrDraft] = useState(app.payment.orNumber);

  useEffect(() => {
    if (!editingOrNumber) {
      setOrDraft(app.payment.orNumber);
    }
  }, [app.payment.orNumber, editingOrNumber]);

  const excess = app.payment.amountReceived - app.totalAmountDue;
  const preferredBreakdown = parsePaymentBreakdown(app.note || app.payment.checkName || '');

  return (
    <View
      style={[
        styles.paymentSection,
        {
          borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        },
      ]}
    >
      <View style={styles.paymentSectionHeader}>
        <View style={[styles.paymentSectionIcon, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
          <Lucide name="credit-card" size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
        </View>
        <Text style={[styles.paymentSectionTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
          Payment Summary
        </Text>
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
            <Text style={[styles.orLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              OFFICIAL RECEIPT (OR) NUMBER
            </Text>
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
                {app.payment.orNumber.length > 0 && (
                  <View
                    style={[
                      styles.orEditBtn,
                      {
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
                        borderColor: isDark ? '#10B981' : '#6EE7B7',
                      },
                    ]}
                  >
                    <Lucide name="check-circle" size={12} color={isDark ? '#34D399' : '#047857'} />
                    <Text style={[styles.orEditText, { color: isDark ? '#34D399' : '#047857', fontWeight: '700' }]}>
                      SETTLED • OR #{app.payment.orNumber}
                    </Text>
                  </View>
                )}
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

            {Boolean(app.cashierOfficer || app.payment.paidAt) && (
              <View style={{ marginTop: SPACING[12] }}>
                {app.cashierOfficer ? (
                  <Text style={[styles.checkInfoText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                    Collecting Officer: <Text style={{ fontWeight: '600', color: isDark ? colors.neutral[200] : colors.neutral[800] }}>{app.cashierOfficer}</Text>
                  </Text>
                ) : null}
                {app.payment.paidAt ? (
                  <Text style={[styles.checkInfoText, { color: isDark ? colors.neutral[400] : colors.neutral[600], marginTop: 2 }]}>
                    Payment Date: <Text style={{ fontWeight: '600', color: isDark ? colors.neutral[200] : colors.neutral[800] }}>{formatDisplayDateTime(app.payment.paidAt)}</Text>
                  </Text>
                ) : null}
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
      ) : isForAccountant ? (
        <View
          style={{
            padding: SPACING[16],
            borderRadius: RADIUS.card,
            backgroundColor: isDark ? '#1e1b4b' : '#eef2ff',
            borderWidth: 1,
            borderColor: isDark ? '#4338ca' : '#c7d2fe',
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark ? '#312e81' : '#e0e7ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lucide name="file-text" size={18} color={isDark ? '#a5b4fc' : '#4f46e5'} />
              </View>
              <View>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: isDark ? '#e0e7ff' : '#3730a3' }}>
                  Order of Payment (OP) — Ready for Review
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.mono, fontSize: 12, color: isDark ? '#a5b4fc' : '#4338ca', marginTop: 2 }}>
                  {app.payment.opNumber || (app.referenceNumber ? `OP-${app.referenceNumber}` : 'OP Ready')} • ₱{(app.totalAmountDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {onPreviewReport !== undefined && (
              <Pressable
                onPress={() => onPreviewReport('op')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: RADIUS.sm,
                  backgroundColor: isDark ? '#4338ca' : '#4f46e5',
                }}
              >
                <Lucide name="eye" size={14} color="#ffffff" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff', fontFamily: TYPOGRAPHY.fonts.primary }}>
                  Review Order of Payment (OP)
                </Text>
              </Pressable>
            )}
          </View>
          <Text style={{ fontSize: 12, color: isDark ? '#c7d2fe' : '#4338ca', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 16 }}>
            Evaluator approved the assessment. Review the Order of Payment details and verify charges before approving and issuing the OP for payment.
          </Text>
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
              {isPaymentSubmitted ? 'Payment Submitted' : 'Awaiting Client Payment'}
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

      {/* Client Preferred Payment Preview */}
      {preferredBreakdown !== null && (
        <View
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff',
            borderColor: isDark ? '#4338ca' : '#ddd6fe',
            borderWidth: 1,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Lucide name="layers" size={14} color={isDark ? '#a5b4fc' : '#6d28d9'} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#e0e7ff' : '#4c1d95', fontFamily: TYPOGRAPHY.fonts.primary }}>
              Client's Preferred Payment: {preferredBreakdown.isCombination ? 'Combination / Split' : preferredBreakdown.items[0]?.mode}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {preferredBreakdown.items.map((item, idx) => (
              <View
                key={idx}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 4,
                  backgroundColor: isDark ? '#312e81' : '#ffffff',
                  borderWidth: 1,
                  borderColor: isDark ? '#4338ca' : '#e9d5ff',
                }}
              >
                <Text style={{ fontSize: 11, color: isDark ? '#c7d2fe' : '#5b21b6', fontFamily: TYPOGRAPHY.fonts.primary }}>
                  <Text style={{ fontWeight: '700' }}>{item.mode}:</Text> ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {item.mode === 'Check' && item.checkNumber ? ` (${item.checkBank || 'Bank'} #${item.checkNumber})` : ''}
                  {item.mode === 'Online' && item.referenceNumber ? ` (Ref: ${item.referenceNumber})` : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
