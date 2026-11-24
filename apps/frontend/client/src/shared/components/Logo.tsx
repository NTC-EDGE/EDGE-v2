import React from 'react';
import { View, Image, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { useTheme } from '@edge/ui';

const logoAsset = require('../../../assets/logo.png');
const darkLogoAsset = require('../../../assets/footer-logo.png');

interface LogoProps {
  height?: number;
  variant?: 'default' | 'light' | 'dark' | 'footer' | 'auto';
  style?: ViewStyle;
}

export function Logo({ height = 72, variant = 'auto', style }: LogoProps) {
  const { isDark } = useTheme();
  const deviceColorScheme = useColorScheme();
  const effectiveIsDark = Boolean(isDark || deviceColorScheme === 'dark');
  // Generous aspect ratio (3.8:1) for horizontal NTC EDGE banner logo
  const width = height * 3.8;

  // 'dark' or 'footer' renders footer-logo.png (colored NTC seal + white EDGE lettering for dark surfaces)
  // 'light' renders logo.png (colored NTC seal + dark blue EDGE lettering for light surfaces)
  // 'auto' or 'default' automatically switches based on active theme / device color scheme
  const isAutoDark = (variant === 'auto' || variant === 'default') && effectiveIsDark;
  const useDarkSurfaceLogo =
    variant === 'dark' ||
    variant === 'footer' ||
    isAutoDark;

  return (
    <View
      style={[
        styles.container,
        { height, width },
        isAutoDark ? styles.autoDarkSurface : null,
        style,
      ]}
    >
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
  autoDarkSurface: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
