import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { REGIONS_LIST } from '../data/mockEmployees';
import { EmployeeFormData } from '../schemas/employeeSchema';
import { fieldStyles } from '../styles/employeeFieldStyles';

interface AssignmentSectionProps {
  control: Control<EmployeeFormData>;
  regionValue: string;
  isRegionDropdownOpen: boolean;
  onToggleRegionDropdown: () => void;
  onSelectRegion: (reg: string) => void;
  isMobile: boolean;
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
  regionValue,
  isRegionDropdownOpen,
  onToggleRegionDropdown,
  onSelectRegion,
  isMobile,
}: AssignmentSectionProps) {
  return (
    <View style={[fieldStyles.cardSection, { zIndex: 40 }]}>
      <View style={fieldStyles.sectionHeaderRow}>
        <Lucide
          name="briefcase"
          size={16}
          color={COLORS.brand[700]}
          style={{ marginRight: 8 }}
        />
        <Text style={fieldStyles.cardSectionTitle}>
          Employee Assignment & Details
        </Text>
      </View>

      {/* Row 1: Region & Level */}
      <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile]}>
        <View style={[fieldStyles.inputGroupFlex, { zIndex: 45 }]}>
          <Text style={fieldStyles.label}>
            Region <Text style={fieldStyles.requiredStar}>*</Text>
          </Text>
          <Pressable
            style={[
              fieldStyles.dropdownTrigger,
              isRegionDropdownOpen && fieldStyles.dropdownTriggerActive,
            ]}
            onPress={onToggleRegionDropdown}
          >
            <Text style={fieldStyles.dropdownTriggerText} numberOfLines={1}>
              {regionValue}
            </Text>
            <Lucide
              name={isRegionDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.neutral[500]}
            />
          </Pressable>

          {isRegionDropdownOpen && (
            <View style={[fieldStyles.dropdownMenu, SHADOWS.modal]}>
              <ScrollView style={{ maxHeight: 200 }}>
                {REGIONS_LIST.map((reg) => (
                  <Pressable
                    key={reg}
                    style={[
                      fieldStyles.dropdownOption,
                      regionValue === reg && fieldStyles.dropdownOptionActive,
                    ]}
                    onPress={() => onSelectRegion(reg)}
                  >
                    <Text
                      style={[
                        fieldStyles.dropdownOptionText,
                        regionValue === reg && fieldStyles.dropdownOptionTextActive,
                      ]}
                    >
                      {reg}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <FormTextInput
          control={control}
          name="level"
          label="Level"
          placeholder="e.g. Level II"
          required
        />
      </View>

      {/* Row 2: Title & Division */}
      <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile]}>
        <FormTextInput
          control={control}
          name="title"
          label="Title"
          placeholder="e.g. Senior Evaluator"
          required
        />
        <FormTextInput
          control={control}
          name="division"
          label="Division"
          placeholder="e.g. Licensing Division"
          required
        />
      </View>

      {/* Row 3: Position & Designation */}
      <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile]}>
        <FormTextInput
          control={control}
          name="position"
          label="Position"
          placeholder="e.g. Technical Assessor"
          required
        />
        <FormTextInput
          control={control}
          name="designation"
          label="Designation"
          placeholder="e.g. Officer-in-Charge"
        />
      </View>
    </View>
  );
}
