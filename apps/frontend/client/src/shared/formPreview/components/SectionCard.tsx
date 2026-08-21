import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';

interface SectionCardProps {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  accentColor?: string;
  children: React.ReactNode;
}

export function SectionCard({ icon, title, accentColor = '#0F2C59', children }: SectionCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderLeftWidth: 5,
        borderLeftColor: accentColor,
        marginBottom: 16,
        ...Platform.select({ web: { boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.04)' } }),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: `${accentColor}12`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name={icon} size={14} color={accentColor} />
        </View>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 14,
            fontWeight: '700',
            color: '#0F2C59',
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}
