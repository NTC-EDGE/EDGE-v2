import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';
import { CanonicalFormMetadata } from '../core/canonicalFormDefinitions';

export interface EquivalentFormHeaderCardProps {
  canonicalForm: CanonicalFormMetadata;
  serviceTitle?: string | null;
  serviceVariantName?: string | null;
  version?: string | null;
}

export function EquivalentFormHeaderCard({
  canonicalForm,
  serviceTitle,
  serviceVariantName,
  version = '1.0',
}: EquivalentFormHeaderCardProps) {
  const effectiveVariant = serviceVariantName && serviceVariantName.trim().length > 0
    ? serviceVariantName.trim()
    : null;

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
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{canonicalForm.category}</Text>
        </View>

        {/* Template Version */}
        <View style={styles.versionPill}>
          <Text style={styles.versionPillText}>Template v{version || '1.0'}</Text>
        </View>
      </View>

      {/* Official Form Title */}
      <Text style={styles.formTitleText}>{canonicalForm.title}</Text>

      {/* Description */}
      <Text style={styles.formDescriptionText}>{canonicalForm.description}</Text>

      {/* Associated Metadata Badges */}
      <View style={styles.metadataBadgeRow}>
        {/* Service */}
        {serviceTitle && serviceTitle.trim().length > 0 && (
          <View style={styles.serviceBadge}>
            <Icon name="folder" size={12} color="#1E40AF" />
            <Text style={styles.serviceBadgeText} numberOfLines={1}>
              Service: {serviceTitle}
            </Text>
          </View>
        )}

        {/* Service Variant */}
        {effectiveVariant && (
          <View style={styles.variantBadge}>
            <Icon name="layers" size={12} color="#065F46" />
            <Text style={styles.variantBadgeText} numberOfLines={1}>
              Variant: {effectiveVariant}
            </Text>
          </View>
        )}
      </View>
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
  versionPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  versionPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
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
  metadataBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  serviceBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  variantBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
});
