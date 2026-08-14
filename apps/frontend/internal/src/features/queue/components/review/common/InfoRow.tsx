import React from "react";
import { StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, useTheme } from "@edge/ui";

export interface InfoRowProps {
  label: string;
  value: string;
  onEdit?: () => void;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (v: string) => void;
  onEditDone?: () => void;
  showRowSaveButton?: boolean;
}

export function InfoRow({
  label,
  value,
  onEdit,
  isEditing,
  editValue,
  onEditChange,
  onEditDone,
  showRowSaveButton = false,
}: InfoRowProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100],
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: isDark ? colors.neutral[400] : colors.neutral[500] },
        ]}
      >
        {label}
      </Text>
      {isEditing ? (
        <View style={styles.editRow}>
          <TextInput
            style={[
              styles.editInput,
              {
                color: isDark ? colors.neutral[100] : colors.neutral[900],
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                borderColor: isDark ? colors.brand[500] : colors.brand[500],
              },
            ]}
            value={editValue}
            onChangeText={onEditChange}
            onBlur={onEditDone}
          />
          {showRowSaveButton && onEditDone && (
            <Pressable
              style={[
                styles.saveBtn,
                {
                  backgroundColor: isDark ? colors.brand[500] : colors.brand[700],
                },
              ]}
              onPress={onEditDone}
            >
              <Text
                style={[
                  styles.saveBtnText,
                  {
                    color: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  },
                ]}
              >
                Save
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.valueRow}>
          <Text
            style={[
              styles.value,
              { color: isDark ? colors.neutral[100] : colors.neutral[900] },
            ]}
          >
            {value}
          </Text>
          {onEdit !== undefined && (
            <Pressable onPress={onEdit}>
              <Text
                style={[
                  styles.editLink,
                  { color: isDark ? colors.brand[500] : colors.brand[700] },
                ]}
              >
                Edit
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    width: 160,
    flexShrink: 0,
  },
  valueRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  editLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: SPACING[8],
  },
  editRow: {
    flex: 1,
    flexDirection: "row",
    gap: SPACING[8],
    alignItems: "center",
  },
  editInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
  },
  saveBtn: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  saveBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
