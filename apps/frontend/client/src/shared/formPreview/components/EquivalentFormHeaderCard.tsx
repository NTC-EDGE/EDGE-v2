import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';
import { CanonicalFormMetadata } from '../core/canonicalFormDefinitions';

export interface EquivalentFormHeaderCardProps {
  canonicalForm: CanonicalFormMetadata;
  serviceTitle?: string | null;
  serviceVariantName?: string | null;
  applicationType?: string | null;
  elements?: string | null;
  version?: string | null;
}

export function EquivalentFormHeaderCard({
  canonicalForm,
  serviceTitle: _serviceTitle,
  serviceVariantName: _serviceVariantName,
  applicationType: _applicationType,
  elements: _elements,
  version: _version,
}: EquivalentFormHeaderCardProps) {
  return (
    <View style={styles.cardContainer}>
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        {/* Form Number Seal */}
        <View style={styles.sealBadge}>
          <Icon name="file-text" size={16} color="#FFFFFF" />
          <Text style={styles.sealBadgeText}>{canonicalForm.formNumber}</Text>
        </View>

        {/* Category Pill */}
        {canonicalForm.category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{canonicalForm.category}</Text>
          </View>
        ) : null}
      </View>

      {/* Official Form Title */}
      <Text style={styles.formTitleText}>{canonicalForm.title}</Text>

      {/* Description */}
      {canonicalForm.description ? (
        <Text style={styles.formDescriptionText}>{canonicalForm.description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F2C59',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sealBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  categoryPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
    color: '#4338CA',
  },
  formTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  formDescriptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
});
