import React from 'react';
import { MotiView, AnimatePresence } from 'moti';
import { Platform } from 'react-native';

const GlowRing = ({
                      visible,
                      color = '#407BFF',
                      size = 137.5,
                      pulseColors = ['#407BFF', '#7AA9FF', '#BFD4FF'], // soft blue gradient cycle
                  }) => {
    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Outer ring pulse */}
                    <MotiView
                        from={{ opacity: 0.15, scale: 0.9 }}
                        animate={{
                            opacity: [0.15, 0.55, 0.15],
                            scale: [0.9, 1.08, 0.9],
                            borderColor: pulseColors,
                        }}
                        transition={{
                            loop: true,
                            type: 'timing',
                            duration: 2200,
                        }}
                        style={{
                            position: 'absolute',
                            width: size + 8,
                            height: size + 8,
                            borderRadius: size / 2,
                            borderWidth: 3,
                            borderColor: color,
                            shadowColor: color,
                            shadowOpacity: 0.6,
                            shadowRadius: 24,
                            shadowOffset: { width: 0, height: 8 },
                            zIndex: -1,
                        }}
                    />

                    {/* Core glow area */}
                    <MotiView
                        from={{ opacity: 0.3, scale: 0.98 }}
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.98, 1.05, 0.98],
                            backgroundColor: [
                                `${pulseColors[0]}33`,
                                `${pulseColors[1]}44`,
                                `${pulseColors[2]}33`,
                            ],
                        }}
                        transition={{
                            loop: true,
                            type: 'timing',
                            duration: 1800,
                        }}
                        style={{
                            position: 'absolute',
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: `${color}22`,
                            shadowColor: color,
                            shadowOpacity: 0.8,
                            shadowRadius: 18,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: Platform.OS === 'android' ? 8 : 0,
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

export default GlowRing;
