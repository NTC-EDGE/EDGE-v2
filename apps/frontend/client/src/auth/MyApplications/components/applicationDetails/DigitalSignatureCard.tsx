import React from 'react';
import { View, Text, Image } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { SectionCard } from '../../../../shared/formPreview';

interface DigitalSignatureCardProps {
  signatures: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  primaryName: string;
}

export function DigitalSignatureCard({ signatures, primaryName }: DigitalSignatureCardProps) {
  return (
    <SectionCard
      icon="shield"
      title="Acknowledgement & Digital Signature"
      accentColor="#0F2C59"
    >
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: '#64748B' }}>
          Applicant digital consent and signature record:
        </Text>

        {signatures.length > 0 ? (
          signatures.map((sig) => {
            const trimmedVal = sig.value.trim();
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
                key={sig.fieldId}
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
                    {sig.fieldLabel || 'Applicant Signature'}
                  </Text>
                  <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#1D4ED8' }}>
                      RECORDED SIGNATURE
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
          })
        ) : (
          <View
            style={{
              backgroundColor: '#F8FAFC',
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#CBD5E1',
              alignItems: 'center',
            }}
          >
            <Icon name="check-circle" size={24} color="#16A34A" />
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 14,
                fontWeight: '700',
                color: '#0F172A',
                marginTop: 6,
              }}
            >
              Digitally Confirmed & Submitted
            </Text>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 12,
                color: '#64748B',
                marginTop: 2,
              }}
            >
              Signed by {primaryName}
            </Text>
          </View>
        )}
      </View>
    </SectionCard>
  );
}
