import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, COLORS, TYPOGRAPHY } from '@edge/ui';
import { ValidatedInput } from './ValidatedInput';

export interface CheckboxOption {
  label: string;
  value: string;
}

export interface CheckboxGroupProps {
  label?: string;
  value?: string;
  options: Array<CheckboxOption | string>;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

function parseSelectedValues(valStr: string | undefined): string[] {
  if (valStr === null || valStr === undefined || valStr.trim().length === 0) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(valStr);
    if (Array.isArray(parsed)) {
      const list: string[] = [];
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (typeof item === 'string') {
          list.push(item);
        } else if (item !== null && item !== undefined) {
          list.push(String(item));
        }
      }
      return list;
    }
  } catch {
    // Not a JSON array, fall through to comma delimiter
  }
  const parts = valStr.split(',');
  const result: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const s = parts[i];
    if (s !== null && s !== undefined) {
      const trimmed = s.trim();
      if (trimmed.length > 0) {
        result.push(trimmed);
      }
    }
  }
  return result;
}

export function CheckboxGroup({
  label,
  value = '',
  options,
  onChange,
  error,
  required = false,
  disabled = false,
  helperText,
}: CheckboxGroupProps) {
  const selectedList = parseSelectedValues(value);

  const normalizedOptions: CheckboxOption[] = [];
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    if (typeof opt === 'string') {
      normalizedOptions.push({ label: opt, value: opt });
    } else if (opt !== null && opt !== undefined) {
      normalizedOptions.push(opt);
    }
  }

  const [othersSpecify, setOthersSpecify] = useState<string>(() => {
    for (let i = 0; i < selectedList.length; i++) {
      const item = selectedList[i];
      if (item.startsWith('Others:')) {
        return item.substring('Others:'.length).trim();
      }
      if (item.startsWith('Other:')) {
        return item.substring('Other:'.length).trim();
      }
    }
    return '';
  });

  const toggleOption = (opt: CheckboxOption) => {
    if (disabled) return;
    const isOthers = opt.value.toLowerCase().startsWith('other') || opt.label.toLowerCase().startsWith('other');
    const isSelected = selectedList.some(
      (s) => s === opt.value || s === opt.label || (isOthers && (s.startsWith('Others:') || s.startsWith('Other:')))
    );

    let updated: string[];
    if (isSelected) {
      updated = selectedList.filter(
        (s) => s !== opt.value && s !== opt.label && !(isOthers && (s.startsWith('Others:') || s.startsWith('Other:')))
      );
      if (isOthers) {
        setOthersSpecify('');
      }
    } else {
      if (isOthers && othersSpecify.trim().length > 0) {
        updated = [...selectedList, `Others: ${othersSpecify.trim()}`];
      } else {
        updated = [...selectedList, opt.value];
      }
    }
    onChange(updated.join(', '));
  };

  const handleOthersChange = (text: string) => {
    setOthersSpecify(text);
    const nonOthers = selectedList.filter(
      (s) => !s.toLowerCase().startsWith('other') && !s.startsWith('Others:') && !s.startsWith('Other:')
    );
    const trimmed = text.trim();
    if (trimmed.length > 0) {
      onChange([...nonOthers, `Others: ${trimmed}`].join(', '));
    } else {
      onChange([...nonOthers, 'Others'].join(', '));
    }
  };

  return (
    <View style={[styles.cardContainer, error !== undefined && error.length > 0 ? styles.cardContainerError : null]}>
      {label !== null && label !== undefined && label.trim().length > 0 ? (
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>
            {label} {required ? <Text style={styles.requiredAsterisk}>*</Text> : null}
          </Text>
          {helperText !== null && helperText !== undefined && helperText.trim().length > 0 ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : (
            <Text style={styles.helperText}>Select all applicable options</Text>
          )}
        </View>
      ) : null}

      <View style={styles.checkboxGrid}>
        {normalizedOptions.map((option, idx) => {
          const isOthers = option.value.toLowerCase().startsWith('other') || option.label.toLowerCase().startsWith('other');
          const isChecked = selectedList.some(
            (s) => s === option.value || s === option.label || (isOthers && (s.startsWith('Others:') || s.startsWith('Other:')))
          );

          return (
            <View key={`${option.value}-${idx}`} style={styles.optionWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={disabled}
                style={[
                  styles.checkboxRow,
                  isChecked ? styles.checkboxRowSelected : null,
                  disabled ? styles.checkboxRowDisabled : null,
                ]}
                onPress={() => toggleOption(option)}
              >
                <View style={[styles.checkboxSquare, isChecked ? styles.checkboxSquareChecked : null]}>
                  {isChecked ? <Icon name="check" size={13} color="#FFFFFF" /> : null}
                </View>
                <Text style={[styles.optionText, isChecked ? styles.optionTextChecked : null]}>
                  {option.label}
                </Text>
              </TouchableOpacity>

              {isOthers && isChecked ? (
                <View style={styles.specifyContainer}>
                  <ValidatedInput
                    label="Please specify"
                    required
                    placeholder="Enter details..."
                    value={othersSpecify}
                    onChangeText={handleOthersChange}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {error !== null && error !== undefined && error.length > 0 ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
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
  cardContainerError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
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
  checkboxRowDisabled: {
    opacity: 0.6,
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
