import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@edge/ui';
import { ClientSoaOpFooterProps } from './clientSoaOpPreviewTypes';
import { modalStyles } from './styles/clientSoaOpModalStyles';

export function ClientSoaOpFooter({
  isPaid,
  onClose,
  onProceedToPayment,
}: ClientSoaOpFooterProps) {
  return (
    <View style={modalStyles.modalFooter}>
      <TouchableOpacity style={modalStyles.secondaryBtn} onPress={onClose} activeOpacity={0.75}>
        <Text style={modalStyles.secondaryBtnText}>Close Preview</Text>
      </TouchableOpacity>

      {onProceedToPayment && !isPaid && (
        <TouchableOpacity
          style={modalStyles.primaryPayBtn}
          onPress={() => {
            onClose();
            onProceedToPayment();
          }}
          activeOpacity={0.85}
        >
          <Icon name="dollar-sign" size={16} color="#FFFFFF" />
          <Text style={modalStyles.primaryPayBtnText}>Proceed to Payment</Text>
          <Icon name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}
