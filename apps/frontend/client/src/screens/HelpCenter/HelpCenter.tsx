import React, { useState, useEffect } from 'react';
import {
    ImageBackground,
    ScrollView,
    StatusBar,
    StyleSheet,
    useColorScheme,
    useWindowDimensions,
    View,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import EdgeBlue from '@assets/svg/edgeBlue';
import Footer from '@atoms/footer';
import Text from '@atoms/text';
import SEO from "@atoms/seo";

const background = require('@assets/webbackground.png');

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#ffffffcc',
        borderRadius: 24,
        width: '94%',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
        maxHeight: '80%',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#0A2342',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 6,
        color: '#1D3557',
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 12,
        color: '#34495E',
    },
    listItem: {
        fontSize: 16,
        marginBottom: 6,
        paddingLeft: 16,
        color: '#2F4F4F',
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 30,
        backgroundColor: '#007AFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    tooltip: {
        position: 'absolute',
        bottom: 160,
        right: 30,
        backgroundColor: '#007AFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    faqContainer: {
        backgroundColor: '#ffffff',
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#D6E4FF',
    },
    question: {
        fontWeight: '700',
        fontSize: 17,
        color: '#007AFF',
    },
    answer: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginTop: 8,
    },
});

const HelpCenter = () => {
    const { height } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [showTooltip, setShowTooltip] = useState(true);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const handleContactPress = () => {
        Linking.openURL('mailto:ntc.edge@gmail.com');
    };

    useEffect(() => {
        const timer = setTimeout(() => setShowTooltip(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    const faqs = [
        {
            q: 'How do I reset my password?',
            a: 'Go to login screen > Tap "Forgot Password" > Follow email instructions.',
        },
        {
            q: 'How can I update my biometric data?',
            a: 'Navigate to Settings > Account > Biometric > Update Biometrics.',
        },
        {
            q: 'What services can I request on the platform?',
            a: 'License and permit applications (new and renewal), certifications, examination scheduling, and more.',
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <SEO
                title="Help Center - NTC EDGE Portal"
                description="Find answers to common questions and get support for the NTC EDGE platform."
            />
            <ImageBackground
                source={background}
                resizeMode="cover"
                style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                imageStyle={{ opacity: isDark ? 0.15 : 1 }}
            >
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={{
                        transform: [{ scale: 0.94 }],
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop: 32,
                        width: '100%',
                    }}
                >
                    <MotiView
                        from={{ scale: 0.9, opacity: 0.1 }}
                        animate={{ scale: 1.15, opacity: 0.15 }}
                        transition={{
                            loop: true,
                            type: 'timing',
                            duration: 2600,
                            easing: t => 1 - Math.pow(1 - t, 2),
                        }}
                        style={{
                            position: 'absolute',
                            top: 40,
                            width: 300,
                            height: 300,
                            borderRadius: 150,
                            backgroundColor: '#007AFF',
                            zIndex: -1,
                        }}
                    />

                    <MotiView
                        from={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 600 }}
                        style={{ paddingBottom: 24 }}
                    >
                        <EdgeBlue width={320} height={74} />
                    </MotiView>

                    <BlurView
                        tint={isDark ? 'dark' : 'light'}
                        intensity={90}
                        style={styles.container}
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <MotiText style={styles.title}>Help Center</MotiText>

                            <MotiText style={styles.heading}>Get Support Anytime</MotiText>
                            <MotiText style={styles.paragraph}>
                                Need help? Our Help Center provides quick answers to common questions and guides you through using NTC EDGE.
                            </MotiText>

                            <MotiText style={styles.heading}>Topics Covered</MotiText>
                            {["Account and Login Issues", "Password Recovery", "Biometric Authentication", "Submitting Service Requests", "Privacy and Data Protection"].map((item, index) => (
                                <MotiText
                                    key={item}
                                    style={styles.listItem}
                                    from={{ opacity: 0, translateX: -10 }}
                                    animate={{ opacity: 1, translateX: 0 }}
                                    transition={{ delay: 400 + index * 60, type: 'timing' }}
                                >
                                    - {item}
                                </MotiText>
                            ))}

                            <MotiText style={styles.heading}>FAQs</MotiText>
                            {faqs.map((faq, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    activeOpacity={0.8}
                                >
                                    <MotiView
                                        from={{ scale: 1 }}
                                        animate={{ scale: expandedFaq === index ? 1.02 : 1 }}
                                        transition={{ type: 'timing', duration: 200 }}
                                        style={styles.faqContainer}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={styles.question}>{faq.q}</Text>
                                            <MotiView
                                                animate={{ rotate: expandedFaq === index ? '180deg' : '0deg' }}
                                                transition={{ type: 'timing', duration: 300 }}
                                            >
                                                <Ionicons name="chevron-down" size={20} color="#007AFF" />
                                            </MotiView>
                                        </View>
                                        <AnimatePresence>
                                            {expandedFaq === index && (
                                                <MotiView
                                                    from={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ type: 'timing', duration: 300 }}
                                                >
                                                    <Text style={styles.answer}>{faq.a}</Text>
                                                </MotiView>
                                            )}
                                        </AnimatePresence>
                                    </MotiView>
                                </TouchableOpacity>
                            ))}

                            <MotiText style={styles.heading}>Contact Support</MotiText>
                            <MotiText style={styles.paragraph}>If you can't find your answer:</MotiText>

                            <MotiText style={styles.listItem}>- Email: ntc.edge@gmail.com</MotiText>

                            <MotiText style={styles.heading}>Response Commitment</MotiText>
                            <MotiText style={styles.paragraph}>
                                We aim to resolve all inquiries quickly, with most responses sent within 24–48 hours.
                            </MotiText>
                        </ScrollView>
                    </BlurView>
                </MotiView>

                {showTooltip && (
                    <MotiView
                        from={{ opacity: 0, translateY: 8 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 700, type: 'timing' }}
                        style={styles.tooltip}
                    >
                        <Text style={{ color: 'white', fontSize: 12 }}>Email Support</Text>
                    </MotiView>
                )}

                <MotiView
                    from={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ loop: true, type: 'timing', duration: 1800 }}
                    style={styles.fab}
                >
                    <TouchableOpacity onPress={handleContactPress}>
                        <Ionicons name="mail-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                </MotiView>
            </ImageBackground>

            <MotiView
                from={{ translateY: height }}
                animate={{ translateY: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 140 }}
            >
                <Footer />
            </MotiView>
        </SafeAreaView>
    );
};

export default React.memo(HelpCenter);
