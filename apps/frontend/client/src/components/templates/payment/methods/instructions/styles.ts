import { StyleSheet, Dimensions } from 'react-native';
import {RNValue as RFValue} from "@utils/formatting";
import { disabledColor, defaultColor, text } from '@styles/color';
import { Bold } from '@styles/font';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  subContainer: {
    padding: 20,
  },
  flatlist: {
    padding: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: disabledColor,
    marginTop: 20,
  },

  iView: {
    marginTop: -15,
  },
  plainRow: {
    flexDirection: 'row',
  },
  separator: {
    height: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iHeaderText: {
    color: text.default,
  },
  rightView: {
    flexShrink: 1,
    marginLeft: 10
  },
  hr: {
    height: 1,
    backgroundColor: disabledColor,
    width: '250%',
  },

  bankAccountView: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bankAccountTextLabel: {
    marginTop: 20,
    color: text.default,
    fontSize: RFValue(16),
  },
  bankAccountTextValue: {
    fontSize: RFValue(20),
    color: text.primary,
    fontFamily: Bold,
    marginTop: 3,
    marginBottom: 20,
    letterSpacing: 2,
  },

  uploadContainer: {
    padding: 20,
    paddingBottom: width / 3,
  },
  fakeSeparatorView: {
    height: 20,
    backgroundColor: '#F2F2F2',
  },

  ccView: {
    marginBottom: 30,
    borderBottomWidth: 0.3,
    borderBottomColor: defaultColor,
  },
  ccHalfView: {
    width: '47%',
    marginRight: 20,
  },
  ccInputView: {
    alignItems: 'center',
  },
  ccLabel: {
    color: text.default,
  },
  input: {
    padding: 0,
    fontSize: RFValue(15),
  },
  ccIcon: {
    marginRight: 15,
  },
  safeIcon: {
    marginRight: 10,
  },
  chkbx_futureUseView: {
    marginBottom: 20,
  },
  chkbx_futureUseText: {
    color: text.default,
  },
  ccBottomView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: width * .3
  },
  ccBottomText: {
    color: text.default,
    fontSize: RFValue(12),
  },
});