// @ts-expect-error - bun test runtime module
import { describe, it, expect } from "bun:test";
import {
  PERMIT_DETAILS_SERVICE_OPTIONS,
  PERMIT_TYPES_BY_SERVICE,
  resolvePermitTypes,
  formatPermitServiceLabel,
} from "./dynamicFormConstants";
import { resolveFileFromUpload } from "../../../auth/Services/shared/helpers/requirementUploadHelper";
import { isAllowedRequirementFileType } from "../../../../../internal/src/utils/fileValidation";
import { resolveApplicationTenantId } from "../../helpers/tenantHelper";
import { initialGeneralApplicant } from "../../../auth/Services/shared/types/generalApplicantTypes";
import { initialExamApplicant } from "../../../auth/Services/exams/radio-operator/types/examTypes";
import { serializeCertificateApplicant } from "../../../auth/Services/certificates/helpers/payloadSerializer";
import {
  mapApplicantsPayload,
  getRequirementsList,
  getUploadItemFileName,
  getUploadItemFileSize,
  getUploadItemMimeType,
} from "../../../auth/Services/exams/radio-operator/helpers/examMapping";

describe("Dead Code & Typo Prevention - Permit Service Options & Labels", () => {
  it("provides clean, professional user-facing labels without typos", () => {
    const labels = PERMIT_DETAILS_SERVICE_OPTIONS.map((opt) => opt.label);

    expect(labels).toContain("Permits in Amateur Service");
    expect(labels).toContain("Permits in Aeronautical Service");
    expect(labels).toContain("Permits in Maritime Service");
    expect(labels).toContain(
      "Permits for Government and Private Radio Stations, in the Fixed and Land Mobile Service"
    );

    // Verify typos are NOT present in user-facing labels
    expect(labels).not.toContain("Permits in AMateur");
    expect(labels).not.toContain("Permits Aeronotical");
    expect(labels).not.toContain("PErmits in Maritime");
    expect(labels).not.toContain(
      "Permits for Government and Private Radio Stations, in the Fixed and Land MObile Service"
    );
  });

  it("preserves legacy backend seeder contract values for submission compatibility", () => {
    const values = PERMIT_DETAILS_SERVICE_OPTIONS.map((opt) => opt.value);

    expect(values).toContain("Permits in AMateur");
    expect(values).toContain("Permits Aeronotical");
    expect(values).toContain("PErmits in Maritime");
    expect(values).toContain(
      "Permits for Government and Private Radio Stations, in the Fixed and Land MObile Service"
    );
  });

  it("resolves permit types correctly using clean user-facing labels", () => {
    const amateurTypes = resolvePermitTypes("Permits in Amateur Service");
    expect(amateurTypes.length).toBeGreaterThan(0);
    expect(amateurTypes[0]?.value).toContain("Amateur Radio Station Permit to Purchase");

    const aeroTypes = resolvePermitTypes("Permits in Aeronautical Service");
    expect(aeroTypes.length).toBeGreaterThan(0);
    expect(aeroTypes[0]?.value).toContain("Aeronautical Station Permit to Purchase");

    const maritimeTypes = resolvePermitTypes("Permits in Maritime Service");
    expect(maritimeTypes.length).toBeGreaterThan(0);
    expect(maritimeTypes[0]?.value).toContain("Ship Station Permit to Purchase");

    const flmTypes = resolvePermitTypes(
      "Permits for Government and Private Radio Stations, in the Fixed and Land Mobile Service"
    );
    expect(flmTypes.length).toBeGreaterThan(0);
    expect(flmTypes[0]?.value).toContain("Permit to Purchase (VSAT)");
  });

  it("resolves permit types correctly using legacy backend seeder contract strings", () => {
    const amateurTypes = resolvePermitTypes("Permits in AMateur");
    expect(amateurTypes.length).toBeGreaterThan(0);
    expect(amateurTypes[0]?.value).toContain("Amateur Radio Station Permit to Purchase");

    const aeroTypes = resolvePermitTypes("Permits Aeronotical");
    expect(aeroTypes.length).toBeGreaterThan(0);
    expect(aeroTypes[0]?.value).toContain("Aeronautical Station Permit to Purchase");

    const maritimeTypes = resolvePermitTypes("PErmits in Maritime");
    expect(maritimeTypes.length).toBeGreaterThan(0);
    expect(maritimeTypes[0]?.value).toContain("Ship Station Permit to Purchase");

    const flmTypes = resolvePermitTypes(
      "Permits for Government and Private Radio Stations, in the Fixed and Land MObile Service"
    );
    expect(flmTypes.length).toBeGreaterThan(0);
    expect(flmTypes[0]?.value).toContain("Permit to Purchase (VSAT)");
  });

  it("resolves permit types via keyword fallbacks", () => {
    expect(resolvePermitTypes("amateur radio").length).toBeGreaterThan(0);
    expect(resolvePermitTypes("aeronautical").length).toBeGreaterThan(0);
    expect(resolvePermitTypes("ship station").length).toBeGreaterThan(0);
    expect(resolvePermitTypes("fixed land mobile").length).toBeGreaterThan(0);
  });

  it("formatPermitServiceLabel converts legacy backend strings to clean display labels", () => {
    expect(formatPermitServiceLabel("Permits in AMateur")).toBe("Permits in Amateur Service");
    expect(formatPermitServiceLabel("Permits Aeronotical")).toBe("Permits in Aeronautical Service");
    expect(formatPermitServiceLabel("PErmits in Maritime")).toBe("Permits in Maritime Service");
    expect(
      formatPermitServiceLabel(
        "Permits for Government and Private Radio Stations, in the Fixed and Land MObile Service"
      )
    ).toBe(
      "Permits for Government and Private Radio Stations, in the Fixed and Land Mobile Service"
    );
    expect(formatPermitServiceLabel("Permits in Amateur Service")).toBe("Permits in Amateur Service");
    expect(formatPermitServiceLabel("")).toBe("");
  });
});

