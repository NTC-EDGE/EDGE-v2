import { button, text } from '@styles/color';
import { Bold } from '@styles/font';
import { StyleSheet } from 'react-native';
import {RNValue as RFValue} from "@utils/formatting";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 10,
    padding: 20,
    paddingBottom: 0,
    alignItems: 'flex-end',
  },
  scrollview: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  description: {
    paddingVertical: 15,
    marginBottom: 30,
  },
  button: {
    borderRadius: 10,
    backgroundColor: button.primary,
    marginHorizontal: 20,
    padding: 0,
    height: RFValue(50),
    justifyContent: 'center',
  },
  keyboardAvoiding: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  boldText: {
    fontFamily: Bold,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    paddingBottom: 15,
  },
  input: {
    letterSpacing: 10,
    fontSize: RFValue(40),
    paddingHorizontal: 0,
    fontFamily: Bold,
    color: text.default,
  },
  outlineStyle: {
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  labelStyle: {
    fontSize: 14,
    color: text.default,
  },
  
});