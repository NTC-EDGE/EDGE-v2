import {button, infoColor,input, lightPrimaryColor} from '@styles/color';
import {Bold} from '@styles/font';
import {Dimensions,Platform,StyleSheet} from 'react-native';
import {RNValue as RFValue} from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {

    backgroundColor: '#fff',
    ...Platform.select({
      native:{
        paddingHorizontal: RFValue(15),
      },
      web: {
        paddingHorizontal: 50,
      }
    })
  },
  tabBar: {
    padding: 15,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        width: "100%"
      }
    })
  },
  tabViewContainer4: {
    ...Platform.select({
      native:{
        minWidth: (width - 30) / 4,
        alignItems: 'center',
      },
      web: {
        paddingHorizontal: 50,
        gap: 60
       // minWidth: ((width * 0.60978835978) - 30) / 4,
        // alignItems: 'flex-start',
      }
    }),


  },
  tabViewContainerMoreThan4: {
    paddingHorizontal: 10,
    ...Platform.select({
         native: {
           alignItems: 'center',
         },
      web: {

       // alignItems: 'flex-start',
      }

    })

  },
  tabView: {
    borderBottomColor: infoColor,
    flexDirection: 'row',
  },
  bottomView: {
    ...Platform.select({
      web: {
        height: width * 0.13
      },
      native:{
        height: width
      }
    }),
  },
  headerText: {
    color: input?.text?.defaultColor,
    fontSize: RFValue(16),
    fontFamily: Bold,
    marginBottom: 10,
  },
  headerTextTouch: {
    color: infoColor,
    fontSize: RFValue(16),
    // ...Platform.select({
    //   web: {
    //     padding: 10,
    //     backgroundColor: "#F4F4F4",
    //   }
    // }),
    marginBottom: 10,
  },
  listFieldContainer: {
   backgroundColor: '#f9f9f9',
   padding: 20,
   marginBottom: 20,
   borderRadius: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerContainer2: {
    marginBottom: 15,
  },
  removeBtnContainer: {
    marginLeft: 10
  },
  addBtnContainer: {
    backgroundColor: button?.info,
    ...Platform.select({

      native:{
        height: Platform.isPad ? width * .10 :  width * .15,
        width: Platform.isPad ? width * .10 :width * .15,
        borderRadius: Platform.isPad ? width * .10 : width * .15,
      },
      web: {
        height: width * 0.04,
        width: width * 0.04,
        borderRadius: width * 0.04,
      }
    }),

    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
  },
  infoTitle: {
    color: input?.text?.defaultColor,
    fontSize: RFValue(16),
    fontFamily: Bold,
    // ...Platform.select({
    //   web: {
    //     padding: 10,
    //     backgroundColor: '#F4F4F4',
    //   }
    // }),
    marginBottom: 10,
  },
  infoMessage: {
    color: input?.text?.defaultColor,
    marginBottom: 10,
    textAlign: 'justify'
  },
  setMainView: {
    // borderWidth: 1,
    backgroundColor: lightPrimaryColor,
    paddingHorizontal: 15,
    paddingTop: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  setSubView: {
    // borderWidth: 1,
  },
});
