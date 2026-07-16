import { StyleSheet, Platform, Dimensions } from "react-native";
import { RNValue as RFValue } from "@utils/formatting";
import { input, outline, primaryColor, palette } from "./color";
import { Bold, Regular } from "./font";

const { text, background } = input;

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  mainContainer: {
    marginBottom: RFValue(20),
  },
  separator: {
    height: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    borderColor: primaryColor,
  },
  container: {
    marginBottom: 15,
  },
  dynamicView: {
    marginBottom: -15,
    marginTop: 10,
  },
  container: {
    backgroundColor: background?.default,
    borderColor: palette.border,
    borderWidth: RFValue(1),
    borderRadius: RFValue(12),
    paddingHorizontal: RFValue(15),
    height: RFValue(54),
    justifyContent: "center",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownContainer: {
    paddingHorizontal: RFValue(15),
  },
  dropdownListContainer: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: outline.default,
    alignSelf: "center",
    padding: 10,
    width: width - 30,
    maxHeight: width * 0.6,
  },
  dropdownElementContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
  },
  labelContainer: {
    flexDirection: "row",
    padding: 0,
  },
  headerLabelText: {
    color: text?.defaultColor,
    fontSize: RFValue(16),
    fontFamily: Bold,
  },
  labelText: {
    color: text?.defaultColor,
    fontSize: RFValue(12),
  },

  requiredText: {
    color: text?.errorColor,
  },
  validationText: {
    color: "#9CA3AF",
    fontSize: RFValue(12),
    marginTop: 5,
    marginLeft: 5,
  },
  validationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  validationIconContainer: {
    marginLeft: 5,
    marginTop: 5,
  },
  validationTextError: {
    marginLeft: 4,
  },
  placeholderText: {
    color: text?.defaultColor,
    fontFamily: Regular,
    fontSize: RFValue(14),
  },
  inputText: {
    fontSize: RFValue(12),
    paddingHorizontal: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 0,
      },
      android: {
        paddingVertical: -100,
      },
      default: {
        paddingVertical: 0,
      },
    }),
    marginVertical: -3,
    color: text?.mainColor,
    fontFamily: Regular,
    fontWeight: "normal",
    marginTop: -3,
  },
  iconStyle: {
    height: RFValue(20),
    width: RFValue(20),
  },
  input: {
    padding: 10,
    width: "100%",
    backgroundColor: "transparent",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
    paddingVertical: Platform.OS === "android" ? 5 : 10,
    fontFamily: Regular,
    color: "#000",
  },
});
