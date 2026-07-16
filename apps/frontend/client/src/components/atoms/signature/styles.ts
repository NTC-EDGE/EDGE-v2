import { StyleSheet, Dimensions, Platform } from 'react-native';
import { button, input, outline, text } from '@styles/color';
import { RFValue } from 'react-native-responsive-fontsize';
import { RNValue } from '@utils/formatting';

const { width } = Dimensions.get('screen');

export default StyleSheet.create({
  view: {
    ...Platform.select({
      native: {
        height: width,
      }
    }),
  },
  viewError: {
    borderWidth: 2,
    borderColor: outline?.error,
  },
  errorText: {
    fontSize:  RFValue(12),
    marginTop: 5,
    color: text?.error
  },
  webCanvas: {
  },
  webCanvasView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  webCanvasTxt: {
    fontSize: RNValue(12),
    color: text?.disabled,
  },
  webCanvasClearView: {
    backgroundColor: button?.info,
    padding: 5,
    borderRadius: 3,
    marginLeft: 15
  },
  webCanvasClearTxt: {
    fontSize: RNValue(12),
    color: '#fff'
  },
});