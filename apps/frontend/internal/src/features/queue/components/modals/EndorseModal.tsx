import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { UserRole } from "../../../shell/context/RoleContext";

const ENDORSABLE_ROLES: {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Lucide>["name"];
}[] = [
  {
    role: "Chief of EOD",
    label: "Chief of EOD",
    description: "Engineering Operations Division",
    icon: "briefcase",
  },
  {
    role: "Regional Director",
    label: "Regional Director",
    description: "Regional Office Director",
    icon: "award",
  },
  {
    role: "Accountant",
    label: "Accountant",
    description: "Accounting and Finance Department",
    icon: "dollar-sign",
  },
  {
    role: "Legal",
    label: "Legal",
    description: "Legal Affairs Division",
    icon: "shield",
  },
];

interface EndorseModalProps {
  visible: boolean;
  applicantName: string;
  currentRole: UserRole;
  onConfirm: (targetRole: UserRole) => void;
  onCancel: () => void;
}

export function EndorseModal({
  visible,
  applicantName,
  currentRole,
  onConfirm,
  onCancel,
}: EndorseModalProps) {
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Lucide name="send" size={28} color={COLORS.brand[700]} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Endorse Application</Text>
              <Text style={styles.subtitle}>
                Select the role to endorse{" "}
                <Text style={styles.highlightName}>{applicantName}</Text>&apos;s
                application to.
              </Text>
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.roleList}>
            {availableRoles.map((item) => {
              const isSelected = selectedRole === item.role;
              return (
                <Pressable
                  key={item.role}
                  style={[
                    styles.roleItem,
                    isSelected && styles.roleItemSelected,
                  ]}
                  onPress={() => setSelectedRole(item.role)}
                >
                  <View
                    style={[
                      styles.roleIcon,
                      isSelected && styles.roleIconSelected,
                    ]}
                  >
                    <Lucide
                      name={item.icon}
                      size={18}
                      color={
                        isSelected ? COLORS.neutral.white : COLORS.neutral[500]
                      }
                    />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text
                      style={[
                        styles.roleLabel,
                        isSelected && styles.roleLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.roleDesc}>{item.description}</Text>
                  </View>
                  {isSelected && (
                    <Lucide
                      name="check-circle"
                      size={18}
                      color={COLORS.brand[700]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.confirmBtn,
                !canSubmit && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!canSubmit}
            >
              <Lucide name="send" size={16} color={COLORS.neutral.white} />
              <Text style={styles.confirmText}>
                Endorse to {selectedRole ?? "Select Role"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING[24],
  },
  container: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.dialog,
    padding: SPACING[24],
    width: "100%",
    maxWidth: 480,
    ...SHADOWS.modal,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING[16],
    marginBottom: SPACING[20],
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    lineHeight: 20,
  },
  highlightName: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  roleList: {
    gap: SPACING[8],
    marginBottom: SPACING[24],
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    gap: SPACING[12],
    backgroundColor: COLORS.neutral.white,
  },
  roleItemSelected: {
    borderColor: COLORS.brand[600],
    backgroundColor: "#EFF6FF",
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconSelected: {
    backgroundColor: COLORS.brand[700],
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },
  roleLabelSelected: {
    color: COLORS.brand[800],
  },
  roleDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING[12],
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[700],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[8],
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.neutral[300],
  },
  confirmText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
