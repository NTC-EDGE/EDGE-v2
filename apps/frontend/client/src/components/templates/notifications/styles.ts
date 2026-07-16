import { disabledColor, text } from '@styles/color';
import { Bold } from '@styles/font';
import { RNValue } from '@utils/formatting';
import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  separator: {
		height: 15,
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
  emptyView: {
		paddingVertical: width * .1,
		backgroundColor: '#fff',
		alignItems: 'center',
		borderRadius: 10,
		borderWidth: 0.5,
		borderColor: disabledColor,
	},
	notifView: {
		backgroundColor: '#fff',
		marginHorizontal: 15,
		padding: 15,
		borderRadius: 5,
	},
	notifTitle: {
		fontFamily: Bold,
	},
	notifDate: {
		fontSize: RNValue(10),
		color: text?.default,
		marginBottom: 10,
	},
	flatlist: {
		marginTop: 15,
	},
});