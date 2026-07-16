import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import Ellipsis from "@atoms/ellipsis";
import {palette, alpha} from "@styles/color";

type LandingButtonProps = {
    onPress?: () => void;
    label: string;
    Icon?: any;
    loading?: boolean;
    disabled?: boolean;
};

const LandingButton: React.FC<LandingButtonProps> = ({ onPress, label, Icon, loading, disabled }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={() => setHovered(true)}   // web
            onHoverOut={() => setHovered(false)} // web
            style={{ borderRadius: 12 }}         // to clip glow nicely
        >
            {({ pressed }) => {
                const active = hovered || pressed;
                const textColor = active ? palette.secondary : palette.primary;

                return (
                    <MotiView
                        style={styles.btn}
                        from={{
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            scale: 1,
                        }}
                        animate={{
                            backgroundColor: disabled ? palette.disabled : (loading || active ? palette.primary : palette.surface),
                            borderColor: disabled ? palette.disabled : (active ? palette.primary : palette.border),
                            shadowOpacity: active ? 0.12 : 0.08,
                            shadowRadius: active ? 20 : 12,
                            scale: pressed ? 0.97 : active ? 1.01 : 1,
                        }}
                        transition={{ type: "timing", duration: 200 }}
                    >
                        {
                            loading ? (
                                    <View style={styles.row}>
                                        {Icon && <Icon size={20} color={textColor} strokeWidth={2} />}
                                        <Ellipsis color={palette.secondary} size={ 10 }/>
                                    </View>


                            ) : (
                                <View style={styles.row}>
                                    {Icon && <Icon size={20} color={disabled ? palette.disabled : textColor} strokeWidth={2} />}
                                    <Text style={[styles.btnText, { color: disabled ? palette.disabled : textColor }]}>
                                        {label}
                                    </Text>
                                </View>

                            )
                        }

                    </MotiView>
                );
            }}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    btn: {
        height: 54, // Luxe standard
        paddingHorizontal: 28,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        backgroundColor: palette.surface,
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    btnText: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 10,
    },
});

export default LandingButton;
