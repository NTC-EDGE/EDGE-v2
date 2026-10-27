// @ts-expect-error - bun test runtime module
import { mock, describe, it, expect } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';

mock.module('react-native', () => ({
  View: (props: { children?: React.ReactNode }) => React.createElement('div', null, props.children),
  Text: (props: { children?: React.ReactNode }) => React.createElement('span', null, props.children),
  Image: () => null,
  TouchableOpacity: (props: { children?: React.ReactNode }) => React.createElement('button', null, props.children),
  Pressable: (props: { children?: React.ReactNode }) => React.createElement('button', null, props.children),
  ScrollView: (props: { children?: React.ReactNode }) => React.createElement('div', null, props.children),
  StyleSheet: { create: (s: unknown) => s },
  Platform: { OS: 'web', select: (obj: Record<string, unknown>) => obj.web || obj.default },
  useWindowDimensions: () => ({ width: 1200, height: 800 }),
}));

mock.module('@edge/ui', () => ({
  Icon: () => null,
  COLORS: { brand: { 700: '#1D4ED8' }, neutral: { 800: '#1E293B', 500: '#64748B', white: '#FFF' } },
  TYPOGRAPHY: { fonts: { primary: 'System' } },
}));

const { BaseApplicationPreview } = await import('./BaseApplicationPreview');
const { DynamicFormSectionsReview } = await import('./DynamicFormSectionsReview');
const { ExamEducationReviewSection } = await import('./ExamEducationReviewSection');
const {
  isApplicantParticularField,
  isJurisdictionOrVariantField,
  isExamEducationField,
} = await import('../core/formPreviewFieldCheckers');

const FIELD_ID_EXAM_CATEGORY = 'fd000000-0000-0000-0000-000000000007';
const FIELD_ID_EXAMINEE_TYPE = 'fd000000-0000-0000-0000-000000000008';
const FIELD_ID_ELEMENTS      = 'fd000000-0000-0000-0000-000000000009';
const FIELD_ID_ADMISSION_NO  = 'fd000000-0000-0000-0000-000000000011';
const FIELD_ID_SCHOOL_NAME   = 'fd000000-0000-0000-0000-000000000061';
const FIELD_ID_COURSE_DEGREE = 'fd000000-0000-0000-0000-000000000062';
const FIELD_ID_YEAR_GRAD     = 'fd000000-0000-0000-0000-000000000063';

