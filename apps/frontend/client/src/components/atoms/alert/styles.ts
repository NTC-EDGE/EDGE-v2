import { outline, text } from '@styles/color';
import { Bold, Regular } from '@styles/font';
import { StyleSheet } from 'react-native';
import {RNValue as RFValue} from "@utils/formatting";

export default StyleSheet.create({
  alertContainerStyle: {
    backgroundColor: 'rgba(0,0,0,0.4)', // slightly darker for better focus
  },
  contentContainerStyle: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 0,
    backgroundColor: '#fff',
  },
  contentStyle: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  titleStyle: {
    fontFamily: Bold,
    fontSize: RFValue(18),
    color: '#222', // soft black
    marginBottom: 10,
    textAlign: 'center',
  },
  messageStyle: {
    fontFamily: Regular,
    fontSize: RFValue(15),
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionContainerStyle: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: outline.default,
    paddingVertical: 12,
    justifyContent: 'space-evenly',
    backgroundColor: '#fafafa',
  },
  confirmButtonStyle: {
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  cancelButtonStyle: {
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  confirmButtonTextStyle: {
    fontFamily: Bold,
    fontSize: RFValue(16),
    color: '#d9534f', // modern red for danger/logout
  },
  cancelButtonTextStyle: {
    fontFamily: Bold,
    fontSize: RFValue(16),
    color: '#007aff', // iOS blue feel
  },
});
