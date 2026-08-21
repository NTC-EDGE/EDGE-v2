import React from 'react';
import { View, Text, Image } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';

interface SignatureSummaryRowProps {
  label: string;
  trimmedVal: string;
}

export function SignatureSummaryRow({ label, trimmedVal }: SignatureSummaryRowProps) {
  const isImageSignature =
    trimmedVal.startsWith('data:image') ||
    trimmedVal.startsWith('blob:') ||
    trimmedVal.startsWith('http://') ||
    trimmedVal.startsWith('https://');

  const typedText = trimmedVal.startsWith('typed:cursive:')
    ? trimmedVal.replace('typed:cursive:', '').trim()
    : trimmedVal;

  return (
    <View
      style={{
        backgroundColor: '#F8FAFC',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 11,
            fontWeight: '700',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#1D4ED8' }}>
            APPLICANT SIGNATURE
          </Text>
        </View>
      </View>

      {isImageSignature ? (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 8,
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 90,
          }}
        >
          <Image
            source={{ uri: trimmedVal }}
            style={{ width: '100%', height: 80 }}
            resizeMode="contain"
          />
          <View style={{ width: '80%', height: 1, backgroundColor: '#CBD5E1', marginTop: 6 }} />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
            Digital Handwritten Signature Recorded
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 8,
            padding: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 22,
              fontStyle: 'italic',
              fontWeight: '700',
              color: '#0F2C59',
              letterSpacing: 1,
            }}
          >
            {typedText}
          </Text>
          <View style={{ width: '80%', height: 1, backgroundColor: '#0F2C59', marginTop: 6 }} />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, color: '#64748B', marginTop: 4 }}>
            Digitally / Electronically Signed
          </Text>
        </View>
      )}
    </View>
  );
}
