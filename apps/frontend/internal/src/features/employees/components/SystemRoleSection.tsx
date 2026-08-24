import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { Role } from '@edge/api';
import { fieldStyles } from '../styles/employeeFieldStyles';

interface SystemRoleSectionProps {
  role: string;
  onSelectRole: (roleName: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  roles?: Role[];
  isLoading?: boolean;
}

export function SystemRoleSection({
  role,
  onSelectRole,
  isOpen,
  onToggleOpen,
  roles = [],
  isLoading = false,
}: SystemRoleSectionProps) {
  const displayRoles = Array.from(new Set(roles.map((r) => r.name)));

  return (
    <View
      style={[
        fieldStyles.cardSection,
        { zIndex: isOpen ? 140 : 60, elevation: isOpen ? 25 : 1 },
      ]}
    >
      <View style={fieldStyles.sectionHeaderRow}>
        <Lucide
          name="shield"
          size={16}
          color={COLORS.brand[700]}
          style={{ marginRight: 8 }}
        />
        <Text style={fieldStyles.cardSectionTitle}>System Role & Access Level</Text>
      </View>

      <View
        style={[
          fieldStyles.inputGroup,
          { zIndex: isOpen ? 150 : 50, elevation: isOpen ? 30 : 1 },
        ]}
      >
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
            <Text style={fieldStyles.dropdownTriggerText}>{role || 'Select Role'}</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.brand[700]} />
          ) : (
            <Lucide
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.neutral[500]}
            />
          )}
        </Pressable>

        {isOpen && (
          <View style={[fieldStyles.dropdownMenu, SHADOWS.modal]}>
            <ScrollView
              style={{ maxHeight: 200, backgroundColor: '#FFFFFF' }}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {displayRoles.length === 0 && !isLoading ? (
                <View style={{ padding: 16 }}>
                  <Text style={fieldStyles.dropdownOptionText}>No roles available for this tenant</Text>
                </View>
              ) : (
                displayRoles.map((r) => (
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
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}
