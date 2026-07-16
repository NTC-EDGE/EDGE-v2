import {StyleSheet,Dimensions,Platform} from 'react-native';
import { primaryColor, text } from '@styles/color';
import { Bold } from '@styles/font';
import { RNValue } from '@utils/formatting';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...Platform.select({
      native: {
        padding: 15,
      },
      web:{
        paddingHorizontal: 64,
        paddingVertical: 15
      }
    })
  },
  flatlistFooterContainer: {
    paddingTop: 20,
    paddingBottom: width / 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkbox: {
    borderColor: primaryColor,
    marginRight: 5,
  },
  text: {
    color: text.default,
  },
  separator: {
    height: 20,
  },
  footer: {
    height: width / 2
  },
  reqHeaderView: {
    marginTop: 20,
    marginBottom: 5,
  },
  reqHeaderView2: {
    marginBottom: 5,
  },
  reqHeaderTitle: {
    fontFamily: Bold,
    fontSize: RNValue(16),
  },
  reqDesc: {
    fontSize: RNValue(12),
    color: text?.default,
    textAlign: 'justify',
    marginHorizontal: 15,
  },
  reqEmptyText: {
    marginHorizontal: 0,
  },
  requiredText: {
    color: text?.error,
    fontSize: Platform.OS === 'web' ? RFValue(8) : RFValue(16),
  }
});