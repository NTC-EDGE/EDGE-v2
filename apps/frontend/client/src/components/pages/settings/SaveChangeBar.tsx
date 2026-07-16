import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";

const BLUE = "#2563ff";
const DISABLED_BLUE = "#9bbdff";

export default function SaveChangesBar({
                                           onPress,
                                            isStart = false,
                                           disabled = false,
                                       }: {
    onPress: () => void;
    disabled?: boolean;
    isStart?: boolean;
}) {
    return (
        <View style={styles.wrapper}>
            {/* Divider */}
            <View style={styles.divider} />

            {/* Animated Button */}
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 300 }}
                style={[styles.buttonContainer, {  alignItems: isStart ? "flex-start" :"flex-end",}]}
            >
                <Pressable
                    disabled={disabled}
                    onPress={onPress}
                    style={[
                        styles.button,
                        disabled && styles.buttonDisabled,
                    ]}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            disabled && styles.buttonTextDisabled,
                        ]}
                    >
                        Save Changes
                    </Text>
                </Pressable>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: "#fff",
    },
    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        width: "100%",
        marginBottom: 16,
    },
    buttonContainer: {
        width: "100%",

    },
    button: {
        backgroundColor: BLUE,
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 40,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 2,
    },
    buttonDisabled: {
        backgroundColor: DISABLED_BLUE,
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonTextDisabled: {
        color: "#f0f4ff",
    },
});
