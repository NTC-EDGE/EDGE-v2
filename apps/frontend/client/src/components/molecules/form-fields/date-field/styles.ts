import {StyleSheet,Dimensions,Platform} from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  view: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -5
  },
  dropdownContainer: {
    width: Platform.select({
      native: (width - 45) / 2,
    }),
  },
  dropdownContainer3: {
    width: Platform.select({
      native: (width - 105) / 2,
    }),
  },
  dropdownContainer2: {
    marginTop: -5,
    marginBottom: 15,
  },
});