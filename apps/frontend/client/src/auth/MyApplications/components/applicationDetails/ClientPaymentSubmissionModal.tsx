import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Icon, SPACING, TYPOGRAPHY } from '@edge/ui';
import { Application } from '../../data/applicationsData';
import { applicationService } from '@edge/api';
import { PaymentMethodDto } from '@edge/api';

interface ClientPaymentSubmissionModalProps {
  visible: boolean;
  app: Application;
  onClose: () => void;
  onSuccess: () => void;
}

type ModeOfPayment = 'LandBank' | 'GCashMaya' | 'BankTransfer' | 'CashierOTC';

export function ClientPaymentSubmissionModal({
  visible,
  app,
  onClose,
  onSuccess,
}: ClientPaymentSubmissionModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [selectedMode, setSelectedMode] = useState<ModeOfPayment>('LandBank');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [payorName, setPayorName] = useState(app.applicantName || app.companyName || '');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paymentModes: Array<{
    id: ModeOfPayment;
    title: string;
    subtitle: string;
    icon: string;
    badge?: string;
  }> = [
    {
      id: 'LandBank',
      title: 'LandBank Link.BizPortal',
      subtitle: 'Official Government e-Payment Gateway (Debit Card, BancNet, LBP Account)',
      icon: 'globe',
      badge: 'Recommended',
    },
    {
      id: 'GCashMaya',
      title: 'GCash / Maya / e-Wallet',
      subtitle: 'Pay via QR Ph or digital wallet transfer to NTC account',
      icon: 'smartphone',
    },
    {
      id: 'BankTransfer',
      title: 'Direct Bank Transfer (PESONet / InstaPay)',
      subtitle: 'Direct deposit/wire transfer to authorized NTC agency bank account',
      icon: 'credit-card',
    },
    {
      id: 'CashierOTC',
      title: 'Over-the-Counter / Cashier Walk-in',
      subtitle: 'Pay in cash or manager\'s check at the designated NTC Regional Office Cashier',
      icon: 'map-pin',
    },
  ];

  const handleSubmit = async () => {
    if ((selectedMode === 'LandBank' || selectedMode === 'GCashMaya' || selectedMode === 'BankTransfer') && !referenceNumber.trim()) {
      setErrorMessage('Please enter the transaction reference number from your payment confirmation slip/email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    let mappedPaymentMethod: PaymentMethodDto = 'Online';
    if (selectedMode === 'CashierOTC') {
      mappedPaymentMethod = 'Cash';
    }

    const payload = {
      paymentMethod: mappedPaymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      payorName: payorName.trim() || undefined,
      remarks: `Mode: ${selectedMode}. ${remarks.trim()}`.trim(),
    };

    const [data, error] = await applicationService.submitPayment(app.id, payload);

    setIsSubmitting(false);

    if (error !== null) {
      setErrorMessage(error || 'Failed to submit payment details. Please try again.');
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { maxWidth: isDesktop ? 640 : '95%' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconCircle}>
              <Icon name="dollar-sign" size={20} color="#1D4ED8" />
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>Submit Payment & Proof</Text>
              <Text style={styles.subtitle}>
                Application #{app.referenceNumber} • {app.serviceName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* SOA Summary Box */}
            <View style={styles.soaSummaryBox}>
              <View style={styles.soaSummaryRow}>
                <Text style={styles.soaSummaryLabel}>Statement of Account:</Text>
                <Text style={styles.soaSummaryValue}>{app.soaNumber || 'SOA Issued'}</Text>
              </View>
              <View style={styles.soaSummaryRow}>
                <Text style={styles.soaSummaryLabel}>Account Name:</Text>
                <Text style={styles.soaSummaryValue}>{payorName || 'Applicant'}</Text>
              </View>
            </View>

            {/* Select Payment Mode */}
            <Text style={styles.sectionHeading}>SELECT PAYMENT METHOD</Text>
            <View style={styles.modeList}>
              {paymentModes.map((mode) => {
                const isSelected = selectedMode === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.modeCard, isSelected && styles.modeCardSelected]}
                    onPress={() => {
                      setSelectedMode(mode.id);
                      setErrorMessage(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.modeRadio, isSelected && styles.modeRadioSelected]}>
                      {isSelected && <View style={styles.modeRadioInner} />}
                    </View>
                    <View style={styles.modeInfo}>
                      <View style={styles.modeTitleRow}>
                        <Text style={[styles.modeTitle, isSelected && styles.modeTitleSelected]}>
                          {mode.title}
                        </Text>
                        {mode.badge ? (
                          <View style={styles.badgePill}>
                            <Text style={styles.badgePillText}>{mode.badge}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dynamic Guide & Form Fields */}
            <View style={styles.formSection}>
              <Text style={styles.sectionHeading}>PAYMENT TRANSACTION DETAILS</Text>

              {selectedMode === 'LandBank' && (
                <View style={styles.guideBox}>
                  <Icon name="info" size={16} color="#1D4ED8" />
                  <Text style={styles.guideText}>
                    Access the LandBank Link.BizPortal, select National Telecommunications Commission as the Merchant, enter your SOA #{app.soaNumber || app.referenceNumber}, and complete the transaction. Then enter your 16-digit LBP Reference Number below.
                  </Text>
                </View>
              )}

              {selectedMode === 'CashierOTC' ? (
                <View style={styles.guideBox}>
                  <Icon name="info" size={16} color="#1D4ED8" />
                  <Text style={styles.guideText}>
                    You may present your Statement of Account #{app.soaNumber || app.referenceNumber} to the NTC Regional Office Cashier to pay over the counter. Entering the date or expected walk-in date helps the Cashier prepare your Official Receipt.
                  </Text>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Transaction Reference Number / E-Receipt No. <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. LBP-2026-12345678 or GCash Ref No."
                    value={referenceNumber}
                    onChangeText={setReferenceNumber}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payor / Depositor Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter name of individual or entity who paid"
                  value={payorName}
                  onChangeText={setPayorName}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Remarks or Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Bank branch, payment timestamp, or transaction notes"
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {errorMessage && (
                <View style={styles.errorAlert}>
                  <Icon name="alert-triangle" size={16} color="#DC2626" />
                  <Text style={styles.errorAlertText}>{errorMessage}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit Payment for Verification</Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING[20],
    gap: 16,
  },
  soaSummaryBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: SPACING[12],
    gap: 6,
  },
  soaSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soaSummaryLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#1E40AF',
  },
  soaSummaryValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1E3A8A',
  },
  sectionHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  modeList: {
    gap: 10,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING[12],
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  modeCardSelected: {
    borderColor: '#1D4ED8',
    backgroundColor: '#F0F7FF',
  },
  modeRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  modeRadioSelected: {
    borderColor: '#1D4ED8',
  },
  modeRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D4ED8',
  },
  modeInfo: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  modeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1E293B',
  },
  modeTitleSelected: {
    color: '#1D4ED8',
  },
  badgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#16A34A',
  },
  modeSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  formSection: {
    gap: 12,
  },
  guideBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: SPACING[10],
  },
  guideText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
  },
  requiredStar: {
    color: '#DC2626',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: SPACING[10],
  },
  errorAlertText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1D4ED8',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});
