import React, {FC, useEffect, useRef, useState} from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    Platform,
    useColorScheme,
} from 'react-native';
import { Close } from '@atoms/icon';
import styles from './style';
import { useNavigation } from '@react-navigation/core';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import {JSONfn} from "@utils/formatting";
import useApi from "@config/api";
import {BASE_URL} from "@services/config";
import {useSelector} from "react-redux";
const regionMap: Record<string, string> = {
    'Region I - Ilocos Region': 'I',
    'Region III - Central Luzon': 'III',
    'Region IV-A - CALABARZON': 'IV-A',
    'Region VII - Central Visayas': 'VII',
    'Region IX - Zamboanga Peninsula': 'IX',
    'Region X - Northern Mindanao': 'X',
    'Region XI - Davao Region': 'XI',
    'Region XII - SOCCSKSARGEN': 'XII',
    'Region XIII - Caraga': 'XIII',
    'Region XIV': 'XIV',
};
const isBudgetDevice = Platform.OS === 'android' && Platform.Version < 28;

interface HelpModalProps {
    visible: boolean;
    onClose: () => void;
    containerStyle?: StyleProp<ViewStyle>;
}

const HelpModal: FC<HelpModalProps> = ({ visible, onClose, containerStyle }) => {
    const navigation = useNavigation();
    const confettiRef = useRef(null);
    const api = useApi(null);
    const user = useSelector(state => state?.user?.session);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [supportLoading, setSupportLoading] = useState(false)
    const [email, setEmail] = useState<any[]>([
        { icon: '📧', text: 'ntc.edge@gmail.com', delay: 100 },
    ]);
    const [message, setMessage] = useState("");
    useEffect(() => {
        fetchSupportContact();
    }, []);
    const userRegionName = user?.applicant?.address?.region ?? '';
    const userRegionCode = regionMap[userRegionName] ?? '';
    const fetchSupportContact = async () => {
        setSupportLoading(true);
        try {
            api.get(`${BASE_URL}/regions/help-contact?region=${userRegionCode}`)
                .then((res) => {
                    if(res.data.email ){
                        setEmail([
                            { icon: '📧', text: res.data.email, hotline: res?.data?.hotline, delay: 100 },
                        ]);
                        setMessage(res.data.message);
                    }

                })
        } catch (e) {
            console.error("Failed to fetch support contact");
        } finally {
            setSupportLoading(false);
        }
    };


    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                confettiRef.current?.start();
            }, 400);
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none">
            <BlurView
                intensity={80}
                tint={isDark ? 'dark' : 'light'}
                style={styles.overlay}
            >
                <AnimatePresence>
                    {visible && (
                        <MotiView
                            key="help-modal"
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'timing', duration: 300 }}
                            style={[
                                styles.container,
                                containerStyle,
                                isDark && { backgroundColor: 'rgba(20,20,20,0.85)' },
                            ]}
                        >
                            <ConfettiCannon
                                count={isBudgetDevice ? 8 : 30}
                                origin={{ x: 200, y: 0 }}
                                autoStart={false}
                                fadeOut
                                fallSpeed={isBudgetDevice ? 5000 : 3000}
                                explosionSpeed={isBudgetDevice ? 200 : 400}
                                ref={confettiRef}
                            />

                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <Close size={24} color={isDark ? '#fff' : '#000'} />
                            </TouchableOpacity>

                            <MotiText
                                from={{ opacity: 0, translateY: -10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 200, duration: 400, type: 'timing' }}
                                style={[styles.title, isDark && { color: '#fff' }]}
                            >
                                Need Help?
                            </MotiText>

                            <MotiText
                                from={{ opacity: 0, translateY: -10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 300, duration: 400, type: 'timing' }}
                                style={[styles.subtitle, isDark && { color: '#bbb' }]}
                            >
                                For general questions, support, or requests, reach out to us:
                            </MotiText>

                            {email.map((item) => (
                                <MotiView
                                    key={item.text}
                                    from={{ opacity: 0, translateY: 20 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{
                                        delay: item.delay + 300,
                                        type: 'timing',
                                        duration: 400,
                                    }}
                                    style={styles.contactCard}
                                >
                                    <View style={styles.iconBubble}>
                                        <MotiText style={styles.iconEmoji}>{item.icon}</MotiText>
                                    </View>
                                    <MotiText style={[styles.contactText, isDark && { color: '#eee' }]}>
                                        {item.text}
                                    </MotiText>
                                </MotiView>
                            ))}

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.ctaButton}
                                onPress={() => {
                                    navigation.navigate('HelpCenter');
                                    onClose();
                                }}
                            >
                                <MotiText
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 600, duration: 300 }}
                                    style={styles.ctaText}
                                >
                                    Open Help Center
                                </MotiText>
                            </TouchableOpacity>
                        </MotiView>
                    )}
                </AnimatePresence>
            </BlurView>
        </Modal>
    );
};

export default React.memo(HelpModal);
