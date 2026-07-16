import React, {memo} from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

export const ShimmerOverlay = () => (
    <MotiView
        from={{ translateX: -80, opacity: 0.0 }}
        animate={{ translateX: 160, opacity: 1 }}
        transition={{ type: 'timing', duration: 1400, loop: true }}
        style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 80,
            borderRadius: 8,
            overflow: 'hidden',
            pointerEvents: 'none',
        }}
    >
        <LinearGradient
            colors={['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
        />
    </MotiView>
);

export const StatusBadge = memo(({ label, colors }: { label: string; colors: string[] }) => (
    <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 160 }}
        style={{ marginLeft: 6 }}
    >
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    minWidth: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text style={{ fontSize: 12, color: '#fff' }}>{label}</Text>
            </LinearGradient>
            <ShimmerOverlay />
        </View>
    </MotiView>
));

// --- Usage in your component ---
