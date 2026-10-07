import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { Application } from '../../data/applicationsData';
import { formatCurrency, getEffectiveTotalAmount } from '../../utils/clientSoaReportGenerator';

interface ConvertToRealModalProps {
  visible: boolean;
  app: Application;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function ConvertToRealModal({
  visible,
  app,
  onClose,
  onConfirm,
  isLoading = false,
}: ConvertToRealModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const totalAmount = getEffectiveTotalAmount(app);
  const refNum = app.referenceNumber || (app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const soaNumber = app.soaNumber || `SOA-${refNum}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={isLoading ? undefined : onClose}
        />

        <View
          style={[
            styles.modalCard,
            { width: isDesktop ? 480 : '92%', maxWidth: 500, alignSelf: 'center' },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.iconCircle}>
              <Icon name="check-circle" size={20} color="#0F2C59" />
            </View>
            <View style={styles.headerTexts}>
              <Text style={styles.modalTitle}>Submit as Real Application</Text>
              <Text style={styles.modalSubtitle}>
                Convert your pre-assessment into an official regulatory filing.
              </Text>
            </View>
            {!isLoading && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Body */}
          <View style={styles.modalBody}>
            <Text style={styles.bodyText}>
              You are about to officially submit this application for regulatory processing. Your assessed Statement of Account will be locked in and forwarded for payment settlement.
            </Text>

            {/* Assessment Details Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Application Service:</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {app.serviceName || 'NTC Service Application'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Assessed SOA #:</Text>
                <Text style={styles.summaryValue}>{soaNumber}</Text>
              </View>
              <View style={styles.summaryRowHighlight}>
                <Text style={styles.summaryLabelHighlight}>Total Assessed Fee:</Text>
                <Text style={styles.summaryValueHighlight}>{formatCurrency(totalAmount)}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Icon name="shield" size={15} color="#0369A1" />
              <Text style={styles.infoBoxText}>
                No need to re-upload documents or fill out information. All submitted details will be automatically preserved.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={15} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Confirm &amp; Proceed</Text>
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
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    padding: 18,
  },
  bodyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 14,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#0F172A',
  },
  summaryRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
  },
  summaryLabelHighlight: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  summaryValueHighlight: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0284C7',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },
  infoBoxText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    gap: 10,
    backgroundColor: '#F8FAFC',
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#475569',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#0F2C59',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },
});
