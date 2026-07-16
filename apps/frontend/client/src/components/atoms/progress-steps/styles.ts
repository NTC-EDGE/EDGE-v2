import {StyleSheet,Dimensions,Platform} from 'react-native';
import {RNValue} from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  flatlist: {
    alignItems: 'center',
  },
  progress: {
    ...Platform.select({
         native: {
           width: RNValue(width * .07),
             marginRight: 5,
             height: RNValue(5),
         },
        web: {
             maxWidth: 30,
          width: width * 0.02,
            marginRight: 20,
            height: 8,
        }
    }),



  },
});