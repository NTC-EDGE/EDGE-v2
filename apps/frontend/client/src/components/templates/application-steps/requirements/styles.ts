import {Platform,StyleSheet} from 'react-native';
import { text } from '@styles/color';
import { Bold } from '@styles/font';
import {RNValue as RFValue} from "@utils/formatting";
export default StyleSheet.create({
  uploadContainer: {
    backgroundColor: '#fff',
    ...Platform.select({
      native:{
        padding: 20,
      },
      web: {
        paddingHorizontal: 72,
        paddingVertical: 20
      }
    })

  },
  uploadLabelText: {

    fontSize: RFValue(16),
    fontFamily: Bold,
  },
  uploadContentText: {
    color: text.default,
    marginHorizontal: 15,
  },

  separator: {
    height: 15,
  },

  requiredText: {
    color: text?.error,
    fontSize: RFValue(16),
  },
});