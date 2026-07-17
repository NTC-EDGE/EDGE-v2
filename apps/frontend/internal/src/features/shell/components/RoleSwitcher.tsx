import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../shared/theme/tokens';
import { UserRole, ROLES } from '../context/RoleContext';

interface RoleDropdownItemProps {
  role: UserRole;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
}

function RoleDropdownItem({ role, isSelected, onSelect }: RoleDropdownItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={() => onSelect(role)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.dropdownItem,
        isSelected && styles.dropdownItemActive,
        !isSelected && isHovered && styles.dropdownItemHover,
      ]}
    >
      <Text
        style={[
          styles.dropdownItemText,
          isSelected && styles.dropdownItemTextActive,
        ]}
      >
        {role}
      </Text>
      {isSelected ? (
        <Lucide name="check" size={14} color={COLORS.brand[700]} />
      ) : null}
    </Pressable>
  );
}

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  showRoleDropdown: boolean;
  toggleRoleDropdown: () => void;
  closeRoleDropdown: () => void;
  isSwitcherHovered: boolean;
  setIsSwitcherHovered: (hovered: boolean) => void;
}

export function RoleSwitcher({
  currentRole,
  onRoleSelect,
  showRoleDropdown,
  toggleRoleDropdown,
  closeRoleDropdown,
  isSwitcherHovered,
  setIsSwitcherHovered,
}: RoleSwitcherProps) {
  return (
    <View style={styles.switcherContainer}>
      <Pressable
        onPress={toggleRoleDropdown}
        onHoverIn={() => setIsSwitcherHovered(true)}
        onHoverOut={() => setIsSwitcherHovered(false)}
        style={[
          styles.switcherBtn,
          isSwitcherHovered && styles.switcherBtnHover,
        ]}
      >
        <Lucide
          name="user-check"
          size={16}
          color={COLORS.neutral.white}
          style={styles.switcherIcon}
        />
        <Text style={styles.switcherText}>Role: {currentRole}</Text>
        <Lucide
          name="chevron-down"
          size={14}
          color={COLORS.neutral.white}
        />
      </Pressable>

      {/* Custom Dropdown Popover */}
      {showRoleDropdown ? (
        <>
          <Pressable
            style={styles.dropdownOverlay}
            onPress={closeRoleDropdown}
          />
          <View style={[styles.dropdownPopover, SHADOWS.modal]}>
            <Text style={styles.dropdownHeader}>Switch Active Role</Text>
            {ROLES.map((role) => {
              const isSelected = currentRole === role;
              return (
                <RoleDropdownItem
                  key={role}
                  role={role}
                  isSelected={isSelected}
                  onSelect={onRoleSelect}
                />
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  switcherContainer: {
    position: 'relative',
    zIndex: 100,
  },
  switcherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  switcherBtnHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  switcherIcon: {
    marginRight: 8,
  },
  switcherText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginRight: 8,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
    zIndex: 99,
  },
  dropdownPopover: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 200,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[8],
    zIndex: 101,
  },
  dropdownHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    marginBottom: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
  },
  dropdownItemHover: {
    backgroundColor: COLORS.neutral[50],
  },
  dropdownItemActive: {
    backgroundColor: COLORS.neutral[50],
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  dropdownItemTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
