import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@edge/ui';

export const signatureStyles = StyleSheet.create({
  signatureRadioGrid: {
    flexDirection: 'row',
    gap: SPACING[16],
    flexWrap: 'wrap',
  },
  radioCard: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.button,
    padding: 14,
    gap: SPACING[12],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  radioCardActive: {
    borderColor: COLORS.brand[700],
    backgroundColor: COLORS.neutral[100],
  },
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterCircleActive: {
    borderColor: COLORS.brand[700],
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand[700],
  },
  radioTextWrapper: {
    flex: 1,
  },
  radioTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  radioSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.button,
    padding: SPACING[16],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 200,
  },
  uploadedFileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  uploadedFileSize: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.semantic.success,
    marginTop: 2,
  },
  uploadedFileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.brand[500],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  replaceBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  deleteFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.semantic.errorBorder,
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  deleteFileBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
  uploadPlaceholderCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.button,
    paddingVertical: 24,
    paddingHorizontal: SPACING[16],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral[50],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  uploadPlaceholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  uploadPlaceholderSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 4,
  },
});
