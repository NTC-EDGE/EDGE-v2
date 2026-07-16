import React, { useState, useEffect, useRef } from 'react';
import {
    ImageBackground,
    ScrollView,
    StatusBar, StyleSheet,
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
const SendFeedback = ({ navigation }: any) => {
    const { height } = useWindowDimensions();

    
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
                title="Send Feedback - NTC EDGE Portal"
                description="Your feedback helps us improve NTC EDGE. Share your thoughts, suggestions, or report issues."
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
                    <Text style={style.title}>Send Feedback</Text>

                    <Text style={style.heading}>We Value Your Input</Text>
                    <Text style={style.paragraph}>
                        Your feedback helps us improve NTC EDGE. Whether it's a bug, suggestion, or compliment, we’re here to listen.
                    </Text>

                    <Text style={style.heading}>Ways to Send Feedback</Text>
                    <Text style={style.paragraph}>
                        1. Use the in-app feedback form. {"\n"}
                        2. Email us directly at ntc.edge@gmail.com. {"\n"}
                        3. Message us through our Help Center.
                    </Text>

                    <Text style={style.heading}>What to Include</Text>
                    <Text style={style.paragraph}>
                        Please include:
                    </Text>
                    <Text style={style.listItem}>- A clear description of the issue or suggestion</Text>
                    <Text style={style.listItem}>- Screenshots (if applicable)</Text>
                    <Text style={style.listItem}>- Your device model and app version (if applicable)</Text>

                    <Text style={style.heading}>Response Time</Text>
                    <Text style={style.paragraph}>
                        Our team strives to respond to feedback within 3 business days. For urgent concerns, use the Help Center or email ntc.edge@gmail.com.
                    </Text>
                </ScrollView>
            </View>

            <Footer></Footer>
        </ImageBackground>
        </>
    );
};

export default React.memo(SendFeedback);
