import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { SPACING, TYPOGRAPHY, useTheme } from "@edge/ui";

export interface SectionHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export function SectionHeader({ title, rightAction }: SectionHeaderProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? colors.neutral[400] : colors.neutral[500] },
        ]}
      >
        {title}
      </Text>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
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
