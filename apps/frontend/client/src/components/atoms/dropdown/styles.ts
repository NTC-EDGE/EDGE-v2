import {StyleSheet,Dimensions,Platform} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { text } from '@styles/color';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  labelCol: { flexShrink: 1, marginRight: 8 },
  closeButton: {
    position: 'absolute',  // Position it in the top-right corner
    top: 10,               // Space from the top
    right: 10,             // Space from the right
    backgroundColor: 'transparent',
    padding: 8,

    zIndex: 10,
  },

  searchButton: {
    position: 'absolute',  // Position it in the top-right corner
    top: 10,               // Space from the top
    left: 10,             // Space from the right
    backgroundColor: 'transparent',
    padding: 8,

    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  modalContent: {
    marginTop: 40,  // Adjust this value to add space between the button and the content
    paddingTop: 10, // Padding from the top of the dropdown content to the close button
  },
  searchInput: {
    width: '100%',
    padding: 10,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,  // Space between search input and dropdown list
  },
  badgesRow: { flexDirection: 'row', alignItems: 'center' },
  badgeWrap: {
    marginLeft: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#1e293b',
  },
  badgeText: { fontSize: 12, color: '#fff' },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowSelected: {
    backgroundColor: '#F1F5F9',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
  },
  placeholder: {
    width: '90%',
  },
  labelText: {
    marginTop: RFValue(5),
  },
  valueText: {
    ...Platform.select({
      native:{
        marginTop: RFValue(-2),
        marginBottom: RFValue(2),
      },
      web: {
        marginTop: RFValue(-2),
      }
    })

  },
  ellipsisContainer: {
    ...Platform.select({
      native: {
        width: width / 6,
        height: width / 3,
      },
      web: {
        width: (width * 0.60978835978) / 6,
        height: (width * 0.60978835978) / 3,
      }
    }),
    alignSelf: 'center',
    justifyContent: 'center',
  },
  emptyListContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyListText: {
    color: text?.default
  },
});
