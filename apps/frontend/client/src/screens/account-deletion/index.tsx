import React from "react";
import { View, Text, ScrollView, StyleSheet, Linking, Pressable } from "react-native";
import SEO from "@atoms/seo";

const DeleteAccountScreen = () => {
    const handleEmailPress = () => {
        Linking.openURL('mailto:ntc.edge@gmail.com?subject=Account%20Deletion%20Request');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <SEO
                title="Delete Account - NTC EDGE Portal"
                description="Manage your account data and learn how to permanently delete your NTC EDGE Portal profile."
                canonical="https://www.ntcedge.com/account-deletion"
            />
            <Text style={styles.title}>Delete Your Account</Text>
            <Text style={styles.subtitle}>Manage your account data easily and securely.</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to request account deletion</Text>
                <View style={styles.divider} />
                <Text style={styles.paragraph}>1. Open the app and go to <Text style={styles.bold}>Settings → Account Settings</Text>.</Text>
                <Text style={styles.paragraph}>2. Tap on <Text style={styles.bold}>"Delete My Account"</Text>.</Text>
                <Text style={styles.paragraph}>3. Confirm your request by verifying your email address.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>What happens after deletion</Text>
                <View style={styles.divider} />
                <Text style={styles.paragraph}>• Your <Text style={styles.bold}>profile</Text>, <Text style={styles.bold}>personal information</Text>, and <Text style={styles.bold}>usage data</Text> will be permanently erased.</Text>
                <Text style={styles.paragraph}>• <Text style={styles.bold}>Transaction records</Text> may be kept up to 90 days for legal purposes.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Need help?</Text>
                <View style={styles.divider} />
                <Pressable style={styles.emailButton} onPress={handleEmailPress}>
                    <Text style={styles.emailButtonText}>📧 Contact ntc.edge@gmail.com</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

export default React.memo(DeleteAccountScreen);

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: "#f3f4f6",
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 8,
        color: "#111827",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: "#6b7280",
        marginBottom: 24,
    },
    section: {
        backgroundColor: "#ffffff",
        padding: 20,
        marginBottom: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 12,
    },
    paragraph: {
        fontSize: 16,
        color: "#4b5563",
        marginBottom: 10,
        lineHeight: 24,
    },
    bold: {
        fontWeight: "600",
        color: "#111827",
    },
    emailButton: {
        marginTop: 12,
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    emailButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
