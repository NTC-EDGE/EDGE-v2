import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { button } from '@styles/color';
import { Bold } from '@styles/font';

export default StyleSheet.create({
  container: {
		flex: 1,
		backgroundColor: '#fff',
	  borderRadius: 12,
	},
	header: {
		marginTop: 10,
		padding: 20,
		paddingBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	content: {
		padding: 20,
	},
	description: {
		paddingVertical: 25,
	},
	button: {
		backgroundColor: button.primary,
		borderRadius: 10,
		width: '100%',
		padding: 0,
		height: RFValue(50),
		justifyContent: 'center',
	},
	keyboardAvoiding: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		padding: 20,
		backgroundColor: '#fff',
	},
	boldText: {
		fontFamily: Bold,
	},
});
