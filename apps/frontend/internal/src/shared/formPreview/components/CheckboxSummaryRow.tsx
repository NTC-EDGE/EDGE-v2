import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';

const OFFICIAL_LEGAL_DECLARATION =
  "I hereby declare that all information given herein is true and correct, and the supporting documents submitted are authentic and duly executed.";

interface CheckboxSummaryRowProps {
  label: string;
  trimmedVal: string;
}

export function CheckboxSummaryRow({ label, trimmedVal }: CheckboxSummaryRowProps) {
  const labelLower = label.toLowerCase();
  const isChecked = trimmedVal === 'true' || trimmedVal === 'agreed' || trimmedVal === 'yes' || trimmedVal === '1';
  const displayLabel = labelLower.startsWith('i hereby declare')
    ? OFFICIAL_LEGAL_DECLARATION
    : label;

  return (
    <View
      style={{
        backgroundColor: isChecked ? '#F0FDF4' : '#FEF2F2',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: isChecked ? '#BBF7D0' : '#FECACA',
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          backgroundColor: isChecked ? '#16A34A' : '#FFFFFF',
          borderWidth: 1.5,
          borderColor: isChecked ? '#16A34A' : '#DC2626',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isChecked && <Icon name="check" size={14} color="#FFFFFF" />}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 12.5,
            fontWeight: '600',
            color: isChecked ? '#166534' : '#991B1B',
            lineHeight: 18,
          }}
        >
          {displayLabel}
        </Text>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 10,
            fontWeight: '700',
            color: isChecked ? '#15803D' : '#B91C1C',
            marginTop: 2,
            textTransform: 'uppercase',
          }}
        >
          {isChecked ? '✓ Confirmed & Agreed' : '✗ Not Agreed'}
        </Text>
      </View>
    </View>
  );
}
