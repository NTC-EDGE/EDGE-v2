import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@edge/ui';

const logoAsset = require('../../../assets/ntc-logo.png');
const darkLogoAsset = require('../../../assets/footer-logo.png');

interface LogoProps {
  height?: number;
  variant?: 'default' | 'light' | 'dark' | 'footer' | 'auto';
  style?: ViewStyle;
}

export function Logo({ height = 72, variant = 'default', style }: LogoProps) {
  const { isDark } = useTheme();
  // Generous aspect ratio (3.8:1) for horizontal NTC EDGE banner logo
  const width = height * 3.8;

  // 'dark' or 'footer' renders footer-logo.png (colored NTC seal + white EDGE lettering for dark surfaces)
  // 'default' or 'light' renders ntc-logo.png (colored NTC seal + dark blue EDGE lettering for light surfaces)
  // 'auto' automatically switches based on active theme / device color scheme
  const useDarkSurfaceLogo =
    variant === 'dark' ||
    variant === 'footer' ||
    (variant === 'auto' && isDark);

  return (
    <View style={[styles.container, { height, width }, style]}>
      <Image
        source={useDarkSurfaceLogo ? darkLogoAsset : logoAsset}
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
