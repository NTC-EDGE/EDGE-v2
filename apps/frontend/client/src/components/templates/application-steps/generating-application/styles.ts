import { StyleSheet, Dimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: width / 1.75
  },
  container: {
    marginHorizontal: width / 5,
    alignItems: 'center',
  },
  image: {
    width: width / 5,
    height: width / 5,
    marginBottom: 30,
  },
  text: {
    fontSize: RFValue(18),
    textAlign: 'center',
    marginBottom: 30,
  },
  ellipsisView: {
    width: width / 6,
  },
});