import { StyleSheet } from 'react-native';
import { disabledColor } from '@styles/color';

export default StyleSheet.create({
  view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: disabledColor,
  },
  viewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input_outlineStyle: {
    borderWidth: 0,
  },
  input_containerStyle: {
    width: '90%',
    paddingVertical: 0,
  },
  input_inputStyle: {
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
});