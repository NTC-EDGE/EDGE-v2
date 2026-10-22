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

const { ApplicantDetailsReviewCard } = await import('./ApplicantDetailsReviewCard');

function collectTextAndTitles(node: unknown): { titles: string[]; textValues: string[] } {
  const titles: string[] = [];
  const textValues: string[] = [];

  function traverse(n: unknown) {
    if (!n || typeof n !== 'object') {
      if (typeof n === 'string' && n.trim()) {
        textValues.push(n.trim());
      }
      return;
    }

    if (React.isValidElement(n)) {
      const p = n.props as Record<string, unknown>;
      if (typeof p?.title === 'string') {
        titles.push(p.title);
      }
      if (typeof p?.value === 'string' && p.value.trim()) {
        textValues.push(p.value.trim());
      }
      if (typeof p?.label === 'string' && p.label.trim()) {
        textValues.push(p.label.trim());
      }
      if (p?.children) {
        if (Array.isArray(p.children)) {
          p.children.forEach(traverse);
        } else {
          traverse(p.children);
        }
      }
      return;
    }

    if (Array.isArray(n)) {
      n.forEach(traverse);
      return;
    }

    const obj = n as Record<string, unknown>;
    if (obj.props) {
      traverse(obj.props);
    }
  }

  traverse(node);
  return { titles, textValues };
}

describe('ApplicantDetailsReviewCard (Internal)', () => {
  describe('Individual Application', () => {
    it('displays ONLY Primary Applicant Details and suppresses Filing Entity & Submitter Details', () => {
      const element = ApplicantDetailsReviewCard({
        activeApplicant: {
          applicantType: 'individual',
          companyName: 'Accidental Company Name',
          representativeName: 'Accidental Submitter',
          registrationNumber: 'SEC-12345',
          companyAddress: '123 Corporate Tower',
        },
        resolvedFullName: 'Juan Dela Cruz',
        resolvedEmail: 'juan@email.com',
        resolvedContactNo: '09171234567',
        resolvedAddress: 'Brgy 1, Manila',
        resolvedBirthDate: '1990-05-15',
        resolvedSex: 'Male',
        resolvedCivilStatus: 'Single',
        resolvedNationality: 'Filipino',
      });

      const { titles, textValues } = collectTextAndTitles(element);

      // Must display Primary Applicant Details
      expect(titles).toContain('Primary Applicant Details');

      // Must NOT display Filing Entity & Submitter Details
      expect(titles).not.toContain('Filing Entity & Submitter Details');

      // Primary applicant data must be present
      expect(textValues).toContain('Juan Dela Cruz');
      expect(textValues).toContain('juan@email.com');
      expect(textValues).toContain('09171234567');
      expect(textValues).toContain('Full Legal Name');

      // Company / Submitter details must NOT be present
      expect(textValues).not.toContain('Accidental Company Name');
      expect(textValues).not.toContain('Accidental Submitter');
      expect(textValues).not.toContain('SEC-12345');
      expect(textValues).not.toContain('123 Corporate Tower');
      expect(textValues).not.toContain('Registered Business / Corporate Name');
      expect(textValues).not.toContain('Authorized Representative / Liaison Officer');
    });
  });

  describe('Company Application', () => {
    it('displays BOTH Filing Entity & Submitter Details and Primary Applicant Details', () => {
      const element = ApplicantDetailsReviewCard({
        activeApplicant: {
          applicantType: 'company',
          companyName: 'Acme Telecommunications Corp.',
          registrationNumber: 'SEC-CS2020-00123',
          companyAddress: 'Penthouse, Ayala Ave, Makati',
          companyEmail: 'contact@acmetelecom.com',
          companyContactNumber: '0288880000',
          representativeName: 'Maria Santos',
          representativePosition: 'Liaison Officer',
          representativeEmail: 'maria.santos@acmetelecom.com',
          representativeContactNumber: '09181234567',
        },
        resolvedFullName: 'Acme Telecommunications Corp.',
        resolvedEmail: 'contact@acmetelecom.com',
        resolvedContactNo: '0288880000',
        resolvedAddress: 'Penthouse, Ayala Ave, Makati',
        resolvedBirthDate: null,
        resolvedSex: null,
        resolvedCivilStatus: null,
        resolvedNationality: null,
      });

      const { titles, textValues } = collectTextAndTitles(element);

      // Must display BOTH cards
      expect(titles).toContain('Filing Entity & Submitter Details');
      expect(titles).toContain('Primary Applicant Details');

      // Filing Entity & Submitter fields must be present
      expect(textValues).toContain('Acme Telecommunications Corp.');
      expect(textValues).toContain('SEC-CS2020-00123');
      expect(textValues).toContain('Penthouse, Ayala Ave, Makati');
      expect(textValues).toContain('contact@acmetelecom.com');
      expect(textValues).toContain('Maria Santos (Liaison Officer)');
      expect(textValues).toContain('maria.santos@acmetelecom.com');

      // Primary Applicant fields must be present
      expect(textValues).toContain('Applicant / Corporate Name');
    });
  });
});
