import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Icon as Lucide, useTheme, toast } from '@edge/ui';
import { PendingPaymentDto, ReturnTargetDto, receiptService } from '@edge/api';

interface EndorseReReviewModalProps {
  visible: boolean;
  payment: PendingPaymentDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_REASONS = [
  'Client failed to pay OP on time / Payment period expired',
  'Exceeded 30-day payment validity window',
  'Client requested cancellation or adjustment of particulars',
  'SOA fee computation needs revision or re-assessment',
];

interface OfficerOption {
  target: ReturnTargetDto;
  label: string;
  roleDescription: string;
  icon: 'user-check' | 'dollar-sign' | 'shield';
}

const OFFICER_OPTIONS: OfficerOption[] = [
  {
    target: 'Evaluator',
    label: 'Technical Evaluator',
    roleDescription: 'Re-evaluates technical requirements, radio particulars, and qualifications',
    icon: 'user-check',
  },
  {
    target: 'Accountant',
    label: 'Accounting Officer',
    roleDescription: 'Re-assesses Statement of Account (SOA), fee breakdown, and tariff schedule',
    icon: 'dollar-sign',
  },
  {
    target: 'Supervisor',
    label: 'Chief / Regional Supervisor',
    roleDescription: 'Administrative re-review, executive assessment, and endorsement',
    icon: 'shield',
  },
];

export function EndorseReReviewModal({
  visible,
  payment,
  onClose,
  onSuccess,
}: EndorseReReviewModalProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const [targetOfficer, setTargetOfficer] = useState<ReturnTargetDto>('Evaluator');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTargetOfficer('Evaluator');
      setRemarks('');
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [visible]);

  if (!visible || payment === null) {
    return null;
  }

  const billedDate = new Date(payment.billedAt);
  const daysSinceBilled = Math.floor((Date.now() - billedDate.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysSinceBilled >= 30;

  const handleApplyPreset = (reason: string) => {
    if (remarks.trim().length === 0) {
      setRemarks(reason);
    } else if (!remarks.includes(reason)) {
      setRemarks(`${remarks}\n${reason}`);
    }
    setErrorMessage(null);
  };

  const handleConfirmEndorsement = async () => {
    const trimmedRemarks = remarks.trim();
    if (trimmedRemarks.length === 0) {
      setErrorMessage('Please provide a reason or remarks for endorsing for re-review.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const [data, err] = await receiptService.returnOp(payment.orderOfPaymentId, {
      remarks: trimmedRemarks,
      returnTo: targetOfficer,
    });

    setIsSubmitting(false);

    if (err !== null) {
      setErrorMessage(err);
      return;
    }

    const appRef = payment.referenceNumber || payment.applicationNumber || 'Application';
    toast.success(`Application Ref #${appRef} endorsed to ${targetOfficer} for re-review.`);
    onSuccess();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
              maxWidth: isMobile ? '94%' : 580,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                <Lucide name="corner-up-left" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>Endorse for Re-Review</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Return Order of Payment to an officer for review & fee re-assessment
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              style={[styles.closeBtn, { backgroundColor: colors.neutral[100] }]}
            >
              <Lucide name="x" size={18} color={colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Target Application & Billing Snapshot */}
            <View style={[styles.snapshotCard, { backgroundColor: colors.neutral[50], borderColor: colors.border }]}>
              <View style={styles.snapshotRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.snapshotLabel, { color: colors.textMuted }]}>APPLICANT</Text>
                  <Text style={[styles.snapshotValue, { color: colors.text }]} numberOfLines={1}>
                    {payment.applicantName}
                  </Text>
                  <Text style={[styles.snapshotSub, { color: colors.textMuted }]}>
                    Ref: {payment.referenceNumber || payment.applicationNumber || 'N/A'}
                  </Text>
                </View>
                <View style={styles.snapshotAmountBox}>
                  <Text style={[styles.snapshotLabel, { color: colors.textMuted }]}>AMOUNT DUE</Text>
                  <Text style={[styles.snapshotAmount, { color: colors.semantic.warningText }]}>
                    ₱{(payment.amountDue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              <View style={[styles.snapshotFooter, { borderTopColor: colors.border }]}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={[styles.badgeText, { color: colors.neutral[700] }]}>OP: {payment.opNumber}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      isOverdue
                        ? { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }
                        : { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
                    ]}
                  >
                    <Lucide
                      name="clock"
                      size={11}
                      color={isOverdue ? '#DC2626' : '#D97706'}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        { color: isOverdue ? '#B91C1C' : '#92400E', fontWeight: '700' },
                      ]}
                    >
                      Billed {daysSinceBilled}d ago {isOverdue ? '(Payment Overdue)' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Officer Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Select Recipient Officer for Re-Review <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={styles.officerList}>
                {OFFICER_OPTIONS.map((opt) => {
                  const isSelected = targetOfficer === opt.target;
                  return (
                    <TouchableOpacity
                      key={opt.target}
                      onPress={() => setTargetOfficer(opt.target)}
                      style={[
                        styles.officerCard,
                        {
                          borderColor: isSelected ? colors.brand.primary : colors.border,
                          backgroundColor: isSelected ? colors.brand.indigoLight : colors.cardBg,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.officerIconBox,
                          {
                            backgroundColor: isSelected ? colors.brand.primary : colors.neutral[100],
                          },
                        ]}
                      >
                        <Lucide
                          name={opt.icon}
                          size={18}
                          color={isSelected ? '#FFFFFF' : colors.neutral[600]}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.officerLabel,
                            { color: isSelected ? colors.brand.primary : colors.text },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={[styles.officerDesc, { color: colors.textMuted }]}>
                          {opt.roleDescription}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? colors.brand.primary : colors.neutral[300],
                            backgroundColor: isSelected ? colors.brand.primary : 'transparent',
                          },
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quick Presets */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Quick Reason Presets
              </Text>
              <View style={styles.presetsRow}>
                {PRESET_REASONS.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleApplyPreset(preset)}
                    style={[styles.presetChip, { backgroundColor: colors.neutral[100], borderColor: colors.border }]}
                  >
                    <Lucide name="plus" size={12} color={colors.neutral[600]} />
                    <Text style={[styles.presetChipText, { color: colors.neutral[700] }]}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Remarks / Justification */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Endorsement Remarks & Instructions <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.remarksInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.bg,
                    borderColor: errorMessage ? '#EF4444' : colors.border,
                  },
                ]}
                multiline
                numberOfLines={4}
                placeholder="State the reason client failed to pay on time, or technical/billing instructions for the officer..."
                placeholderTextColor={colors.neutral[400]}
                value={remarks}
                onChangeText={(val) => {
                  setRemarks(val);
                  setErrorMessage(null);
                }}
              />
            </View>

            {/* Error Message */}
            {errorMessage !== null && (
              <View style={[styles.errorBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                <Lucide name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </ScrollView>

          {/* Modal Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.neutral[700] }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirmEndorsement}
              disabled={isSubmitting}
              style={[styles.confirmBtn, { backgroundColor: '#D97706' }]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Lucide name="corner-up-left" size={16} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Confirm Endorsement</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  snapshotCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  snapshotLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  snapshotValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  snapshotSub: {
    fontSize: 11,
    marginTop: 2,
  },
  snapshotAmountBox: {
    alignItems: 'flex-end',
  },
  snapshotAmount: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  snapshotFooter: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeText: {
    fontSize: 11,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  officerList: {
    gap: 8,
  },
  officerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 10,
  },
  officerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  officerLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  officerDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  remarksInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
