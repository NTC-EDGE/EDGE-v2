import { StyleSheet } from "react-native";
import { text } from 'src/styles/color';
import {RNValue, RNValue as RFValue} from "@utils/formatting";
import {Regular} from "@styles/font";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30
  },
  alertMessage: {
    textAlign: 'center',
    color: text.default,
  },
  contentStyle: {
    padding: 30,
  },
  actionContainerStyle: {
    justifyContent: 'space-around',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: text.default,
  },
  confirmText: {
    color: 'white',
    fontSize: 14,
  },
  cancelText: {
    color: text.default,
    fontSize: 14,
  },
  icon2 : {
    color : "rgba(207,3,39,1)" ,
    fontSize : RFValue(18)
  } ,
  logOut : {
    color : "rgba(207,3,39,1)"
  } ,
  itemContainer : {
    flexDirection : "column" ,

    borderLeftWidth : RNValue(3) ,

  } ,
  item : {
    padding : 0 ,
    marginHorizontal : 0 ,
    marginVertical : 0 ,
  } ,
  icon : {} ,
  label : {
    textAlign: "center",
    fontSize : RFValue(12 * 0.90) ,
    fontFamily : Regular
  }
});

export default styles;
