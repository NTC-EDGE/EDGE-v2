import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { OfficialReceiptDto } from '@edge/api';

interface ReceiptPrintPreviewModalProps {
  visible: boolean;
  receipt: OfficialReceiptDto | null;
  onClose: () => void;
}

export function ReceiptPrintPreviewModal({
  visible,
  receipt,
  onClose,
}: ReceiptPrintPreviewModalProps) {
  const { colors } = useTheme();

  if (receipt === null) return null;

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  const isCancelled = receipt.status === 'Cancelled' || (receipt.status as unknown) === 2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <Lucide name="file-text" size={20} color={colors.brand.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Accountable Form No. 51 Preview</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handlePrint} style={[styles.printHeaderBtn, { backgroundColor: colors.brand.primary }]}>
                <Lucide name="printer" size={16} color="#fff" />
                <Text style={styles.printHeaderBtnText}>Print Form 51</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Lucide name="x" size={20} color={colors.neutral[700]} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Accountable Form 51 Layout Card */}
            <View style={[styles.receiptSheet, isCancelled && { borderColor: colors.semantic.error }]}>
              {isCancelled && (
                <View style={styles.watermarkContainer}>
                  <Text style={styles.watermarkText}>CANCELLED / VOID</Text>
                </View>
              )}

              {/* Form 51 Top Header */}
              <View style={styles.formHeader}>
                <Text style={styles.formAgency}>REPUBLIC OF THE PHILIPPINES</Text>
                <Text style={styles.formDept}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                <Text style={styles.formTitle}>OFFICIAL RECEIPT</Text>
                <Text style={styles.formCode}>Accountable Form No. 51 - Revised 2006</Text>
              </View>

              {/* Serial & Date Bar */}
              <View style={styles.metaBar}>
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
              <View style={styles.payorSection}>
                <View style={styles.payorRow}>
                  <Text style={styles.payorLabel}>Agency / Office:</Text>
                  <Text style={styles.payorVal}>NTC Regional Operations Center</Text>
                </View>
                <View style={styles.payorRow}>
                  <Text style={styles.payorLabel}>Payor:</Text>
                  <Text style={[styles.payorVal, { fontWeight: '700' }]}>{receipt.payorName}</Text>
                </View>
                {receipt.payorAddress && (
                  <View style={styles.payorRow}>
                    <Text style={styles.payorLabel}>Address:</Text>
                    <Text style={styles.payorVal}>{receipt.payorAddress}</Text>
                  </View>
                )}
                {receipt.opNumber && (
                  <View style={styles.payorRow}>
                    <Text style={styles.payorLabel}>Order of Payment #:</Text>
                    <Text style={styles.payorVal}>{receipt.opNumber}</Text>
                  </View>
                )}
              </View>

              {/* Line Items Table */}
              <View style={styles.table}>
                <View style={styles.tableHeader}>
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
              <View style={styles.paymentMethodCard}>
                <View style={styles.methodInfoRow}>
                  <Text style={styles.methodLabel}>Payment Mode:</Text>
                  <Text style={styles.methodVal}>{receipt.paymentMethod.toUpperCase()}</Text>
                </View>
                {receipt.paymentMethod === 'Check' && (
                  <View style={styles.checkDetails}>
                    <Text style={styles.methodLabel}>Check #:</Text>
                    <Text style={styles.methodVal}>{receipt.checkNumber}</Text>
                    <Text style={[styles.methodLabel, { marginLeft: 12 }]}>Drawee Bank:</Text>
                    <Text style={styles.methodVal}>{receipt.checkBank}</Text>
                  </View>
                )}
                {receipt.depositSlipNumber && (
                  <View style={styles.methodInfoRow}>
                    <Text style={styles.methodLabel}>Bank Deposit Slip #:</Text>
                    <Text style={styles.methodVal}>{receipt.depositSlipNumber}</Text>
                  </View>
                )}
              </View>

              {/* Cashier Signatures */}
              <View style={styles.signSection}>
                <View style={styles.signBox}>
                  <Text style={styles.signTitle}>RECEIVED THE AMOUNT STATED ABOVE</Text>
                  <View style={styles.signLine} />
                  <Text style={styles.signName}>{receipt.issuedByUserName ?? 'Authorized Collecting Officer'}</Text>
                  <Text style={styles.signRole}>Collecting Officer / Cashier</Text>
                </View>
              </View>

              {receipt.cancellationReason && (
                <View style={styles.cancellationBox}>
                  <Text style={styles.cancellationLabel}>Cancellation Reason:</Text>
                  <Text style={styles.cancellationVal}>{receipt.cancellationReason}</Text>
                  {receipt.cancelledByUserName && (
                    <Text style={styles.cancellationMeta}>
                      Cancelled by: {receipt.cancelledByUserName} on{' '}
                      {receipt.cancelledAt ? new Date(receipt.cancelledAt).toLocaleString() : ''}
                    </Text>
                  )}
                </View>
              )}
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
    maxWidth: 720,
    maxHeight: '94%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  printHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
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
  body: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  receiptSheet: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
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
    borderBottomColor: '#CBD5E1',
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
    color: '#0F172A',
    marginVertical: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
    marginTop: 4,
  },
  formCode: {
    fontSize: 9,
    color: '#64748B',
    fontStyle: 'italic',
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  orSerial: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
  },
  payorSection: {
    marginBottom: 16,
    gap: 4,
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
    color: '#0F172A',
  },
  table: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 6,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#94A3B8',
    padding: 8,
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
  },
  td: {
    fontSize: 12,
    color: '#1E293B',
  },
  tableTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 8,
  },
  tableTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  tableTotalVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  paymentMethodCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
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
    color: '#0F172A',
  },
  signSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
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
    marginBottom: 40,
  },
  signLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#0F172A',
    marginBottom: 4,
  },
  signName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  signRole: {
    fontSize: 10,
    color: '#64748B',
  },
  cancellationBox: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
  },
  cancellationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  cancellationVal: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
  },
  cancellationMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
});
