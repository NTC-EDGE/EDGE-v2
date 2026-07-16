import React from "react";
import {Modal, Pressable, ScrollView, View, StyleSheet} from "react-native";
import {X} from "lucide-react-native";
import Text from "@atoms/text"
import LegalModal from "@molecules/landing/Modal/LegalModal";
const CommunityGuidelines = ({visible, onClose}) => {
    return (
        <LegalModal
            visible={visible}
            title="Community Guidelines"
            onClose={onClose}
        >
            <Text style={styles.text}>
                These guidelines promote a safe and productive environment for all users of the EDGE Portal, especially when utilizing public-facing features like feedback forums or communication channels.
            </Text>

            <Text style={styles.subtitle}>1. Respectful Conduct</Text>
            <Text style={styles.text}>
                All interactions must be respectful, professional, and courteous. Hate speech, harassment, threats, or discrimination are strictly prohibited.
            </Text>

            <Text style={styles.subtitle}>2. Truthfulness</Text>
            <Text style={styles.text}>
                Do not submit false, misleading, or fraudulent information in any application or communication within the portal. Accuracy and honesty are mandatory.
            </Text>

            <Text style={styles.subtitle}>3. Prohibited Content</Text>
            <Text style={styles.text}>
                Do not upload or share content that is illegal, defamatory, obscene, or violates the intellectual property rights of others. Violations may lead to account suspension and legal action.
            </Text>
        </LegalModal>

    )
}

const styles = StyleSheet.create({
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

export default CommunityGuidelines
