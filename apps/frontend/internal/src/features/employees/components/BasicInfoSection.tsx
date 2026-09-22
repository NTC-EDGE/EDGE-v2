import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { COLORS, Icon as Lucide } from '@edge/ui';
import { EmployeeFormData } from '../schemas/employeeSchema';
import { fieldStyles } from '../styles/employeeFieldStyles';

interface BasicInfoSectionProps {
  control: Control<EmployeeFormData>;
  isMobile: boolean;
  isEditing?: boolean;
}

export function BasicInfoSection({ control, isMobile, isEditing = false }: BasicInfoSectionProps) {
  return (
    <View style={fieldStyles.cardSection}>
      <View style={fieldStyles.sectionHeaderRow}>
        <Lucide
          name="user"
          size={16}
          color={COLORS.brand[700]}
          style={{ marginRight: 8 }}
        />
        <Text style={fieldStyles.cardSectionTitle}>Basic Information</Text>
      </View>

      {/* Row 1: Last Name & First Name */}
      <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile]}>
        <View style={fieldStyles.inputGroupFlex}>
          <Text style={fieldStyles.label}>
            Last Name <Text style={fieldStyles.requiredStar}>*</Text>
          </Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[fieldStyles.input, error !== undefined && fieldStyles.inputError]}
                  placeholder="Last Name"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={value}
                  onChangeText={onChange}
                />
                {error !== undefined && (
                  <Text style={fieldStyles.errorText}>{error.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View style={fieldStyles.inputGroupFlex}>
          <Text style={fieldStyles.label}>
            First Name <Text style={fieldStyles.requiredStar}>*</Text>
          </Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[fieldStyles.input, error !== undefined && fieldStyles.inputError]}
                  placeholder="First Name"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={value}
                  onChangeText={onChange}
                />
                {error !== undefined && (
                  <Text style={fieldStyles.errorText}>{error.message}</Text>
                )}
              </>
            )}
          />
        </View>
      </View>

      {/* Row 2: Middle Name & Suffix */}
      <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile]}>
        <View style={fieldStyles.inputGroupFlex}>
          <Text style={fieldStyles.label}>Middle Name</Text>
          <Controller
            control={control}
            name="middleName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={fieldStyles.input}
                placeholder="Middle Name"
                placeholderTextColor={COLORS.neutral[400]}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <View style={fieldStyles.inputGroupFlex}>
          <Text style={fieldStyles.label}>Suffix</Text>
          <Controller
            control={control}
            name="suffix"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={fieldStyles.input}
                placeholder="e.g. Jr., III"
                placeholderTextColor={COLORS.neutral[400]}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
      </View>

      {/* Row 3: Email */}
      <View style={fieldStyles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={fieldStyles.label}>
            Email Address <Text style={fieldStyles.requiredStar}>*</Text>
          </Text>
          {isEditing && (
            <Text style={{ fontSize: 11, color: COLORS.neutral[500], fontWeight: '500' }}>
              Managed via Change Email
            </Text>
          )}
        </View>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <View style={fieldStyles.inputIconWrapper}>
                <Lucide
                  name={isEditing ? 'lock' : 'mail'}
                  size={15}
                  color={COLORS.neutral[400]}
                  style={fieldStyles.inputIcon}
                />
                <TextInput
                  style={[
                    fieldStyles.inputWithIcon,
                    isEditing && { backgroundColor: COLORS.neutral[100], color: COLORS.neutral[600] },
                    error !== undefined && fieldStyles.inputError,
                  ]}
                  placeholder="official.email@example.com"
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isEditing}
                  value={value}
                  onChangeText={onChange}
                />
              </View>
              {error !== undefined && (
                <Text style={fieldStyles.errorText}>{error.message}</Text>
              )}
              {isEditing && (
                <Text style={{ fontSize: 11, color: COLORS.neutral[500], marginTop: 4 }}>
                  To modify this employee&apos;s primary login email in Clerk, use the &quot;Change Login Email&quot; action in the accounts list.
                </Text>
              )}
            </>
          )}
        />
      </View>
    </View>
  );
}
