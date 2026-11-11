// @ts-expect-error - bun test runtime module
import { mock, describe, it, expect } from 'bun:test';
import React from 'react';

mock.module('react-native', () => ({
  View: (props: { children?: React.ReactNode }) => props.children,
  Text: (props: { children?: React.ReactNode }) => props.children,
  Image: () => null,
  TouchableOpacity: (props: { children?: React.ReactNode }) => props.children,
  Pressable: (props: { children?: React.ReactNode }) => props.children,
  ScrollView: (props: { children?: React.ReactNode }) => props.children,
  StyleSheet: { create: (s: unknown) => s },
  Platform: { OS: 'web', select: (obj: Record<string, unknown>) => obj.web || obj.default },
  useWindowDimensions: () => ({ width: 1200, height: 800 }),
}));

mock.module('@edge/ui', () => ({
  Icon: () => null,
  COLORS: { brand: { 700: '#1D4ED8' }, neutral: { 800: '#1E293B', 500: '#64748B', white: '#FFF' } },
  TYPOGRAPHY: { fonts: { primary: 'System' } },
}));

const { TvroRegReviewCard } = await import('./TvroRegReviewCard');
const { CopyOfCertReviewCard } = await import('./CopyOfCertReviewCard');
const { CopyOfPermitReviewCard } = await import('./CopyOfPermitReviewCard');
const { PermitDataReviewCard } = await import('./PermitDataReviewCard');
const { RadioCertReviewCard } = await import('./RadioCertReviewCard');
const { VasReviewCard } = await import('./VasReviewCard');

describe('General Review Cards Safe Rendering with Undefined/Null serviceTitle', () => {
  it('TvroRegReviewCard returns null and does not throw when serviceTitle is undefined or null', () => {
    expect(() => {
      const res = TvroRegReviewCard({
        isCertificateService: true,
        serviceTitle: undefined,
        tvroReg: null,
      });
      expect(res).toBeNull();
    }).not.toThrow();

    expect(() => {
      const res = TvroRegReviewCard({
        isCertificateService: false,
        serviceTitle: null,
        tvroReg: null,
      });
      expect(res).toBeNull();
    }).not.toThrow();
  });

  it('CopyOfCertReviewCard returns null and does not throw when serviceTitle is undefined or null', () => {
    expect(() => {
      const res = CopyOfCertReviewCard({
        serviceTitle: undefined,
        copyOfCert: null,
      });
      expect(res).toBeNull();
    }).not.toThrow();
  });

  it('CopyOfPermitReviewCard returns null and does not throw when serviceTitle is undefined or null', () => {
    expect(() => {
      const res = CopyOfPermitReviewCard({
        isPermitService: true,
        serviceTitle: undefined,
        copyOfPermit: null,
      });
      expect(res).toBeNull();
    }).not.toThrow();
  });

  it('PermitDataReviewCard returns null and does not throw when serviceTitle is undefined or null', () => {
    expect(() => {
      const res = PermitDataReviewCard({
        isPermitService: true,
        serviceTitle: undefined,
        permitData: null,
      });
      expect(res).toBeNull();
    }).not.toThrow();
  });

  it('RadioCertReviewCard returns null and does not throw when serviceTitle is undefined or null', () => {
    expect(() => {
      const res = RadioCertReviewCard({
        isCertificateService: true,
        isAmateurCertService: false,
        serviceTitle: undefined,
        radioCert: null,
      });
      expect(res).toBeNull();
    }).not.toThrow();
  });

  it('VasReviewCard returns null and does not throw when serviceTitle is undefined or null', () => {
    expect(() => {
      const res = VasReviewCard({
        isCertificateService: true,
        serviceTitle: undefined,
        vasData: null,
      });
      expect(res).toBeNull();
    }).not.toThrow();
  });
});
