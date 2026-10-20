import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { Select } from './Select';

interface HourAmPmInputProps {
  label?: string;
  value?: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const HOUR_OPTIONS = [
  { label: '12:00', value: '12:00' },
  { label: '01:00', value: '01:00' },
  { label: '02:00', value: '02:00' },
  { label: '03:00', value: '03:00' },
  { label: '04:00', value: '04:00' },
  { label: '05:00', value: '05:00' },
  { label: '06:00', value: '06:00' },
  { label: '07:00', value: '07:00' },
  { label: '08:00', value: '08:00' },
  { label: '09:00', value: '09:00' },
  { label: '10:00', value: '10:00' },
  { label: '11:00', value: '11:00' },
];

export function HourAmPmInput({
  label = 'Time of incident/transaction',
  value = '',
  onChangeText,
  required = false,
  error,
  disabled = false,
}: HourAmPmInputProps) {
  const parseTime = (valStr: string): { hour: string; period: 'AM' | 'PM' } => {
    if (!valStr || valStr.trim() === '') {
      return { hour: '', period: 'AM' };
    }
    const clean = valStr.trim();
    const upper = clean.toUpperCase();
    const period: 'AM' | 'PM' = upper.includes('PM') ? 'PM' : 'AM';
    const hourPart = clean.replace(/AM|PM/gi, '').trim();

    // Check if hourPart matches one of HOUR_OPTIONS
    const matchedOption = HOUR_OPTIONS.find((h) => {
      const numOnly = h.value.split(':')[0];
      return h.value === hourPart || numOnly === hourPart || `${parseInt(numOnly, 10)}:00` === hourPart;
    });

    if (matchedOption) {
      return { hour: matchedOption.value, period };
    }

    if (hourPart.length > 0) {
      return { hour: hourPart, period };
    }

    return { hour: '', period: 'AM' };
  };

  const parsed = parseTime(value);
  const [selectedHour, setSelectedHour] = useState<string>(parsed.hour);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(parsed.period);

  useEffect(() => {
    const nextParsed = parseTime(value);
    setSelectedHour(nextParsed.hour);
    setSelectedPeriod(nextParsed.period);
  }, [value]);

  const emitTime = (hour: string, period: 'AM' | 'PM') => {
    if (!hour || hour.trim() === '') {
      onChangeText('');
      return;
    }
    onChangeText(`${hour.trim()} ${period}`);
  };

  const handleHourChange = (newHour: string) => {
    setSelectedHour(newHour);
    emitTime(newHour, selectedPeriod);
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setSelectedPeriod(newPeriod);
    if (selectedHour && selectedHour.trim() !== '') {
      emitTime(selectedHour, newPeriod);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.asterisk}>*</Text>}
        </View>
      )}

      <View style={styles.controlsRow}>
        <View style={styles.hourSelectContainer}>
          <Select
            value={selectedHour}
            onValueChange={handleHourChange}
            options={HOUR_OPTIONS}
            placeholder="Select hour (e.g. 10:00)..."
            disabled={disabled}
            error={error}
          />
        </View>

        <View style={styles.periodToggleGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={disabled}
            onPress={() => handlePeriodChange('AM')}
            style={[
              styles.periodButton,
              styles.periodButtonLeft,
              selectedPeriod === 'AM' && styles.periodButtonActive,
              disabled && styles.periodButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'AM' && styles.periodButtonTextActive,
              ]}
            >
              AM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={disabled}
            onPress={() => handlePeriodChange('PM')}
            style={[
              styles.periodButton,
              styles.periodButtonRight,
              selectedPeriod === 'PM' && styles.periodButtonActive,
              disabled && styles.periodButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'PM' && styles.periodButtonTextActive,
              ]}
            >
              PM
            </Text>
          </TouchableOpacity>
        </View>
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
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  asterisk: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
  },
  hourSelectContainer: {
    flex: 1,
  },
  periodToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  periodButton: {
    paddingHorizontal: 16,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  periodButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  periodButtonRight: {},
  periodButtonActive: {
    backgroundColor: '#0284C7',
  },
  periodButtonDisabled: {
    opacity: 0.6,
  },
  periodButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
  },
});
