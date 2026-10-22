import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@edge/ui';

export const fieldStyles = StyleSheet.create({
  cardSection: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    gap: SPACING[16],
    position: 'relative',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingBottom: 10,
  },
  cardSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formGridRow: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  formGridRowMobile: {
    flexDirection: 'column',
    gap: SPACING[16],
  },
  inputGroup: {
    position: 'relative',
    gap: 6,
  },
  inputGroupFlex: {
    flex: 1,
    position: 'relative',
    gap: 6,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  requiredStar: {
    color: COLORS.semantic.error,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  inputIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    height: 42,
    paddingHorizontal: SPACING[12],
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    height: '100%',
    padding: 0,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  inputError: {
    borderColor: COLORS.semantic.error,
    backgroundColor: COLORS.semantic.errorBg,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    height: 42,
    paddingHorizontal: 14,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownTriggerActive: {
    borderColor: COLORS.brand[700],
  },
  dropdownValueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadgeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownTriggerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[900],
  },
  dropdownMenu: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    maxHeight: 220,
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 25,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  dropdownOption: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.brand[500],
  },
  dropdownOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
  },
  dropdownOptionTextActive: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
