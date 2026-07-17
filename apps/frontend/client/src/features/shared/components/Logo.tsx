import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle, Line, Text as SvgText, Defs, TextPath } from 'react-native-svg';

interface LogoProps {
  height?: number;
  variant?: 'default' | 'light';
}

export function Logo({ height = 40, variant = 'default' }: LogoProps) {
  // Aspect ratio is 3.72 (335 / 90)
  const width = height * 3.72;

  const isLight = variant === 'light';
  const primaryColor = isLight ? '#FFFFFF' : '#0A3199';
  const secondaryColor = '#C8102E'; // Red accent
  const subtitleColor = isLight ? '#CBD5E1' : '#475569';

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 335 90"
        fill="none"
      >
        <Defs>
          {/* Paths for text wrapping around the circular NTC seal */}
          {/* Top text path: circular arc from left to right, clockwise, at radius 33.5 */}
          <Path
            id="ntc-top-path"
            d="M 11.5 45 A 33.5 33.5 0 0 1 78.5 45"
            fill="none"
          />
          {/* Bottom text path: circular arc from right to left, clockwise, at radius 33.5 (renders at bottom) */}
          <Path
            id="ntc-bottom-path"
            d="M 78.5 45 A 33.5 33.5 0 0 1 11.5 45"
            fill="none"
          />
        </Defs>

        {/* ========================================== */}
        {/* 1. NTC SEAL (Left - Keep brand colors)     */}
        {/* ========================================== */}
        {/* Outer White Background and border */}
        <Circle cx="45" cy="45" r="40" fill="#FFFFFF" stroke="#000000" strokeWidth="1.0" />

        {/* Top Text "NATIONAL TELECOMMUNICATIONS" */}
        <SvgText fontSize="5.2" fontWeight="900" fill="#1E293B" letterSpacing="0.2">
          <TextPath href="#ntc-top-path" startOffset="50%" textAnchor="middle">
            NATIONAL TELECOMMUNICATIONS
          </TextPath>
        </SvgText>

        {/* Bottom Text "COMMISSION" */}
        <SvgText fontSize="5.2" fontWeight="900" fill="#1E293B" letterSpacing="0.2">
          <TextPath href="#ntc-bottom-path" startOffset="50%" textAnchor="middle">
            COMMISSION
          </TextPath>
        </SvgText>

        {/* Inner Circle Border */}
        <Circle cx="45" cy="45" r="27" fill="none" stroke="#000000" strokeWidth="1.0" />

        {/* Blue/Red Half Circle Backgrounds */}
        {/* Left Semi-Circle (Blue) */}
        <Path d="M 45 18 A 27 27 0 0 0 45 72 Z" fill="#0A3199" />
        {/* Right Semi-Circle (Red) */}
        <Path d="M 45 18 A 27 27 0 0 1 45 72 Z" fill="#C8102E" />

        {/* Concentric White Rings inside blue/red area */}
        <Circle cx="45" cy="45" r="20.5" fill="none" stroke="#FFFFFF" strokeWidth="0.9" strokeOpacity="0.95" />
        <Circle cx="45" cy="45" r="14" fill="none" stroke="#FFFFFF" strokeWidth="0.9" strokeOpacity="0.95" />
        <Circle cx="45" cy="45" r="7.5" fill="none" stroke="#FFFFFF" strokeWidth="0.9" strokeOpacity="0.95" />

        {/* Target Reticle (Y-lines) */}
        {/* Center white dot */}
        <Circle cx="45" cy="45" r="2.5" fill="#FFFFFF" />
        {/* Bottom vertical white line (along division) */}
        <Line x1="45" y1="45" x2="45" y2="72" stroke="#FFFFFF" strokeWidth="1.0" strokeOpacity="0.95" />
        {/* Diagonal up-left line (45 degrees) */}
        <Line x1="45" y1="45" x2="25.9" y2="25.9" stroke="#FFFFFF" strokeWidth="1.0" strokeOpacity="0.95" />
        {/* Diagonal up-right line (45 degrees) */}
        <Line x1="45" y1="45" x2="64.1" y2="25.9" stroke="#FFFFFF" strokeWidth="1.0" strokeOpacity="0.95" />

        {/* ========================================== */}
        {/* 2. SKEWED GROUP (EDGE Typography & Icon)   */}
        {/* ========================================== */}
        {/* Skewing group by -14 degrees matches Eurostile Bold Italic slants */}
        <G transform="skewX(-14) translate(100, 0)">
          {/* Top Bar (Primary Color) with concentric cutout */}
          <Path
            d="M 0 24 Q 6 18 12 15 L 43 15 L 43 24 Z"
            fill={primaryColor}
          />
          {/* Outer circle with inner white cutout (uses evenodd for transparency) */}
          <Path
            d="M 33.5 19.5 A 9.5 9.5 0 1 0 52.5 19.5 A 9.5 9.5 0 1 0 33.5 19.5 Z M 39.5 19.5 A 3.5 3.5 0 1 0 46.5 19.5 A 3.5 3.5 0 1 0 39.5 19.5 Z"
            fill={primaryColor}
            fillRule="evenodd"
          />

          {/* Middle Bar (Primary Color) with concentric cutout */}
          <Path
            d="M 0 41 A 9.5 9.5 0 1 0 19 41 A 9.5 9.5 0 1 0 0 41 Z M 6 41 A 3.5 3.5 0 1 0 13 41 A 3.5 3.5 0 1 0 6 41 Z"
            fill={primaryColor}
            fillRule="evenodd"
          />
          <Path
            d="M 9.5 36.5 L 49 36.5 L 49 45.5 L 9.5 45.5 Z"
            fill={primaryColor}
          />

          {/* Bottom Bar (Red Accent) with concentric cutout */}
          <Path
            d="M 0 58 Q 6 64 12 67 L 43 67 L 43 58 Z"
            fill={secondaryColor}
          />
          <Path
            d="M 33.5 62.5 A 9.5 9.5 0 1 0 52.5 62.5 A 9.5 9.5 0 1 0 33.5 62.5 Z M 39.5 62.5 A 3.5 3.5 0 1 0 46.5 62.5 A 3.5 3.5 0 1 0 39.5 62.5 Z"
            fill={secondaryColor}
            fillRule="evenodd"
          />

          {/* Letters "D", "G", "E" */}
          {/* D: Outer path and inner path (cutout) using evenodd fill rule */}
          <Path
            d="M 65 15 L 87 15 A 20 20 0 0 1 107 35 L 107 47 A 20 20 0 0 1 87 67 L 65 67 Z M 74 24 L 87 24 A 11 11 0 0 1 98 35 L 98 47 A 11 11 0 0 1 87 58 L 74 58 Z"
            fill={primaryColor}
            fillRule="evenodd"
          />

          {/* G: Tech-styled geometric G with rounded right-hand corners */}
          <Path
            d="M 159 32 L 159 28 A 20 20 0 0 0 139 15 L 117 15 L 117 67 L 139 67 A 20 20 0 0 0 159 47 L 159 38 L 137 38 L 137 46 L 150 46 L 150 47 A 11 11 0 0 1 139 58 L 126 58 L 126 24 L 139 24 A 11 11 0 0 1 150 35 L 159 35 Z"
            fill={primaryColor}
          />

          {/* E: Tech-styled geometric E with all corners sharp */}
          <Path
            d="M 169 15 L 211 15 L 211 24 L 178 24 L 178 36.5 L 201 36.5 L 201 45.5 L 178 45.5 L 178 58 L 211 58 L 211 67 L 169 67 Z"
            fill={primaryColor}
          />
        </G>

        {/* ========================================== */}
        {/* 3. SUBTITLE (Bottom, Upright)              */}
        {/* ========================================== */}
        <SvgText
          x="205.5"
          y="82"
          fill={subtitleColor}
          fontSize="6.8"
          fontWeight="600"
          fontFamily="System"
          textAnchor="middle"
          letterSpacing="0.2"
        >
          ELECTRONIC DATA GOVERNANCE AND EVALUATION
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
