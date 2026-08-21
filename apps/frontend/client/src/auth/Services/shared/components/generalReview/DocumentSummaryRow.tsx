import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';

interface DocumentSummaryRowProps {
  label: string;
  trimmedVal: string;
  onPreviewFile?: (file: string, label: string) => void;
}

export function DocumentSummaryRow({ label, trimmedVal, onPreviewFile }: DocumentSummaryRowProps) {
  return (
    <View
      style={{
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 10,
            fontWeight: '700',
            color: '#64748B',
            marginBottom: 3,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 12,
            fontWeight: '600',
            color: '#0F172A',
          }}
          numberOfLines={1}
        >
          {trimmedVal}
        </Text>
      </View>
      {onPreviewFile !== undefined && (
        <TouchableOpacity
          onPress={() => onPreviewFile(trimmedVal, label)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#EFF6FF',
            borderWidth: 1,
            borderColor: '#BFDBFE',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            gap: 4,
          }}
        >
          <Icon name="eye" size={13} color="#1D4ED8" />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: "#1D4ED8" }}>
            View Document
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
