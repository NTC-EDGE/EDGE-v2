import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { EmployeeRole, ROLES_LIST } from '../data/mockEmployees';
import { fieldStyles } from '../styles/employeeFieldStyles';

interface SystemRoleSectionProps {
  role: EmployeeRole;
  onSelectRole: (role: EmployeeRole) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export function SystemRoleSection({
  role,
  onSelectRole,
  isOpen,
  onToggleOpen,
}: SystemRoleSectionProps) {
  return (
    <View style={[fieldStyles.cardSection, { zIndex: 60 }]}>
      <View style={fieldStyles.sectionHeaderRow}>
        <Lucide
          name="shield"
          size={16}
          color={COLORS.brand[700]}
          style={{ marginRight: 8 }}
        />
        <Text style={fieldStyles.cardSectionTitle}>System Role & Access Level</Text>
      </View>

      <View style={[fieldStyles.inputGroup, { zIndex: 50 }]}>
        <Text style={fieldStyles.label}>
          Role <Text style={fieldStyles.requiredStar}>*</Text>
        </Text>
        <Pressable
          style={[
            fieldStyles.dropdownTrigger,
            isOpen && fieldStyles.dropdownTriggerActive,
          ]}
          onPress={onToggleOpen}
        >
          <View style={fieldStyles.dropdownValueWrapper}>
            <View style={fieldStyles.roleBadgeIcon}>
              <Lucide name="user" size={13} color={COLORS.brand[700]} />
            </View>
            <Text style={fieldStyles.dropdownTriggerText}>{role}</Text>
          </View>
          <Lucide
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.neutral[500]}
          />
        </Pressable>

        {isOpen && (
          <View style={[fieldStyles.dropdownMenu, SHADOWS.modal]}>
            <ScrollView style={{ maxHeight: 200 }}>
              {ROLES_LIST.map((r) => (
                <Pressable
                  key={r}
                  style={[
                    fieldStyles.dropdownOption,
                    role === r && fieldStyles.dropdownOptionActive,
                  ]}
                  onPress={() => onSelectRole(r)}
                >
                  <Text
                    style={[
                      fieldStyles.dropdownOptionText,
                      role === r && fieldStyles.dropdownOptionTextActive,
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}
