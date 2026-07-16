import {StyleSheet, Dimensions, Platform} from 'react-native';
import { text } from '@styles/color';
import {RNValue as RFValue} from "@utils/formatting";

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
	scroll: {
		maxHeight: Math.min(height * 0.3, 640), // keep modal compact on small screens
	},
	contentContainer: {
		marginHorizontal: 20,
	},
	text: {
		color: text.default,
		textAlign: 'justify',
		fontSize: RFValue(16),
	},
	coloredText: {
		color: text.info,
		fontSize: RFValue(18),
	},
	checkboxLabel: {
		fontSize: RFValue(18),
	},
	bottomView: {
		...Platform.select(
			{
				native: {
					height: RFValue(50),
				},
			}
		)


	}
});
