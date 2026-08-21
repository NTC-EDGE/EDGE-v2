import React from 'react';
import { View, Text, Image } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { SectionCard } from './SectionCard';

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
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 1.5,
          borderColor: '#E2E8F0',
          borderRadius: 8,
          padding: 20,
          alignItems: 'center',
        }}
      >
        {/* Consent to Data Privacy Act of 2012 (R.A. 10173) */}
        <View
          style={{
            backgroundColor: '#F0FDF4',
            borderWidth: 1,
            borderColor: '#BBF7D0',
            borderRadius: 8,
            padding: 14,
            width: '100%',
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#16A34A',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 1,
            }}
          >
            <Icon name="check" size={14} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 12,
                fontWeight: '700',
                color: '#166534',
                marginBottom: 4,
              }}
            >
              Consent to Data Privacy Act of 2012 (R.A. No. 10173) & Legal Affirmation
            </Text>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 11,
                color: '#15803D',
                lineHeight: 16,
              }}
            >
              I hereby declare that all entries are true and correct. I freely give full consent for the collection and processing of personal information in accordance with Republic Act No. 10173 (Data Privacy Act of 2012) and NTC online filing guidelines.
            </Text>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 10,
                fontWeight: '700',
                color: '#15803D',
                marginTop: 6,
                textTransform: 'uppercase',
              }}
            >
              ✓ Consented & Agreed
            </Text>
          </View>
        </View>

        {signatures.length > 0 ? (
          signatures.map((sig, idx) => {
            const val = sig.value.trim();
            const isImage =
              val.startsWith('data:image') ||
              val.startsWith('blob:') ||
              val.startsWith('http://') ||
              val.startsWith('https://');

            const typedText = val.startsWith('typed:cursive:')
              ? val.replace('typed:cursive:', '').trim()
              : val;

            return (
              <View key={sig.fieldId || `sig-${idx}`} style={{ width: '100%', alignItems: 'center', marginVertical: 4 }}>
                {isImage ? (
                  <Image
                    source={{ uri: val }}
                    style={{ width: 260, height: 85 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 26,
                      fontStyle: 'italic',
                      fontWeight: '700',
                      color: '#0F2C59',
                      letterSpacing: 1,
                      marginVertical: 8,
                    }}
                  >
                    {typedText}
                  </Text>
                )}
              </View>
            );
          })
        ) : (
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 24,
              fontStyle: 'italic',
              fontWeight: '700',
              color: '#0F2C59',
              letterSpacing: 1,
              marginVertical: 8,
            }}
          >
            {primaryName}
          </Text>
        )}

        <View style={{ width: 280, height: 1.5, backgroundColor: '#0F2C59', marginTop: 8, marginBottom: 8 }} />
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 14,
            fontWeight: '700',
            color: '#0F172A',
          }}
        >
          {primaryName}
        </Text>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 11.5,
            color: '#64748B',
            marginTop: 2,
          }}
        >
          Authorized Signatory / Applicant
        </Text>

        <View
          style={{
            marginTop: 14,
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            paddingTop: 12,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 10.5,
              color: '#94A3B8',
              textAlign: 'center',
              lineHeight: 15,
              maxWidth: 600,
            }}
          >
            Digitally authenticated and officially recorded under Republic Act No. 8792 (Electronic Commerce Act) and NTC Online Filing Guidelines.
          </Text>
        </View>
      </View>
    </SectionCard>
  );
}
