import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, COLORS, TYPOGRAPHY } from '@edge/ui';
import { ValidatedInput } from './ValidatedInput';

export const AVAILABLE_VAS_SERVICES = [
  'Messaging Service',
  'Audio Conferencing',
  'Audio and Video Conferencing',
  'Voice mail service',
  'Electronic mail service',
  'Information service',
  'Content and Program service',
  'Audiotext service',
  'Facsimile service',
  'Hosting service',
  'Electronic Gaming Services, except gambling',
  'Others',
];

interface VasServicesCheckboxGroupProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function VasServicesCheckboxGroup({
  label = 'VALUE ADDED SERVICE',
  value = '',
  onChange,
  error,
  required = true,
}: VasServicesCheckboxGroupProps) {
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
  const [otherSpecify, setOtherSpecify] = useState<string>(() => {
    const custom = selectedList.find((s) => !AVAILABLE_VAS_SERVICES.includes(s) && s !== 'Others');
    return custom || '';
  });

  const toggleService = (srv: string) => {
    let updated: string[];
    if (selectedList.includes(srv)) {
      updated = selectedList.filter((s) => s !== srv);
      if (srv === 'Others') {
        updated = updated.filter((s) => AVAILABLE_VAS_SERVICES.includes(s));
      }
    } else {
      updated = [...selectedList, srv];
    }
    onChange(updated.join(', '));
  };

  const handleOtherSpecifyChange = (text: string) => {
    setOtherSpecify(text);
    const standardSelected = selectedList.filter((s) => AVAILABLE_VAS_SERVICES.includes(s));
    if (text.trim()) {
      onChange([...standardSelected, text.trim()].join(', '));
    } else {
      onChange(standardSelected.join(', '));
    }
  };

  const hasOthersSelected = selectedList.includes('Others') || selectedList.some((s) => !AVAILABLE_VAS_SERVICES.includes(s));

  return (
    <View style={[styles.cardContainer, error !== undefined && error.length > 0 ? styles.cardContainerError : null]}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconCircle}>
            <Icon name="globe" size={14} color="#0F2C59" />
          </View>
          <Text style={styles.cardTitle}>
            {label} {required ? <Text style={{ color: '#EF4444' }}>*</Text> : null}
          </Text>
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{selectedList.length} SELECTED</Text>
        </View>
      </View>

      <Text style={styles.hintText}>
        Select all value-added telecommunications service offerings provided under this registration:
      </Text>

      <View style={styles.checkboxGrid}>
        {AVAILABLE_VAS_SERVICES.map((serviceName) => {
          const isSelected = selectedList.includes(serviceName) || (serviceName === 'Others' && hasOthersSelected);
          return (
            <TouchableOpacity
              key={serviceName}
              style={[styles.checkboxItem, isSelected && styles.checkboxItemSelected]}
              onPress={() => toggleService(serviceName)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxBox, isSelected && styles.checkboxBoxSelected]}>
                {isSelected && <Icon name="check" size={12} color="#FFFFFF" />}
              </View>
              <Text style={[styles.checkboxLabel, isSelected && styles.checkboxLabelSelected]}>
                {serviceName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {hasOthersSelected && (
        <View style={styles.othersSpecifyContainer}>
          <ValidatedInput
            label="Please specify other service(s)"
            placeholder="e.g. Specialized cloud IoT telemetry, API messaging..."
            value={otherSpecify}
            onChangeText={handleOtherSpecifyChange}
            required={true}
          />
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardContainerError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2C59',
  },
  badgeContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  hintText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    color: '#64748B',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: '48%',
    flexGrow: 1,
  },
  checkboxItemSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  checkboxLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  checkboxLabelSelected: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  othersSpecifyContainer: {
    marginTop: 6,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#EF4444',
  },
});
