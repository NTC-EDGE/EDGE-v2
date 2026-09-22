import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { COLORS, Icon as Lucide } from '@edge/ui';
import { ChangeEmailFormData } from '../schemas/changeEmailSchema';
import { Employee } from '../data/mockEmployees';
import { changeEmailModalStyles as styles } from '../styles/changeEmailModalStyles';

interface ChangeEmployeeEmailFormFieldsProps {
  control: Control<ChangeEmailFormData>;
  employee: Employee;
}

export function ChangeEmployeeEmailFormFields({
  control,
  employee,
}: ChangeEmployeeEmailFormFieldsProps) {
  return (
    <View style={styles.modalBody}>
      {/* Target Account Summary Banner */}
      <View style={styles.accountCard}>
        <View style={styles.accountAvatar}>
          <Text style={styles.accountAvatarText}>
            {employee.firstName.charAt(0)}
            {employee.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>
            {employee.firstName} {employee.lastName}
          </Text>
          <Text style={styles.accountCurrentEmail}>
            Current: <Text style={styles.boldText}>{employee.email}</Text>
          </Text>
        </View>
      </View>

      {/* Security Notice */}
      <View style={styles.warningBox}>
        <Lucide
          name="alert-triangle"
          size={16}
          color={COLORS.semantic.warning}
          style={{ marginRight: 8, marginTop: 2 }}
        />
        <Text style={styles.warningText}>
          Changing this email will immediately update the staff member&apos;s
          Clerk login username and invalidate login with the previous address.
        </Text>
      </View>

      {/* New Email Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          New Email Address <Text style={styles.requiredStar}>*</Text>
        </Text>
        <Controller
          control={control}
          name="newEmail"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <View style={styles.inputIconWrapper}>
                <Lucide
                  name="mail"
                  size={15}
                  color={COLORS.neutral[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.inputWithIcon, error !== undefined && styles.inputError]}
                  placeholder="new.email@example.com"
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
              {error !== undefined && <Text style={styles.errorText}>{error.message}</Text>}
            </>
          )}
        />
      </View>

      {/* Confirm New Email Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Confirm New Email Address <Text style={styles.requiredStar}>*</Text>
        </Text>
        <Controller
          control={control}
          name="confirmEmail"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <View style={styles.inputIconWrapper}>
                <Lucide
                  name="check"
                  size={15}
                  color={COLORS.neutral[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.inputWithIcon, error !== undefined && styles.inputError]}
                  placeholder="Retype new email address"
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
              {error !== undefined && <Text style={styles.errorText}>{error.message}</Text>}
            </>
          )}
        />
      </View>
    </View>
  );
}
