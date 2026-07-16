import React from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    Platform,
} from "react-native";
import { HelpCircle, LogInIcon, UserIcon, X } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import LandingButton from "@molecules/landing/LandingButton";

const BLUE = "#003366";

type GuestModalProps = {
    visible: boolean;
    loggingIn?: boolean;
    onClose: () => void;
    onLogin: () => void;
    onGuest: () => void;
    onSignUp: () => void;
};

export const GuestModal: React.FC<GuestModalProps> = ({
                                                          visible,
                                                          onClose,
                                                          onLogin,
                                                          onGuest,
                                                          onSignUp,
                                                          loggingIn
                                                      }) => {

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none" // we'll animate with moti
            onRequestClose={onClose}
        >
            <AnimatePresence>
                {visible && (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "timing", duration: 200 }}
                        style={styles.overlay}
                    >
                        {/* Card */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.9, translateY: 12 }}
                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, translateY: 12 }}
                            transition={{ type: "timing", duration: 220 }}
                            style={styles.card}
                        >
                            {/* Close */}
                            <Pressable style={styles.close} onPress={onClose} hitSlop={10}>
                                <X size={20} color="#94A3B8" />
                            </Pressable>

                            {/* Icon */}
                            <MotiView
                                from={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    damping: 15,
                                    stiffness: 180,
                                    delay: 80,
                                }}
                                style={styles.iconCircle}
                            >
                                <HelpCircle size={26} color={BLUE} />
                            </MotiView>

                            {/* Title */}
                            <Text style={styles.title}>
                                How would you like to{"\n"}proceed?
                            </Text>

                            {/* Body */}
                            <Text style={styles.body}>
                                To save your progress and access application{"\n"}
                                history, we recommend having an account.
                            </Text>

                            {/* Buttons row */}
                            <View style={styles.actionsRow}>
                                <LandingButton
                                    disabled={loggingIn}
                                    Icon={LogInIcon}
                                    label={"Log In"}
                                    onPress={onLogin}
                                />
                                <LandingButton
                                    disabled={loggingIn}
                                    Icon={UserIcon}
                                    label={"Continue as Guest"}
                                    onPress={onGuest}
                                />
                            </View>

                            {/* Sign up link */}
                            <Text style={styles.footerText}>
                                Don&apos;t have an account yet?{" "}
                                <Text style={styles.link} onPress={onSignUp}>
                                    Sign Up
                                </Text>
                            </Text>
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
        paddingVertical: 28,
        paddingHorizontal: 24,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: Platform.OS === "ios" ? 0.25 : 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
        alignItems: "center",
    },
    close: {
        position: "absolute",
        right: 18,
        top: 18,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
        backgroundColor: "#F9FAFB",
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        textAlign: "center",
        color: "#0F172A",
        marginBottom: 10,
    },
    body: {
        fontSize: 14,
        textAlign: "center",
        color: "#4B5563",
        lineHeight: 20,
        marginBottom: 22,
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        marginBottom: 18,
    },
    footerText: {
        fontSize: 13,
        color: "#6B7280",
    },
    link: {
        color: BLUE,
        fontWeight: "700",
    },
});
