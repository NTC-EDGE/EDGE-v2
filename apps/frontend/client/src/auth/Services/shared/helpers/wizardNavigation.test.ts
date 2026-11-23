// @ts-expect-error - bun test runtime module
import { describe, it, expect, mock } from "bun:test";

mock.module("react-native", () => ({
  Alert: { alert: mock(() => {}) },
  Platform: { OS: "web", select: (obj: Record<string, unknown>) => obj.web || obj.default },
  Modal: "Modal",
  View: "View",
  Text: "Text",
  Image: "Image",
  TouchableOpacity: "TouchableOpacity",
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  useWindowDimensions: () => ({ width: 1200, height: 800 }),
  StyleSheet: { create: <T,>(s: T): T => s },
}));

mock.module("@edge/ui", () => ({
  COLORS: { brand: { 700: "#0038A8" }, neutral: { 500: "#64748B", 900: "#0F172A" } },
  TYPOGRAPHY: { fonts: { primary: "System" } },
  Icon: "Icon",
  ImageCropRotateModal: "ImageCropRotateModal",
}));

mock.module("@clerk/expo", () => ({
  useUser: () => ({ user: null }),
  useAuth: () => ({ getToken: async () => null }),
}));

const { handleWizardNext } = await import("./wizardNavigation");
const { initialGeneralApplicant } = await import("../types/generalApplicantTypes");
const {
  synthesizeAllApplicantFieldValues,
  resolveFriendlyFieldLabel,
} = await import("./applicantFieldSynthesizer");
const { resolveApplicantParticulars } = await import(
  "../components/generalReview/generalReviewResolvers"
);
const { isRedundantApplicationType } = await import(
  "../components/generalReview/JurisdictionParametersCard"
);
const { buildDynamicSections } = await import(
  "../../../../shared/formPreview/core/buildDynamicSections"
);
const { canClientEditAttachmentImage } = await import(
  "../../../../shared/components/DocumentPreviewModal"
);
import type { NTCService } from "../../data/servicesData";

const dummyExamService: NTCService = {
  id: "50000000-0000-0000-0000-000000000001",
  code: "NTC_1_01",
  title: "Application for Admission to Radio Operator Examination",
  category: "Examination Services",
  description: "Radio Operator Examination",
  requirements: [],
  fee: "PHP 50.00",
  time: "5 Days",
};

function createCompletedExamApplicant() {
  return {
    ...initialGeneralApplicant(1),
    firstName: "Juan",
    lastName: "Dela Cruz",
    birthMonth: "January",
    birthDay: "15",
    birthYear: "1998",
    sex: "Male",
    civilStatus: "Single",
    nationality: "Filipino",
    email: "juan.delacruz@example.com",
    contactNo: "09171234567",
    region: "National Capital Region (NCR)",
    province: "Metro Manila",
    city: "Quezon City",
    barangay: "Belmont",
    street: "123 Main St",
    address: "123 Main St, Belmont, Quezon City",
    zipCode: "1100",
    signatureUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
    selectedVariantId: "v-exam-1",
    selectedVariantName: "Amateur - First Taker",
    schoolName: "University of the Philippines",
    courseDegree: "BS Electronics Engineering",
    yearGraduated: "2020",
    formFieldValues: [],
  };
}

