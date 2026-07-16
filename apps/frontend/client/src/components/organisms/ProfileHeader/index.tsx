import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { MotiView, AnimatePresence } from "moti";

interface Props {
    name: string;
    email: string;
    photo?: string | null;
    onUpload?: () => void;
    onRemove?: () => void;
    onClose?: () => void;
}

export default function ProfileHeader({
                                          name,
                                          email,
                                          photo,
                                          onUpload,
                                          onRemove,
                                      }: Props) {
    const [hover, setHover] = useState(false);

    // initials
    const initials = name
        ?.split(" ")
        .map(i => i[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const avatarSource = photo ? { uri: photo } : null;

    return (
        <View style={styles.wrapper}>
            {/* Avatar */}
            <Pressable
                onPress={() => setHover(!hover)}
                onHoverIn={() => setHover(true)}
                onHoverOut={() => setHover(false)}
                style={styles.avatarContainer}
            >
                <View style={styles.avatar}>
                    {avatarSource ? (
                        <Image source={avatarSource} style={styles.avatarImg} />
                    ) : (
                        <Text style={styles.initials}>{initials}</Text>
                    )}
                </View>

                {/* Hover Action Layer */}
                <AnimatePresence>
                    {hover && (
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 180 }}
                            style={styles.overlay}
                        >
                            <Text style={styles.overlayText} onPress={onUpload}>Upload</Text>
                            <Text style={styles.overlayText} onPress={onRemove}>Remove</Text>
                        </MotiView>
                    )}
                </AnimatePresence>
            </Pressable>

            {/* Name & Email */}
            <Text numberOfLines={1} style={styles.name}>{name}</Text>
            <Text numberOfLines={1} style={styles.email}>{email}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        paddingTop: 30,
        paddingBottom: 10,
    },

    avatarContainer: { alignItems: "center", justifyContent: "center" },

    avatar: {
        height: 95,
        width: 95,
        borderRadius: 70,
        backgroundColor: "#17428A",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    avatarImg: { width: "100%", height: "100%" },

    initials: { color: "#fff", fontSize: 34, fontWeight: "700" },

    overlay: {
        position: "absolute",
        height: 95,
        width: 95,
        borderRadius: 60,
        backgroundColor: "rgba(0,0,0,0.50)",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },

    overlayText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
        textDecorationLine: "underline",
    },

    name: { fontSize: 20, fontWeight: "700", marginTop: 12, color: "#111" },

    email: { fontSize: 14, marginTop: 2, color: "#6B7280" },
});
