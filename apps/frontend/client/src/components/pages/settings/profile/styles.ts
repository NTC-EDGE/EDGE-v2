import { text } from '@styles/color';
import { Bold } from '@styles/font';
import {StyleSheet, Dimensions, Platform} from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  scrollview: {
    ...Platform.select({
      web: {

      },
      native: {  backgroundColor: '#fff',}
    }),

    padding: 15,
    paddingTop: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    ...Platform.select({
      native:{
        height: width / 4,
        width: width / 4,
      },
      default:{
        height: width / 10,
        width: width / 10,
      },
    }),

    marginLeft: 15,
    justifyContent: 'center',
  },
  imageStyle: {
    borderRadius: width / 4,
  },
  bottomView: {
    ...Platform.select({
      native:{
        height: width / 3,
      },
      default:{

      },
    }),

  },
  changePassword: {
    color: text.info,
    fontSize: 16,
    fontFamily: Bold,
    marginLeft: 5,
  }, column: {alignItems: "center"},

});
