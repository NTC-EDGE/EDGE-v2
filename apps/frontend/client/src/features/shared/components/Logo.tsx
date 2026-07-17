import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme/tokens';

export function Logo() {
  return (
    <View style={styles.container}>
      {/* NTC circular seal */}
      <View style={styles.sealContainer}>
        <View style={styles.outerRing}>
          <View style={styles.innerRing}>
            <View style={styles.centerBlue}>
              <Text style={styles.sealText}>NTC</Text>
            </View>
          </View>
        </View>
      </View>

      {/* EDGE Typography */}
      <View style={styles.textContainer}>
        <Text style={styles.edgeText}>EDGE</Text>
        <Text style={styles.subtitleText}>Data Governance</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sealContainer: {
    marginRight: 8,
  },
  outerRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#1236A8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
  },
  innerRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  centerBlue: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1236A8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.neutral.white,
    letterSpacing: 0.2,
  },
  textContainer: {
    justifyContent: 'center',
  },
  edgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: '800',
    color: '#1236A8',
    lineHeight: 20,
  },
  subtitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.neutral[500],
    marginTop: -2,
  },
});
