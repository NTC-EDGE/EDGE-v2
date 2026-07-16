import {StyleSheet,Dimensions,Platform} from 'react-native';
import { input, outline, text } from '@styles/color';
import { Bold } from '@styles/font';
import {RNValue as RFValue, RNValue} from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  relative: { position: 'relative', overflow: 'visible' },
  halo: {
    position: 'absolute',
    inset: -3,                 // slightly larger than the badge
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(76,175,80,0.6)', // tweak to match your success color
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  backdrop: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
  },
  previewBox: {
    width: "80%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  controlsRow: {
    marginTop: 12,
    alignItems: 'stretch',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#4A90E2',      // your primary button color
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  rawContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  disabledContainer: {
    backgroundColor: '#CCC',         // disabled bg
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',                   // default text
  },
  rawText: {
    color: '#4A90E2',
  },
  disabledText: {
    color: '#888',                   // disabled text
  },
  container: {
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    shadowOffset: { width: 0, height: 1 },
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: outline.default
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 800,          // allow it to stretch wider
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
  cropperContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 20,

  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
      native: {
        marginTop: 5,
      },
      web: {
        marginVertical: 5
      }
    }),

  },
  disabledText: {
    color: text.disabled,
  },
  fileContainer: {
    ...Platform.select({
      native: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      web: {
        padding: 10,
      },
    }),



    marginTop: 10,
  },
  fileIconTextContainer: {

    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 10,
  },
  fileTextContainer50: {
    width: '50%',
  },
  fileText: {
    fontFamily: Bold,
  },
  fileXContainer: {
    width: '10%',
    alignItems: 'flex-end',
  },
  filePreview: {
    ...Platform.select({
        native: {
          height: width / 4,
          width: width / 4,
        },
      web: {

        height: "100%",
        width: "100%",
      }
    })

  },
  xPreviewContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-end',
    borderRadius: 30,
    padding: 3,
    margin: 3,
  },
  progressText: {
    color: text.default,
    marginLeft: 5,
  },
  progressBar: {
    marginTop: 10,
    ...Platform.select({
       web: {
        // position: "absolute",
         width: "100%",
       }
    })

  },
  separator: {
    height: 10,
  },
  selectionRow: {
    ...Platform.select({
      web: {

      },
      native: {
        flexDirection: 'row',
      }
    }),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  selectionSeparator: {
    height: 1,
    backgroundColor: input?.background?.default,
    margin: 15
  },
  selectionText: {
    fontSize: RFValue(16),
  },
  selectionIcon: {
    color: text?.default,
    marginRight: 10
  },
  descriptionText: {
    fontSize: RNValue(12),
    color: text?.disabled,
    marginTop: 3,
  },



  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 6,
    borderRadius: 14,
    backgroundColor: "#fff",
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },

  thumbWrap: {
    width: 80,          // was 56
    height: 80,         // was 56
    borderRadius: 16,   // slightly bigger curve for a bigger image
    overflow: "hidden"
  },

  thumb: {
    flex: 1,
    backgroundColor: "#F2F4F7",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    height: "100%",
    width: "100%",
  },

  thumbImg: {
    borderRadius: 16,   // match thumbWrap
    resizeMode: "cover"
  },

  closeBtn: { position: "absolute", top: 6, right: 6 },
  closePill: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    padding: 4,
  },

  meta: { flex: 1, minWidth: 0 }, // allow ellipsis
  name: { fontSize: 14, fontWeight: "600", color: "#101828" },

  badgeSuccess: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#B7E3C2",
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#2E7D32" },

  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },

  fill: { flex: 1 },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  centerWrap: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  imageCard: {
    width: '100%',
    maxWidth: 720,
    height: '70%',
    backgroundColor: '#111',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },


});
