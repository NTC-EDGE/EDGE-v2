import {Linking, Pressable, StyleSheet, Text, View} from "react-native";
import React, {useState} from "react";
import UserAgreement from "@molecules/landing/Modal/UserAgreement";
import PrivacyPolicy from "@molecules/landing/Modal/PrivacyPolicy";
import CommunityGuidelines from "@molecules/landing/Modal/CommunityGuidelines";
import CookiePolicy from "@molecules/landing/Modal/CookiePolicy";
import SendFeedback from "@molecules/landing/Modal/SendFeedback";
import HelpCenter from "@molecules/landing/Modal/HelpCenter";





const Footer = () => {
    const [userAgreement, setUserAgreement] = useState(false);
    const [privacyPolicy, setPrivacyPolicy] = useState(false);
    const [communityGuidelines, setCommunityGuidelines] = useState(false);
    const [cookiePolicy, setCookiePolicy] = useState(false);
    const [sendFeedback, setSendFeedback] = useState(false);
    const [helpCenter, setHelpCenter] = useState(false);
    return (
        <>
            <View style={styles.footer}>
                <View style={styles.footerInner}>
                    <Text style={{color: "#fff", fontWeight: "800"}}>EDGE © 2025</Text>
                    <View style={styles.footerLinks}>
                        {[{
                            name:"User Agreement",
                            onClick: () => { setUserAgreement(true); },
                        }, {
                            name:"Privacy Policy",
                            onClick: () => { setPrivacyPolicy(true); },
                        },{
                            name: "Community Guidelines",
                            onClick: () => { setCommunityGuidelines(true); },
                        },{
                            name:  "Cookie Policy",
                            onClick: () => { setCookiePolicy(true); },
                        },{
                            name:   "Send Feedback",
                            onClick: () => { setSendFeedback(true); },
                        },{
                            name:  "Help Center",
                            onClick: () => { setHelpCenter(true); },
                        } ]
                            .map((t) => (<Pressable key={t.name} onPress={t.onClick}>
                                <Text style={styles.footerLink}>{t.name}</Text>
                            </Pressable>))}
                    </View>
                </View>
            </View>
            <UserAgreement onClose={() => setUserAgreement(false)} visible={userAgreement} />
            <PrivacyPolicy onClose={() => setPrivacyPolicy(false)} visible={privacyPolicy} />
            <CommunityGuidelines onClose={() => setCommunityGuidelines(false)} visible={communityGuidelines} />
            <CookiePolicy onClose={() => setCookiePolicy(false)} visible={cookiePolicy} />
            <SendFeedback onClose={() => setSendFeedback(false)} visible={sendFeedback} />
            <HelpCenter onClose={() => setHelpCenter(false)} visible={helpCenter} />
        </>
       );
}
const BLUE = "#003366";
const styles = StyleSheet.create({
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
        paddingTop: 10,
        elevation: 10, // shadow on Android
        shadowColor: "#000", // shadow on iOS
        shadowOpacity: 0.1,
        shadowRadius: 4,
        backgroundColor: BLUE,
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18
    },
    footerInner: {maxWidth: 1200, width: "100%", alignSelf: "center", alignItems: "center"},
    footerLinks: {flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 6},
    footerLink: {color: "#d1d5db", fontWeight: "600"},

})


export default Footer;
