import { StyleSheet, Dimensions } from 'react-native';
import { text, outline, input } from '@styles/color';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  mainContainer: {
    marginTop: -15,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 30,
  },
  container: {
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: outline.default,
    marginTop: 20,
  },

  tableHeadView: {
    backgroundColor: input.background.default,
    padding: 5,
    marginBottom: 5,
  },
  headerText: {
    color: text.default,
  },
  contentRow: {
    flexDirection: 'row',
    marginHorizontal: 5,
    marginTop: 5,
  },
  leftText: {
    width: width / 3,
    color: text.default,
  },
  rightTextView: {
    flexShrink: 1,
    marginLeft: 5,
  },

  sectionView: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  rowSignatories: {
    justifyContent: 'space-around',
    paddingVertical: 50,
  },
  signNameText: {
    textAlign: 'center',
  },
  signPositionText: {
    color: text.default,
    textAlign: 'center',
  },
  applicantImg: {
    height: width / 2.5,
    width: width / 2.5,
    borderRadius: 5,
  },
  eSignatureImg: {
    width: width / 3,
    height: width * .15,
    alignSelf: 'center',
  },
  bottomView: {
    height: width / 4
  },
});