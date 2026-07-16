import { StyleSheet } from 'react-native';
import {RNValue as RFValue} from "@utils/formatting";
import { defaultColor, text } from '@styles/color';
import { Bold } from '@styles/font';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  separator: {
    height: 20,
  },
  flatlist: {
    marginTop: -15,
    padding: 20,
  },
  paymentContainerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTxt: {
    color: text.default,
    fontSize: RFValue(16),
    fontFamily: Bold,
  },
  selectedText: {
    color: text.primary
  },
  paymentDescription: {
    color: defaultColor,
    fontSize: RFValue(10),
    marginTop: 3,
  },
  paymentLogo: {
    height: RFValue(20),
    width: RFValue(30),
    marginRight: 15,
  },
});