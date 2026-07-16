import * as React from 'react';
import {
    ImageBackground,
    ImageURISource,
    LayoutChangeEvent,
    StyleSheet,
    ImageBackgroundProps,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withRepeat,
    interpolate,
    Extrapolate,
    useAnimatedReaction,
} from 'react-native-reanimated';

export type ProgressBarProps = {
    isIndeterminate?: boolean,
    duration?: number,
    isAnimated?: boolean,
    progress?: number,
    color?: string,
    trackColor?: string,
    progressImage?: ImageURISource | ImageURISource[],
    trackImage?: ImageURISource | ImageURISource[],
    height?: number,
    borderRadius?: number,
    style?: ImageBackgroundProps['style'],
    key?: any
};

const minProgress = 0;
const maxProgress = 1;

function ProgressBar({
                         isIndeterminate = false,
                         duration = isIndeterminate ? 1000 : 500,
                         isAnimated = false,
                         progress = isIndeterminate ? 0.5 : 0,
                         height = 7,
                         borderRadius = height * 0.5,
                         color = '#007aff',
                         trackColor = 'transparent',
                         style,
                         trackImage,
                         progressImage,
                         key
                     }: ProgressBarProps) {
    const [width, setWidth] = React.useState(0);
    const progressValue = useSharedValue(isAnimated ? 0 : progress);
    const indeterminateValue = useSharedValue(0);

    useAnimatedReaction(
        () => progress,
        (currentProgress) => {
            if (isAnimated) {
                progressValue.value = withTiming(currentProgress ?? 0, {duration});
            } else {
                progressValue.value = currentProgress ?? 0;
            }
        },
        [isAnimated, duration]
    );

    useAnimatedReaction(
        () => isIndeterminate,
        (currentIsIndeterminate) => {
            if (currentIsIndeterminate) {
                indeterminateValue.value = withRepeat(
                    withTiming(1, {duration}),
                    -1,
                    false
                );
            } else {
                indeterminateValue.value = withTiming(0, {duration});
            }
        },
        [duration]
    );

    const animatedStyle = useAnimatedStyle(() => {
        const animatedWidth = interpolate(
            progressValue.value,
            [minProgress, maxProgress],
            [0, width],
            Extrapolate.CLAMP
        );

        let translateX = 0;
        if (isIndeterminate) {
            translateX = interpolate(
                indeterminateValue.value,
                [0, 1],
                [-animatedWidth, width]
            );
        }

        return {
            width: animatedWidth,
            transform: [{translateX}],
        } as ViewStyle;
    });

    return (
        <ImageBackground
            onLayout={(e: LayoutChangeEvent) => {
                setWidth(e.nativeEvent.layout.width);
            }}
            resizeMode={'stretch'}
            style={[
                styles.container,
                {
                    height,
                    borderRadius,
                    backgroundColor: trackColor,
                },
                style,
            ]}
            source={trackImage}
        >
            <Animated.Image
                style={[
                    styles.bar,
                    animatedStyle,
                    {
                        backgroundColor: color,
                        borderRadius,
                    },
                ]}
                source={progressImage}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    bar: {
        resizeMode: 'stretch',
        left: 0,
        position: 'absolute',
        height: '100%',
    },
});

export default React.memo(ProgressBar);
