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
const CommunityGuidelines = ({ navigation }: any) => {
    const { width, height } = useWindowDimensions();
    const [forgotPasswordModal, setForgotPasswordModal] = useState(false);

    
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
                title="Community Guidelines - NTC EDGE Portal"
                description="Our community guidelines foster respectful, informative, and meaningful engagement among users."
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
                    <Text style={style.title}>Community Guidelines</Text>

                    <Text style={style.heading}>1. Purpose</Text>
                    <Text style={style.paragraph}>
                        Our community exists to foster respectful, informative, and meaningful engagement among users of the NTC EDGE platform. These guidelines are here to ensure a safe and inclusive space for all.
                    </Text>

                    <Text style={style.heading}>2. Respectful Behavior</Text>
                    <Text style={style.paragraph}>
                        Treat all members with kindness and respect. Discrimination, harassment, bullying, hate speech, or any form of abusive behavior will not be tolerated.
                    </Text>

                    <Text style={style.heading}>3. Responsible Sharing</Text>
                    <Text style={style.paragraph}>
                        Share accurate and helpful information. Do not spread misinformation, spam, or engage in promotional activities without approval.
                    </Text>

                    <Text style={style.heading}>4. Privacy and Confidentiality</Text>
                    <Text style={style.paragraph}>
                        Do not post personal, sensitive, or confidential information—whether your own or others'—without explicit consent.
                    </Text>

                    <Text style={style.heading}>5. Illegal or Harmful Content</Text>
                    <Text style={style.paragraph}>
                        Posting content that is illegal, promotes harm, violence, or endangers individuals or groups is strictly prohibited.
                    </Text>

                    <Text style={style.heading}>6. Intellectual Property</Text>
                    <Text style={style.paragraph}>
                        Only share content that you own or have permission to use. Respect copyrights, trademarks, and other intellectual property rights.
                    </Text>

                    <Text style={style.heading}>7. Reporting Violations</Text>
                    <Text style={style.paragraph}>
                        If you witness behavior that violates these guidelines, report it through the in-app feedback tool or by contacting our Help Center.
                    </Text>

                    <Text style={style.heading}>8. Consequences</Text>
                    <Text style={style.paragraph}>
                        Violations of these guidelines may lead to warnings, content removal, suspension, or permanent banning of user accounts, depending on the severity.
                    </Text>

                    <Text style={style.heading}>9. Updates to Guidelines</Text>
                    <Text style={style.paragraph}>
                        These guidelines may be updated to reflect community needs and legal requirements. Continued use of the platform means you agree to the latest version.
                    </Text>

                    <Text style={style.heading}>10. Contact Us</Text>
                    <Text style={style.paragraph}>
                        For concerns, questions, or suggestions about our community guidelines, please contact us through the Help Center or email us at ntc.edge@gmail.com.
                    </Text>

                </ScrollView>
            </View>

            <Footer></Footer>
        </ImageBackground>
        </>
    );
};

export default React.memo(CommunityGuidelines);
