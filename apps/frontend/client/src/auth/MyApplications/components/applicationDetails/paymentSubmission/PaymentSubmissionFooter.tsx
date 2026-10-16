import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from '@edge/ui';
import { styles } from './paymentSubmissionStyles';

interface PaymentSubmissionFooterProps {
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function PaymentSubmissionFooter({
  isSubmitting,
  isSubmitDisabled,
  onClose,
  onSubmit,
}: PaymentSubmissionFooterProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isSubmitting}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitBtn, (isSubmitting || isSubmitDisabled) && styles.submitBtnDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting || isSubmitDisabled}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="check" size={16} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Submit Payment &amp; Proof</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
