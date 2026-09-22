import React from "react";
import { View, ScrollView } from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, SkeletonLoader } from "@edge/ui";

export function ApplicationReviewSkeleton({ onClose }: { onClose?: () => void }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING[16],
          paddingVertical: SPACING[12],
          borderBottomWidth: 1,
          borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        }}
      >
        <View style={{ flexDirection: 'row', gap: SPACING[8] }}>
          <SkeletonLoader width={100} height={28} borderRadius={RADIUS.button} />
          <SkeletonLoader width={120} height={28} borderRadius={RADIUS.button} />
          <SkeletonLoader width={90} height={28} borderRadius={RADIUS.button} />
        </View>
        {onClose !== undefined && (
          <SkeletonLoader width={28} height={28} borderRadius={14} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING[16], gap: SPACING[16] }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            borderRadius: RADIUS.card,
            borderWidth: 1,
            borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
            padding: SPACING[16],
            gap: SPACING[12],
          }}
        >
          <SkeletonLoader width={180} height={20} borderRadius={4} />
          <SkeletonLoader width="60%" height={14} borderRadius={4} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[8], marginTop: SPACING[4] }}>
            <SkeletonLoader width={80} height={22} borderRadius={RADIUS.circle} />
            <SkeletonLoader width={120} height={22} borderRadius={RADIUS.circle} />
            <SkeletonLoader width={90} height={22} borderRadius={RADIUS.circle} />
          </View>
        </View>

        <View
          style={{
            borderRadius: RADIUS.card,
            borderWidth: 1,
            borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
            padding: SPACING[16],
            gap: SPACING[12],
          }}
        >
          <SkeletonLoader width={140} height={16} borderRadius={4} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[12] }}>
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
          </View>
        </View>

        <View
          style={{
            borderRadius: RADIUS.card,
            borderWidth: 1,
            borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
            padding: SPACING[16],
            gap: SPACING[12],
          }}
        >
          <SkeletonLoader width={220} height={18} borderRadius={4} />
          <View style={{ gap: SPACING[8] }}>
            <SkeletonLoader width="100%" height={52} borderRadius={RADIUS.card} />
            <SkeletonLoader width="100%" height={52} borderRadius={RADIUS.card} />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: SPACING[12],
          paddingHorizontal: SPACING[16],
          paddingVertical: SPACING[12],
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        }}
      >
        <SkeletonLoader width={110} height={38} borderRadius={RADIUS.button} />
        <SkeletonLoader width={130} height={38} borderRadius={RADIUS.button} />
      </View>
    </View>
  );
}
