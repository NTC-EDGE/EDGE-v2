import { StyleSheet, Dimensions } from 'react-native';
import { primaryColor, text } from '@styles/color';
import { Bold } from '@styles/font';
import { RNValue as RFValue } from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: primaryColor,
    borderBottomWidth: 1,
    borderBottomColor: primaryColor,
  },
  iconContainer: {
    width: RFValue(50),
  },
  rightIconContainer: {
    alignItems: 'flex-end',
  },
  shadowContainer: {
    overflow: 'hidden',
    paddingBottom: 15,
    zIndex: 1,
  },
  shadow: {
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
  },
  titleContainer: {
    maxWidth: width * .70,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    color: '#fff',
    fontSize: RFValue(18),
    fontFamily: Bold,
  },
  lightTitle: {
    color: text.default,
  }
});