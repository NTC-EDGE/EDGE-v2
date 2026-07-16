import { StyleSheet, Platform } from 'react-native';
import { palette } from '@styles/color';

export default StyleSheet.create({
  view: {
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
});