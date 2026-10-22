import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Icon, COLORS, TYPOGRAPHY } from '@edge/ui';

interface ReassessmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (remarks: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReassessmentModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: ReassessmentModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      setError('Please provide notes or reason for requesting a re-assessment.');
      return;
    }
    setError(null);
    try {
      await onSubmit(remarks.trim());
      setRemarks('');
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message.length > 0
          ? err.message
          : 'Failed to submit re-assessment request.';
      setError(message);
    }
  };

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
              <Icon name="rotate-ccw" size={18} color="#7C3AED" />
            </View>
            <View style={styles.headerTexts}>
              <Text style={styles.modalTitle}>Request Re-assessment</Text>
              <Text style={styles.modalSubtitle}>
                Provide feedback or notes to the evaluating officer to request an updated SOA.
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
            <Text style={styles.inputLabel}>Reason / Remarks for Re-evaluation *</Text>
            <TextInput
              placeholder="e.g., Updated unit count, requesting rate clarification, or amended documents uploaded..."
              placeholderTextColor="#94A3B8"
              value={remarks}
              onChangeText={(txt) => {
                setRemarks(txt);
                if (error) setError(null);
              }}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              editable={!isLoading}
            />

            {error ? (
              <View style={styles.errorRow}>
                <Icon name="alert-circle" size={14} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.noticeBox}>
              <Icon name="info" size={14} color="#7C3AED" />
              <Text style={styles.noticeText}>
                The evaluating officer will be notified to review your remarks and update your Statement of Account.
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
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="send" size={14} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit Request</Text>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
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
  inputLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
    marginBottom: 6,
  },
  textArea: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#0F172A',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#DC2626',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FAF5FF',
    borderColor: '#DDD6FE',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },
  noticeText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#6B21A8',
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },
});
