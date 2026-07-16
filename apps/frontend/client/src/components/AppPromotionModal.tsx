// AppPromoBanner.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, Platform, Linking } from 'react-native';

const ANDROID_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.ntcedge.portal&hl=en-US&pli=1';
const DIRECT_APK_URL   = 'https://example.com/app.apk'; // optional; remove if you don’t want sideloading
const STORAGE_KEY      = 'appPromoBanner:dismissedAt';
const HIDE_DAYS        = 1;
function isAndroidWebUA() {
    if (Platform.OS !== 'web') return false;
    const ua = navigator.userAgent || '';
    return /Android/i.test(ua);
}

function dismissedRecently() {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return false;
        const then = new Date(raw).getTime();
        const now = Date.now();
        return now - then < HIDE_DAYS * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

export default function AppPromoBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isAndroidWebUA() && !dismissedRecently()) {
            setVisible(true);
        }
    }, []);

    const dismiss = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
            }
        } catch {}
        setVisible(false);
    }, []);

    const open = useCallback((url: string) => {
        Linking.openURL(url).catch(() => {});
    }, []);

    if (!visible) return null;

    return (
        <View
            style={{
                position: 'fixed' as any,
                left: 0, right: 0, bottom: 0,
                paddingVertical: 12, paddingHorizontal: 16,
                backgroundColor: '#121212',
                borderTopWidth: 1, borderTopColor: '#2a2a2a',
                display: 'flex', flexDirection: 'row',
                alignItems: 'center', justifyContent: 'space-between',
                zIndex: 9999
            }}
        >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Download our Android App
            </Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                    onPress={() => open(ANDROID_PLAY_URL)}
                    style={({ pressed }) => ({
                        paddingVertical: 8, paddingHorizontal: 12,
                        backgroundColor: pressed ? '#2b9a66' : '#10b981',
                        borderRadius: 8
                    })}
                >
                    <Text style={{ color: '#000', fontWeight: '700' }}>Google Play</Text>
                </Pressable>



                <Pressable
                    onPress={dismiss}
                    accessibilityLabel="Dismiss app download banner"
                    style={({ pressed }) => ({
                        paddingVertical: 8, paddingHorizontal: 12,
                        backgroundColor: pressed ? '#272727' : '#1f1f1f',
                        borderRadius: 8
                    })}
                >
                    <Text style={{ color: '#aaa', fontWeight: '700' }}>Dismiss</Text>
                </Pressable>
            </View>
        </View>
    );
}
