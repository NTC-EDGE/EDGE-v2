import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    Pressable,
    Linking,
    Platform,
    StyleSheet,
    Dimensions,
    useWindowDimensions,
    TouchableOpacity,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {MotiView, AnimatePresence} from "moti";
import {X, ChevronDown, LogInIcon, SearchIcon,} from "lucide-react-native";
import AboutEdge from "@molecules/landing/About";
import Hero from "@molecules/landing/Hero";
import EdgeBlue from "@assets/svg/edgeBlue";
import HowItWorks from "@molecules/landing/HowitWorks";
import {GuestModal} from "@molecules/landing/GuestModal";
import {LoginModal} from "@molecules/landing/Login";
import LoginForm from "@organisms/forms/login";
import {useLogin} from "@hooks/useLogin";
import {useDispatch} from "react-redux";
import {setCreatedAt, setLoggingIn, setLoginUserError} from "@reducers/user/actions";
import Alert from "@atoms/alert";
import {useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming} from "react-native-reanimated";
import useApi, {changeCreatedAt} from "@config/api";
import {JSONfn, RNValue as RFValue} from "@utils/formatting";
import {GUEST_USER, regionList} from "@utils/ntc";
import {AnimatedModal} from "@atoms/modals";
import {DropdownField, InputField} from "@molecules/form-fields";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {text} from "@styles/color";
import LandingButton from "@molecules/landing/LandingButton";
import {Bold, Regular} from "@styles/font";
import ForgotPasswordComponent from "@molecules/landing/forgorPassword";
import Signup from "@molecules/landing/signup";
import Footer from "@molecules/landing/Footer";
import SEO from "@atoms/seo";

const BLUE = "#003366";
const RED = "#E4002B";
const TEXT = "#29465B";
const BG = "#ffffff";

type QA = { q: string; a: string };

const FAQS: QA[] = [{
    q: "What is the EDGE application?",
    a: "The Electronic Data Governance and Evaluation (EDGE) application is an online information system by the NTC for issuing certificates, permits, licenses, and handling complaints/requests."
}, {
    q: "Who can use this portal?",
    a: "Individuals and businesses who need to interact with the NTC for services like permits, licenses, and tracking complaints."
}, {
    q: "How do I track my application?",
    a: "Tap “Track Application” and enter your reference number or open “My Applications” in your dashboard."
}, {
    q: "Is my data secure?",
    a: "Yes. We use industry-standard security to protect your information and application data."
},];


