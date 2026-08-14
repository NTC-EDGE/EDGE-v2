import React from "react";
import { View, ScrollView } from "react-native";
import { COLORS, RADIUS, SPACING, SkeletonLoader, useTheme } from "@edge/ui";

export function ApplicationReviewSkeleton({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
      }}
    >
      {/* Top Bar / Header Banner Skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: SPACING[16],
          paddingVertical: SPACING[12],
          borderBottomWidth: 1,
          borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING[12],
          }}
        >
          {onClose !== undefined && (
            <SkeletonLoader width={32} height={32} borderRadius={RADIUS.button} />
          )}
          <View style={{ gap: 6 }}>
            <SkeletonLoader width={240} height={20} borderRadius={4} />
            <SkeletonLoader width={140} height={13} borderRadius={4} />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING[8],
          }}
        >
          <SkeletonLoader width={80} height={28} borderRadius={14} />
          <SkeletonLoader width={80} height={28} borderRadius={14} />
        </View>
      </View>

      {/* Inner Tabs Bar Skeleton */}
      <View
        style={{
          flexDirection: "row",
          gap: SPACING[8],
          paddingHorizontal: SPACING[16],
          paddingVertical: SPACING[8],
          borderBottomWidth: 1,
          borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        }}
      >
        <SkeletonLoader width={140} height={36} borderRadius={6} />
        <SkeletonLoader width={140} height={36} borderRadius={6} />
        <SkeletonLoader width={140} height={36} borderRadius={6} />
      </View>

      {/* Content Workspace Skeleton */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING[16], gap: SPACING[16] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Overview Card */}
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
          <SkeletonLoader width={180} height={18} borderRadius={4} />
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: SPACING[12],
            }}
          >
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
          </View>
        </View>

        {/* Section 2: Applicants Roster & Record */}
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

        {/* Section 3: Form Submissions / Requirements Table */}
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
          <SkeletonLoader width={260} height={18} borderRadius={4} />
          <SkeletonLoader width="100%" height={100} borderRadius={RADIUS.card} />
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar Skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
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
