import {Platform,StyleSheet} from 'react-native';
import {button} from '@styles/color';
import {Bold} from '@styles/font';
import {RNValue as RFValue} from "@utils/formatting";

export default StyleSheet.create({
  container: {
    ...Platform.select({
      native: {
        position: 'absolute',
        bottom: 0,
      },
    }),
    width: "100%",
    backgroundColor: '#fff',
    padding: 20,

  },
  container2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  containerShadow: {
    ...Platform.select({
            native: {
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
              shadowOffset: { width: 0, height: -3 },
            },
      web: {

              borderTopColor: "#efefef",
        borderTopWidth: 1
      }
    }),

  },
  button: {

    ...Platform.select({
      native: {
        flex: 1,
        height: RFValue(50),
        backgroundColor: button.primary,
        borderRadius: 10,
        padding: 0,
        justifyContent: 'center',
      },
      web: {
        flex: 1,
        justifyContent: 'center',

        borderWidth: 1,
        borderRadius: 100,
        borderColor: "#efefef",
        flexWrap: 'nowrap',
      }
    }),
	},
  button2: {
    width: '47%',
  },
  buttonNotBlock: {
    alignSelf: 'center',
    width: '60%',
    borderRadius: 100,
  },
  buttonTxt: {
    ...Platform.select({
      native:{
        color:'#fff',
        fontSize:RFValue(16),
      },
      web:{

        color:'#2863D6',
        fontSize:16,
      }
    }),

    flexShrink: 0,
    fontFamily: Bold
  },
  icon: {
    color: '#fff',
    marginRight: 10,
  },
});
