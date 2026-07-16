import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    Platform,
} from "react-native";
import { MotiView } from "moti";
import { UploadCloud, Camera, X } from "lucide-react-native";

interface Props {
    visible: boolean;
    onClose: () => void;
    onUploadFromFile: () => void;
    onTakePhoto: () => void;
}

const ChangeProfilePhotoModal: React.FC<Props> = ({
                                                      visible,
                                                      onClose,
                                                      onUploadFromFile,
                                                      onTakePhoto,
                                                  }) => {
    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            {/* Clickable backdrop */}
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            {/* Dialog */}
            <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: 10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, translateY: 10 }}
                transition={{ type: "timing", duration: 220 }}
                style={styles.dialog}
            >
                {/* Optional close icon (top-right) */}
                <Pressable style={styles.closeIcon} onPress={onClose}>
                    <X size={18} color="#9CA3AF" />
                </Pressable>

                <Text style={styles.title}>Change Profile Photo</Text>

                {/* Upload from file */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.firstButton]}
                    onPress={onUploadFromFile}
                    activeOpacity={0.8}
                >
                    <UploadCloud size={18} color="#2563EB" />
                    <Text style={styles.actionLabel}>Upload from File</Text>
                </TouchableOpacity>

                {/* Take a photo */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onTakePhoto}
                    activeOpacity={0.8}
                >
                    <Camera size={18} color="#4B5563" />
                    <Text style={styles.actionLabel}>Take a Photo</Text>
                </TouchableOpacity>

                {/* Footer / cancel */}
                <Pressable style={styles.cancelWrapper} onPress={onClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
            </MotiView>
        </View>
    );
};

export default ChangeProfilePhotoModal;

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)", // dimmed background
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    dialog: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 22,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
    },
    closeIcon: {
        position: "absolute",
        right: 14,
        top: 14,
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        textAlign: "center",
        marginBottom: 18,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 8,
        gap: 8,
    },
    firstButton: {
        marginBottom: 10,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    cancelWrapper: {
        marginTop: 12,
        alignItems: "center",
    },
    cancelText: {
        fontSize: 14,
        color: "#6B7280",
    },
});
