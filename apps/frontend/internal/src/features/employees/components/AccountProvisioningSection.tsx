import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { EmployeeFormData } from '../schemas/employeeSchema';
import { fieldStyles } from '../styles/employeeFieldStyles';

interface AccountProvisioningSectionProps {
  control: Control<EmployeeFormData>;
  isMobile: boolean;
  provisioningMethod: 'email' | 'manual';
  onSelectMethod: (method: 'email' | 'manual') => void;
}

export function AccountProvisioningSection({
  control,
  isMobile,
  provisioningMethod,
  onSelectMethod,
}: AccountProvisioningSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={fieldStyles.cardSection}>
      <View style={fieldStyles.sectionHeaderRow}>
        <Lucide
          name="user-plus"
          size={16}
          color={COLORS.brand[700]}
          style={{ marginRight: 8 }}
        />
        <Text style={fieldStyles.cardSectionTitle}>Account Creation & Signup Method</Text>
      </View>

      {/* Provisioning Mode Cards */}
      <View style={[styles.methodCardsRow, isMobile && styles.methodCardsRowMobile]}>
        {/* Option 1: Email Invitation */}
        <Pressable
          style={[
            styles.methodCard,
            provisioningMethod === 'email' && styles.methodCardSelected,
          ]}
          onPress={() => onSelectMethod('email')}
        >
          <View style={styles.cardHeaderFlex}>
            <View
              style={[
                styles.methodIconBox,
                provisioningMethod === 'email' && styles.methodIconBoxSelected,
              ]}
            >
              <Lucide
                name="mail"
                size={18}
                color={
                  provisioningMethod === 'email'
                    ? COLORS.brand[700]
                    : COLORS.neutral[600]
                }
              />
            </View>
            <View
              style={[
                styles.radioCircle,
                provisioningMethod === 'email' && styles.radioCircleSelected,
              ]}
            >
              {provisioningMethod === 'email' && <View style={styles.radioInnerDot} />}
            </View>
          </View>

          <Text style={styles.methodCardTitle}>Send Email Invitation</Text>
          <Text style={styles.methodCardSubtitle}>
            Clerk sends an official onboarding email link for the employee to set their password.
          </Text>
        </Pressable>

        {/* Option 2: Manual Provisioning */}
        <Pressable
          style={[
            styles.methodCard,
            provisioningMethod === 'manual' && styles.methodCardSelected,
          ]}
          onPress={() => onSelectMethod('manual')}
        >
          <View style={styles.cardHeaderFlex}>
            <View
              style={[
                styles.methodIconBox,
                provisioningMethod === 'manual' && styles.methodIconBoxSelected,
              ]}
            >
              <Lucide
                name="key"
                size={18}
                color={
                  provisioningMethod === 'manual'
                    ? COLORS.brand[700]
                    : COLORS.neutral[600]
                }
              />
            </View>
            <View
              style={[
                styles.radioCircle,
                provisioningMethod === 'manual' && styles.radioCircleSelected,
              ]}
            >
              {provisioningMethod === 'manual' && <View style={styles.radioInnerDot} />}
            </View>
          </View>

          <Text style={styles.methodCardTitle}>Manual Account Setup</Text>
          <Text style={styles.methodCardSubtitle}>
            Directly create staff account credentials without waiting for email delivery.
          </Text>
        </Pressable>
      </View>

      {/* Manual Password Input (shown only when manual provisioning is selected) */}
      {provisioningMethod === 'manual' && (
        <View style={styles.manualPasswordContainer}>
          <Text style={fieldStyles.label}>
            Initial Password <Text style={styles.optionalNote}>(Optional - leave blank for auto-generated password)</Text>
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={fieldStyles.inputIconWrapper}>
                <Lucide
                  name="lock"
                  size={15}
                  color={COLORS.neutral[400]}
                  style={fieldStyles.inputIcon}
                />
                <TextInput
                  style={fieldStyles.inputWithIcon}
                  placeholder="e.g. TempPass@123 (or auto-generates NtcStaff_XXXXX!)"
                  placeholderTextColor={COLORS.neutral[400]}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={value ?? ''}
                  onChangeText={onChange}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeButton}
                  accessibilityLabel="Toggle password visibility"
                >
                  <Lucide
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={16}
                    color={COLORS.neutral[500]}
                  />
                </Pressable>
              </View>
            )}
          />
          <Text style={styles.helperText}>
            If left blank, a secure temporary password will be generated automatically.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  methodCardsRow: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  methodCardsRowMobile: {
    flexDirection: 'column',
    gap: SPACING[12],
  },
  methodCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    gap: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      },
    }),
  },
  methodCardSelected: {
    borderColor: COLORS.brand[700],
    backgroundColor: COLORS.brand.light,
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  methodIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconBoxSelected: {
    backgroundColor: COLORS.brand[100],
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.brand[700],
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand[700],
  },
  methodCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  methodCardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.neutral[600],
  },
  manualPasswordContainer: {
    marginTop: 4,
    gap: 6,
  },
  optionalNote: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.regular,
    color: COLORS.neutral[500],
  },
  helperText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  eyeButton: {
    padding: 4,
  },
});
