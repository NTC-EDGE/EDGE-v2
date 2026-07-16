import React from "react";
import {Modal, Pressable, ScrollView, View, StyleSheet} from "react-native";
import {X} from "lucide-react-native";
import Text from "@atoms/text"
import LegalModal from "./LegalModal";
const PrivacyPolicy = ({visible, onClose}) => {
    return (
        <LegalModal
            visible={visible}
            title="Privacy Policy"
            onClose={onClose}
        >
            <Text style={styles.text}>
                Your privacy is important to us. This policy outlines how the NTC collects,
                uses, and protects the personal and application data you provide through
                the EDGE Portal.
            </Text>

            <Text style={styles.subtitle}>1. Data Collection</Text>
            <Text style={styles.text}>
                We collect personal information (e.g., name, address, contact details) and
                transactional data related to your applications and requests required for
                NTC services.
            </Text>

            <Text style={styles.subtitle}>2. Use of Data</Text>
            <Text style={styles.text}>
                The collected data is used exclusively for processing NTC services,
                verifying identities, internal reporting, and improving the portal&apos;s
                functionality, in accordance with applicable Philippine data privacy laws.
            </Text>

            <Text style={styles.subtitle}>3. Data Security</Text>
            <Text style={styles.text}>
                We implement technical and organizational measures to safeguard your data
                against unauthorized access, disclosure, alteration, and destruction.
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

export default PrivacyPolicy
