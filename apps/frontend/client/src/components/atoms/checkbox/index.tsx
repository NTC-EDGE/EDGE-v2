import React, { FC } from 'react';
import Checkbox from 'expo-checkbox';
import { View } from 'react-native';
import { Check } from '@atoms/icon';
import { disabledColor, infoColor, input } from '@styles/color';
import {RNValue as RFValue} from "@utils/formatting";

interface Props {
	size?: number;
	style?: any;
	isChecked: boolean;
	onClick: any;
	type?: string;
};

const CheckBox: FC<Props> = ({
	size = 24,
	style = {},
	isChecked = false,
	onClick = () => {},
	type,
}) => {
	if (type === 'circle') {
		return (
			<View
				accessibilityElementsHidden={true}
				importantForAccessibility="no-hide-descendants"
				style={[
					{
						height: RFValue(size),
						width: RFValue(size),
						borderRadius: RFValue(size),
						backgroundColor: isChecked ? infoColor : input.background.default,
						alignItems: 'center',
						justifyContent: 'center',
					},
					style,
				]}>
				<Check color='#fff' size={size / 1.5} />
			</View>
		)
	}
	return (
		<Checkbox
			accessibilityElementsHidden={true}
			importantForAccessibility="no-hide-descendants"
			style={[
				{
					height: RFValue(size),
					width: RFValue(size),
					borderWidth: 0.5,
				},
				style,
			]}
			disabled={false}
			value={isChecked}
			onValueChange={onClick}
			color={isChecked ? infoColor : disabledColor}
		/>
	)
};

export default React.memo(CheckBox);
