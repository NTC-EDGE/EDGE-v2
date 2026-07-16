import {StyleSheet,Dimensions,Platform} from 'react-native';
import { text } from '@styles/color';
import { Bold } from '@styles/font';
import {RNValue as RFValue} from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  mainHeaderContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  flatlistContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    ...Platform.select(
        {
          native: {
            flex: 1
          },
          web: {
            borderWidth: 1,
            borderColor: "#D1D1D6",
            borderRadius: 10,
            flex: 1,
            overflow: "hidden",
          }
        }
    ),
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
  },
  rightView: {
    flexShrink: 1,
    marginLeft: 5
  },
  mainHeaderText: {
    marginBottom: 10,
  },
  headerText: {
    fontFamily: Bold,
    color: '#000',
    fontSize: RFValue(16),
  },
  subText: {
    color: text.default,
    textAlign: 'justify',
  },
  indentedText: {
    marginLeft: 15,
  },
  whoMayAvailText: {
    fontFamily: Bold,
    color: text.info,
    fontSize: RFValue(16),
    marginBottom: 5,
  },
  flatlist2:{
    marginTop: 3,
  },
  separator: {
    height: 10,
  },
  separator2: {
    height: 3,
  },
  footer: {
    ...Platform.select({
      web:{

         height: width * 0.02
      },
      native: {
        height: width / 3,
      }
    })

  },
  flatlist:{
    ...Platform.select({
      web: {
        backgroundColor: "#fff", paddingHorizontal: 50
      }
    })

  }

});
