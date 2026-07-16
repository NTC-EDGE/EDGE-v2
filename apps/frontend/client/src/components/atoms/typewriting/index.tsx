import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSharedValue, withSpring, useAnimatedStyle, runOnUI } from 'react-native-reanimated';

const TypewritingText = ({ text, speed = 100 } ) => {
    const [displayedText, setDisplayedText] = useState('');
    const textIndex = useSharedValue(0);

    useEffect(() => {
        if (textIndex.value < text.length) {
            const timer = setInterval(() => {
                textIndex.value += 1;
                runOnUI(() => {
                    setDisplayedText(text.substring(0, textIndex.value));
                });
            }, speed);

            return () => clearInterval(timer);
        }
    }, [textIndex.value, text, speed]);

    return (
       {displayedText}
    );
};

export default TypewritingText;
