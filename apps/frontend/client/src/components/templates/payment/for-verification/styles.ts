import {StyleSheet, Dimensions, Platform} from 'react-native';
import {RNValue as RFValue} from "@utils/formatting";
import { primaryColor } from '@styles/color';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
      ...Platform.select({
          web:{
                justifyContent: "center"
          }
      })
  },
  image: {
    height: 100,
    width: 100,

    marginBottom: 30,
    ...Platform.select({
     native:{
       marginTop: width * .4
     },
    })

  },
  txt: {
    color: primaryColor,
    fontSize: RFValue(20),
    textAlign: 'center',
  },
});
