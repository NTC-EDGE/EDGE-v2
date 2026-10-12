import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { OfficialReceiptDto } from '@edge/api';
import {
  PrintOutputMode,
  loadUserReportPrintConfig,
  saveUserReportPrintConfig,
} from '../../queue/types/documentPrintTypes';
import {
  generateOfficialReceiptPrintHtml,
  OfficialReceiptPrintOptions,
} from '../utils/officialReceiptPrintGenerator';
import { openDocumentPrintWindow } from '../../queue/utils/documentPrintGenerator';

interface ReceiptPrintPreviewModalProps {
  visible: boolean;
  receipt: OfficialReceiptDto | null;
  onClose: () => void;
  userId?: string | null;
}

export function ReceiptPrintPreviewModal({
  visible,
  receipt,
  onClose,
  userId = null,
}: ReceiptPrintPreviewModalProps) {
  const { colors } = useTheme();

  const [outputMode, setOutputMode] = useState<PrintOutputMode>('plain_paper');
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [showCalibrationSettings, setShowCalibrationSettings] = useState<boolean>(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      const savedConfig = loadUserReportPrintConfig('AF-51', userId);
      if (savedConfig !== null && savedConfig !== undefined) {
        if (savedConfig.outputMode !== null && savedConfig.outputMode !== undefined) {
          setOutputMode(savedConfig.outputMode);
        }
        if (savedConfig.calibration !== null && savedConfig.calibration !== undefined) {
          setOffsetX(savedConfig.calibration.offsetXmm || 0);
          setOffsetY(savedConfig.calibration.offsetYmm || 0);
        }
      }
    }
  }, [visible, userId]);

  if (receipt === null) return null;

  const handleSaveCalibration = () => {
    saveUserReportPrintConfig(
      'AF-51',
      {
        paperSize: 'letter',
        outputMode,
        orientation: 'portrait',
        offsetXmm: offsetX,
        offsetYmm: offsetY,
      },
      userId
    );
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
    }, 2000);
  };

  const handlePrint = () => {
    const printOptions: OfficialReceiptPrintOptions = {
      outputMode,
      paperSize: 'letter',
      orientation: 'portrait',
      calibration: {
        offsetXmm: offsetX,
        offsetYmm: offsetY,
        scalePercent: 100,
      },
      collectingOfficerName: receipt.issuedByUserName ?? undefined,
      agencyOffice: 'National Telecommunications Commission',
    };

    const html = generateOfficialReceiptPrintHtml(receipt, printOptions);
    openDocumentPrintWindow(html);
  };

  const isStatusCancelled = (statusVal: unknown): boolean => {
    if (typeof statusVal === 'string') return statusVal.toLowerCase() === 'cancelled';
    if (typeof statusVal === 'number') return statusVal === 2;
    return false;
  };

  const isCancelled = isStatusCancelled(receipt.status);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          {/* Header Bar */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <Lucide name="printer" size={20} color={colors.brand.primary} />
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Official Receipt Print Center</Text>
                <Text style={styles.subtitle}>Accountable Form No. 51 • #{receipt.officialReceiptNumber}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setShowCalibrationSettings(!showCalibrationSettings)}
                style={[
                  styles.settingsBtn,
                  showCalibrationSettings && { backgroundColor: colors.brand.primary + '18' },
                ]}
              >
                <Lucide name="sliders" size={15} color={colors.brand.primary} />
                <Text style={[styles.settingsBtnText, { color: colors.brand.primary }]}>Feeder Calibration</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePrint} style={[styles.printHeaderBtn, { backgroundColor: colors.brand.primary }]}>
                <Lucide name="printer" size={16} color="#fff" />
                <Text style={styles.printHeaderBtnText}>
                  {outputMode === 'accountable_form' ? 'Print on Physical Form' : outputMode === 'alignment_test' ? 'Print Alignment Test' : 'Print Electronic Receipt'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Lucide name="x" size={20} color={colors.neutral[700]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabsRow}>
            <TouchableOpacity
              onPress={() => setOutputMode('plain_paper')}
              style={[styles.modeTab, outputMode === 'plain_paper' && styles.modeTabActive]}
            >
              <Lucide
                name="file-text"
                size={14}
                color={outputMode === 'plain_paper' ? colors.brand.primary : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.modeTabText,
                  outputMode === 'plain_paper' && { color: colors.brand.primary, fontWeight: '700' },
                ]}
              >
                Plain Bond Paper (Full Form)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOutputMode('accountable_form')}
              style={[styles.modeTab, outputMode === 'accountable_form' && styles.modeTabActive]}
            >
              <Lucide
                name="copy"
                size={14}
                color={outputMode === 'accountable_form' ? colors.brand.primary : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.modeTabText,
                  outputMode === 'accountable_form' && { color: colors.brand.primary, fontWeight: '700' },
                ]}
              >
                Pre-Printed Form Overlay (Hard Copy OR)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOutputMode('alignment_test')}
              style={[styles.modeTab, outputMode === 'alignment_test' && styles.modeTabActive]}
            >
              <Lucide
                name="target"
                size={14}
                color={outputMode === 'alignment_test' ? colors.brand.primary : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.modeTabText,
                  outputMode === 'alignment_test' && { color: colors.brand.primary, fontWeight: '700' },
                ]}
              >
                Alignment Test Sheet
              </Text>
            </TouchableOpacity>
          </View>

          {/* Collapsible Feeder Calibration Panel */}
          {showCalibrationSettings && (
            <View style={styles.calibrationPanel}>
              <View style={styles.calibrationHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Lucide name="settings" size={14} color="#0f172a" />
                  <Text style={styles.calibrationTitle}>Workstation Printer Tray Calibration (Accountable Form No. 51)</Text>
                </View>
                {isSavedFeedback && <Text style={styles.savedFeedbackText}>Saved to workstation profile!</Text>}
              </View>

              <Text style={styles.calibrationDescription}>
                Adjust feeder offsets if your physical hard-copy receipt fields print slightly shifted. Holds settings in local profile.
              </Text>

              <View style={styles.calibrationControls}>
                <View style={styles.calibrationField}>
                  <Text style={styles.calibrationLabel}>Horizontal Offset X (mm):</Text>
                  <View style={styles.nudgeRow}>
                    <TouchableOpacity
                      onPress={() => setOffsetX((prev) => Math.round((prev - 0.5) * 10) / 10)}
                      style={styles.nudgeBtn}
                    >
                      <Text style={styles.nudgeBtnText}>-0.5</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.calibrationInput}
                      value={String(offsetX)}
                      keyboardType="numeric"
                      onChangeText={(val) => {
                        const parsed = parseFloat(val);
                        if (!isNaN(parsed)) setOffsetX(parsed);
                        else if (val === '' || val === '-') setOffsetX(0);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setOffsetX((prev) => Math.round((prev + 0.5) * 10) / 10)}
                      style={styles.nudgeBtn}
                    >
                      <Text style={styles.nudgeBtnText}>+0.5</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.calibrationField}>
                  <Text style={styles.calibrationLabel}>Vertical Offset Y (mm):</Text>
                  <View style={styles.nudgeRow}>
                    <TouchableOpacity
                      onPress={() => setOffsetY((prev) => Math.round((prev - 0.5) * 10) / 10)}
                      style={styles.nudgeBtn}
                    >
                      <Text style={styles.nudgeBtnText}>-0.5</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.calibrationInput}
                      value={String(offsetY)}
                      keyboardType="numeric"
                      onChangeText={(val) => {
                        const parsed = parseFloat(val);
                        if (!isNaN(parsed)) setOffsetY(parsed);
                        else if (val === '' || val === '-') setOffsetY(0);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setOffsetY((prev) => Math.round((prev + 0.5) * 10) / 10)}
                      style={styles.nudgeBtn}
                    >
                      <Text style={styles.nudgeBtnText}>+0.5</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity onPress={handleSaveCalibration} style={styles.saveCalibrationBtn}>
                  <Lucide name="save" size={13} color="#fff" />
                  <Text style={styles.saveCalibrationBtnText}>Save Offsets</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mode Guidance Notice */}
          {outputMode === 'accountable_form' && (
            <View style={styles.overlayNotice}>
              <Lucide name="info" size={16} color="#0369a1" />
              <Text style={styles.overlayNoticeText}>
                <strong>Hard Copy Insertion Mode:</strong> Static agency headers, labels, and borders will be suppressed during printing. The printer will only fill out dynamic fields directly into the boxes of your pre-printed physical Official Receipt.
              </Text>
            </View>
          )}

          {outputMode === 'alignment_test' && (
            <View style={[styles.overlayNotice, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
              <Lucide name="alert-triangle" size={16} color="#b91c1c" />
              <Text style={[styles.overlayNoticeText, { color: '#991b1b' }]}>
                <strong>Alignment Test Mode:</strong> Prints red dashed boundary boxes on plain scrap paper. Lay the printed test sheet over your physical Accountable Form No. 51 against a window/light to verify tray alignment.
              </Text>
            </View>
          )}

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Accountable Form 51 Layout Card */}
            <View style={[styles.receiptSheet, isCancelled && { borderColor: colors.semantic.error }]}>
              {isCancelled && (
                <View style={styles.watermarkContainer}>
                  <Text style={styles.watermarkText}>CANCELLED / VOID</Text>
                </View>
              )}

              {/* Form 51 Top Header */}
              <View style={[styles.formHeader, outputMode === 'accountable_form' && styles.preprintedSuppressed]}>
                <Text style={styles.formAgency}>REPUBLIC OF THE PHILIPPINES</Text>
                <Text style={styles.formDept}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                <Text style={styles.formTitle}>OFFICIAL RECEIPT</Text>
                <Text style={styles.formCode}>Accountable Form No. 51 - Revised 2006</Text>
              </View>

              {/* Serial & Date Bar */}
              <View style={[styles.metaBar, outputMode === 'accountable_form' && styles.preprintedBoxHighlight]}>
                <View>
                  <Text style={styles.metaLabel}>DATE</Text>
                  <Text style={styles.metaValue}>
                    {new Date(receipt.issuedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.metaLabel}>No.</Text>
                  <Text style={styles.orSerial}>{receipt.officialReceiptNumber}</Text>
                </View>
              </View>

              {/* Payor Info */}
              <View style={[styles.payorSection, outputMode === 'accountable_form' && styles.preprintedBoxHighlight]}>
                <View style={styles.payorRow}>
                  <Text style={styles.payorLabel}>Agency / Office:</Text>
                  <Text style={styles.payorVal}>NTC Regional Operations Center</Text>
                </View>
                <View style={styles.payorRow}>
                  <Text style={styles.payorLabel}>Payor:</Text>
                  <Text style={[styles.payorVal, { fontWeight: '700' }]}>{receipt.payorName}</Text>
                </View>
                {receipt.payorAddress ? (
                  <View style={styles.payorRow}>
                    <Text style={styles.payorLabel}>Address:</Text>
                    <Text style={styles.payorVal}>{receipt.payorAddress}</Text>
                  </View>
                ) : null}
                {receipt.opNumber ? (
                  <View style={styles.payorRow}>
                    <Text style={styles.payorLabel}>Order of Payment #:</Text>
                    <Text style={styles.payorVal}>{receipt.opNumber}</Text>
                  </View>
                ) : null}
              </View>

              {/* Line Items Table */}
              <View style={[styles.table, outputMode === 'accountable_form' && styles.preprintedBoxHighlight]}>
                <View style={[styles.tableHeader, outputMode === 'accountable_form' && styles.preprintedHeaderSubtle]}>
                  <Text style={[styles.th, { flex: 1.5 }]}>NATURE OF COLLECTION</Text>
                  <Text style={[styles.th, { flex: 1 }]}>FUND / ACCOUNT CODE</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>AMOUNT</Text>
                </View>

                {receipt.lineItems && receipt.lineItems.length > 0 ? (
                  receipt.lineItems.map((item, index) => (
                    <View key={item.id || index} style={styles.tableRow}>
                      <Text style={[styles.td, { flex: 1.5 }]}>{item.description}</Text>
                      <Text style={[styles.td, { flex: 1, fontFamily: 'monospace' }]}>{item.feeCode}</Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>
                        ₱{(item.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 1.5 }]}>Payment of Regulatory Fees</Text>
                    <Text style={[styles.td, { flex: 1, fontFamily: 'monospace' }]}>REG-01</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>
                      ₱{(receipt.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                )}

                {/* Total Row */}
                <View style={styles.tableTotalRow}>
                  <Text style={[styles.tableTotalLabel, { flex: 2.5 }]}>TOTAL AMOUNT (in Figures):</Text>
                  <Text style={[styles.tableTotalVal, { flex: 1, textAlign: 'right' }]}>
                    ₱{(receipt.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              {/* Payment Details */}
              <View style={[styles.paymentMethodCard, outputMode === 'accountable_form' && styles.preprintedBoxHighlight]}>
                <View style={styles.methodInfoRow}>
                  <Text style={styles.methodLabel}>Payment Mode:</Text>
                  <Text style={styles.methodVal}>{receipt.paymentMethod.toUpperCase()}</Text>
                </View>
                {receipt.paymentMethod === 'Check' ? (
                  <View style={styles.checkDetails}>
                    <Text style={styles.methodLabel}>Check #:</Text>
                    <Text style={styles.methodVal}>{receipt.checkNumber}</Text>
                    <Text style={[styles.methodLabel, { marginLeft: 12 }]}>Drawee Bank:</Text>
                    <Text style={styles.methodVal}>{receipt.checkBank}</Text>
                  </View>
                ) : null}
                {receipt.depositSlipNumber ? (
                  <View style={styles.methodInfoRow}>
                    <Text style={styles.methodLabel}>Bank Deposit Slip #:</Text>
                    <Text style={styles.methodVal}>{receipt.depositSlipNumber}</Text>
                  </View>
                ) : null}
              </View>

              {/* Cashier Signatures */}
              <View style={styles.signSection}>
                <View style={styles.signBox}>
                  <Text style={[styles.signTitle, outputMode === 'accountable_form' && styles.preprintedSuppressed]}>
                    RECEIVED THE AMOUNT STATED ABOVE
                  </Text>
                  <View style={[styles.signLine, outputMode === 'accountable_form' && styles.preprintedSuppressed]} />
                  <Text style={styles.signName}>{receipt.issuedByUserName ?? 'Authorized Collecting Officer'}</Text>
                  <Text style={[styles.signRole, outputMode === 'accountable_form' && styles.preprintedSuppressed]}>
                    Collecting Officer / Cashier
                  </Text>
                </View>
              </View>

              {receipt.cancellationReason ? (
                <View style={styles.cancellationBox}>
                  <Text style={styles.cancellationLabel}>Cancellation Reason:</Text>
                  <Text style={styles.cancellationVal}>{receipt.cancellationReason}</Text>
                  {receipt.cancelledByUserName ? (
                    <Text style={styles.cancellationMeta}>
                      Cancelled by: {receipt.cancelledByUserName} on{' '}
                      {receipt.cancelledAt ? new Date(receipt.cancelledAt).toLocaleString() : ''}
                    </Text>
                  ) : null}
                </View>
              ) : null}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 12,
    width: '100%',
    maxWidth: 780,
    maxHeight: '94%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  settingsBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  printHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  printHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    padding: 4,
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: 'transparent',
  },
  modeTabActive: {
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderTopColor: '#0284c7',
  },
  modeTabText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  calibrationPanel: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  calibrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calibrationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  savedFeedbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  calibrationDescription: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  calibrationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  calibrationField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calibrationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  nudgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nudgeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  nudgeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  calibrationInput: {
    width: 44,
    height: 28,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#ffffff',
  },
  saveCalibrationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  saveCalibrationBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  overlayNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  overlayNoticeText: {
    fontSize: 11,
    color: '#0369a1',
    flex: 1,
    lineHeight: 16,
  },
  body: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  receiptSheet: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0f172a',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  preprintedSuppressed: {
    opacity: 0.18,
  },
  preprintedBoxHighlight: {
    borderColor: '#93c5fd',
    backgroundColor: '#f0f9ff',
  },
  preprintedHeaderSubtle: {
    opacity: 0.25,
  },
  watermarkContainer: {
    position: 'absolute',
    top: '35%',
    left: '-10%',
    right: '-10%',
    transform: [{ rotate: '-25deg' }],
    alignItems: 'center',
    zIndex: 10,
  },
  watermarkText: {
    fontSize: 48,
    fontWeight: '900',
    color: 'rgba(239, 68, 68, 0.18)',
    letterSpacing: 4,
    borderWidth: 4,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  formHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 8,
    marginBottom: 8,
  },
  formAgency: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '600',
    color: '#475569',
  },
  formDept: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 2,
    marginTop: 4,
  },
  formCode: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  orSerial: {
    fontSize: 16,
    fontWeight: '900',
    color: '#dc2626',
  },
  payorSection: {
    marginBottom: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    borderRadius: 6,
  },
  payorRow: {
    flexDirection: 'row',
  },
  payorLabel: {
    width: 140,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  payorVal: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
  },
  table: {
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 6,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    padding: 8,
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1e293b',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  td: {
    fontSize: 12,
    color: '#1e293b',
  },
  tableTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 8,
  },
  tableTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  tableTotalVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  paymentMethodCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    gap: 4,
  },
  methodInfoRow: {
    flexDirection: 'row',
  },
  checkDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginRight: 6,
  },
  methodVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
  },
  signSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 8,
  },
  signBox: {
    width: 240,
    alignItems: 'center',
  },
  signTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
  },
  signLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#0f172a',
    marginBottom: 4,
  },
  signName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  signRole: {
    fontSize: 10,
    color: '#64748b',
  },
  cancellationBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 6,
  },
  cancellationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
  cancellationVal: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
  },
  cancellationMeta: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
});
