import { input } from "@styles/color";
import { Bold } from "@styles/font";
import { Platform, StyleSheet, Dimensions } from "react-native";
import { RNValue as RFValue } from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web:   {
        width: "100%",
      },
    })
  },
  flatlist: {
    ...Platform.select({
      web:   {
        paddingHorizontal: 50,
      },
    }),
    backgroundColor: '#fff',
    padding: 20,

  },
  dropdown: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: input?.background?.default,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    shadowOffset: { width: 0, height: -3 },
    padding: 15,
    backgroundColor: '#fff',
    margin: 5,
	},
	dropdownTitleTxt: {
		fontSize: RFValue(16),
		fontFamily: Bold
	},
  separator: {
    height: 10,
  },
  title:{ borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    height: 74,
    paddingVertical: 24,
  },
  bottomContainer: {
    height: width / 3
  }
});
