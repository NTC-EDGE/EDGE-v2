import {Platform, StyleSheet} from 'react-native';

export default StyleSheet.create({
	overlay: {
		backgroundColor: 'rgba(0,0,0,0.5)',
    	flex: 1,
		...Platform.select({
			native: {
				justifyContent:"flex-end",
			},
			default:{
				justifyContent:"center",
			}
		})

	},
	container: {
		backgroundColor: '#fff',
		paddingVertical: 30,

		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		...Platform.select(
			{
				web: {

					borderBottomRightRadius: 10,
					borderBottomLeftRadius: 10,
				}
			}
		)


	},
});
