import { StyleSheet, Dimensions } from 'react-native';
import { primaryColor, defaultColor } from '@styles/color';
import { Bold } from '@styles/font';
import {RNValue as RFValue} from "@utils/formatting";

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * .15,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 50,
  },
  image: {
    height: 200,
    width: 200,
  },
  messageOne: {
    fontSize: RFValue(20),
    fontFamily: Bold,
    color: primaryColor,
    textAlign: 'center',
    marginTop: 30,
  },
  messageTwo: {
    fontSize: RFValue(16),
    color: defaultColor,
    textAlign: 'center',
    marginTop: 30,
  },
});
