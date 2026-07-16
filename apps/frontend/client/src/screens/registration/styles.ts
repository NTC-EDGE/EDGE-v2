  import {StyleSheet,Dimensions,Platform} from 'react-native';
import { button, text } from '@styles/color';
import { Bold } from '@styles/font';
import {RNValue as RFValue} from "@utils/formatting";

const { height, width } = Dimensions.get('window');

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
    justifyContent: 'center',
    padding: 0,
    height: RFValue(50),
    width: RFValue(150),
  },
  keyboardAvoiding: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  boldText: {
    fontFamily: Bold
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
    width: width / 2,
  },
  outlineStyle: {
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  labelStyle: {
    fontSize: RFValue(16),
    color: text.default,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  arrowRight: {
    marginLeft: 10,
  },
  bottomView: {
    height: height * .20
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

});
