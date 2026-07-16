import {Dimensions,Platform,StyleSheet} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

const { width , height } = Dimensions.get('window');

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    ...Platform.select({
      web:{
        backgroundColor: "#fff",
        width:"100%",
      }
    })

  },
  iconStyle: {
    color: '#fff',
    fontSize: RFValue(15),
  },
  progressContainer: {

    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  completedBr: {
    height: height * .09,
    backgroundColor: '#fff',
  },
  title:{
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    height: 74,

    paddingVertical: 24,
    paddingRight:width * 0.04,
    paddingLeft: width * 0.048,
  },

  genAppView: {
    backgroundColor: 'red',
  }

});