describe('Exam Application Preview Fallbacks & Duplicate Suppression (Internal)', () => {
  it('correctly classifies exam fields and education fields in field checkers', () => {
    // Exam jurisdiction/variant fields should be recognized
    expect(isJurisdictionOrVariantField(FIELD_ID_EXAM_CATEGORY)).toBe(true);
    expect(isJurisdictionOrVariantField('Exam Category')).toBe(true);
    expect(isJurisdictionOrVariantField(FIELD_ID_EXAMINEE_TYPE)).toBe(true);
    expect(isJurisdictionOrVariantField('Examinee Type')).toBe(true);
    expect(isJurisdictionOrVariantField(FIELD_ID_ELEMENTS)).toBe(true);
    expect(isJurisdictionOrVariantField('Selected Exam Elements')).toBe(true);
    expect(isJurisdictionOrVariantField(FIELD_ID_ADMISSION_NO)).toBe(true);
    expect(isJurisdictionOrVariantField('Admission Slip Number')).toBe(true);

    // Education fields should be recognized as applicant details
    expect(isApplicantParticularField(FIELD_ID_SCHOOL_NAME)).toBe(true);
    expect(isApplicantParticularField('School / University Attended')).toBe(true);
    expect(isApplicantParticularField(FIELD_ID_COURSE_DEGREE)).toBe(true);
    expect(isApplicantParticularField('Course / Degree Program')).toBe(true);
    expect(isApplicantParticularField(FIELD_ID_YEAR_GRAD)).toBe(true);
    expect(isApplicantParticularField('Year Graduated')).toBe(true);
    expect(isApplicantParticularField('Special Order (SO) Number')).toBe(true);

    // Education checker identifies them
    expect(isExamEducationField('School / University Attended', FIELD_ID_SCHOOL_NAME)).toBe(true);
    expect(isExamEducationField('Course / Degree Program', FIELD_ID_COURSE_DEGREE)).toBe(true);
    expect(isExamEducationField('Year Graduated', FIELD_ID_YEAR_GRAD)).toBe(true);
  });

  it('DynamicFormSectionsReview never renders "Application Particulars & Technical Details" for exam services', () => {
    const remainingFields = [
      { fieldId: 'sample-field', fieldLabel: 'Sample Unmapped Field', value: 'Some Value' },
    ];

    // For exam service: should NOT show "Application Particulars & Technical Details"
    const examHtml = renderToString(
      React.createElement(DynamicFormSectionsReview, {
        dynamicSectionsToRender: [],
        isExamService: true,
        remainingFields,
        onPreviewFile: () => {},
      })
    );
    expect(examHtml).not.toContain('Application Particulars &amp; Technical Details');
    expect(examHtml).not.toContain('Application Particulars & Technical Details');
    expect(examHtml).toContain('Examination Details &amp; Particulars');

    // For non-exam service: should show "Application Particulars & Technical Details"
    const nonExamHtml = renderToString(
      React.createElement(DynamicFormSectionsReview, {
        dynamicSectionsToRender: [],
        isExamService: false,
        remainingFields,
        onPreviewFile: () => {},
      })
    );
    expect(nonExamHtml).toContain('Application Particulars &amp; Technical Details');
  });

  it('ExamEducationReviewSection suppresses duplicate section when education is already rendered', () => {
    const educationFields = [
      { fieldId: FIELD_ID_SCHOOL_NAME, fieldLabel: 'School / University Attended', value: 'UP Diliman' },
      { fieldId: FIELD_ID_COURSE_DEGREE, fieldLabel: 'Course / Degree Program', value: 'BS ECE' },
      { fieldId: FIELD_ID_YEAR_GRAD, fieldLabel: 'Year Graduated', value: '2024' },
    ];

    // When suppressEducationSection is true: should NOT render duplicate section
    const suppressedHtml = renderToString(
      React.createElement(ExamEducationReviewSection, {
        isExamService: true,
        examEducationFields: educationFields,
        examAssistanceFields: [],
        onPreviewFile: () => {},
        suppressEducationSection: true,
      })
    );
    expect(suppressedHtml).not.toContain('Educational Background &amp; Qualifications');
    expect(suppressedHtml).not.toContain('Educational Background & Qualifications');

    // When suppressEducationSection is false: renders fallback
    const fallbackHtml = renderToString(
      React.createElement(ExamEducationReviewSection, {
        isExamService: true,
        examEducationFields: educationFields,
        examAssistanceFields: [],
        onPreviewFile: () => {},
        suppressEducationSection: false,
      })
    );
    expect(fallbackHtml).toContain('Educational Background &amp; Qualifications');
  });

  it('BaseApplicationPreview renders educational background in Primary Applicant Details and does not duplicate it or render technical particulars for Exam', () => {
    const formFieldValues = [
      { fieldId: FIELD_ID_SCHOOL_NAME, fieldLabel: 'School / University Attended', value: 'Polytechnic University of the Philippines' },
      { fieldId: FIELD_ID_COURSE_DEGREE, fieldLabel: 'Course / Degree Program', value: 'BS Electronics Engineering' },
      { fieldId: FIELD_ID_YEAR_GRAD, fieldLabel: 'Year Graduated', value: '2025' },
      { fieldId: FIELD_ID_EXAM_CATEGORY, fieldLabel: 'Exam Category', value: 'Commercial' },
      { fieldId: FIELD_ID_EXAMINEE_TYPE, fieldLabel: 'Examinee Type', value: 'First Taker' },
      { fieldId: FIELD_ID_ELEMENTS, fieldLabel: 'Selected Exam Elements', value: 'Elements 1, 2, 3 & 4' },
    ];

    const previewHtml = renderToString(
      React.createElement(BaseApplicationPreview, {
        service: {
          id: '50000000-0000-0000-0000-000000000001',
          title: 'Admission Slip for Radio Operator Examination',
          category: 'Exams',
        },
        form: { sections: [] },
        formFieldValues: formFieldValues,
        resolvedFullName: 'Juan Dela Cruz',
        resolvedEmail: 'juan@example.com',
        resolvedContactNo: '09171234567',
        resolvedAddress: '123 Sampaguita St, Manila',
        resolvedBirthDate: '2000-01-01',
        resolvedSex: 'Male',
        resolvedCivilStatus: 'Single',
        resolvedNationality: 'Filipino',
        schoolAttended: 'Polytechnic University of the Philippines',
        courseTaken: 'BS Electronics Engineering',
        yearGraduated: '2025',
        isExamService: true,
        showApplicantCard: true,
      })
    );

    // 1. "Application Particulars & Technical Details" MUST NOT be rendered
    expect(previewHtml).not.toContain('Application Particulars &amp; Technical Details');
    expect(previewHtml).not.toContain('Application Particulars & Technical Details');

    // 2. Primary Applicant Details must have Educational Background
    expect(previewHtml).toContain('Primary Applicant Details');
    expect(previewHtml).toContain('EDUCATIONAL BACKGROUND');
    expect(previewHtml).toContain('Polytechnic University of the Philippines');
    expect(previewHtml).toContain('BS Electronics Engineering');

    // 3. Separate duplicate "Educational Background & Qualifications" card MUST NOT be rendered
    expect(previewHtml).not.toContain('Educational Background &amp; Qualifications');
    expect(previewHtml).not.toContain('Educational Background & Qualifications');
  });
});
