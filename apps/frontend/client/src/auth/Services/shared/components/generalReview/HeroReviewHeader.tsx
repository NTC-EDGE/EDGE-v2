import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';

export function HeroReviewHeader() {
  return (
    <View
      style={{
        backgroundColor: '#0F2C59',
        borderRadius: 14,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: 'rgba(255,255,255,0.15)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon name="check-circle" size={22} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 16,
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: 2,
          }}
        >
          Final Application Review & Summary
        </Text>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Please verify all filled-out particulars and parameters before official submission.
        </Text>
      </View>
    </View>
  );
}
