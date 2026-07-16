// WowCard.tsx
import React, { PropsWithChildren, useEffect } from 'react';
import { Pressable, View, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence, useAnimationState } from 'moti';

type WowCardProps = PropsWithChildren<{
    radius?: number;
    padding?: number;
    borderWidth?: number;
    selected?: boolean;
    disabled?: boolean;
    onPress?: () => void;
}>;

const WowCard: React.FC<WowCardProps> = ({
                                             children,
                                             radius = 12,
                                             padding = 10,
                                             borderWidth = 2,
                                             selected = false,
                                             disabled,
                                             onPress,
                                         }) => {
    // 🔸 Card press animation
    const pressState = useAnimationState({
        idle: { scale: 1, rotateX: '0deg' },
        pressed: { scale: 0.97, rotateX: '3deg' },
    });

    // 🔸 Shimmer (looping border)
    const shimmerState = useAnimationState({
        start: { translateX: -40 },
        end: { translateX: 40 },
    });

    useEffect(() => {
        shimmerState.transitionTo('end');
    }, []);

    // 🔸 Shine (sweep highlight once)
    const shineState = useAnimationState({
        hide: { opacity: 0, translateX: -120 },
        show: { opacity: 0.15, translateX: 220 },
    });

    useEffect(() => {
        shineState.transitionTo('show');
    }, []);

    const borderColors = ['#7DD3FC', '#60A5FA', '#C084FC', '#60A5FA', '#7DD3FC'];

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.98, translateY: 6 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 250 }}
            style={{ borderRadius: radius }}
        >
            <Pressable
                onPressIn={() => pressState.transitionTo('pressed')}
                onPressOut={() => pressState.transitionTo('idle')}
                onPress={onPress}
                disabled={disabled}
                style={{ borderRadius: radius }}
            >
                {/* Gradient border layer */}
                <View style={{ borderRadius: radius, overflow: 'hidden' }}>
                    <MotiView
                        state={shimmerState}
                        transition={{
                            type: 'timing',
                            duration: 2600,
                            loop: true,
                        }}
                        style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]}
                    >
                        <LinearGradient
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            colors={borderColors}
                            style={{ height: '100%', width: '120%' }}
                        />
                    </MotiView>

                    {/* Inner card */}
                    <MotiView
                        state={pressState}
                        transition={{ type: 'spring', damping: 20 }}
                        style={{
                            margin: borderWidth,
                            borderRadius: radius - borderWidth,
                            overflow: 'hidden',
                            backgroundColor: '#fff',

                            shadowOffset: { width: 0, height: 8 },
                            shadowRadius: 22,
                            elevation: Platform.OS === 'android' ? 5 : 0,
                        }}
                    >
                        {/* soft inner gradient */}
                        <LinearGradient
                            colors={['rgba(255,255,255,0.05)', 'transparent']}
                            style={StyleSheet.absoluteFillObject}
                        />

                        {/* Shine sweep once */}
                        <MotiView
                            state={shineState}
                            transition={{ type: 'timing', duration: 900 }}
                            style={[
                                {
                                    position: 'absolute',
                                    top: -40,
                                    bottom: -40,
                                    width: 120,

                                    borderRadius: 24,
                                },
                                Platform.OS === 'web' ? { filter: 'blur(16px)' } : {},
                            ]}
                        />

                        {/* selection glow pulse */}
                        <AnimatePresence>
                            {selected && (
                                <MotiView
                                    from={{ opacity: 0.18 }}
                                    animate={{ opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'timing', duration: 600 }}
                                    pointerEvents="none"
                                    style={[
                                        StyleSheet.absoluteFillObject,
                                        { backgroundColor: '#60A5FA' },
                                    ]}
                                />
                            )}
                        </AnimatePresence>

                        {/* content */}
                        <View style={{ padding, borderRadius: radius - borderWidth }}>
                            {children}
                        </View>
                    </MotiView>
                </View>
            </Pressable>
        </MotiView>
    );
};

export default React.memo(WowCard);
