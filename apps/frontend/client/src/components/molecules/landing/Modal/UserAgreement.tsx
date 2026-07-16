import React from "react";
import {Modal, Pressable, ScrollView, View, StyleSheet} from "react-native";
import {X} from "lucide-react-native";
import Text from "@atoms/text"
const UserAgreement = ({visible, onClose}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Dimmed background */}
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>User Agreement</Text>
                        <Pressable onPress={onClose}>
                            <X size={24} color="#555" />
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    {/* Scrollable Content */}
                    <ScrollView
                        style={{ flexGrow: 0 }}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={true}
                    >
                        <Text style={styles.text}>
                            Welcome to the EDGE Portal. This User Agreement governs your access
                            to and use of all services provided by the National Telecommunications
                            Commission (NTC) via this platform.
                        </Text>

                        <Text style={styles.subtitle}>1. Acceptance of Terms</Text>
                        <Text style={styles.text}>
                            By accessing or using the EDGE Portal, you agree to be bound by these
                            terms and all policies incorporated herein. If you do not agree, you
                            must cease use immediately.
                        </Text>

                        <Text style={styles.subtitle}>2. User Obligations</Text>
                        <Text style={styles.text}>
                            You agree to use the portal only for lawful purposes related to NTC
                            services. You are responsible for maintaining the confidentiality of
                            your account credentials and for all activities that occur under your
                            account.
                        </Text>

                        <Text style={styles.subtitle}>3. Termination</Text>
                        <Text style={styles.text}>
                            The NTC reserves the right to suspend or terminate your account and
                            access to the service for any breach of this agreement without prior
                            notice.
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>

    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        elevation: 10,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#003366',
    },

    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 15,
    },

    subtitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 4,
        color: '#003366',
    },

    text: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        marginBottom: 10,
    },
});

export default UserAgreement