describe("Educational Background prefill & dynamic field validation", () => {
  it("recognizes pre-filled schoolName, courseDegree, and yearGraduated without requiring manual re-editing", () => {
    const applicant = createCompletedExamApplicant();
    let capturedErrors: Record<string, string> = {};
    let currentStep = 3;

    handleWizardNext({
      step: currentStep,
      setStep: (next) => {
        currentStep = typeof next === "function" ? next(currentStep) : next;
      },
      selectedRegionId: "t-1",
      selectedOfficeId: "o-1",
      appMode: "SINGLE",
      activeApplicant: applicant,
      applicants: [applicant],
      currentApplicantIndex: 0,
      setCurrentApplicantIndex: () => {},
      service: dummyExamService,
      setIsConfirmModalOpen: () => {},
      dynamicRequiredFieldIds: [
        "fd000000-0000-0000-0000-000000000061",
        "fd000000-0000-0000-0000-000000000062",
        "fd000000-0000-0000-0000-000000000063",
      ],
      dynamicFieldLabels: {
        "fd000000-0000-0000-0000-000000000061": "School / University Attended",
        "fd000000-0000-0000-0000-000000000062": "Course / Degree Program",
        "fd000000-0000-0000-0000-000000000063": "Year Graduated",
      },
      setFormErrors: (errs) => {
        capturedErrors = errs;
      },
    });

    expect(capturedErrors).toEqual({});
    expect(currentStep).toBe(4);
  });

  it("recognizes pre-filled educational fields even when the form uses newly cloned variant UUIDs", () => {
    const applicant = createCompletedExamApplicant();
    const clonedSchoolUuid = "a1111111-2222-3333-4444-555555555561";
    const clonedCourseUuid = "a1111111-2222-3333-4444-555555555562";
    const clonedYearUuid = "a1111111-2222-3333-4444-555555555563";

    let capturedErrors: Record<string, string> = {};
    let currentStep = 3;

    handleWizardNext({
      step: currentStep,
      setStep: (next) => {
        currentStep = typeof next === "function" ? next(currentStep) : next;
      },
      selectedRegionId: "t-1",
      selectedOfficeId: "o-1",
      appMode: "SINGLE",
      activeApplicant: applicant,
      applicants: [applicant],
      currentApplicantIndex: 0,
      setCurrentApplicantIndex: () => {},
      service: dummyExamService,
      setIsConfirmModalOpen: () => {},
      dynamicRequiredFieldIds: [clonedSchoolUuid, clonedCourseUuid, clonedYearUuid],
      dynamicFieldLabels: {
        [clonedSchoolUuid]: "School / University Attended",
        [clonedCourseUuid]: "Course / Degree Program",
        [clonedYearUuid]: "Year Graduated",
      },
      setFormErrors: (errs) => {
        capturedErrors = errs;
      },
    });

    expect(capturedErrors).toEqual({});
    expect(currentStep).toBe(4);
  });

  it("never displays raw UUIDs in validation error warnings when a required field is blank", () => {
    const applicant = {
      ...createCompletedExamApplicant(),
      schoolName: "",
      courseDegree: "",
      yearGraduated: "",
    };

    const unknownUuid = "b9999999-8888-7777-6666-555555555555";
    let capturedErrors: Record<string, string> = {};

    handleWizardNext({
      step: 3,
      setStep: () => {},
      selectedRegionId: "t-1",
      selectedOfficeId: "o-1",
      appMode: "SINGLE",
      activeApplicant: applicant,
      applicants: [applicant],
      currentApplicantIndex: 0,
      setCurrentApplicantIndex: () => {},
      service: dummyExamService,
      setIsConfirmModalOpen: () => {},
      dynamicRequiredFieldIds: [
        "fd000000-0000-0000-0000-000000000061",
        unknownUuid,
      ],
      setFormErrors: (errs) => {
        capturedErrors = errs;
      },
    });

    expect(capturedErrors["fd000000-0000-0000-0000-000000000061"]).toBe(
      "School / University Attended is required and cannot be left blank."
    );
    expect(capturedErrors["fd000000-0000-0000-0000-000000000061"]).not.toContain("fd000000");

    expect(capturedErrors[unknownUuid]).toBe(
      "This required field cannot be left blank."
    );
    expect(capturedErrors[unknownUuid]).not.toContain(unknownUuid);
  });

  it("synthesizeAllApplicantFieldValues maps educational fields to custom schema field UUIDs", () => {
    const applicant = createCompletedExamApplicant();
    const customSchoolId = "c1111111-1111-1111-1111-111111111111";
    const synthesized = synthesizeAllApplicantFieldValues(applicant, [
      { id: customSchoolId, fieldId: customSchoolId, label: "School / University Attended" },
    ]);

    const matched = synthesized.find((f) => f.fieldId === customSchoolId);
    expect(matched?.value).toBe("University of the Philippines");
  });

  it("resolveFriendlyFieldLabel strips unknown UUIDs and resolves known GUIDs", () => {
    expect(resolveFriendlyFieldLabel("fd000000-0000-0000-0000-000000000061")).toBe(
      "School / University Attended"
    );
    expect(resolveFriendlyFieldLabel("12345678-1234-1234-1234-123456789abc")).toBe("");
  });

  it("includes auto-filled form fields in the summary review even when the client makes no manual changes", () => {
    const applicant = createCompletedExamApplicant();
    // Simulate untouched auto-filled applicant where formFieldValues is still empty []
    expect(applicant.formFieldValues).toEqual([]);

    const examFormSchema = {
      sections: [
        {
          id: "sec-edu",
          key: "educationalBackground",
          title: "Educational Background & Qualifications",
          fields: [
            {
              id: "f-school-clone",
              fieldId: "fd000000-0000-0000-0000-000000000061",
              label: "School / University Attended",
            },
            {
              id: "f-course-clone",
              fieldId: "fd000000-0000-0000-0000-000000000062",
              label: "Course / Degree Program",
            },
            {
              id: "f-year-clone",
              fieldId: "fd000000-0000-0000-0000-000000000063",
              label: "Year Graduated",
            },
          ],
        },
      ],
    };

    const particulars = resolveApplicantParticulars(applicant, examFormSchema);
    const { dynamicSectionsToRender } = buildDynamicSections(
      examFormSchema,
      particulars.formFieldValues,
      {
        selectedVariantName: applicant.selectedVariantName,
        selectedVariantId: applicant.selectedVariantId,
        serviceTitle: dummyExamService.title,
      }
    );

    expect(dynamicSectionsToRender.length).toBe(1);
    expect(dynamicSectionsToRender[0]?.title).toBe(
      "Educational Background & Qualifications"
    );
    expect(dynamicSectionsToRender[0]?.fields).toEqual([
      {
        fieldId: "fd000000-0000-0000-0000-000000000061",
        label: "School / University Attended",
        value: "University of the Philippines",
      },
      {
        fieldId: "fd000000-0000-0000-0000-000000000062",
        label: "Course / Degree Program",
        value: "BS Electronics Engineering",
      },
      {
        fieldId: "fd000000-0000-0000-0000-000000000063",
        label: "Year Graduated",
        value: "2020",
      },
    ]);
  });

  it("suppresses redundant Application Type in Application & Service Parameters when already equal to or contained in Variant", () => {
    expect(
      isRedundantApplicationType("Radiotelegraphy (FIRSTTAKER)", "Radiotelegraphy (FIRSTTAKER)")
    ).toBe(true);
    expect(
      isRedundantApplicationType("Radiotelegraphy (FIRSTTAKER)", "First Taker")
    ).toBe(true);
    expect(
      isRedundantApplicationType("Amateur Radio Station License (NEW)", "NEW")
    ).toBe(true);
    expect(
      isRedundantApplicationType("Amateur Radio Operator Certificate", "Renewal")
    ).toBe(false);
  });

  it("allows client attachment crop/rotate only while in draft (not yet submitted) and denies when submitted", () => {
    // Draft / wizard filing before submission
    expect(
      canClientEditAttachmentImage({
        allowEditImage: true,
        isSubmitted: false,
        applicationStatus: "DRAFT",
      })
    ).toBe(true);

    // Default (e.g., My Applications preview where allowEditImage is false/omitted)
    expect(canClientEditAttachmentImage()).toBe(false);
    expect(canClientEditAttachmentImage({ allowEditImage: false })).toBe(false);

    // Already submitted applications in My Applications
    expect(
      canClientEditAttachmentImage({
        allowEditImage: true,
        isSubmitted: true,
      })
    ).toBe(false);
    expect(
      canClientEditAttachmentImage({
        allowEditImage: true,
        applicationStatus: "FOR_EVALUATION",
      })
    ).toBe(false);
    expect(
      canClientEditAttachmentImage({
        allowEditImage: true,
        applicationStatus: "PENDING",
      })
    ).toBe(false);
    expect(
      canClientEditAttachmentImage({
        allowEditImage: true,
        applicationStatus: "APPROVED",
      })
    ).toBe(false);
  });
});
