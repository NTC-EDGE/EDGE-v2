import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Icon as Lucide } from '@edge/ui';
import { FeeMasterEntity } from '../hooks/useFeeMasterCatalog';

interface FeeMasterSelectProps {
  feeEntities: FeeMasterEntity[];
  selectedFeeId: string;
  onSelectFee: (fee: FeeMasterEntity | null) => void;
  colors: Record<string, any>;
  isDark: boolean;
}

export function FeeMasterSelect({
  feeEntities,
  selectedFeeId,
  onSelectFee,
  colors,
  isDark,
}: FeeMasterSelectProps) {
  const selectedFee = feeEntities.find((f) => f.id === selectedFeeId) || null;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        Fee Master Entity *
      </Text>

      {/* Web HTML select / Cross-platform Native Dropdown */}
      {Platform.OS === 'web' ? (
        <View
          style={[
            styles.selectWrapper,
            {
              backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
              borderColor: colors.border,
            },
          ]}
        >
          <select
            value={selectedFeeId}
            onChange={(e) => {
              const val = e.target.value;
              const found = feeEntities.find((f) => f.id === val) || null;
              onSelectFee(found);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '13px',
              fontFamily: 'inherit',
              color: colors.text,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <option value="" style={{ background: isDark ? '#1E293B' : '#FFFFFF', color: colors.textMuted }}>
              -- Select Fee Entity from Master Catalog --
            </option>
            {feeEntities.map((fee) => (
              <option
                key={fee.id}
                value={fee.id}
                style={{ background: isDark ? '#1E293B' : '#FFFFFF', color: colors.text }}
              >
                [{fee.code}] {fee.name}
              </option>
            ))}
          </select>
          <View style={styles.chevronIconPosition}>
            <Lucide name="chevron-down" size={16} color={colors.textMuted} />
          </View>
        </View>
      ) : (
        <View style={{ gap: 6 }}>
          {feeEntities.map((fee) => {
            const isSelected = fee.id === selectedFeeId;
            return (
              <Pressable
                key={fee.id}
                style={[
                  styles.nativePill,
                  {
                    backgroundColor: isSelected
                      ? (isDark ? colors.neutral[800] : colors.brand.light)
                      : (isDark ? colors.neutral[900] : colors.cardBg),
                    borderColor: isSelected
                      ? (isDark ? '#60A5FA' : colors.brand.primary)
                      : colors.border,
                  },
                ]}
                onPress={() => onSelectFee(isSelected ? null : fee)}
              >
                <Lucide
                  name={isSelected ? 'check-circle' : 'circle'}
                  size={16}
                  color={isSelected ? (isDark ? '#60A5FA' : colors.brand.primary) : colors.textMuted}
                />
                <Text
                  style={[
                    styles.nativePillText,
                    { color: isSelected ? (isDark ? '#60A5FA' : colors.brand.primary) : colors.text },
                  ]}
                >
                  [{fee.code}] {fee.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* SELECTED FEE ENTITY DISPLAY CARD (CODE, NAME, DESCRIPTION) */}
      {selectedFee && (
        <View
          style={[
            styles.feeDetailsCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
              borderColor: isDark ? '#60A5FA' : colors.brand[200],
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.codeBadge,
                { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : colors.brand.primary },
              ]}
            >
              <Text style={styles.codeBadgeText}>{selectedFee.code}</Text>
            </View>

            <View style={styles.feeTitleGroup}>
              <Text style={[styles.feeNameText, { color: colors.text }]}>
                {selectedFee.name}
              </Text>
              <Text style={[styles.feeTypeTag, { color: isDark ? '#60A5FA' : colors.brand.primary }]}>
                {selectedFee.feeType}
              </Text>
            </View>
          </View>

          <View style={styles.descRow}>
            <Lucide name="info" size={14} color={isDark ? '#60A5FA' : colors.brand.primary} />
            <Text style={[styles.feeDescText, { color: colors.textMuted }]}>
              {selectedFee.description}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chevronIconPosition: {
    position: 'absolute',
    right: 12,
    pointerEvents: 'none',
  },
  feeDetailsCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  feeTitleGroup: {
    flex: 1,
    gap: 2,
  },
  feeNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  feeTypeTag: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 4,
  },
  feeDescText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  nativePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  nativePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
