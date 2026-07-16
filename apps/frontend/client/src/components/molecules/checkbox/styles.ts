import { StyleSheet, Dimensions } from 'react-native';
import { disabledColor, text } from '@styles/color';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
	view: {
		flexDirection: 'row',
    alignItems: 'center',
	},
	textContainer: {
		flexShrink: 1,
		marginLeft: 10,
		width: width * .8
	},
	highlightedText: {
		color: text.info,
	},
	checkbox: {
		borderColor: disabledColor,
	},
});