import { StyleSheet } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';

export const pdfStyles = StyleSheet.create({
  pdfContainer: {
    flex: 1,
    minHeight: 680,
    backgroundColor: '#334155',
    position: 'relative',
    zIndex: 1,
  },
  pdfLoadingBox: {
    flex: 1,
    minHeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  pdfLoadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#475569',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  pdfErrorBox: {
    flex: 1,
    minHeight: 450,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    padding: 24,
  },
  pdfErrorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    maxWidth: 400,
  },
  pdfErrorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  retryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  switchGridBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  switchGridBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#DC2626',
  },
});
