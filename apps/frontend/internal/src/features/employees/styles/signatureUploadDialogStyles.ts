import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@edge/ui';

export const uploadDialogStyles = StyleSheet.create({
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[20],
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    paddingBottom: 12,
  },
  dialogTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  dialogCloseBtn: {
    padding: 4,
  },
  dialogBody: {
    gap: SPACING[16],
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.brand[700],
    borderRadius: RADIUS.button,
    paddingVertical: 28,
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
  dropzoneTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    textAlign: 'center',
  },
  dropzoneSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 4,
    textAlign: 'center',
  },
  dropzoneSpecs: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: 8,
    textAlign: 'center',
  },
  dialogDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dialogDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  dialogDividerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    marginHorizontal: SPACING[12],
  },
  dialogCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand[800],
    paddingVertical: 12,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dialogCameraBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  dialogFooter: {
    marginTop: SPACING[20],
    alignItems: 'flex-end',
  },
  dialogCancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dialogCancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
  },
});