export default function EdgePortalScreen({navigation, route}: any) {
    const [showGuest, setShowGuest] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const dispatch = useDispatch();

    const {width, height} = useWindowDimensions();
    const {
        loggingIn, formValue, isValid, loginUserError, onChangeValue, onCheckValidation,
    } = useLogin(navigation, route);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        opacity.value = withSpring(1, {damping: 2});
        scale.value = withSpring(1, {damping: 2});
    }, []);


    const positionX = useSharedValue(-width * 0.22);
    useEffect(() => {
        positionX.value = withSpring(0, {damping: 12, stiffness: 100});
    }, []);
    const opacity1 = useSharedValue(0);
    const opacity2 = useSharedValue(0);
    const scale1 = useSharedValue(0.8);
    const scale2 = useSharedValue(0.8);

    useEffect(() => {
        opacity1.value = withTiming(1, {duration: 1000});
        scale1.value = withSpring(1, {damping: 8});

        opacity2.value = withDelay(500, withTiming(1, {duration: 1000}));
        scale2.value = withDelay(500, withSpring(1, {damping: 8}));
    }, []);
    const api = useApi(null);
    const [tracking, setTracking] = useState(false);
    const [alert, setAlert] = useState({title: '', message: ''});
    const [visibleA, setVisibleA] = useState(false);
    const [registrationModal, setRegistrationModal] = useState(false);
    const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState('');
    const scrollRef = useRef(null);
    const [positions, setPositions] = useState({
        about: 0, how: 0,
    });
    const scrollToAbout = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTo({y: positions.about - 40, animated: true}); // -40 = small offset
    };

    const scrollToBottom = () => {
        if (!scrollRef.current) return;

        scrollRef.current.scrollToEnd({animated: true});
    };
    const scrollToHowitworks = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTo({y: positions.how - 40, animated: true});
    };
    const [region, setRegion] = useState({
        label: "Region X - Northern Mindanao", value: "ntc-region10"
    });

    useEffect(() => {
        var _region = route?.params?.region
        var changeRegion = {
            label: "Region X - Northern Mindanao", value: "ntc-region10"
        }
        if (_region) {
            if (_region == "13") {
                changeRegion = {
                    label: "Region XIII - Caraga", value: "ntc-region13"
                }
            }
            if (_region == "3") {
                changeRegion = {
                    label: "Region III - Central Luzon", value: "ntc-region3"
                }
            } else if (_region == "11") {
                changeRegion = {
                    label: "Region XI - Davao Region", value: "ntc-region11"
                }
            } else if (_region == "10") {
                changeRegion = {
                    label: "Region X - Northern Mindanao", value: "ntc-region10"
                }
            } else if (_region == "12") {
                changeRegion = {
                    label: "Region XII - SOCCSKSARGEN", value: "ntc-region12"
                }
            } else if (_region == "9") {
                changeRegion = {
                    label: "Region IX - Zamboanga Peninsula", value: "ntc-region9"
                }
            } else if (_region == "7") {
                changeRegion = {
                    label: "Region VII - Central Visayas", value: "ntc-region7"
                }
            }
            dispatch(setCreatedAt(changeCreatedAt(changeRegion.value)))
            onChangeValue('CreatedAt', changeRegion)
            setRegion(changeRegion)
        }
    }, [route?.params?.region]);


    useEffect(() => {
        return () => {
            if (loggingIn) dispatch(setLoggingIn(false));
        }
    });
    useEffect(() => {
        if (loginUserError) {
            setAlert({
                title: 'Authentication Failed', message: 'Credentials provided do not match our record.'
            });
            setTimeout(() => setVisibleA(true), 500);
        }
    }, [loginUserError]);
    const hideAlert = () => {
        setShowRegistrationModal(false);
    };
    const renderAlert = () => (<Alert
        visible={visibleA}
        title={alert?.title}
        message={alert?.message}
        confirmText='OK'
        onConfirm={() => {
            setVisibleA(false);
            dispatch(setLoginUserError(false));
        }}
    />);
    const onFind = () => {
        setTracking(true);
        let reset = () => {
            setTracking(false);
            setReferenceNumber('');
            setVisibleM(false);
        };
        let notFound = (_a: any = null) => {
            _a = {
                title: _a?.status === 404 || _a?.title ? 'Application Not Found' : _a.title,
                message: _a?.status === 404 || _a?.title ? 'It seems like the application you are trying to track is non-existent.\n\nPlease double check your reference no.' : _a?.message,
            };
            reset();
            setAlert(_a);
            setTimeout(() => setVisibleA(true), 500);
        };

        dispatch(setCreatedAt(formValue?.CreatedAt?.value?.value ?? "ntc-region10"));
        api.get(`/applications-v2/${referenceNumber}?region=${formValue.CreatedAt?.value?.label}`, {
            headers: {
                'Content-type': ('application/json'), ...(true ? {CreatedAt: formValue?.CreatedAt?.value?.value ?? "ntc-region10"} : {})
            }
        })
            .then((res) => {
                reset();
                if (res?.data?._id) navigation.navigate('Preview', {application: res?.data}); else notFound();
            })
            .catch(e => {
                e = JSONfn.parse(JSONfn.stringify(e));
                notFound({
                    status: e?.status, title: e?.name, message: e?.message,
                });
            }).finally(() => {
            setTracking(false)

        });
    };
    const [visibleM, setVisibleM] = useState(false);

    const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
    useEffect(() => {
        const handleResize = ({window}: any) => {
            setWindowDimensions(window);
        };

        const subscription = Dimensions.addEventListener('change', handleResize);

        return () => {
            subscription?.remove();
        };
    }, []);
    useEffect(() => {
        const loadSavedRegion = async () => {
            try {
                const storedRegion = await AsyncStorage.getItem('selectedRegion');
                if (storedRegion) {
                    const parsedRegion = JSON.parse(storedRegion);
                    dispatch(setCreatedAt(parsedRegion.value));
                    onChangeValue('CreatedAt', parsedRegion);
                    setRegion(parsedRegion);
                }
            } catch (e) {
                console.warn('Failed to load saved region', e);
            }
        };

        loadSavedRegion();
    }, []);

    const steps = useMemo(() => ([{
        n: 1, title: "Create Account/Apply", body: "Register an account or tap Start Application to begin."
    }, {
        n: 2, title: "Submit Application", body: "Complete forms and upload requirements."
    }, {
        n: 3, title: "Track Application", body: "Use your reference number or My Applications."
    }, {
        n: 4, title: "Process Payment", body: "Pay fees at the nearest NTC office once approved."
    }, {
        n: 5, title: "Get Issuance", body: "Receive your License, Certificate, Permit, or resolution."
    },]), []);

    /** Header */
    const Header = () => (<SafeAreaView edges={["top"]} style={[styles.header, {backgroundColor: "#fff"}]}>
        <View style={styles.headerInner}>
            <View style={styles.rowCenter}>
                <EdgeBlue width={200}/>
            </View>

            <View style={styles.headerActions}>
                {[{
                    name: "About", onClick: scrollToAbout
                }, {
                    name: "How it works", onClick: scrollToHowitworks
                }, {
                    name: "FAQs", onClick: scrollToBottom
                }].map((t) => (<Pressable key={t?.name} onPress={t.onClick} style={styles.headerLink}>
                    <Text style={[styles.headerLinkText, {color: "#334155"}]}>{t.name}</Text>
                </Pressable>))}
            </View>
        </View>
    </SafeAreaView>);


    /** FAQ */
    const FAQs = () => (<View style={[styles.section, {backgroundColor: "#fff"}]}>
        <View style={[styles.sectionInner, {maxWidth: 900, flexDirection: "column"}]}>
            <Text style={[styles.h2, {textAlign: "center", marginBottom: 12}]}>Frequently Asked Questions</Text>

            <View style={{gap: 12}}>
                {FAQS.map((qa, i) => <FAQItem key={i} {...qa} />)}
            </View>
        </View>
    </View>);

    function FAQItem({q, a}: QA) {
        const [open, setOpen] = useState(true);
        return (<MotiView
            from={{opacity: 0, translateY: 6}}
            animate={{opacity: 1, translateY: 0}}
            transition={{type: "timing", duration: 200}}
            style={styles.faqCard}
        >
            <Pressable onPress={() => setOpen(v => !v)}
                       style={({pressed}) => [styles.faqHeader, pressed && {opacity: 0.9}]}>
                <Text style={styles.faqQ}>{q}</Text>
                <MotiView from={{rotate: "0deg"}} animate={{rotate: open ? "180deg" : "0deg"}}
                          transition={{duration: 180}}>
                    <ChevronDown color={BLUE}/>
                </MotiView>
            </Pressable>

            <AnimatePresence>
                {open && (<MotiView
                    from={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: "auto"}}
                    exit={{opacity: 0, height: 0}}
                    transition={{duration: 200}}
                    style={{overflow: "hidden"}}
                >
                    <Text style={styles.faqA}>{a}</Text>
                </MotiView>)}
            </AnimatePresence>
        </MotiView>);
    }

    /** Footer (sticky/pinned to bottom of ScrollView content) */


    const renderModal = () => (<AnimatedModal
        containerStyle={{
            width: "40%", minWidth: 420, alignSelf: "center"
        }}
        visible={visibleM}
        onDismiss={() => setVisibleM(false)}
    >

        <View style={styles?.modalView}>
            <Text style={styles?.modalLabelText}>
                Track Application
            </Text>
            <InputField

                label='Reference No.'
                placeholder='Enter you reference no.'
                value={referenceNumber}
                error={!referenceNumber}
                onChangeText={(value: string) => setReferenceNumber(value)}
            />
            <DropdownField
                items={regionList}
                required={true}
                hasValidation={true}
                placeholder='Region'

                value={region?.label}
                onChangeValue={(value: object) => {
                    if (value?.value) {
                        dispatch(setCreatedAt(changeCreatedAt(value?.value)))
                        onChangeValue('CreatedAt', {...value, value: changeCreatedAt(value?.value)})
                        AsyncStorage.setItem('selectedRegion', JSON.stringify({
                            ...value,
                            value: changeCreatedAt(value?.value)
                        }));
                    }
                    setRegion(value)
                }}
            />
            <LandingButton Icon={SearchIcon} disabled={!referenceNumber || tracking} label={"Track Application"}
                           onPress={onFind}/>
        </View>
    </AnimatedModal>);
    return (<View style={{flex: 1, backgroundColor: BG}}>
        <SEO
            title="NTC EDGE Portal – Official Electronic Data Governance & Evaluation"
            description="Issue certificates, permits, licenses, and handle complaints/requests online with the National Telecommunications Commission (NTC) EDGE application."
            canonical="https://www.ntcedge.com/"
            ogTitle="NTC EDGE Portal"
            ogDescription="Efficiently manage telecom-related applications and regulatory services online."
            twitterCard="summary_large_image"
        />
        <Header/>
        <ScrollView
            ref={scrollRef}
            contentContainerStyle={{paddingBottom: 90}}>
            <Hero onPress={() => setShowGuest(true)} onPress1={() => setVisibleM(true)}/>
            <View
                onLayout={e => {
                    const y = e.nativeEvent.layout.y;
                    setPositions(prev => ({...prev, about: y}));
                }}
            >
                <AboutEdge/>
            </View>
            <View
                onLayout={e => {
                    const y = e.nativeEvent.layout.y;
                    setPositions(prev => ({...prev, how: y}));
                }}
            >
                <HowItWorks steps={steps}/>
            </View>

            <FAQs/>
            <Footer/>


        </ScrollView>


        <GuestModal
            loggingIn={loggingIn}
            visible={showGuest}
            onClose={() => setShowGuest(false)}
            onLogin={() => {
                setShowGuest(false);
                setShowLogin(true);
            }}
            onGuest={() => {
                onChangeValue('login', {
                    ...GUEST_USER, createdAt: formValue?.CreatedAt?.value?.value
                })
            }}
            onSignUp={() => {
                setRegistrationModal(true)
            }}
        />
        <Signup width={width} registrationModal={registrationModal} setRegistrationModal={setRegistrationModal}
                setShowRegistrationModal={setShowRegistrationModal} showRegistrationModal={showRegistrationModal}
                hideAlert={hideAlert}/>
        <LoginModal visible={showLogin} onClose={() => setShowLogin(false)}>
            {/* Your form here */}
            <LoginForm showForgotPassword={false} onChangeValue={onChangeValue} form={formValue}/>
            <View>
                <View style={{
                    paddingBottom: 14,
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "flex-end"
                }}><TouchableOpacity onPress={() => {
                    setForgotPasswordModal(true)
                }}>
                    <Text
                        style={[{fontSize: 14, fontWeight: "500", fontFamily: Regular, color: text.primary}]}

                    >
                        Forgot your password?
                    </Text>
                </TouchableOpacity></View>
            </View>
            <LandingButton disabled={false} loading={loggingIn} label={"Login"} Icon={LogInIcon}
                           onPress={onCheckValidation}></LandingButton>
        </LoginModal>
        <ForgotPasswordComponent
            width={width}
            forgotPasswordModal={forgotPasswordModal}
            setForgotPasswordModal={setForgotPasswordModal}></ForgotPasswordComponent>
        {renderModal()}
        {renderAlert()}
    </View>);
}

