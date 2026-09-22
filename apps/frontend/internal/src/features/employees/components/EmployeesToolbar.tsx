import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { SHADOWS, Icon as Lucide, useTheme } from '@edge/ui';
import { employeesToolbarStyles as styles } from '../styles/employeesToolbarStyles';

interface EmployeesToolbarProps {
  isMobile: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: string;
  onRoleSelect: (role: string) => void;
  roleOptions: string[];
  isRoleDropdownOpen: boolean;
  onToggleRoleDropdown: () => void;
  onCloseRoleDropdown: () => void;
}

export function EmployeesToolbar({
  isMobile,
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleSelect,
  roleOptions,
  isRoleDropdownOpen,
  onToggleRoleDropdown,
  onCloseRoleDropdown,
}: EmployeesToolbarProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.toolbarCard,
        SHADOWS.card,
        { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border },
      ]}
    >
      <View style={[styles.toolbarRow, isMobile && styles.toolbarRowMobile]}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border },
          ]}
        >
          <Lucide name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search employees by name, email, or department..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => onSearchChange('')} style={styles.clearSearchBtn}>
              <Lucide name="x" size={14} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Role Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={[styles.dropdownLabel, { color: colors.textMuted }]}>Role:</Text>
          <Pressable
            style={[
              styles.dropdownTrigger,
              { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border },
              isRoleDropdownOpen && { borderColor: isDark ? colors.brand[400] : colors.brand[700] },
            ]}
            onPress={onToggleRoleDropdown}
          >
            <Text style={[styles.dropdownTriggerText, { color: colors.text }]} numberOfLines={1}>
              {selectedRole === 'All' ? 'All Roles' : selectedRole}
            </Text>
            <Lucide
              name={isRoleDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textMuted}
            />
          </Pressable>

          {isRoleDropdownOpen && (
            <View
              style={[
                styles.dropdownMenu,
                SHADOWS.modal,
                { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border },
              ]}
            >
              <Pressable
                style={[
                  styles.dropdownOption,
                  selectedRole === 'All' && {
                    backgroundColor: isDark ? colors.brand[800] : colors.brand[500],
                  },
                ]}
                onPress={() => {
                  onRoleSelect('All');
                  onCloseRoleDropdown();
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    { color: selectedRole === 'All' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  All Roles
                </Text>
              </Pressable>
              {roleOptions.map((r) => (
                <Pressable
                  key={r}
                  style={[
                    styles.dropdownOption,
                    selectedRole === r && {
                      backgroundColor: isDark ? colors.brand[800] : colors.brand[500],
                    },
                  ]}
                  onPress={() => {
                    onRoleSelect(r);
                    onCloseRoleDropdown();
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      { color: selectedRole === r ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Reset Filters Button */}
        {(selectedRole !== 'All' || searchQuery.length > 0) && (
          <Pressable
            style={[
              styles.resetFiltersBtn,
              { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border },
            ]}
            onPress={() => {
              onRoleSelect('All');
              onSearchChange('');
              onCloseRoleDropdown();
            }}
          >
            <Lucide
              name="rotate-ccw"
              size={13}
              color={isDark ? colors.brand[400] : colors.brand[700]}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.resetFiltersText, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
              Reset
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
