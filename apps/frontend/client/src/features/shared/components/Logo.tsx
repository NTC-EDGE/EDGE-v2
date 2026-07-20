import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

const logoAsset = require('../../../../assets/ntc-logo.png');

interface LogoProps {
  height?: number;
  variant?: 'default' | 'light';
  style?: ViewStyle;
}

export function Logo({ height = 72, style }: LogoProps) {
  // Generous aspect ratio (3.8:1) for ntc-logo.png to render crystal clear
  const width = height * 3.8;

  return (
    <View style={[styles.container, { height, width }, style]}>
      <Image
        source={logoAsset}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
