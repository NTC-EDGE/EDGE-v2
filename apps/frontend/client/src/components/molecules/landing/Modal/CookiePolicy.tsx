import React from "react";
import {Modal, Pressable, ScrollView, View, StyleSheet} from "react-native";
import {X} from "lucide-react-native";
import Text from "@atoms/text"
import LegalModal from "@molecules/landing/Modal/LegalModal";
import {Bold} from "@styles/font";
const CookiePolicy = ({visible, onClose}) => {
    return (
        <LegalModal visible={visible} title={"Cookie Policy"} onClose={onClose}>

            <Text style={styles.text}>
                This portal uses cookies to ensure optimal performance and user experience. By continuing to use the EDGE Portal, you consent to the use of cookies.
            </Text>

            <Text style={styles.subtitle}>1. What are Cookies?</Text>
            <Text style={styles.text}>
                Cookies are small text files stored on your device that help us remember your preferences and settings, and analyze how you interact with our services.
            </Text>

            <Text style={styles.subtitle}>2. Types of Cookies Used</Text>
            <Text style={styles.text}>
                 <Text style={styles.textBold}>● Essential Cookies:</Text> Necessary for the website to function securely (e.g., managing your session).

            </Text>

            <Text style={styles.text}>
                <Text style={styles.textBold}>● Performance Cookies:</Text> Used for analytics to improve the portal's speed and reliability.
            </Text>

            <Text style={styles.subtitle}>3. Managing Cookies</Text>
            <Text style={styles.text}>
                You may control and/or delete cookies as you wish. Please note that disabling essential cookies may affect the functionality of the EDGE Portal.
            </Text>

        </LegalModal>

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
    textBold:{
        fontWeight: 'bold',
    },
    text: {

        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        marginBottom: 10,
    },
});

export default CookiePolicy
