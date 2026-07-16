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
      native: (width - 50) / 2,
    }),
    marginBottom: 15,
  },
  dropdownContainer3: {
    width: Platform.select({
      native: (width - 110) / 2,
    }),
  },
  dropdownContainer2: {
    marginTop: -5,
    marginBottom: 15,
  },
});