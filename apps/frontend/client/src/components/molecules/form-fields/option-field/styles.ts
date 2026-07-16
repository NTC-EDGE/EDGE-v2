import { primaryColor } from '@styles/color';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  separator: {
    height: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    borderColor: primaryColor,
  },
  container: {
    marginBottom: 15,
  },
  dynamicView: {
    marginBottom: -15,
    marginTop: 10,
  },
});