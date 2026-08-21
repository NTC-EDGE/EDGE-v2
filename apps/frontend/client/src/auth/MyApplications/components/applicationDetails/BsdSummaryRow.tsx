import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';

interface BsdSummaryRowProps {
  label: string;
  trimmedVal: string;
}

export function BsdSummaryRow({ label, trimmedVal }: BsdSummaryRowProps) {
  return (
    <View
      style={{
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 10,
            fontWeight: '700',
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#1D4ED8' }}>
            OFFICIAL NTC ASSIGNMENT
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 13,
          fontWeight: '700',
          color: '#0F172A',
        }}
      >
        {trimmedVal !== '' ? trimmedVal : 'TO BE ASSIGNED BY NTC'}
      </Text>
    </View>
  );
}
