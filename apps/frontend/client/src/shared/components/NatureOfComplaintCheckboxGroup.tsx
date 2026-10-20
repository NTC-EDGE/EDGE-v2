import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, COLORS, TYPOGRAPHY } from '@edge/ui';
import { ValidatedInput } from './ValidatedInput';

export const DEFAULT_COMPLAINT_NATURES = [
  'Billing Complaint',
  'Spam',
  'Poor Service (Technical Service/Customer Service)',
  'Scam',
  'Fair Use',
  'Denial of Subscription Plan',
  'Others, please specify',
];

interface NatureOfComplaintCheckboxGroupProps {
  label?: string;
  value?: string;
  options?: Array<{ label: string; value: string } | string>;
  onChange: (value: string) => void;
  onOthersSpecifyChange?: (text: string) => void;
  othersSpecifyValue?: string;
  error?: string;
  required?: boolean;
}

export function NatureOfComplaintCheckboxGroup({
  label = 'Nature of Complaint',
  value = '',
  options,
  onChange,
  onOthersSpecifyChange,
  othersSpecifyValue = '',
  error,
  required = false,
}: NatureOfComplaintCheckboxGroupProps) {
  const availableOptions: string[] =
    options && options.length > 0
      ? options.map((opt) => (typeof opt === 'string' ? opt : opt.label || opt.value))
      : DEFAULT_COMPLAINT_NATURES;

  const parseSelected = (valStr: string): string[] => {
    if (!valStr || valStr.trim() === '') return [];
    try {
      const parsed: unknown = JSON.parse(valStr);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => (typeof item === 'string' ? item : String(item)));
      }
    } catch {
      // Non-JSON comma separated string
    }
    return valStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const selectedList = parseSelected(value);

  const isOthersSelected = selectedList.some(
    (s) =>
      s.toLowerCase().includes('others') ||
      s.toLowerCase().startsWith('other:') ||
      s.toLowerCase().startsWith('others:')
  );

  const [localOtherSpecify, setLocalOtherSpecify] = useState<string>(() => {
    if (othersSpecifyValue && othersSpecifyValue.trim().length > 0) {
      return othersSpecifyValue.trim();
    }
    const foundOtherItem = selectedList.find(
      (s) => s.toLowerCase().startsWith('others:') || s.toLowerCase().startsWith('other:')
    );
    if (foundOtherItem && foundOtherItem.includes(':')) {
      return foundOtherItem.substring(foundOtherItem.indexOf(':') + 1).trim();
    }
    return '';
  });

  const activeOtherText = othersSpecifyValue || localOtherSpecify;

  const toggleOption = (opt: string) => {
    const isOtherOption = opt.toLowerCase().includes('others');
    let updated: string[];

    const isCurrentlyChecked = isOtherOption
      ? isOthersSelected
      : selectedList.includes(opt);

    if (isCurrentlyChecked) {
      if (isOtherOption) {
        updated = selectedList.filter(
          (s) =>
            !s.toLowerCase().includes('others') &&
            !s.toLowerCase().startsWith('others:') &&
            !s.toLowerCase().startsWith('other:')
        );
        setLocalOtherSpecify('');
        onOthersSpecifyChange?.('');
      } else {
        updated = selectedList.filter((s) => s !== opt);
      }
    } else {
      if (isOtherOption) {
        const item = activeOtherText.trim()
          ? `Others: ${activeOtherText.trim()}`
          : 'Others, please specify';
        updated = [...selectedList, item];
      } else {
        updated = [...selectedList, opt];
      }
    }

    onChange(updated.join(', '));
  };

  const handleOtherSpecifyChange = (text: string) => {
    setLocalOtherSpecify(text);
    onOthersSpecifyChange?.(text);

    const nonOtherItems = selectedList.filter(
      (s) =>
        !s.toLowerCase().includes('others') &&
        !s.toLowerCase().startsWith('others:') &&
        !s.toLowerCase().startsWith('other:')
    );

    const newOtherEntry = text.trim() ? `Others: ${text.trim()}` : 'Others, please specify';
    const updated = [...nonOtherItems, newOtherEntry];
    onChange(updated.join(', '));
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.asterisk}>*</Text>}
        </View>
      )}

      <Text style={styles.subtext}>
        Select all applicable nature of complaints that apply to your case.
      </Text>

      <View style={styles.optionsList}>
        {availableOptions.map((opt, idx) => {
          const isOtherOption = opt.toLowerCase().includes('others');
          const isChecked = isOtherOption
            ? isOthersSelected
            : selectedList.includes(opt);

          return (
            <View key={`complaint-opt-${idx}`} style={styles.optionWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleOption(opt)}
                style={[
                  styles.optionCard,
                  isChecked && styles.optionCardChecked,
                ]}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Icon name="check" size={13} color="#FFFFFF" />}
                </View>
                <Text style={[styles.optionText, isChecked && styles.optionTextChecked]}>
                  {opt}
                </Text>
              </TouchableOpacity>

              {isOtherOption && isChecked && (
                <View style={styles.specifyContainer}>
                  <ValidatedInput
                    label="Please specify other nature of complaint"
                    required={true}
                    placeholder="Enter details of your complaint (e.g. unsolicited calls, fraudulent promo)..."
                    value={activeOtherText}
                    onChangeText={handleOtherSpecifyChange}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {error !== undefined && error.length > 0 && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  asterisk: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 14,
  },
  subtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  optionsList: {
    gap: 8,
    marginTop: 4,
  },
  optionWrapper: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  optionCardChecked: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  optionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  optionTextChecked: {
    color: '#0369A1',
    fontWeight: '600',
  },
  specifyContainer: {
    marginLeft: 32,
    marginTop: 2,
    marginBottom: 4,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});
