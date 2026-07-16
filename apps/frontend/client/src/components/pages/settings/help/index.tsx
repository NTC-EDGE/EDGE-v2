import React from "react";
import { View, Text, Linking, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import styles from './styles';
const HelpPage = () => {
    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>Help & Support</Text>
                <Text style={styles.subtitle}>Find resources and get in touch with us.</Text>
            </View>

            {/* HELP CENTER CARD */}
            <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 250 }}
                style={styles.card}
            >
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Help Center</Text>

                    <TouchableOpacity onPress={() => Linking.openURL("https://support.example.com")}>
                        <Text style={styles.linkText}>Get Support Anytime</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.cardDesc}>
                    Need help? Our Help Center provides quick answers to common questions
                    and guides you through using the system.
                </Text>

                <Text style={styles.sectionLabel}>Topics Covered / FAQs</Text>

                <View style={styles.listContainer}>
                    <Text style={styles.bullet}>•  Account and Login Issues</Text>
                    <Text style={styles.bullet}>•  Password Recovery</Text>
                    <Text style={styles.bullet}>•  Biometric Authentication</Text>
                    <Text style={styles.bullet}>•  Submitting Service Requests</Text>
                    <Text style={styles.bullet}>•  Privacy and Data Protection</Text>
                </View>
            </MotiView>

            {/* CONTACT SUPPORT */}
            <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 250, delay: 100 }}
                style={styles.card}
            >
                <Text style={styles.cardTitle}>Contact Support</Text>
                <Text style={styles.cardDesc}>
                    If you can't find your answer, contact us directly:
                </Text>

                <TouchableOpacity onPress={() => Linking.openURL("mailto:ntc.edge@gmail.com")}>
                    <Text style={styles.email}>ntc.edge@gmail.com</Text>
                </TouchableOpacity>

                <View style={styles.responseBox}>
                    <Text style={styles.responseTitle}>Response Commitment</Text>
                    <Text style={styles.responseText}>
                        We aim to resolve all inquiries quickly, with most responses sent
                        within 24–48 hours.
                    </Text>
                </View>
            </MotiView>

            {/* FOOTER */}
            <View style={{ marginTop: 24 }}>
                <Text style={styles.footerLabel}>About</Text>
                <Text style={styles.footerText}>App Version 1.2.0</Text>
            </View>
        </View>
    );
};

export default HelpPage;
