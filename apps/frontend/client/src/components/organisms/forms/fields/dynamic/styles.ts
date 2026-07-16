import { StyleSheet, Platform } from 'react-native';
import { RNValue as RFValue } from '@utils/formatting';

import { input } from '@styles/color';
import { Bold } from '@styles/font';

export default StyleSheet.create({
  title: {
    color: input?.text?.defaultColor,
    fontSize: RFValue(16),
    fontFamily: Bold,
    // ...Platform.select({
    //   web: {
    //     padding: 10,
    //     backgroundColor: '#F4F4F4',
    //   }
    // }),
    marginBottom: 10,
  },
  description: {
    color: input?.text?.defaultColor,
    marginBottom: 10,
  },
});