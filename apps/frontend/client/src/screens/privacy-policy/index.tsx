import React from 'react';
import {
    View,
    ScrollView,
    StatusBar,
    useWindowDimensions,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Text from '@atoms/text';
import Footer from '@atoms/footer';
import EdgeBlue from '@assets/svg/edgeBlue';
import {primaryColor} from "@styles/color";
import SEO from "@atoms/seo";

const policySections = [
    {
        title: "Information We Collect",
        content: "1.1 Personal Information: We may collect personal information such as your name, email, and contact info when you interact with our service."
    },
    {
        title: "Use of Information",
        content: "2.1 We use your information to personalize services, respond to requests, send updates, and improve features."
    },
    {
        title: "Information Sharing",
        content: "3.1 We may share your data with trusted service providers, business partners (with consent), or as required by law."
    },
    {
        title: "Data Retention and Security",
        content: "4.1 We retain your information as needed for service delivery. 4.2 We use standard security practices but cannot guarantee absolute safety."
    },
    {
        title: "Your Rights and Choices",
        content: "5.1 You can access, update, or delete your info. 5.2 You may also manage communications and notifications."
    },
    {
        title: "Policy Updates",
        content: "6.1 We may update this policy and notify you through our app or website."
    },
    {
        title: "Contact Us",
        content: "7.1 For concerns, please reach out through our support channels."
    }
];

const PrivacyPolicy = () => {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    return (
        <>
            <SEO
                title="Privacy Policy - NTC EDGE Portal"
                description="Learn about how the NTC EDGE Portal collects, uses, and protects your personal information."
            />
            <StatusBar barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={{
                    paddingVertical: 72,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                    backgroundColor: '#F0F2F5',
                }}
            >
                {/* Edge Logo Container */}
                <View style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    padding: 18,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    elevation: 6,
                    marginBottom: 20
                }}>
                    <View style={{flexDirection: 'row', justifyContent: "center",  alignItems: 'center', flex: 1}}>
                        <EdgeBlue width={220} height={60} />
                    </View>

                    <Text style={{
                        fontSize: 28,
                        fontWeight: 'bold',
                        marginBottom: 30,
                        color: primaryColor,
                        textAlign: 'center',
                        letterSpacing: 0.5
                    }}>
                        Privacy Policy
                    </Text>
                    {policySections.map((section, index) => (
                        <MotiView
                            key={index}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{
                                delay: 150 + index * 130,
                                type: 'timing',
                                duration: 400
                            }}
                            style={{
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                borderRadius: 20,
                                paddingVertical: 22,
                                paddingHorizontal: 24,
                                marginBottom: 20,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.06,
                                shadowRadius: 6,
                                elevation: 4,
                                borderWidth: 1,
                                borderColor: '#E1E3E6',
                                position: 'relative'
                            }}
                        >
                            {/* Number Badge */}
                            <View style={{
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                backgroundColor: '#216FED',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                top: -17,
                                left: 24,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 4,
                                borderWidth: 2,
                                borderColor: '#fff'
                            }}>
                                <Text style={{
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: 13
                                }}>{index + 1}</Text>
                            </View>

                            {/* Section Title */}
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: 8,
                                paddingTop: 16,
                                textTransform: 'uppercase',
                                color: '#222',
                                letterSpacing: 0.4
                            }}>
                                {section.title}
                            </Text>

                            {/* Section Content */}
                            <Text style={{
                                fontSize: 14,
                                color: '#444',
                                lineHeight: 22
                            }}>
                                {section.content}
                            </Text>
                        </MotiView>
                    ))}
                </View>



            </ScrollView>

            {/* Footer Animation */}
            <MotiView
                from={{ translateY: 60, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 16 }}
                style={{
                    position: 'absolute',
                    bottom: insets.bottom ,
                    width: '100%',
                }}
            >
                <Footer />
            </MotiView>
        </>
    );
};

export default  React.memo(PrivacyPolicy);