const styles = StyleSheet.create({
    modalView: {
        paddingHorizontal: 20,

    },
    loginButton: {
        borderRadius: 10, maxHeight: RFValue(56), justifyContent: 'center',
    },
    boldText: {
        fontFamily: Bold,
    },
    modalLabelText: {
        fontFamily: Bold, fontSize: RFValue(16), color: text?.primary, textAlign: 'center', marginBottom: 20,
    },
    h2: {fontSize: 24, fontWeight: "900", color: TEXT},
    header: {width: "100%", borderBottomWidth: 1, borderBottomColor: "#e5e7eb"},
    section: {paddingVertical: "6%"},
    sectionInner: {
        maxWidth: 1200,
        width: "100%",
        alignSelf: "center",
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    headerInner: {
        maxWidth: 1200,
        width: "100%",
        alignSelf: "center",
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rowCenter: {flexDirection: "row", alignItems: "center"},
    headerTitle: {fontWeight: "800", fontSize: 18, marginLeft: 8},
    headerActions: {flexDirection: "row", alignItems: "center", gap: 10},
    headerLink: {paddingHorizontal: 8, paddingVertical: 6},
    headerLinkText: {fontWeight: "600"},

    logoBox: {
        width: 32, height: 32, borderRadius: 6, backgroundColor: RED, justifyContent: "center", alignItems: "center",
    },
    logoCircle: {position: "absolute", width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff"},
    logoCaret: {width: 12, height: 12, transform: [{rotate: "45deg"}], backgroundColor: BLUE},


    pill: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: BLUE,
        shadowOpacity: Platform.OS === "ios" ? 0.25 : 0,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 8},
        elevation: 3,
    },
    pillOutline: {backgroundColor: "#fff", borderWidth: 2, borderColor: BLUE},
    pillText: {color: "#fff", fontWeight: "800"},


    p: {fontSize: 15, color: "#334155", marginTop: 8},

    logoCard: {
        borderWidth: 4,
        borderColor: RED,
        borderRadius: 16,
        padding: 12,
        backgroundColor: "#f1f5f9",
        width: "100%",
        maxWidth: 360,
        height: 200,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    logoPanel: {flex: 1, borderRadius: 12, alignItems: "center", justifyContent: "center"},


    faqCard: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    faqHeader: {flexDirection: "row", alignItems: "center", justifyContent: "space-between"},
    faqQ: {fontSize: 16, fontWeight: "800", color: TEXT},
    faqA: {color: "#334155", marginTop: 8, fontSize: 15, lineHeight: 22},


    overlay: {flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16},
    modalCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        maxWidth: 480,
        width: "100%",
        alignSelf: "center"
    },
    modalClose: {position: "absolute", right: 16, top: 16, padding: 6},
    modalTitle: {fontSize: 22, fontWeight: "900", color: TEXT, textAlign: "center", marginBottom: 10},

    label: {fontSize: 12, color: "#475569", marginTop: 10, marginBottom: 6, fontWeight: "700"},
    input: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#f8fafc",
        color: TEXT,
    },
    resultBox: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "#F8FAFC"
    },
    resultTitle: {fontWeight: "800", marginBottom: 6, color: TEXT},
});
