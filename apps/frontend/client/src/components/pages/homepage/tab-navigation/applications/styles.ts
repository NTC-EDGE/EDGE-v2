import { StyleSheet, Dimensions, Platform } from 'react-native';
import { text, disabledColor, button, palette } from '@styles/color';
import { Bold } from '@styles/font';
import { RNValue as RFValue } from "@utils/formatting";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
	errorContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingVertical: 10,
	},
	helpCenterBtn: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		backgroundColor: '#1E2A78',
		borderRadius: 20,
		paddingVertical: 10,
		paddingHorizontal: 15
	},
	helpCenterText: {
		color: '#fff',
		fontSize: 14
	},
	drawerItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},
	downloadButtonContainer: {
		marginLeft: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	tabIcon: {
		marginEnd: 5,
	},
	tabText: {
		fontFamily: Bold,
		fontSize: RFValue(16),
	},

	dot: {
		marginLeft: 5,
	},

	flatlist: {
		padding: 6,
		backgroundColor: "#f8fafc"
	},
	separator: {
		height: 20,
	},
	emptyView: {
		paddingVertical: width * .15,
		backgroundColor: '#F8FAFC',
		alignItems: 'center',
		borderRadius: 24,
		borderWidth: 1.5,
		borderColor: '#E2E8F0',
		borderStyle: 'dashed',
		marginVertical: 20,
	},
	emptyViewText: {
		color: '#64748B',
		fontFamily: Bold,
		fontSize: RFValue(15),
		letterSpacing: 0.5,
	},

	dropdown: {
		backgroundColor: '#FFFFFF',
		padding: 16, // added padding here since it's a card container
	},
	cardWrapper: {
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		shadowColor: '#0F172A',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.05,
		shadowRadius: 20,
		elevation: 3,
		overflow: 'hidden',
	},
	cardTopGradient: {
		height: 4,
		width: '100%',
	},
	dropdownTitleTxt: {
		fontSize: (14),
		fontFamily: Bold,
		color: '#0F172A', // Higher contrast primary text
		letterSpacing: -0.2,
		marginBottom: 6,
	},
	dropdownDescriptionTxt: {
		fontSize: RFValue(13),
		color: '#64748B',
		marginTop: 2,
		letterSpacing: 0.1,
	},
	dropdownCompanyTxt: {
		fontFamily: Bold,
		fontSize: RFValue(14),
		color: '#334155', // Better contrast for secondary text
		marginBottom: 4,
	},
	bottomView: {
		...Platform.select(
			{
				native: {
					height: width / 3,
				},
				web: {

				}
			}
		),
		alignItems: 'center',
		justifyContent: 'center',
	},
	ellipsisViewWeb: {
		marginVertical: 30
	},

	updateContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
	},
	inActiveContainer: {
		opacity: 0.5
	},
	updateStatusContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	updateIcon: {
		marginRight: 5,
	},
	updateStatus: {
		textTransform: 'uppercase',
		fontFamily: Bold,
		fontSize: RFValue(12),
		letterSpacing: 0.8,
	},
	buttonMainContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	updateButtonContainer: {
		backgroundColor: '#2563EB',
		borderWidth: 0,
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	updateButtonTextContainer: {
		alignItems: 'center',
		marginRight: 6,
	},
	updateButtonText: {
		color: '#FFFFFF',
		fontFamily: Bold,
		fontSize: RFValue(13),
		letterSpacing: 0.2,
	},
	applicationRowContainer: {
		zIndex: 1,
		shadowColor: "rgba(0,0,0,0.1)",
		shadowOffset: {
			width: 0,
			height: 4
		},
		elevation: 30,
		shadowOpacity: 1,
		shadowRadius: 10,
		backgroundColor: '#fff',
		flexGrow: 0,
		flexShrink: 0
	},
	downloadIconContainer: {
		height: width * 0.05,
		width: width * 0.05,
		alignItems: 'center',
		justifyContent: 'center'
	},

	refreshView: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 15,
	},
	refreshText: {
		color: text?.disabled,
		marginLeft: 5,
		fontSize: RFValue(12)
	},

	selectedAppView: {
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		borderRadius: 10,
	},

	// ── Tag Badges ───────────────────────────────────────────────
	tagBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
		alignSelf: 'flex-start',
		marginTop: 0,
		borderWidth: 1,
	},
	tagBadgeSingle: {
		backgroundColor: '#F0F9FF',
		borderColor: '#BAE6FD',
	},
	tagBadgeBulk: {
		backgroundColor: '#FDF2F8',
		borderColor: '#FBCFE8',
	},
	tagText: {
		fontSize: RFValue(11),
		fontFamily: Bold,
		letterSpacing: 0.5,
		textTransform: 'uppercase',
	},
	tagTextSingle: {
		color: '#0284C7',
	},
	tagTextBulk: {
		color: '#BE185D',
	},
})
