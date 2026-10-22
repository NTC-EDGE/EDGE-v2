import React from "react";
import { StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, TYPOGRAPHY } from "@edge/ui";
import { SectionHeaderProps, InfoRowProps } from "./reviewTypes";

export function SectionHeader({ title, rightAction }: SectionHeaderProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        sectionStyles.header,
        {
          backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      ]}
    >
      <Text style={[sectionStyles.title, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
        {title}
      </Text>
      {rightAction}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    marginVertical: SPACING[8],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

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
    <View style={[infoStyles.row, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
      <Text style={[infoStyles.label, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{label}</Text>
      {isEditing ? (
        <View style={infoStyles.editRow}>
          <TextInput
            style={[
              infoStyles.editInput,
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
              style={[infoStyles.saveBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]}
              onPress={onEditDone}
            >
              <Text style={[infoStyles.saveBtnText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
                Save
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={infoStyles.valueRow}>
          <Text style={[infoStyles.value, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
            {value}
          </Text>
          {onEdit !== undefined && (
            <Pressable onPress={onEdit}>
              <Text style={[infoStyles.editLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>
                Edit
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const infoStyles = StyleSheet.create({
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
    flexWrap: 'wrap',
    flexShrink: 1,
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
