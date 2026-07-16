import { button, text } from '@styles/color';
import { Bold } from '@styles/font';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

const imageSize = Platform.OS === 'web' ? width * .1 : width / 4;

export default StyleSheet.create({
  webRoot: {
    flex: 1,
    flexDirection: "row",      // drawer left, content right
    alignItems: "stretch",
  },  compactContainer: {
    width: '100%',                 // full-width on small screens
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  }, webRootRow: {
    flex: 1,
    flexDirection: 'row',    // sidebar + content
    minHeight: '100vh',
  },
  webRootColumn: {
    flex: 1,
    flexDirection: 'column', // stacked
    minHeight: '100vh',
  },
  rightScroll: {
    flex: 1,
    minWidth: 0,
  },
  rightScrollContent: {
    padding: 24,
  },

  webView: {},          // keep if you use it elsewhere
  flatlistWebView: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  webShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  webShadow: {
   // backgroundColor: '#f4f4f4',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    // borderRadius: 10,
  },
  webHeaderView: {
    flex: 0.3,
  },
  flatlistWebView: {
    flex: 0.8

  },
  sectionContainer: {
    ...Platform.select({
      native: {
        backgroundColor: '#fff',
      }
    }),
    padding: 20,
  },
  contentContainer: {
    marginVertical: 20,
    backgroundColor: 'red',
  },
  profileContainer: {
    alignItems: 'center',
  },
  logoutContainer: {
    paddingHorizontal: 0,
  },
  rowContainer: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  top: {
    marginTop: 20,
    paddingTop: 20,
  },
  bottom: {
    marginBottom: 20,
    paddingBottom: 20,
  },

  image: {
    height: imageSize,
    width: imageSize,
    borderRadius: imageSize,
  },
  nameText: {
    fontFamily: Bold,
    fontSize: Platform.OS === 'web' ? RFValue(12) : RFValue(20),
    marginTop: 10,
  },
  emailText: {
    color: text.default,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: button.info,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  leftTextButton: {
    marginRight: 5,
    color: '#fff',
    ...Platform.select({
      web: {
        fontFamily: Bold,
      }
    })
  },

  textSettings: {
    fontSize: Platform.OS === 'web' ? RFValue(10) : RFValue(16),
    marginLeft: 15,
  },

  separator: {
    height: 30,
    backgroundColor: '#fff',
  },
  toggleDefault: {
    transform: [{ scaleX: -1 }],
    color: '#A0A3BD',
  },
  toggleActive: {
    color: '#2863D6',
  },
});
