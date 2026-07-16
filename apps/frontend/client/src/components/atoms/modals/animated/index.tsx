import React, { FC, ReactNode, useEffect, useCallback, useMemo } from 'react';
import {
	View,
	Modal,
	TouchableWithoutFeedback,
	Dimensions,
	StyleProp,
	ViewStyle,
} from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	runOnJS,
} from 'react-native-reanimated';
import styles from './styles';

interface Props {
	onDismiss?: () => void;
	containerStyle?: StyleProp<ViewStyle>;
	visible?: boolean;
	children?: ReactNode;
}

const ReanimatedModal: FC<Props> = ({
										containerStyle,
										onDismiss = () => {},
										visible = false,
										children,
									}) => {
	const screenHeight = useMemo(() => Dimensions.get('screen').height, []);
	const translateY = useSharedValue(screenHeight);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}), []);

	const handleDismiss = useCallback(() => {
		translateY.value = withTiming(screenHeight, { duration: 250 }, () => {
			runOnJS(onDismiss)();
		});
	}, [onDismiss, screenHeight]);

	useEffect(() => {
		if (visible) {
			translateY.value = withSpring(0, { damping: 22, stiffness: 150 });
		}
	}, [visible]);
	const stylesMemo = useMemo(() => {
		return styles;
	}, [])
	return (
		<Modal
			transparent
			visible={visible}
			hardwareAccelerated={true}
			statusBarTranslucent
			animationType="none"
			onRequestClose={handleDismiss}
		>
			<TouchableWithoutFeedback onPress={handleDismiss}>
				<View style={stylesMemo.overlay}>
					<TouchableWithoutFeedback>
						<Animated.View style={[stylesMemo.container, animatedStyle, containerStyle]}>
							{children}
						</Animated.View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

export default React.memo(ReanimatedModal);
