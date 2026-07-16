import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MotiView } from "moti";

type DeleteConfirmModalProps = {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
                                                                   visible,
                                                                   onCancel,
                                                                   onConfirm,
                                                               }) => {
    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={deleteStyles.overlay}>
                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: 20 }}
                    transition={{ type: "timing", duration: 220 }}
                    style={deleteStyles.card}
                >
                    <Text style={deleteStyles.title}>Remove application?</Text>
                    <Text style={deleteStyles.subtitle}>
                        This will remove this application from your bulk list.
                        You can still recreate it later if needed.
                    </Text>

                    <View style={deleteStyles.actions}>
                        <TouchableOpacity
                            style={[deleteStyles.btn, deleteStyles.btnCancel]}
                            onPress={onCancel}
                        >
                            <Text style={deleteStyles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[deleteStyles.btn, deleteStyles.btnConfirm]}
                            onPress={onConfirm}
                        >
                            <Text style={deleteStyles.confirmText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </MotiView>
            </View>
        </Modal>
    );
};
export default DeleteConfirmModal;
const deleteStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "82%",
        maxWidth: 420,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 22,
        paddingHorizontal: 22,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 18,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },
    btn: {
        minWidth: 110,
        height: 40,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    btnCancel: {
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    btnConfirm: {
        backgroundColor: "#EF4444",
    },
    cancelText: {
        color: "#4B5563",
        fontSize: 14,
        fontWeight: "500",
    },
    confirmText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
