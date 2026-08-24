import React from 'react';
import { View, Text } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';

interface HeroReviewHeaderProps {
  serviceName: string;
  isExamService: boolean;
  variantLabel: string;
  scheduleSummaryText: string | null;
  isDesktop: boolean;
}

export function HeroReviewHeader({
  serviceName,
  isExamService,
  variantLabel,
  scheduleSummaryText,
  isDesktop,
}: HeroReviewHeaderProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: isDesktop ? 'center' : 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: '#EFF6FF',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}
        >
          <Icon name={isExamService ? 'book-open' : 'award'} size={24} color="#1D4ED8" />
        </View>
        <View>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              fontWeight: '700',
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Application For
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 18,
              fontWeight: '700',
              color: '#0F172A',
              marginTop: 2,
            }}
          >
            {serviceName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: '#475569' }}>
              Mode: <Text style={{ fontWeight: '700', color: '#0F172A' }}>Individual Single Filing</Text>
            </Text>
            {variantLabel !== 'Standard' && (
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: '#475569' }}>
                • Variant: <Text style={{ fontWeight: '700', color: '#1D4ED8' }}>{variantLabel}</Text>
              </Text>
            )}
          </View>
        </View>
      </View>

      {scheduleSummaryText && (
        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="calendar" size={16} color="#1D4ED8" />
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
              {isExamService ? 'EXAM SCHEDULE & VENUE' : 'PROCESSING OFFICE'}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12.5, fontWeight: '600', color: '#0F172A' }}>
              {scheduleSummaryText}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