describe("Cross-Platform File Pickers & Nullable Safety Checks", () => {
  it("resolveFileFromUpload handles undefined and null file properties safely", async () => {
    const resString = await resolveFileFromUpload("");
    expect(resString).toBeNull();

    const resEmpty = await resolveFileFromUpload({ name: "test.pdf" });
    expect(resEmpty).toBeNull();

    const resNullish = await resolveFileFromUpload({
      name: "valid.png",
      uri: undefined,
      type: undefined,
      file: undefined,
    });
    expect(resNullish).toBeNull();
  });

  it("isAllowedRequirementFileType safely checks nullable and undefined strings", () => {
    expect(isAllowedRequirementFileType(undefined, undefined)).toBe(false);
    expect(isAllowedRequirementFileType("", "")).toBe(false);
    expect(isAllowedRequirementFileType("doc.pdf", undefined)).toBe(true);
    expect(isAllowedRequirementFileType(undefined, "application/pdf")).toBe(true);
    expect(isAllowedRequirementFileType("photo.jpg", undefined)).toBe(true);
    expect(isAllowedRequirementFileType(undefined, "image/jpeg")).toBe(true);
    expect(isAllowedRequirementFileType("malware.exe", "application/x-msdownload")).toBe(false);
  });
});

describe("Multi-Tenant Dynamic Context & Fallback Elimination", () => {
  it("resolves authentic tenantId from application entity without hardcoded fallbacks", () => {
    const validTenantId = "bb2de653-8376-4e0f-9353-059fd8e4e1b9";
    const appWithTenant = {
      tenantId: validTenantId,
    };
    expect(resolveApplicationTenantId(appWithTenant)).toBe(validTenantId);
  });

  it("resolves regional fallback from application entity when region is a valid GUID", () => {
    const validRegionId = "cc3ef764-9487-5f1a-a464-160ae9f5f2ca";
    const appWithRegion = {
      tenantId: undefined,
      region: validRegionId,
    };
    expect(resolveApplicationTenantId(appWithRegion)).toBe(validRegionId);
  });

  it("returns null when application has no tenantId or region GUID (no phantom hardcoded GUID)", () => {
    expect(resolveApplicationTenantId(null)).toBeNull();
    expect(resolveApplicationTenantId(undefined)).toBeNull();
    expect(resolveApplicationTenantId({})).toBeNull();
    expect(
      resolveApplicationTenantId({
        tenantId: "not-a-guid",
        region: "NCR",
      })
    ).toBeNull();
  });
});

