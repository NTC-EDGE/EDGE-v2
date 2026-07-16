import {Platform,StyleSheet} from 'react-native';
import { primaryColor } from '@styles/color';
import { Bold } from '@styles/font';
import { RFValue } from 'react-native-responsive-fontsize';

export default StyleSheet.create({
	detailContainer: {
		flex: 1,
		backgroundColor: "#fff",
	},
	detailHeader: {
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	detailTitle: {
		fontSize: 18,
		fontWeight: "700",
	},
	detailSubtitle: {
		fontSize: 14,
		color: "#555",
		marginTop: 4,
	},
	detailTag: {
		marginTop: 6,
		fontSize: 12,
		color: "#888",
	},
	section: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: "700",
		marginBottom: 4,
	},
	sectionText: {
		fontSize: 13,
		color: "#444",
	},

	container: {
			...Platform.select({
				web: {
					flex: 1
				}
			}),
		backgroundColor: primaryColor,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 20,
		marginHorizontal: 20,
	},
	dotIcon: {

	},
	safearea: {

		backgroundColor: primaryColor,
	},
	exitGuestText: {
		backgroundColor: primaryColor,
		padding: 15,
		fontFamily: Bold,
		color: '#fff',
		fontSize: Platform.select({
			ios: RFValue(18),
			android: RFValue(18),
			native: RFValue(18),
		 	default: RFValue(18),
			web: RFValue(10)
		}),
		textAlign: 'center',
	},
});
