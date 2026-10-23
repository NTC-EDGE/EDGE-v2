import { describe, it, expect } from "bun:test";
import {
  PERMIT_DETAILS_SERVICE_OPTIONS,
  PERMIT_TYPES_BY_SERVICE,
  resolvePermitTypes,
  formatPermitServiceLabel,
} from "./dynamicFormConstants";
import { resolveFileFromUpload } from "../../../auth/Services/shared/helpers/requirementUploadHelper";
import { isAllowedRequirementFileType } from "../../../../../internal/src/utils/fileValidation";

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
    // String upload
    const resString = await resolveFileFromUpload("");
    expect(resString).toBeNull();

    // Descriptor with empty URI and no File
    const resEmpty = await resolveFileFromUpload({ name: "test.pdf" });
    expect(resEmpty).toBeNull();

    // Descriptor with null/undefined properties
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
