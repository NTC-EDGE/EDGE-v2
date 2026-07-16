import React, {
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    View,
    Platform,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { useSelector, RootStateOrAny, useDispatch } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import useFonts from '@hooks/useFont';
import { fetchRegions } from '@reducers/application/actions';
import EdgeLogo from '@assets/svg/edge';
import { RNValue as RFValue } from '@utils/formatting';
import axios from "axios";
import {BASE_URL} from "@services/config";
import {Poppins_400Regular} from "@expo-google-fonts/poppins";


SplashScreen.preventAutoHideAsync();

const primaryColor = '#031A6E';
const infoColor = '#2F5BFA';
const accentColor = '#7EB6FF';
const gradientColors = ['#000A33', '#031A6E', '#2F5BFA'];
const App = ({ navigation }: any) => {
    const dispatch = useDispatch();

    const [appIsReady, setAppIsReady] = useState(false);
    const [animationFinished, setAnimationFinished] = useState(false);

    const sessionToken = useSelector(
        (state: RootStateOrAny) => state?.user?.session?.sessionToken
    );

    const splashHiddenRef = useRef(false);
    const navigatedRef = useRef(false);

    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.82)).current;
    const logoTranslateY = useRef(new Animated.Value(20)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;

    const pulseScale = useRef(new Animated.Value(0.92)).current;
    const pulseOpacity = useRef(new Animated.Value(0.18)).current;

    const orb1Y = useRef(new Animated.Value(0)).current;
    const orb2Y = useRef(new Animated.Value(0)).current;
    const orb3Y = useRef(new Animated.Value(0)).current;

    const orb1X = useRef(new Animated.Value(0)).current;
    const orb2X = useRef(new Animated.Value(0)).current;
    const orb3X = useRef(new Animated.Value(0)).current;

    const shimmerX = useRef(new Animated.Value(-220)).current;
    const shimmerOpacity = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        async function prepare() {
            try {
                await useFonts();

                if (sessionToken) {
                    // @ts-ignore
                    dispatch(fetchRegions());
                }
            } catch (e) {
                console.warn('Failed to load fonts', e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (!appIsReady) return;

        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(pulseScale, {
                        toValue: 1.08,
                        duration: 1300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseOpacity, {
                        toValue: 0.30,
                        duration: 1300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(pulseScale, {
                        toValue: 0.94,
                        duration: 1300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseOpacity, {
                        toValue: 0.14,
                        duration: 1300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        const orbLoop1 = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(orb1Y, {
                        toValue: -16,
                        duration: 2600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(orb1X, {
                        toValue: 12,
                        duration: 2600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(orb1Y, {
                        toValue: 0,
                        duration: 2600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(orb1X, {
                        toValue: 0,
                        duration: 2600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        const orbLoop2 = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(orb2Y, {
                        toValue: 14,
                        duration: 3000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(orb2X, {
                        toValue: -10,
                        duration: 3000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(orb2Y, {
                        toValue: 0,
                        duration: 3000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(orb2X, {
                        toValue: 0,
                        duration: 3000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        const orbLoop3 = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(orb3Y, {
                        toValue: -10,
                        duration: 2200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(orb3X, {
                        toValue: -8,
                        duration: 2200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(orb3Y, {
                        toValue: 0,
                        duration: 2200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(orb3X, {
                        toValue: 0,
                        duration: 2200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        const shimmerLoop = Animated.loop(
            Animated.sequence([
                Animated.delay(250),
                Animated.parallel([
                    Animated.timing(shimmerX, {
                        toValue: 260,
                        duration: 1300,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(shimmerOpacity, {
                            toValue: 0.45,
                            duration: 180,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shimmerOpacity, {
                            toValue: 0,
                            duration: 900,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
                Animated.timing(shimmerX, {
                    toValue: -220,
                    duration: 0,
                    useNativeDriver: true,
                }),
                Animated.delay(1100),
            ])
        );

        pulseLoop.start();
        orbLoop1.start();
        orbLoop2.start();
        orbLoop3.start();
        shimmerLoop.start();

        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 6,
                tension: 70,
                useNativeDriver: true,
            }),
            Animated.timing(logoTranslateY, {
                toValue: 0,
                duration: 750,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(logoRotate, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setTimeout(() => setAnimationFinished(true), 900);
        });

        return () => {
            pulseLoop.stop();
            orbLoop1.stop();
            orbLoop2.stop();
            orbLoop3.stop();
            shimmerLoop.stop();
        };
    }, [
        appIsReady,
        logoOpacity,
        logoScale,
        logoTranslateY,
        logoRotate,
        pulseScale,
        pulseOpacity,
        orb1X,
        orb1Y,
        orb2X,
        orb2Y,
        orb3X,
        orb3Y,
        shimmerX,
        shimmerOpacity,
    ]);

    const onLayoutRootView = useCallback(async () => {
        if (!appIsReady || splashHiddenRef.current) return;

        try {
            await SplashScreen.hideAsync();
        } catch (e) {
            console.warn('Error hiding splash screen:', e);
        }

        splashHiddenRef.current = true;
    }, [appIsReady]);

    useEffect(() => {
        if (!appIsReady || !animationFinished || navigatedRef.current) return;

        navigatedRef.current = true;

        if (sessionToken) {
            navigation.replace('HomeScreen');
        } else {
            navigation.replace(Platform.OS === 'web' ? 'Login' : 'AppIntro');
        }
    }, [animationFinished, appIsReady, navigation, sessionToken]);

    if (!appIsReady) return null;

    const rotateInterpolate = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['-4deg', '0deg'],
    });

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <Animated.View
                style={[
                    styles.orb,
                    styles.orbOne,
                    {
                        transform: [{ translateY: orb1Y }, { translateX: orb1X }],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.orb,
                    styles.orbTwo,
                    {
                        transform: [{ translateY: orb2Y }, { translateX: orb2X }],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.orb,
                    styles.orbThree,
                    {
                        transform: [{ translateY: orb3Y }, { translateX: orb3X }],
                    },
                ]}
            />

            <Animated.View
                style={[
                    styles.pulseRing,
                    {
                        opacity: pulseOpacity,
                        transform: [{ scale: pulseScale }],
                    },
                ]}
            />

            <Animated.View
                style={[
                    styles.logoWrapper,
                    {
                        opacity: logoOpacity,
                        transform: [
                            { scale: logoScale },
                            { translateY: logoTranslateY },
                            { rotate: rotateInterpolate },
                        ],
                    },
                ]}
            >
                <View style={styles.logoCard}>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            {
                                opacity: shimmerOpacity,
                                transform: [{ translateX: shimmerX }, { rotate: '18deg' }],
                            },
                        ]}
                    />
                    <EdgeLogo width={381} height={87} />
                </View>

                <View style={styles.dotsRow}>
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                opacity: pulseOpacity.interpolate({
                                    inputRange: [0.14, 0.3],
                                    outputRange: [0.45, 1],
                                }),
                                transform: [
                                    {
                                        scale: pulseScale.interpolate({
                                            inputRange: [0.94, 1.08],
                                            outputRange: [0.9, 1.1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            styles.dotMiddle,
                            {
                                opacity: pulseOpacity.interpolate({
                                    inputRange: [0.14, 0.3],
                                    outputRange: [1, 0.5],
                                }),
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                opacity: pulseOpacity.interpolate({
                                    inputRange: [0.14, 0.3],
                                    outputRange: [0.5, 1],
                                }),
                                transform: [
                                    {
                                        scale: pulseScale.interpolate({
                                            inputRange: [0.94, 1.08],
                                            outputRange: [1.08, 0.92],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />
                </View>
            </Animated.View>
        </View>
    );
};

export default memo(App);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },

    logoCard: {
        paddingHorizontal: 40,
        paddingVertical: 28,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        shadowColor: accentColor,
        shadowOpacity: 0.24,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        elevation: 12,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    pulseRing: {
        position: 'absolute',
        width: RFValue(320),
        height: RFValue(320),
        borderRadius: RFValue(160),
        backgroundColor: 'rgba(126,182,255,0.16)',
        zIndex: 1,
    },

    orb: {
        position: 'absolute',
        borderRadius: 999,
    },

    orbOne: {
        width: RFValue(180),
        height: RFValue(180),
        top: '18%',
        left: '-10%',
        backgroundColor: 'rgba(126,182,255,0.14)',
    },

    orbTwo: {
        width: RFValue(130),
        height: RFValue(130),
        bottom: '18%',
        right: '-6%',
        backgroundColor: 'rgba(47,91,250,0.22)',
    },

    orbThree: {
        width: RFValue(90),
        height: RFValue(90),
        top: '22%',
        right: '18%',
        backgroundColor: 'rgba(255,255,255,0.10)',
    },

    shimmer: {
        position: 'absolute',
        width: RFValue(90),
        height: '180%',
        backgroundColor: 'rgba(255,255,255,0.20)',
        left: -60,
        top: -20,
        borderRadius: 24,
    },

    dotsRow: {
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: '#FFFFFF',
        opacity: 0.8,
    },

    dotMiddle: {
        marginHorizontal: 10,
        backgroundColor: accentColor,
    },
});
