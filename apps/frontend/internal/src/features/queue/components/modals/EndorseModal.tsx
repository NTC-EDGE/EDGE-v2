import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, ConfirmationModal, useTheme, Icon as Lucide } from '@edge/ui';
import { UserRole } from '../../../shell/context/RoleContext';

type EndorseIcon = 'briefcase' | 'award' | 'dollar-sign' | 'shield';

function isEndorseIcon(icon: string): icon is EndorseIcon {
  return ['briefcase', 'award', 'dollar-sign', 'shield'].includes(icon);
}

const ENDORSABLE_ROLES: { role: UserRole; label: string; description: string; icon: EndorseIcon }[] = [
  {
    role: 'Chief of EOD',
    label: 'Chief of EOD',
    description: 'Engineering Operations Division',
    icon: 'briefcase',
  },
  {
    role: 'Regional Director',
    label: 'Regional Director',
    description: 'Regional Office Director',
    icon: 'award',
  },
  {
    role: 'Accountant',
    label: 'Accountant',
    description: 'Accounting and Finance Department',
    icon: 'dollar-sign',
  },
  {
    role: 'Legal',
    label: 'Legal',
    description: 'Legal Affairs Division',
    icon: 'shield',
  },
];

interface EndorseModalProps {
  visible: boolean;
  applicantName: string;
  currentRole: UserRole;
  onConfirm: (targetRole: UserRole) => void;
  onCancel: () => void;
}

export function EndorseModal({ visible, applicantName, currentRole, onConfirm, onCancel }: EndorseModalProps) {
  const { colors, isDark } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const availableRoles = ENDORSABLE_ROLES.filter((r) => r.role !== currentRole);
  const canSubmit = selectedRole !== null;

  const handleConfirm = () => {
    if (selectedRole !== null) {
      onConfirm(selectedRole);
      setSelectedRole(null);
    }
  };

  const handleCancel = () => {
    setSelectedRole(null);
    onCancel();
  };

  return (
    <ConfirmationModal
      visible={visible}
      title="Endorse Application"
      variant="purple"
      confirmText={selectedRole !== null ? `Endorse to ${selectedRole}` : 'Select a Role'}
      subtitle={
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 14,
            color: isDark ? colors.neutral[400] : COLORS.neutral[500],
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          Select the designated role to endorse{' '}
          <Text
            style={{
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: isDark ? colors.neutral[200] : COLORS.neutral[700],
            }}
          >
            {applicantName}
          </Text>
          &apos;s application.
        </Text>
      }
      onConfirm={() => {
        if (canSubmit) {
          handleConfirm();
        }
      }}
      onCancel={handleCancel}
    >
      <View style={styles.roleList}>
        {availableRoles.map((item) => {
          const isSelected = selectedRole === item.role;
          const iconName: EndorseIcon = isEndorseIcon(item.icon) ? item.icon : 'briefcase';
          return (
            <Pressable
              key={item.role}
              style={[
                styles.roleItem,
                {
                  borderColor: isSelected
                    ? (isDark ? colors.brand[500] : colors.brand[600])
                    : (isDark ? colors.neutral[700] : colors.neutral[200]),
                  backgroundColor: isSelected
                    ? (isDark ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF')
                    : (isDark ? colors.neutral[800] : COLORS.neutral.white),
                },
              ]}
              onPress={() => setSelectedRole(item.role)}
            >
              <View
                style={[
                  styles.roleIcon,
                  {
                    backgroundColor: isSelected
                      ? (isDark ? colors.brand[500] : colors.brand[700])
                      : (isDark ? colors.neutral[700] : colors.neutral[100]),
                  },
                ]}
              >
                <Lucide
                  name={iconName}
                  size={18}
                  color={isSelected ? COLORS.neutral.white : (isDark ? colors.neutral[300] : colors.neutral[500])}
                />
              </View>
              <View style={styles.roleInfo}>
                <Text
                  style={[
                    styles.roleLabel,
                    {
                      color: isSelected
                        ? (isDark ? colors.brand[300] : colors.brand[800])
                        : (isDark ? colors.neutral[100] : colors.neutral[800]),
                    },
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={[styles.roleDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  {item.description}
                </Text>
              </View>
              {isSelected && (
                <Lucide name="check-circle" size={18} color={isDark ? colors.brand[400] : colors.brand[700]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </ConfirmationModal>
  );
}

const styles = StyleSheet.create({
  roleList: {
    gap: SPACING[8],
    width: '100%',
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    gap: SPACING[12],
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  roleDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
});
