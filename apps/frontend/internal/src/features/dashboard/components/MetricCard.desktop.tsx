import React, { ComponentProps } from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { TYPOGRAPHY, useTheme, Icon as Lucide, AnimatedCard } from "@edge/ui";

export type LucideIconName = ComponentProps<typeof Lucide>["name"];

export interface MetricCardProps {
  title: string;
  value: string | number;
  iconName: LucideIconName;
  iconColor: string;
  iconBgColor: string;
  trendText?: string;
  trendType?: "success" | "warning" | "error" | "info";
  delay?: number;
  style?: ViewStyle;
}

type TrendIcon = "arrow-up-right" | "arrow-down-right";

interface TrendDetails {
  bg: string;
  text: string;
  icon: TrendIcon;
  color: string;
}

export function MetricCard({
  title,
  value,
  iconName,
  iconColor,
  iconBgColor,
  trendText,
  trendType = "info",
  delay = 0,
  style,
}: MetricCardProps): React.ReactElement {
  const { colors, isDark } = useTheme();

  const getTrendInfo = (): TrendDetails => {
    switch (trendType) {
      case "success":
        return {
          bg: colors.semantic.successBg,
          text: colors.semantic.successText,
          icon: "arrow-up-right",
          color: colors.semantic.success,
        };
      case "warning":
        return {
          bg: colors.semantic.warningBg,
          text: colors.semantic.warningText,
          icon: "arrow-up-right",
          color: colors.semantic.warning,
        };
      case "error":
        return {
          bg: colors.semantic.errorBg,
          text: colors.semantic.errorText,
          icon: "arrow-down-right",
          color: colors.semantic.error,
        };
      case "info":
      default:
        return {
          bg: isDark ? colors.neutral[800] : colors.brand.light,
          text: isDark ? colors.brand.primary : colors.brand.secondary,
          icon: "arrow-up-right",
          color: isDark ? colors.brand.primary : colors.brand.secondary,
        };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <AnimatedCard delay={delay} padding={18} style={style ? { ...styles.cardWrapper, ...style } : styles.cardWrapper}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Lucide name={iconName} size={20} color={iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { color: colors.textMuted }]}>{title}</Text>
          <View style={styles.valRow}>
            <Text style={[styles.valueText, { color: colors.text }]}>{value}</Text>
            {trendText !== undefined && trendText.length > 0 ? (
              <View style={[styles.trendBadge, { backgroundColor: trendInfo.bg }]}>
                <Lucide name={trendInfo.icon} size={12} color={trendInfo.color} />
                <Text style={[styles.trendText, { color: trendInfo.text }]}>{trendText}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    minWidth: 220,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  titleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  valRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
