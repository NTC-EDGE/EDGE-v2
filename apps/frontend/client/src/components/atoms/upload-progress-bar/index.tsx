import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";

type Point = { x: number; y: number };

type Props = {
    height?: number;           // default 8
    rounded?: boolean;         // default true
    confetti?: boolean;        // default true
    originInParent?: Point;    // where confetti should start, relative to this wrapper's parent
};

const UploadProgressBar: React.FC<Props> = ({
                                                height = 8,
                                                rounded = true,
                                                confetti = true,
                                                originInParent, // pass the thumbnail corner here
                                            }) => {
    const [label, setLabel] = useState("0%");
    const [isDone, setIsDone] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const widthAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    // Animate 0 → 100 automatically
    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: 100,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start(() => {
            setLabel("Done");
            setIsDone(true);
            if (confetti) setShowConfetti(true);
        });
    }, []);

    // Live % label
    useEffect(() => {
        const id = widthAnim.addListener(({ value }) => {
            setLabel(value >= 100 ? "Done" : `${Math.round(value)}%`);
        });
        return () => widthAnim.removeListener(id);
    }, []);

    // Subtle pulsing glow
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const radius = rounded ? height / 2 : 4;

    const widthInterpolated = widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
    });

    const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
    const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] });

    // Default origin (if not provided): top-left of this component
    const origin = originInParent ?? { x: 0, y: 0 };

    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            <Text style={[styles.label, { color: isDone ? "#2E7D32" : "#4A90E2" }]}>{label}</Text>

            <View style={[styles.track, { height, borderRadius: radius }]}>
                {/* Glow */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.glow,
                        { borderRadius: radius, opacity: glowOpacity, transform: [{ scaleX: glowScale }, { scaleY: glowScale }] },
                    ]}
                />
                {/* Fill */}
                <Animated.View style={{ width: widthInterpolated, height: "100%" }}>
                    <LinearGradient
                        colors={isDone ? ["#2E7D32", "#66BB6A"] : ["#4A90E2", "#67C8FF"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ height: "100%", borderRadius: radius }}
                    />
                </Animated.View>
            </View>

            {/* Tiny confetti burst from thumbnail corner */}
            {showConfetti && (
                <ConfettiCannon
                    count={35}
                    origin={origin}
                    explosionSpeed={300}
                    fallSpeed={2500}
                    fadeOut
                    autoStart
                    onAnimationEnd={() => setShowConfetti(false)}
                   containerStyles={styles.confettiContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { width: "100%", position: "relative" },
    label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
    track: {
        width: "100%",
        backgroundColor: "#E6EAF0",
        overflow: "hidden",
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
            android: { elevation: 1 },
        }),
    },
    glow: { ...StyleSheet.absoluteFillObject, backgroundColor: "#67C8FF" },
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: "none",
    },
});

export default UploadProgressBar;