describe("Payload Purity - Preventing Altered Payloads from Artificial Fallbacks", () => {
  it("initialGeneralApplicant starts with undefined specialized models and blank birth fields", () => {
    const applicant = initialGeneralApplicant(1);
    expect(applicant.radioCertData).toBeUndefined();
    expect(applicant.deviceRegData).toBeUndefined();
    expect(applicant.tvroRegData).toBeUndefined();
    expect(applicant.vasData).toBeUndefined();
    expect(applicant.copyOfCertData).toBeUndefined();
    expect(applicant.copyOfPermitData).toBeUndefined();
    expect(applicant.amateurLicenseData).toBeUndefined();
    expect(applicant.lifetimeLicenseData).toBeUndefined();
    expect(applicant.permitData).toBeUndefined();
    expect(applicant.birthMonth).toBe("");
    expect(applicant.birthDay).toBe("");
    expect(applicant.birthYear).toBe("");
  });

  it("initialExamApplicant starts with blank birth date and blank sex to prevent artificial defaults", () => {
    const examApp = initialExamApplicant(1);
    expect(examApp.birthMonth).toBe("");
    expect(examApp.birthDay).toBe("");
    expect(examApp.birthYear).toBe("");
    expect(examApp.sex).toBe("");
  });

  it("serializeCertificateApplicant does not fabricate 2000-01-01, applicant@example.com, or Philippines", () => {
    const app = initialGeneralApplicant(1);
    app.firstName = "Maria";
    app.lastName = "Santos";

    const dummyService = {
      id: "srv-1",
      title: "General Service",
      description: "General Service Description",
      requirements: [],
      fee: "0",
      time: "1 day",
    };

    const payload = serializeCertificateApplicant(app, dummyService);
    expect(payload.birthDate).toBeUndefined();
    expect(payload.email).toBe("");
    expect(payload.address).toBe("");
    expect(payload.firstName).toBe("Maria");
    expect(payload.lastName).toBe("Santos");
  });

  it("mapApplicantsPayload does not fabricate random admission slip numbers or fake GUIDs", () => {
    const examApp = initialExamApplicant(1);
    examApp.firstName = "Juan";
    examApp.lastName = "Dela Cruz";
    examApp.email = "juan@realdomain.ph";
    examApp.contactNo = "09171234567";

    const mapped = mapApplicantsPayload([examApp], []);
    expect(mapped.length).toBe(1);
    const applicantPayload = mapped[0];

    // Verify birthDate is undefined when not entered
    expect(applicantPayload?.birthDate).toBeUndefined();

    // Verify no fake GUIDs or random ADM numbers are in formFieldValues
    const fieldValues = applicantPayload?.formFieldValues || [];
    const hasRandomAdm = fieldValues.some((fv) => fv.value.startsWith("ADM-"));
    expect(hasRandomAdm).toBe(false);

    const hasFakeGuid = fieldValues.some((fv) => fv.fieldId.startsWith("f0100000"));
    expect(hasFakeGuid).toBe(false);
  });

  describe("Exam Mapping & Asset Property Defensive Null-Checks", () => {
    it("getUploadItemFileName safely resolves file names from multiple asset descriptor formats without type assertions", () => {
      // 1. Direct string
      expect(getUploadItemFileName("passport_photo.jpg")).toBe("passport_photo.jpg");

      // 2. Object with name property
      expect(getUploadItemFileName({ name: "transcript_of_records.pdf" })).toBe("transcript_of_records.pdf");

      // 3. Object with nested file.name property
      expect(getUploadItemFileName({ file: { name: "birth_cert.png" } })).toBe("birth_cert.png");

      // 4. Object with uri property
      expect(getUploadItemFileName({ uri: "file:///data/user/0/documents/nbi_clearance.pdf" })).toBe("nbi_clearance.pdf");

      // 5. Fallback for null, undefined, or empty objects
      expect(getUploadItemFileName(null)).toBe("Supporting Document");
      expect(getUploadItemFileName(undefined)).toBe("Supporting Document");
      expect(getUploadItemFileName({})).toBe("Supporting Document");
      expect(getUploadItemFileName("   ")).toBe("Supporting Document");
    });

    it("getUploadItemFileSize safely resolves file sizes with null guards", () => {
      expect(getUploadItemFileSize({ size: 204800 })).toBe(204800);
      expect(getUploadItemFileSize({ file: { size: 102400 } })).toBe(102400);
      expect(getUploadItemFileSize(null)).toBeUndefined();
      expect(getUploadItemFileSize({})).toBeUndefined();
      expect(getUploadItemFileSize({ size: 0 })).toBeUndefined();
    });

    it("getUploadItemMimeType safely resolves mime types from various property structures", () => {
      expect(getUploadItemMimeType({ type: "application/pdf" })).toBe("application/pdf");
      expect(getUploadItemMimeType({ mimeType: "image/png" })).toBe("image/png");
      expect(getUploadItemMimeType({ file: { type: "image/jpeg" } })).toBe("image/jpeg");
      expect(getUploadItemMimeType(null)).toBeUndefined();
      expect(getUploadItemMimeType({})).toBeUndefined();
    });

    it("getRequirementsList safely handles unknown/malformed db requirement arrays", () => {
      const rawDbList: unknown[] = [
        { id: "req-1", name: "Custom Clearance", isRequired: true, description: "Valid clearance" },
        { requirementId: "req-2", title: "Valid ID", isRequired: false },
        { label: "Photo" },
        null,
        "unexpected-string",
      ];

      const resolved = getRequirementsList(rawDbList, "First Taker");
      expect(resolved.length).toBe(5);
      expect(resolved[0]?.name).toBe("Custom Clearance");
      expect(resolved[0]?.isRequired).toBe(true);
      expect(resolved[1]?.id).toBe("req-2");
      expect(resolved[1]?.name).toBe("Valid ID");
      expect(resolved[1]?.isRequired).toBe(false);
      expect(resolved[2]?.name).toBe("Photo");
      expect(resolved[3]?.name).toBe("Requirement 4");
      expect(resolved[4]?.name).toBe("Requirement 5");
    });

    it("mapApplicantsPayload handles unknown form fields array without throw or corruption", () => {
      const examApp = initialExamApplicant(1);
      examApp.firstName = "Pedro";
      examApp.lastName = "Penduko";
      examApp.schoolName = "STI College";
      examApp.courseDegree = "BSIT";
      examApp.yearGraduated = "2022";

      const rawFormFields: unknown[] = [
        { fieldId: "f-school", label: "School Attended" },
        { id: "f-course", label: "Course / Degree" },
        null,
        123,
      ];

      const mapped = mapApplicantsPayload([examApp], rawFormFields);
      expect(mapped.length).toBe(1);
      expect(mapped[0]?.firstName).toBe("Pedro");
      expect(mapped[0]?.lastName).toBe("Penduko");

      const values = mapped[0]?.formFieldValues || [];
      expect(values.find((v) => v.fieldId === "f-school")?.value).toBe("STI College");
      expect(values.find((v) => v.fieldId === "f-course")?.value).toBe("BSIT");
    });
  });
});
