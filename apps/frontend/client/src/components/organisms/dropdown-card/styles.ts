import {StyleSheet,Dimensions,Platform} from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLabelContainer: {
    ...Platform.select({
         native: {
           width: Platform?.isPad ? width * .65 :width * .75,
         },
        web:{
            flex: 1,   width: width * .75,
        }
    })

  },
  contentContainer: {
    marginTop: 15,
  }
});
