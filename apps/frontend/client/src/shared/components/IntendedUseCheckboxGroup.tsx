import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, COLORS, TYPOGRAPHY } from '@edge/ui';
import { ValidatedInput } from './ValidatedInput';

export const AVAILABLE_INTENDED_USES = [
  'Additional Radio Equipment',
  'New Radio Station',
  'Change of Equipment',
  'Storage at',
  'Others',
];

interface IntendedUseCheckboxGroupProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function IntendedUseCheckboxGroup({
  label = 'INTENDED USE OF EQUIPMENT',
  value = '',
  onChange,
  error,
  required = false,
}: IntendedUseCheckboxGroupProps) {
  const parseSelected = (valStr: string): string[] => {
    if (!valStr || valStr.trim() === '') return [];
    try {
      const parsed = JSON.parse(valStr);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // Not JSON array
    }
    return valStr.split(',').map((s) => s.trim()).filter(Boolean);
  };

  const selectedList = parseSelected(value);
  const [storageSpecify, setStorageSpecify] = useState<string>(() => {
    const storageItem = selectedList.find((s) => s.startsWith('Storage at: ') || s.startsWith('Storage at'));
    if (storageItem && storageItem.includes(':')) {
      return storageItem.substring(storageItem.indexOf(':') + 1).trim();
    }
    return '';
  });

  const [otherSpecify, setOtherSpecify] = useState<string>(() => {
    const custom = selectedList.find(
      (s) =>
        !AVAILABLE_INTENDED_USES.includes(s) &&
        !s.startsWith('Storage at') &&
        s !== 'Others'
    );
    return custom || '';
  });

  const toggleOption = (opt: string) => {
    let updated: string[];
    const isSelected =
      selectedList.includes(opt) ||
      (opt === 'Storage at' && selectedList.some((s) => s.startsWith('Storage at'))) ||
      (opt === 'Others' && selectedList.some((s) => !AVAILABLE_INTENDED_USES.includes(s) && !s.startsWith('Storage at')));

    if (isSelected) {
      if (opt === 'Storage at') {
        updated = selectedList.filter((s) => !s.startsWith('Storage at'));
        setStorageSpecify('');
      } else if (opt === 'Others') {
        updated = selectedList.filter(
          (s) => AVAILABLE_INTENDED_USES.includes(s) || s.startsWith('Storage at')
        );
        setOtherSpecify('');
      } else {
        updated = selectedList.filter((s) => s !== opt);
      }
    } else {
      if (opt === 'Storage at') {
        const item = storageSpecify.trim() ? `Storage at: ${storageSpecify.trim()}` : 'Storage at';
        updated = [...selectedList, item];
      } else if (opt === 'Others') {
        const item = otherSpecify.trim() ? `Others: ${otherSpecify.trim()}` : 'Others';
        updated = [...selectedList, item];
      } else {
        updated = [...selectedList, opt];
      }
    }
    onChange(updated.join(', '));
  };

  const handleStorageSpecifyChange = (text: string) => {
    setStorageSpecify(text);
    const nonStorage = selectedList.filter((s) => !s.startsWith('Storage at'));
    const item = text.trim() ? `Storage at: ${text.trim()}` : 'Storage at';
    onChange([...nonStorage, item].join(', '));
  };

  const handleOtherSpecifyChange = (text: string) => {
    setOtherSpecify(text);
    const standard = selectedList.filter(
      (s) => AVAILABLE_INTENDED_USES.includes(s) && s !== 'Others'
    );
    const storageItem = selectedList.find((s) => s.startsWith('Storage at'));
    const base = storageItem ? [...standard, storageItem] : standard;
    if (text.trim()) {
      onChange([...base, `Others: ${text.trim()}`].join(', '));
    } else {
      onChange([...base, 'Others'].join(', '));
    }
  };

  const isStorageSelected = selectedList.some((s) => s.startsWith('Storage at') || s === 'Storage at');
  const isOthersSelected =
    selectedList.includes('Others') ||
    selectedList.some((s) => s.startsWith('Others:') || (!AVAILABLE_INTENDED_USES.includes(s) && !s.startsWith('Storage at')));

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>
          {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
        <Text style={styles.helperText}>Select all applicable intended uses</Text>
      </View>

      <View style={styles.checkboxGrid}>
        {AVAILABLE_INTENDED_USES.map((option) => {
          const checked =
            option === 'Storage at'
              ? isStorageSelected
              : option === 'Others'
              ? isOthersSelected
              : selectedList.includes(option);

          return (
            <View key={option} style={styles.optionWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.checkboxRow, checked && styles.checkboxRowSelected]}
                onPress={() => toggleOption(option)}
              >
                <View style={[styles.checkboxSquare, checked && styles.checkboxSquareChecked]}>
                  {checked && <Icon name="check" size={13} color="#FFFFFF" />}
                </View>
                <Text style={[styles.optionText, checked && styles.optionTextChecked]}>
                  {option}
                </Text>
              </TouchableOpacity>

              {option === 'Storage at' && checked && (
                <View style={styles.specifyContainer}>
                  <ValidatedInput
                    label="Specify Storage Location / Address"
                    required
                    placeholder="Enter complete storage location/address..."
                    value={storageSpecify}
                    onChangeText={handleStorageSpecifyChange}
                  />
                </View>
              )}

              {option === 'Others' && checked && (
                <View style={styles.specifyContainer}>
                  <ValidatedInput
                    label="Please specify other intended use"
                    required
                    placeholder="Enter intended use..."
                    value={otherSpecify}
                    onChangeText={handleOtherSpecifyChange}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 16,
    gap: 12,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  headerLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    textTransform: 'uppercase',
  },
  requiredAsterisk: {
    color: COLORS.semantic.error,
  },
  helperText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    color: '#64748B',
    fontStyle: 'italic',
  },
  checkboxGrid: {
    gap: 10,
  },
  optionWrapper: {
    gap: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  checkboxRowSelected: {
    borderColor: COLORS.brand.primary,
    backgroundColor: '#F0F9FF',
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareChecked: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.brand.primary,
  },
  optionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  optionTextChecked: {
    color: '#0F172A',
    fontWeight: '600',
  },
  specifyContainer: {
    paddingLeft: 28,
    paddingTop: 4,
    paddingBottom: 4,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
    marginTop: 2,
  },
});