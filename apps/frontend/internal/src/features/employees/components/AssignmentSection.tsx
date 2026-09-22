import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { FieldOfficeDto } from '@edge/api';
import { EmployeeFormData } from '../schemas/employeeSchema';
import { fieldStyles } from '../styles/employeeFieldStyles';

interface AssignmentSectionProps {
  control: Control<EmployeeFormData>;
  fieldOfficeValue: string;
  isFieldOfficeDropdownOpen: boolean;
  onToggleFieldOfficeDropdown: () => void;
  onSelectFieldOffice: (fo: string) => void;
  isMobile: boolean;
  fieldOffices?: FieldOfficeDto[];
  isLoading?: boolean;
}

interface FormTextInputProps {
  control: Control<EmployeeFormData>;
  name: 'level' | 'title' | 'division' | 'position' | 'designation';
  label: string;
  placeholder: string;
  required?: boolean;
}

function FormTextInput({
  control,
  name,
  label,
  placeholder,
  required = false,
}: FormTextInputProps) {
  return (
    <View style={fieldStyles.inputGroupFlex}>
      <Text style={fieldStyles.label}>
        {label} {required && <Text style={fieldStyles.requiredStar}>*</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              style={[
                fieldStyles.input,
                error !== undefined && fieldStyles.inputError,
              ]}
              placeholder={placeholder}
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
  );
}

export function AssignmentSection({
  control,
  fieldOfficeValue,
  isFieldOfficeDropdownOpen,
  onToggleFieldOfficeDropdown,
  onSelectFieldOffice,
  isMobile,
  fieldOffices = [],
  isLoading = false,
}: AssignmentSectionProps) {
  const displayFieldOffices = fieldOffices.length > 0
    ? ['None (Unassigned)', ...Array.from(new Set(fieldOffices.map((f) => f.name)))]
    : ['None (Unassigned)', 'Regional Main Office (Central Station)', 'Cebu District Office', 'Mandaue Field Office'];

  return (
    <View
      style={[
        fieldStyles.cardSection,
        {
          zIndex: isFieldOfficeDropdownOpen ? 120 : 40,
          elevation: isFieldOfficeDropdownOpen ? 20 : 1,
        },
      ]}
    >
      <View style={fieldStyles.sectionHeaderRow}>
        <Lucide
          name="briefcase"
          size={16}
          color={COLORS.brand[700]}
          style={{ marginRight: 8 }}
        />
        <Text style={fieldStyles.cardSectionTitle}>
          Employee Assignment & Field Office Details
        </Text>
      </View>

      {/* 1. Field Office Dropdown */}
      <View
        style={[
          fieldStyles.inputGroup,
          {
            zIndex: isFieldOfficeDropdownOpen ? 130 : 50,
            elevation: isFieldOfficeDropdownOpen ? 25 : 1,
          },
        ]}
      >
        <Text style={fieldStyles.label}>
          Assigned Field Office <Text style={fieldStyles.requiredStar}>*</Text>
        </Text>
        <Pressable
          style={[
            fieldStyles.dropdownTrigger,
            isFieldOfficeDropdownOpen && fieldStyles.dropdownTriggerActive,
          ]}
          onPress={onToggleFieldOfficeDropdown}
        >
          <Text style={fieldStyles.dropdownTriggerText} numberOfLines={1}>
            {fieldOfficeValue || 'Select Field Office'}
          </Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.brand[700]} />
          ) : (
            <Lucide
              name={isFieldOfficeDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.neutral[500]}
            />
          )}
        </Pressable>

        {isFieldOfficeDropdownOpen && (
          <View style={[fieldStyles.dropdownMenu, SHADOWS.modal]}>
            <ScrollView
              style={{ maxHeight: 200, backgroundColor: '#FFFFFF' }}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {displayFieldOffices.map((fo) => {
                const isSelected = (fo === 'None (Unassigned)' && !fieldOfficeValue) || fieldOfficeValue === fo;
                return (
                  <Pressable
                    key={fo}
                    style={[
                      fieldStyles.dropdownOption,
                      isSelected && fieldStyles.dropdownOptionActive,
                    ]}
                    onPress={() => onSelectFieldOffice(fo === 'None (Unassigned)' ? '' : fo)}
                  >
                    <Text
                      style={[
                        fieldStyles.dropdownOptionText,
                        isSelected && fieldStyles.dropdownOptionTextActive,
                      ]}
                    >
                      {fo}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* 2. Position & Level */}
      <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile]}>
        <FormTextInput
          control={control}
          name="position"
          label="Position"
          placeholder="e.g. Technical Assessor"
        />
        <FormTextInput
          control={control}
          name="level"
          label="Level"
          placeholder="e.g. Level II"
        />
      </View>

      {/* 3. Title & Division */}
      <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile]}>
        <FormTextInput
          control={control}
          name="title"
          label="Title"
          placeholder="e.g. Senior Evaluator"
        />
        <FormTextInput
          control={control}
          name="division"
          label="Division"
          placeholder="e.g. Licensing Division"
        />
      </View>

      {/* 4. Designation */}
      <FormTextInput
        control={control}
        name="designation"
        label="Designation"
        placeholder="e.g. Officer-in-Charge"
      />
    </View>
  );
}
