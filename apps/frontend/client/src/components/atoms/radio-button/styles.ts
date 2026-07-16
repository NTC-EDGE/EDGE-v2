import { StyleSheet } from 'react-native';
import { input } from '@styles/color';

export default StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: input.background.default,
  },
  inner: {
    backgroundColor: '#fff',
  }
});