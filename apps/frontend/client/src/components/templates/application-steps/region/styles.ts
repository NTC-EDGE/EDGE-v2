import {StyleSheet,Dimensions,Platform} from 'react-native';
import { infoColor, input, outline, text } from '@styles/color';
import { Bold } from '@styles/font';
import {RNValue as RFValue} from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  mainContainer: {
    ...Platform.select({
       native: {

       },
      web: {
         backgroundColor: "#fff",
         paddingHorizontal: 50
      }
    }),
    flex: 1,
  },

  subContainer: {
    backgroundColor: '#fff',
    padding: 15
  },
  dropdownContainer: {
    paddingBottom: 0,
  },
  subContainerFull: {
    flex: 1
  },
  labelText: {
    fontFamily: Bold,
    fontSize: RFValue(16),
    marginBottom: 15,
  },
  flatlist: {
    ...Platform.select({
      native:{
        marginVertical: 15,
      }
    })
  },
  scheduleContainer: {
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: outline.default,
    ...Platform.select({
      web: {
        marginRight: 15,
        //marginVertical:15,
        //marginTop:15,
      }
    }),

    padding: 10,
  },
  schedulesContainer: {
    ...Platform.select({
      native:{
        marginTop: 15,
      }
    }),

    flex: 1,
  },
  emptyListContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyListText: {
    color: text?.disabled,
    ...Platform.select({
      native: {

      },
      web: {
        fontSize: 18
      }
    })
  },
  selectedScheduleContainer: {
    ...Platform.select({
      native:{
        borderWidth: 3,
        borderColor: infoColor,
        backgroundColor: input?.background?.default,
      },
      web: {
        borderWidth: 4,
        borderColor: "#2863D6",
        backgroundColor: "#EAEDFF"
      }
    })

  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    color: text.default,
  },
  scheduleText: {
    color: text.default,
    marginLeft: 5,
    fontFamily: Bold,
    fontSize: RFValue(11),
  },
  scheduleInnerSeparator: {
    height: 10,
  },
  ellipsisContainer: {
    ...Platform.select({
      native: {
        width: width / 5,
        height: width / 2,
      },
      web: {
        height: (width * 0.60978835978) * 0.1,
        width: (width * 0.60978835978) * 0.1
      }
    }),

    alignSelf: 'center',
    justifyContent: 'center',
  },
  image: {
    ...Platform.select({
      native: {
          height: width / 3,
          width: width / 3
        },
      web: {
        height: (width * 0.60978835978) / 3,
        width: (width * 0.60978835978) / 3
      }
    })

  },
  borderContainer:{
    /*paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D1D6"*/
  },
  row:{
    shadowColor:'#000',
    shadowOpacity:0.2,
    shadowRadius:5,
    elevation:5,
    shadowOffset:{width:0,height:1},
    borderRadius:RFValue(5 *1.2),
    backgroundColor:"#FFFFFF",
    width:RFValue(145 *1.2),
    height:RFValue(35 *1.2),
    flexDirection:"row",
    position:"absolute"
  },

  footerView: {
    height: width / 2
  },
  separatorView: {
    height:  RFValue(15)
  },

  iconWrapper: {
    backgroundColor: '#e0f2fe',
    padding: 6,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }

});
