import React, { useState, useEffect, useRef } from 'react';
import {
    Easing,
    ImageBackground,
    Modal,
    ScrollView,
    StatusBar, StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useWindowDimensions,
    View
} from 'react-native';
import EdgeBlue from "@assets/svg/edgeBlue";
import Text from "@atoms/text";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import Footer from '@atoms/footer';
import SEO from "@atoms/seo";

const background = require("@assets/webbackground.png");
const style = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 22,
    },
    listItem: {
        fontSize: 16,
        marginBottom: 5,
        paddingLeft: 10,
    },
});
const CookiePolicy = ({ navigation }: any) => {
    const { width, height } = useWindowDimensions();

    
    const logoScale = useSharedValue(0);
    const formOpacity = useSharedValue(0);
    const formTranslateY = useSharedValue(50);

    
    useEffect(() => {
        logoScale.value = withTiming(1, { duration: 800 });
        formOpacity.value = withTiming(1, { duration: 1000 });
        formTranslateY.value = withTiming(0, { duration: 1000 });
    }, []);

    
    const logoAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: logoScale.value }],
        };
    });


    const translateY = useSharedValue(height);
    useEffect(() => {
        translateY.value = withSpring(0, {
            damping: 100,
            stiffness: 100,
            mass: 1,
        });
    }, []);

    return (
        <>
            <SEO
                title="Cookie Policy - NTC EDGE Portal"
                description="Understand how the NTC EDGE platform uses cookies to improve your experience."
            />
        <ImageBackground
            resizeMode="cover"
            source={background}
            style={{
                flex: 1,
                width: "100%",
                height: "100%",
                justifyContent: "center",
            }}
            imageStyle={{ flex: 1 }}
        >
            <StatusBar barStyle="dark-content" />

            <View style={{ transform: [{ scale: 0.90 }], flex: 1, justifyContent: "center", alignItems: "center" }}>
                {/* Animated logo */}
                <Animated.View style={[{ paddingBottom: 40 }, logoAnimatedStyle]}>
                    <EdgeBlue width={342} height={78} />
                </Animated.View>
                <ScrollView style={style.container}>
                    <Text style={style.title}>Cookie Policy</Text>

                    <Text style={style.heading}>1. What Are Cookies?</Text>
                    <Text style={style.paragraph}>
                        Cookies are small text files stored on your device when you use the NTC EDGE platform. They help us remember your preferences and improve your experience.
                    </Text>

                    <Text style={style.heading}>2. How We Use Cookies</Text>
                    <Text style={style.paragraph}>
                        We use cookies to:
                    </Text>
                    <Text style={style.listItem}>- Keep you signed in</Text>
                    <Text style={style.listItem}>- Understand how you use the app</Text>
                    <Text style={style.listItem}>- Enhance performance and security</Text>
                    <Text style={style.listItem}>- Personalize your experience</Text>

                    <Text style={style.heading}>3. Types of Cookies We Use</Text>
                    <Text style={style.paragraph}>
                        <Text style={{ fontWeight: 'bold' }}>Essential Cookies:</Text> Required for login, session management, and security. {"\n"}
                        <Text style={{ fontWeight: 'bold' }}>Analytics Cookies:</Text> Help us measure usage and improve features. {"\n"}
                        <Text style={{ fontWeight: 'bold' }}>Preference Cookies:</Text> Remember your settings (e.g., language).
                    </Text>

                    <Text style={style.heading}>4. Managing Cookies</Text>
                    <Text style={style.paragraph}>
                        You can manage or disable cookies in your browser or device settings. Please note that some features may not work properly if cookies are disabled.
                    </Text>

                    <Text style={style.heading}>5. Changes to This Policy</Text>
                    <Text style={style.paragraph}>
                        We may update this Cookie Policy as needed. Updates will be posted in the app with the latest effective date.
                    </Text>

                    <Text style={style.heading}>6. Contact</Text>
                    <Text style={style.paragraph}>
                        If you have questions about our Cookie Policy, contact us at ntc.edge@gmail.com.
                    </Text>


                </ScrollView>
            </View>

            <Footer></Footer>
        </ImageBackground>
        </>
    );
};

export default React.memo(CookiePolicy);
