import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { useTheme, COLORS, RADIUS, TYPOGRAPHY, Icon as Lucide, DatePickerInput } from "@edge/ui";
import { ApplicationData, SoaItem } from "../../../../../types/application";
import { formatAmount, amountToWords, formatDisplayDueDate, formatDisplayDateTime } from "../reviewFormatters";
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

  useEffect(() => {
    if (!editingDueDate) {
      setDueDraft(app.dueDate);
    }
  }, [app.dueDate, editingDueDate]);

  const amountWords = amountToWords(app.totalAmountDue);

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
          {app.soaNumber !== null && app.soaNumber !== undefined && app.soaNumber.trim().length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? colors.brand[400] : colors.brand[700], fontFamily: TYPOGRAPHY.fonts.mono }}>
                {app.soaNumber}
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  backgroundColor:
                    app.soaStatus === 'ForOrderOfPayment' || isForAccountant
                      ? (isDark ? '#312e81' : '#e0e7ff')
                      : app.soaStatus === 'Approved'
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
                        : app.soaStatus === 'Approved'
                        ? (isDark ? '#86efac' : '#15803d')
                        : isSoaReturned || app.soaStatus === 'Returned'
                        ? (isDark ? '#fde68a' : '#b45309')
                        : (isDark ? '#9ca3af' : '#4b5563'),
                  }}
                >
                  {app.soaStatus === 'ForOrderOfPayment' || isForAccountant
                    ? 'FOR Order of Payment'
                    : app.soaStatus === 'Approved'
                    ? 'Approved'
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
                  OR #{app.payment.orNumber}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

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
                <Lucide name="calendar" size={15} color={isDark ? colors.brand[400] : colors.brand[600]} />
                <Text style={[styles.dueDateHighlightLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
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
                  onChangeText={setDueDraft}
                  placeholder="YYYY-MM-DD"
                  containerStyle={{ flex: 1 }}
                />
                <View style={styles.inlineEditActions}>
                  <Pressable
                    style={[styles.inlineSaveBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]}
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
                    <Text style={[styles.inlineCancelBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.dueDateValueRow}>
                <Text style={[styles.dueDateHighlightValue, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                  {formatDisplayDueDate(app.dueDate)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
