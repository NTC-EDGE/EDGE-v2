import { StyleSheet, Dimensions, Platform } from 'react-native';
import { input, outline, text } from '@styles/color';
import { Bold } from '@styles/font';
import { RNValue as RFValue, RNValue } from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  /** Backdrop & Card **/
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 800,
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },

  /** Cropper **/
  cropperContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },

  /** Controls **/
  controlsRow: {
    marginTop: 12,
    alignItems: 'stretch',
  },
  slider: {
    width: '100%',
    height: 40,
  },

  /** Buttons **/
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      web: { transitionDuration: '200ms' },
    }),
  },
  btnCancel: {
    backgroundColor: '#e0e0e0',
  },
  btnConfirm: {
    backgroundColor: '#4A90E2',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '500',
  },

  /** File Upload (extra components outside cropper) **/
  uploadContainer: {
    backgroundColor: input.background.default,
    borderRadius: 10,
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  uploadedContainer: {
    justifyContent: 'center',
    marginTop: 5,
  },
  uploadText: {
    color: text.info,
    marginLeft: 5,
  },
  uploadedText: {
    color: text.success,
    ...Platform.select({
      native: { marginTop: 5 },
      web: { marginVertical: 5 },
    }),
  },
  disabledText: {
    color: text.disabled,
  },

  /** File list **/
  fileContainer: {
    marginTop: 10,
    ...Platform.select({
      native: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      web: { padding: 10 },
    }),
  },
  fileIconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: { marginRight: 10 },
  fileTextContainer50: { width: '50%' },
  fileText: { fontFamily: Bold },
  fileXContainer: { width: '10%', alignItems: 'flex-end' },
  filePreview: {
    ...Platform.select({
      native: { height: width / 4, width: width / 4 },
      web: { height: "100%", width: "100%" },
    }),
  },
  xPreviewContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-end',
    borderRadius: 30,
    padding: 3,
    margin: 3,
  },

  /** Progress **/
  progressText: {
    color: text.default,
    marginLeft: 5,
  },
  progressBar: {
    marginTop: 10,
    ...Platform.select({
      web: { width: "100%" },
    }),
  },

  /** Misc **/
  separator: { height: 10 },
  selectionRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    ...Platform.select({
      native: { flexDirection: 'row' },
    }),
  },
  selectionSeparator: {
    height: 1,
    backgroundColor: input?.background?.default,
    margin: 15,
  },
  selectionText: { fontSize: RFValue(16) },
  selectionIcon: { color: text?.default, marginRight: 10 },
  descriptionText: {
    fontSize: RNValue(12),
    color: text?.disabled,
    marginTop: 3,
  },
});
