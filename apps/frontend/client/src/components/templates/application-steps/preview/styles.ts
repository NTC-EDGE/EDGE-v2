import { StyleSheet, Dimensions, Platform } from 'react-native';
import { text, input, button, primaryColor, lightPrimaryColor } from '@styles/color';
import { Bold } from '@styles/font';
import { RNValue as RFValue } from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalContainer: {

    backgroundColor: "#fff",
    borderRadius: 10,
    alignSelf: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#888",
  },
  docContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorText: {
    padding: 16,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  container: {
    ...Platform.select({
      web: {
        width: "100%",
      }
    }),
    flex: 1,
    backgroundColor: '#fff',
  },
  reviewContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  reviewContainer2: {
    padding: 15,
    marginHorizontal: 5,
    marginVertical: 15,
  },
  tableContainer: {
    paddingVertical: 15,
  },
  tableHeadView: {
    backgroundColor: input.background.default,
    padding: 5,
    marginBottom: 5,
  },
  secondaryTableHeadView: {
    backgroundColor: input?.background?.lightDefault
  },
  headerText: {
    color: text.default,
  },
  boldText: {
    fontFamily: Bold,
  },
  subChildSeparator: {
    height: 1,
    backgroundColor: input.background.default,
    marginVertical: 10,
  },
  serviceText: {
    marginHorizontal: 5,
    marginTop: 5,
    textAlign: 'justify',
  },
  statusText: {
    marginLeft: 7,
    textTransform: 'uppercase',
  },

  row: {
    flexDirection: 'row',
    marginHorizontal: 5,
    marginTop: 3,
    alignItems: 'center',
  },
  rowRight: {
    flexShrink: 1,
  },
  leftText: {
    width: width / 2.5,
  },
  rightTextView: {
    flexShrink: 1,
  },
  descriptionText: {
    marginLeft: 15,
    fontSize: RFValue(13),
  },

  uploadFlatlist: {
    paddingHorizontal: 5,
    marginTop: 5,
  },
  uploadSeparatorMain: {
    height: 20,
    width: 10,
  },
  uploadSeparator: {
    height: 20,
    width: 10,
  },
  fileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fileText: {
    width: '50%',
  },
  filePreview: {
    ...Platform.select({
      native: {
        height: width / 4,
        width: width / 4,
      },
      web: {
        height: (width * 0.60978835978) / 4,
        width: (width * 0.60978835978) / 4,
      }
    })

  },

  remarksContainer: {
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 25,
  },
  remarksTitle: {
    fontSize: RFValue(14),
    fontFamily: Bold,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    marginTop: -10,
    marginLeft: 15,
  },
  remarksContent: {
    fontSize: RFValue(15),
    textAlign: 'justify',
    margin: 15,
  },

  bottomView: {
    ...Platform.select({
      web: {
        height: width * 0.01
      },
      native: {
        height: width / 3,
      }
    })

  },
  bottomViewPageOnly: {
    ...Platform.select({
      web: {
        height: width * 0.01
      },
      native: {
        height: width / 1.5
      }
    })
  },
  btnBottomView: {
    ...Platform.select({
      web: {
        height: width * 0.01
      },
      native: {
        height: width / 3,
      }
    })
  },

  webViewContainer: {
    backgroundColor: primaryColor,
    flex: 1,
  },
  webViewTab: {
    backgroundColor: button.primary,
    alignItems: 'center',
    padding: 15,
  },
  webViewTabText: {
    color: '#fff',
    fontFamily: Bold,
    fontSize: RFValue(16),
  },

  gggChildContainer: {
    marginHorizontal: 5
  },

  optionView: {
    marginVertical: 10
  },

  noteView: {
    backgroundColor: lightPrimaryColor,
    padding: 15,
    borderRadius: 10,
    marginVertical: 15
  },
  noteText: {
    textAlign: 'justify',
    color: text?.primary,
    fontFamily: Bold
  },
  bottomContainer: {
    ...Platform.select({
      native: {
        position: 'absolute',
        bottom: 0,
      },
    }),
    width: "100%",
    backgroundColor: '#fff',
    padding: 20,
  },
  ellipsisContainer: {
    ...Platform.select({
      native: {
        width: width / 5,
        height: width / 2,
      },
      web: {
        height: (width * 0.60978835978) * 0.1,
        width: (width * 0.60978835978) * 0.1
      }
    }),
    alignSelf: 'center',
    justifyContent: 'center',
  }, 
  separator: {
    height: 15,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginLeft: 8,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tagBadgeSingle: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  tagBadgeBulk: {
    backgroundColor: '#F3E8FF',
    borderColor: '#D8B4FE',
  },
  tagText: {
    fontSize: RFValue(10),
    fontFamily: Bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tagTextSingle: {
    color: '#0369A1',
  },
  tagTextBulk: {
    color: '#7E22CE',
  },

  // --- MODERN PREVIEW NEW STYLES ---
  modernHeaderContainer: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modernBadgeRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modernBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  modernBadgeText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modernRefId: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modernTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    width: '90%',
  },
  modernSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  modernSubtitleBold: {
    color: '#334155',
    fontWeight: '700',
  },
  
  // Sandbox Banner
  sandboxBanner: {
    margin: 20,
    backgroundColor: '#0F172A', // Dark Navy
    borderRadius: 12,
    padding: 16,
  },
  sandboxBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)', // Light blue tint
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  sandboxBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sandboxText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 16,
  },
  sandboxButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  sandboxButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sandboxButtonText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },

  // Roadmap Stepper
  roadmapContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepTextActive: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTextInactive: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },

  // Contextual Action Board
  actionBoardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBoardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBoardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  actionBoardContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  actionDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  actionFooter: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responsibleUnitText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Registry Parameters
  registryTable: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  registryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  registryLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  registryValue: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Checklist
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checklistName: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },
  downloadLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
});
