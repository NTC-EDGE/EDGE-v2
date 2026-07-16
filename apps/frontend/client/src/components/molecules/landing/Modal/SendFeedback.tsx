import React from "react";
import {Modal, Pressable, ScrollView, View, StyleSheet} from "react-native";
import {X} from "lucide-react-native";
import Text from "@atoms/text"
import LegalModal from "@molecules/landing/Modal/LegalModal";

const SendFeedback = ({visible, onClose}) => {
    return (<LegalModal visible={visible} title={"Send Feedback"} onClose={onClose}>

            <Text style={styles.text}>
                Your feedback is crucial for the continuous improvement of the EDGE Portal. Please use this channel to submit suggestions, bug reports, or compliments.
            </Text>

            <Text style={styles.subtitle}>1. Focus on Specifics</Text>
            <Text style={styles.text}>
                When reporting issues, include the steps you took, the device you used, and the desired outcome. For suggestions, explain how the change would benefit your experience.
            </Text>

            <Text style={styles.subtitle}>2. Response Time</Text>
            <Text style={styles.text}>
                While we read all feedback, we cannot promise a personal response to every submission. If your concern is urgent, please refer to the Help Center for official support channels.
            </Text>

            <Text style={styles.subtitle}>3. Confidentiality</Text>
            <Text style={styles.text}>
                All feedback submitted is considered non-confidential and may be used by the NTC to enhance the system without compensation.
            </Text></LegalModal>)
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20,
    },

    modalContainer: {
        width: '90%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 10,
    },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },

    title: {
        fontSize: 22, fontWeight: '700', color: '#003366',
    },

    divider: {
        height: 1, backgroundColor: '#e0e0e0', marginVertical: 15,
    },

    subtitle: {
        fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 4, color: '#003366',
    },

    text: {
        fontSize: 15, lineHeight: 22, color: '#444', marginBottom: 10,
    },
});

export default SendFeedback
