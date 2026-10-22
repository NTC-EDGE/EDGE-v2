import { StyleSheet } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';

export const signatoryStyles = StyleSheet.create({
  signatoriesRow: {
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sigBlock: {
    alignItems: 'center',
  },
  sigName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  sigRole: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
