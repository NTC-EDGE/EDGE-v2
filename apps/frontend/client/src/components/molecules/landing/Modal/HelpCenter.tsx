import React from "react";
import {Modal, Pressable, ScrollView, View, StyleSheet} from "react-native";
import {X} from "lucide-react-native";
import Text from "@atoms/text"
import LegalModal from "@molecules/landing/Modal/LegalModal";

const HelpCenter = ({visible, onClose}) => {
    return (<LegalModal visible={visible} title={"Help Center & Support"} onClose={onClose}>

            <Text style={styles.text}>
                Find comprehensive guides, video tutorials, and technical support for all NTC EDGE Portal services.
            </Text>

            <Text style={styles.subtitle}>1. Self-Service Resources</Text>
            <Text style={styles.text}>
                Before contacting support, please check our extensive FAQ section and step-by-step guides available
                within the portal's main Help Center link (this will lead to a dedicated website).
            </Text>

            <Text style={styles.subtitle}>2. Contact Information</Text>
            <Text style={styles.text}>
                For application-specific inquiries or technical issues that cannot be resolved via self-service:


            </Text>
            <Text style={styles.text}>
                <Text style={styles.textBold}>
                    Email Support:
                </Text>
                <Text style={styles.text}>support@ntcedge.gov.ph</Text>

            </Text>


            <Text style={styles.subtitle}>3. Operating Hours</Text>
            <Text style={styles.text}>
                Live support is available Monday to Friday, 8:00 AM to 5:00 PM (Philippine Standard Time).
            </Text>
        </LegalModal>

    )
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

    textBold: {
        fontWeight: "bold"
    },

    text: {
        fontSize: 15, lineHeight: 22, color: '#444', marginBottom: 10,
    },
});

export default HelpCenter
