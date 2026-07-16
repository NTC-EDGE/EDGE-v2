// FeedbackSuccessModal.tsx
import React, { FC, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { MotiView, MotiText } from "moti";
import { BlurView } from "expo-blur";
import { Star, CheckCircle2, Send } from "lucide-react-native";
import { primaryColor, warningColor } from "@styles/color";

interface FeedbackSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmitFeedback?: (rating: number, comment: string) => Promise<void> | void;
    isBulk?: boolean;
}

const FeedbackSuccessModal: FC<FeedbackSuccessModalProps> = ({
    visible,
    onClose,
    onSubmitFeedback,
    isBulk,
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!onSubmitFeedback) return;
        setIsLoading(true);
        setErrorMsg(null);
        try {
            await onSubmitFeedback(rating, comment);
        } catch (error: any) {
            setErrorMsg(error?.message || "Failed to submit feedback. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (Platform.OS === "web") {
            if (window.confirm("Are you sure you want to close the feedback?")) {
                onClose();
            }
        } else {
            Alert.alert(
                "Confirm",
                "Are you sure you want to close the feedback?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Close", onPress: onClose }
                ]
            );
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.fullscreen}>
                {/* Overlay + blur */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 200 }}
                    style={styles.overlay}
                >
                    <BlurView style={StyleSheet.absoluteFill} intensity={40} tint="dark" />

                    {/* Card */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.85, translateY: 60 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9, translateY: 40 }}
                        transition={{ type: "spring", damping: 18 }}
                        style={styles.card}
                    >
                        {/* Icon */}
                        <MotiView
                            from={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", delay: 180 }}
                            style={styles.iconWrap}
                        >
                            <CheckCircle2 size={56} color="#4F46E5" />
                        </MotiView>

                        {/* Title */}
                        <MotiText
                            from={{ opacity: 0, translateY: -8 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 260 }}
                            style={styles.title}
                        >
                            {isBulk ? "Your applications have been submitted." : "Your application has been submitted."}
                        </MotiText>

                        <MotiText
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 340 }}
                            style={styles.subtitle}
                        >
                            {isBulk ? "We will notify you once your applications are validated." : "We will notify you once your application is validated."}{"\n"}Thank you!
                        </MotiText>

                        {/* Feedback panel */}
                        <MotiView
                            from={{ opacity: 0, translateY: 12 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 430, type: "spring", damping: 16 }}
                            style={styles.feedbackBox}
                        >
                            <Text style={styles.sectionLabel}>HOW WAS YOUR EXPERIENCE?</Text>

                            {/* Stars */}
                            <View style={styles.stars}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <MotiView
                                        key={i}
                                        from={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 500 + i * 70 }}
                                    >
                                        <Pressable onPress={() => setRating(i)}>
                                            <Star
                                                size={32}
                                                color={i <= rating ? warningColor : "#9CA3AF"}
                                                fill={i <= rating ? warningColor : "transparent"}
                                            />
                                        </Pressable>
                                    </MotiView>
                                ))}
                            </View>

                            <Text style={styles.label}>Share your comment/s</Text>
                            <TextInput
                                style={styles.textarea}
                                placeholder="Share any thoughts on the application process..."
                                placeholderTextColor="#A1A1AA"
                                multiline
                                value={comment}
                                onChangeText={setComment}
                            />

                            {errorMsg ? (
                                <Text style={{ color: "red", fontSize: 12, marginBottom: 8, textAlign: "center" }}>
                                    {errorMsg}
                                </Text>
                            ) : null}

                            {/* Send feedback */}
                            <Pressable
                                style={[
                                    styles.feedbackBtn,
                                    { opacity: rating === 0 || isLoading ? 0.4 : 1 },
                                ]}
                                disabled={rating === 0 || isLoading}
                                onPress={handleSubmit}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Send size={18} color="#ffffff" />
                                )}
                                <Text style={styles.feedbackText}>{isLoading ? "Submitting..." : "Send your feedback"}</Text>
                            </Pressable>
                        </MotiView>

                    </MotiView>
                </MotiView>
            </View>
        </Modal>
    );
};

export default FeedbackSuccessModal;

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "90%",
        maxWidth: 520,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 26,
        paddingHorizontal: 22,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    iconWrap: {
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "700",
        color: "#4F46E5",
        marginBottom: 4,
    },
    subtitle: {
        textAlign: "center",
        fontSize: 13,
        color: "#4B5563",
        marginBottom: 18,
    },
    feedbackBox: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 18,
        marginTop: 8,
    },
    sectionLabel: {
        textAlign: "center",
        fontSize: 12,
        fontWeight: "700",
        color: "#4B5563",
        marginBottom: 14,
        letterSpacing: 0.5,
    },
    stars: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 18,
        columnGap: 10,
    },
    label: {
        fontSize: 13,
        color: "#374151",
        marginBottom: 6,
    },
    textarea: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        minHeight: 90,
        padding: 10,
        fontSize: 13,
        color: "#111827",
        textAlignVertical: "top",
    },
    feedbackBtn: {
        marginTop: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        columnGap: 8,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: primaryColor,
    },
    feedbackText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffffff",
    },
    closeBtn: {
        alignSelf: "center",
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 48,
        borderRadius: 999,
        backgroundColor: primaryColor,
    },
    closeText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#ffffff",
        letterSpacing: 0.5,
    },
});
