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
const UserAgreementScreen = ({ navigation }: any) => {
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
                title="User Agreement - NTC EDGE Portal"
                description="Read the terms and conditions for using the NTC EDGE platform and its services."
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
                    <Text style={style.title}>User Agreement</Text>

                    <Text style={style.heading}>1. Acceptance of Terms</Text>
                    <Text style={style.paragraph}>
                        By using the NTC EDGE platform and its services, you agree to abide by the terms and conditions outlined in this User Agreement. If you do not agree to these terms, you must not access or use the app.
                    </Text>

                    <Text style={style.heading}>2. User Responsibilities</Text>
                    <Text style={style.paragraph}>
                        You agree to use the platform only for lawful purposes and in a manner that does not violate the rights of others. You are responsible for maintaining the confidentiality of your login credentials.
                    </Text>

                    <Text style={style.heading}>3. Account Security</Text>
                    <Text style={style.paragraph}>
                        You are solely responsible for the activity that occurs on your account. Notify us immediately of any unauthorized use or security breach.
                    </Text>

                    <Text style={style.heading}>4. Intellectual Property</Text>
                    <Text style={style.paragraph}>
                        All content, trademarks, and data on this platform—including but not limited to code, designs, logos, and documents—are the property of NTC EDGE or its licensors. You agree not to copy, modify, distribute, or exploit such materials without permission.
                    </Text>

                    <Text style={style.heading}>5. Service Availability</Text>
                    <Text style={style.paragraph}>
                        We aim to maintain service availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue services at any time without prior notice.
                    </Text>

                    <Text style={style.heading}>6. Termination</Text>
                    <Text style={style.paragraph}>
                        We reserve the right to suspend or terminate your access if you violate these terms. In such cases, your right to use the app will immediately cease.
                    </Text>

                    <Text style={style.heading}>7. Modifications to This Agreement</Text>
                    <Text style={style.paragraph}>
                        We may update this User Agreement from time to time. We will notify users of significant changes through the app or email. Continued use after changes indicates acceptance of the revised terms.
                    </Text>

                    <Text style={style.heading}>8. Governing Law</Text>
                    <Text style={style.paragraph}>
                        This Agreement shall be governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the appropriate courts of jurisdiction.
                    </Text>

                    <Text style={style.heading}>9. Contact Information</Text>
                    <Text style={style.paragraph}>
                        If you have any questions or concerns about this User Agreement, please contact us via the Help Center or at ntc.edge@gmail.com.
                    </Text>
                </ScrollView>
            </View>

            <Footer></Footer>
        </ImageBackground>
        </>
    );
};

export default React.memo(UserAgreementScreen);
