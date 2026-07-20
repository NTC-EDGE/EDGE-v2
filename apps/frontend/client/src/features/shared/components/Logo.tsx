import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

const logoAsset = require('../../../../assets/ntc-logo.png');

interface LogoProps {
  height?: number;
  variant?: 'default' | 'light';
  style?: ViewStyle;
}

export function Logo({ height = 44, style }: LogoProps) {
  // Standard aspect ratio for ntc-logo.png
  const width = height * 3.5;

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
