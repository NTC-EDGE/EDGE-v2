import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { disabledColor, text } from '@styles/color';
import { Bold, Regular } from '@styles/font';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  flatlist: {
    flex: 1,
    marginTop: -15,
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 50,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 5,
  },
  rowBottom: {
    justifyContent: 'flex-end',
  },
  headerView: {
    padding: 5,
  },
  mainHeaderView: {
    backgroundColor: disabledColor,
    padding: 5,
    marginBottom: 20
  },
  text: {
    color: text.default,
  },
  leftText: {
    maxWidth: '70%',
  },
  textHeader: {
    textAlign: 'center',
    fontFamily: Bold,
  },
  descriptionText: {
    marginLeft: 5,
    fontSize: RFValue(10),
  },
  bottomLeftText: {
    marginRight: 15,
    fontFamily: Regular,
  },
  separator: {
    height: 0.5,
    backgroundColor: disabledColor,
    marginTop: 5,
  },

  bar: {
    height: 1,
    width: '100%',
    backgroundColor: disabledColor,
    marginTop: 10,
  },

  pmView: {
    backgroundColor: '#fff',
    padding: 20
  },
  pmTxt: {
    color: text?.default,
  },
  pmText: {
    fontFamily: Bold,
  }
});
