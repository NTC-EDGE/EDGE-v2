import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, useTheme } from '@edge/ui';

interface EmployeesPaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function EmployeesPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPrevPage,
  onNextPage,
}: EmployeesPaginationProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.bottomPagination,
        SHADOWS.card,
        { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.paginationText, { color: colors.textMuted }]}>
        Showing <Text style={[styles.boldText, { color: colors.text }]}>{startIndex + 1}</Text> to{' '}
        <Text style={[styles.boldText, { color: colors.text }]}>{endIndex}</Text> of{' '}
        <Text style={[styles.boldText, { color: colors.text }]}>{totalItems}</Text> employees (Page{' '}
        {currentPage} of {totalPages})
      </Text>

      <View style={styles.paginationActions}>
        <Pressable
          disabled={currentPage <= 1}
          onPress={onPrevPage}
          style={[
            styles.pageBtn,
            { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border },
            currentPage <= 1 && styles.pageBtnDisabled,
          ]}
        >
          <Lucide
            name="chevron-left"
            size={16}
            color={currentPage > 1 ? colors.text : colors.textMuted}
          />
          <Text
            style={[
              styles.pageBtnText,
              { color: colors.text },
              currentPage <= 1 && styles.pageBtnTextDisabled,
            ]}
          >
            Previous
          </Text>
        </Pressable>

        <Pressable
          disabled={currentPage >= totalPages}
          onPress={onNextPage}
          style={[
            styles.pageBtn,
            { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border },
            currentPage >= totalPages && styles.pageBtnDisabled,
          ]}
        >
          <Text
            style={[
              styles.pageBtnText,
              { color: colors.text },
              currentPage >= totalPages && styles.pageBtnTextDisabled,
            ]}
          >
            Next
          </Text>
          <Lucide
            name="chevron-right"
            size={16}
            color={currentPage < totalPages ? colors.text : colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    marginTop: SPACING[8],
    marginBottom: SPACING[8],
    flexWrap: 'wrap',
    gap: SPACING[12],
    zIndex: 1,
  },
  paginationText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  paginationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 7,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    gap: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  pageBtnDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.neutral[50],
  },
  pageBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },
  pageBtnTextDisabled: {
    color: COLORS.neutral[400],
  },
});
