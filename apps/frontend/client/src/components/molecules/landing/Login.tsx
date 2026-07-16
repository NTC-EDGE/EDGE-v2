import React from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    Platform,
} from "react-native";
import { X } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";

const BLUE = "#003366";

export const LoginModal = ({ visible, onClose, children }) => {
    return (
        <Modal visible={visible} transparent animationType="none">
            <AnimatePresence>
                {visible && (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "timing", duration: 180 }}
                        style={styles.overlay}
                    >
                        {/* Card Animation */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.92, translateY: 14 }}
                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                            exit={{ opacity: 0, scale: 0.92, translateY: 14 }}
                            transition={{ type: "timing", duration: 220 }}
                            style={styles.card}
                        >
                            {/* Close Button */}
                            <Pressable style={styles.close} onPress={onClose}>
                                <X size={22} color="#94A3B8" />
                            </Pressable>

                            {/* Modal Title */}
                            <Text style={styles.title}>Login</Text>

                            {/* Insert your form */}
                            {children}
                        </MotiView>
                    </MotiView>
                )}
            </AnimatePresence>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.55)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    card: {
        width: "100%",
        maxWidth: 480,
        borderRadius: 20,
        paddingVertical: 26,
        paddingHorizontal: 24,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: Platform.OS === "ios" ? 0.25 : 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
    },
    close: {
        position: "absolute",
        right: 18,
        top: 18,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
        textAlign: "center",
        marginBottom: 16,
    },
});
