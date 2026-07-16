import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
    Easing,
    useDerivedValue,
    withRepeat,
    FadeInUp,
} from 'react-native-reanimated';
import Download from "@atoms/icon/download";
import { text, primaryColor } from "@styles/color";

const DocumentDownloadButton = ({ onPress = () => {}, textColor = primaryColor, buttonLabel = "Download Order of Payment" }) => {
    const scale = useSharedValue(1);
    const pulse = useSharedValue(1);
    const colorAnim = useSharedValue(0);

    // Pulse effect for attention
    useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1.05, {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value * pulse.value }],
        backgroundColor: interpolateColor(
            colorAnim.value,
            [0, 1],
            ['#FFFFFF', '#F0F4FF']
        ),
        shadowColor: '#2F80ED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    }));

    const onPressIn = () => {
        scale.value = withSpring(0.95, { damping: 5 });
        colorAnim.value = withTiming(1, { duration: 200 });
    };

    const onPressOut = () => {
        scale.value = withSpring(1);
        colorAnim.value = withTiming(0, { duration: 200 });
    };

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
        >
            <Animated.View entering={FadeInUp.duration(500)} style={[styles.button, animatedStyle]}>
                <Animated.View style={styles.content}>
                    <Text style={[styles.label, { color: textColor }]}>{buttonLabel}</Text>
                    <Download size={18} color={textColor} style={{ marginLeft: 8 }} />
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default React.memo(DocumentDownloadButton);
