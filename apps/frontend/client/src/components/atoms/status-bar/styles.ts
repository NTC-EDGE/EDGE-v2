import { StyleSheet, Platform, StatusBar } from 'react-native';

const height = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

export default StyleSheet.create({
  view: {
    width: '100%',
    height,
  },
});