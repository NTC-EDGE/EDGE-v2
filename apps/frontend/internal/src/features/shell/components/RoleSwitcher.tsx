import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useTheme, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { UserRole, ROLES } from '../context/RoleContext';

interface RoleDropdownItemProps {
  role: UserRole;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
}

function RoleDropdownItem({ role, isSelected, onSelect }: RoleDropdownItemProps) {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const hoverBg = isDark ? colors.neutral[700] : colors.neutral[50];
  const activeBg = isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.04)';
  const activeTextColor = isDark ? colors.brand[500] : colors.brand[700];
  const normalTextColor = isDark ? colors.neutral[300] : colors.neutral[700];

  return (
    <Pressable
      onPress={() => onSelect(role)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.dropdownItem,
        isSelected
          ? { backgroundColor: activeBg }
          : isHovered
            ? { backgroundColor: hoverBg }
            : null,
      ]}
    >
      <Text
        style={[
          styles.dropdownItemText,
          { color: isSelected ? activeTextColor : normalTextColor },
          isSelected && styles.dropdownItemTextActive,
        ]}
      >
        {role}
      </Text>
      {isSelected ? (
        <Lucide name="check" size={14} color={activeTextColor} />
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
  variant?: 'header' | 'sidebar' | 'dropdown';
}

export function RoleSwitcher({
  currentRole,
  onRoleSelect,
  showRoleDropdown,
  toggleRoleDropdown,
  closeRoleDropdown,
  isSwitcherHovered,
  setIsSwitcherHovered,
  variant = 'header',
}: RoleSwitcherProps) {
  const { colors, isDark } = useTheme();
  const isSidebar = variant === 'sidebar';
  const isDropdown = variant === 'dropdown';

  const textColor = (isSidebar || isDropdown)
    ? (isDark ? colors.neutral[200] : colors.neutral[700])
    : colors.neutral.white;
  const iconColor = (isSidebar || isDropdown)
    ? (isDark ? colors.neutral[400] : colors.neutral[500])
    : colors.neutral.white;
  const popoverBg = isDark ? colors.neutral[800] : colors.cardBg;

  return (
    <View style={styles.switcherContainer}>
      <Pressable
        onPress={toggleRoleDropdown}
        onHoverIn={() => setIsSwitcherHovered(true)}
        onHoverOut={() => setIsSwitcherHovered(false)}
        style={[
          styles.switcherBtn,
          (isSidebar || isDropdown)
            ? [
                styles.switcherBtnSidebar,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: colors.border,
                },
              ]
            : styles.switcherBtnHeader,
          isSwitcherHovered &&
            ((isSidebar || isDropdown)
              ? { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }
              : styles.switcherBtnHeaderHover),
        ]}
      >
        <Lucide
          name="user-check"
          size={16}
          color={iconColor}
          style={styles.switcherIcon}
        />
        <Text style={[styles.switcherText, { color: textColor }]}>
          Role: {currentRole}
        </Text>
        <Lucide
          name="chevron-down"
          size={14}
          color={iconColor}
        />
      </Pressable>

      {/* Custom Dropdown Popover */}
      {showRoleDropdown ? (
        <>
          <Pressable
            style={styles.dropdownOverlay}
            onPress={closeRoleDropdown}
          />
          <View
            style={[
              styles.dropdownPopover,
              { backgroundColor: popoverBg, borderColor: colors.border },
              isDropdown ? styles.dropdownPopoverDropdown : (isSidebar ? styles.dropdownPopoverSidebar : styles.dropdownPopoverHeader),
              SHADOWS.modal,
            ]}
          >
            <Text style={[styles.dropdownHeader, { color: colors.textMuted, borderBottomColor: colors.border }]}>Switch Active Role</Text>
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
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    ...Platform.select({
      web: {
        transition: 'all 200ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  switcherBtnHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  switcherBtnHeaderHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  switcherBtnSidebar: {},
  switcherIcon: {
    marginRight: 8,
  },
  switcherText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
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
    width: 200,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
    zIndex: 101,
  },
  dropdownPopoverHeader: {
    top: 48,
    right: 0,
  },
  dropdownPopoverSidebar: {
    bottom: 44, // Open upwards on sidebar so it doesn't run off screen
    left: 0,
    width: 252, // Adapted width to fit sidebar padding nicely
  },
  dropdownPopoverDropdown: {
    top: 44,
    left: 0,
    width: 216,
  },
  dropdownHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: 6,
    marginHorizontal: 4,
    marginBottom: 2,
    ...Platform.select({
      web: {
        transition: 'all 150ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  dropdownItemTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

