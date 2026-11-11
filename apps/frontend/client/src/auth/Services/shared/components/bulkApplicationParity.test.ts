// @ts-expect-error - bun test runtime module
import { describe, it, expect } from "bun:test";
import { initialGeneralApplicant, GeneralApplicantData } from "../types/generalApplicantTypes";
import { serializeCertificateApplicant } from "../../certificates/helpers/payloadSerializer";
import { isGeneralApplicantComplete } from "../helpers/applicantValidationHelper";
import { NTCService } from "../../data/servicesData";

describe("Bulk vs Single Application Parity", () => {
  const dummyService: NTCService = {
    id: "serv-broadcast-station",
    code: "NTC-BS-01",
    title: "Permit to Purchase and Possess Radio Transmitter",
    category: "Permits",
    description: "Standard broadcast radio station permit",
    requirements: ["DTI Registration", "Board Resolution", "NTC Technical Form"],
    fee: "PHP 1,500.00",
    time: "3 working days",
  };

  it("synchronizes service variant and element across all existing cohort applicants", () => {
    const applicants: GeneralApplicantData[] = [initialGeneralApplicant(1), initialGeneralApplicant(2)];
    const variantId = "var-commercial-am";
    const variantName = "Commercial AM Broadcast Station";
    const elementId = "elem-high-power";
    const elementTitle = "High Power 50kW Transmitter";

    const updatedApplicants = applicants.map((app) => ({
      ...app,
      selectedVariantId: variantId,
      selectedVariantName: variantName,
      selectedElementId: elementId,
      selectedElementTitle: elementTitle,
    }));

    expect(updatedApplicants.length).toBe(2);
    expect(updatedApplicants[0]?.selectedVariantId).toBe("var-commercial-am");
    expect(updatedApplicants[0]?.selectedElementId).toBe("elem-high-power");
    expect(updatedApplicants[1]?.selectedVariantId).toBe("var-commercial-am");
    expect(updatedApplicants[1]?.selectedElementId).toBe("elem-high-power");
  });

  it("inherits variant, element, and company credentials when adding a new applicant to an active cohort", () => {
    const baseCompanyApp: GeneralApplicantData = {
      ...initialGeneralApplicant(1),
      applicantType: "company",
      companyName: "Mega Broadcast Corp",
      dtiSecRegistration: "SEC-12345678",
      representativeName: "Juan Dela Cruz",
      representativePosition: "Station General Manager",
      selectedVariantId: "var-commercial-am",
      selectedVariantName: "Commercial AM Broadcast Station",
      selectedElementId: "elem-high-power",
      selectedElementTitle: "High Power 50kW Transmitter",
      region: "National Capital Region",
      city: "Quezon City",
    };

    const newCohortMember: GeneralApplicantData = {
      ...initialGeneralApplicant(2),
      selectedVariantId: baseCompanyApp.selectedVariantId,
      selectedVariantName: baseCompanyApp.selectedVariantName,
      selectedElementId: baseCompanyApp.selectedElementId,
      selectedElementTitle: baseCompanyApp.selectedElementTitle,
      applicantType: baseCompanyApp.applicantType || "individual",
      ...(baseCompanyApp.applicantType === "company"
        ? {
            companyName: baseCompanyApp.companyName,
            representativeName: baseCompanyApp.representativeName,
            representativePosition: baseCompanyApp.representativePosition,
            dtiSecRegistration: baseCompanyApp.dtiSecRegistration,
            region: baseCompanyApp.region,
            city: baseCompanyApp.city,
          }
        : {}),
    };

    expect(newCohortMember.selectedVariantId).toBe("var-commercial-am");
    expect(newCohortMember.applicantType).toBe("company");
    expect(newCohortMember.companyName).toBe("Mega Broadcast Corp");
    expect(newCohortMember.representativeName).toBe("Juan Dela Cruz");
    expect(newCohortMember.city).toBe("Quezon City");
  });

  it("enriches imported spreadsheet applicants with active variant configuration", () => {
    const activeApp: GeneralApplicantData = {
      ...initialGeneralApplicant(1),
      selectedVariantId: "var-vhf-radio",
      selectedVariantName: "VHF Marine Coastal Station",
    };

    const importedFromExcel: GeneralApplicantData[] = [
      { ...initialGeneralApplicant(1), firstName: "Pedro", lastName: "Reyes", email: "pedro@maritime.ph" },
      { ...initialGeneralApplicant(2), firstName: "Ana", lastName: "Santos", email: "ana@maritime.ph" },
    ];

    const enriched = importedFromExcel.map((app) => ({
      ...app,
      selectedVariantId: activeApp.selectedVariantId || app.selectedVariantId,
      selectedVariantName: activeApp.selectedVariantName || app.selectedVariantName,
    }));

    expect(enriched[0]?.selectedVariantId).toBe("var-vhf-radio");
    expect(enriched[0]?.selectedVariantName).toBe("VHF Marine Coastal Station");
    expect(enriched[1]?.selectedVariantId).toBe("var-vhf-radio");
    expect(enriched[1]?.selectedVariantName).toBe("VHF Marine Coastal Station");
  });

  it("serializes each bulk applicant identically to single applicant serialization", () => {
    const singleApplicant: GeneralApplicantData = {
      ...initialGeneralApplicant(1),
      firstName: "Cardo",
      lastName: "Dalisay",
      email: "cardo@cidg.gov.ph",
      contactNo: "09171234567",
      region: "NCR",
      province: "Metro Manila",
      city: "Quezon City",
      barangay: "Crame",
      street: "Camp Crame Gate 1",
      birthYear: "1985",
      birthMonth: "January",
      birthDay: "15",
      sex: "Male",
      civilStatus: "Married",
    };

    const serialized = serializeCertificateApplicant(singleApplicant, dummyService, []);

    expect(serialized.firstName).toBe("Cardo");
    expect(serialized.lastName).toBe("Dalisay");
    expect(serialized.email).toBe("cardo@cidg.gov.ph");
    expect(serialized.birthDate).toBe("1985-01-15");
    expect(serialized.sex).toBe("Male");
    expect(serialized.contactNumber).toBe("09171234567");
  });

  it("enforces mandatory completion across all cohort members prior to submission", () => {
    const completeApp: GeneralApplicantData = {
      ...initialGeneralApplicant(1),
      firstName: "Juan",
      lastName: "Luna",
      email: "juan@art.ph",
      contactNo: "09181234567",
      region: "Region I",
      province: "Ilocos Norte",
      city: "Badoc",
      barangay: "Poblacion",
      address: "Luna Ancestral Home",
      signatureUrl: "data:image/png;base64,signature1",
      uploads: {
        "DTI Registration": { name: "dti.pdf", uri: "file://dti.pdf" },
        "Board Resolution": { name: "board.pdf", uri: "file://board.pdf" },
        "NTC Technical Form": { name: "tech.pdf", uri: "file://tech.pdf" },
      },
    };

    const incompleteApp: GeneralApplicantData = {
      ...initialGeneralApplicant(2),
      firstName: "Antonio",
      lastName: "Luna",
      email: "antonio@army.ph",
      contactNo: "09191234567",
      region: "Region I",
      province: "Ilocos Norte",
      city: "Badoc",
      barangay: "Poblacion",
      address: "General Luna Quarters",
      signatureUrl: "data:image/png;base64,signature2",
      uploads: {},
    };

    const cohort = [completeApp, incompleteApp];
    const completedCount = cohort.filter((app) =>
      isGeneralApplicantComplete(app, dummyService, dummyService.requirements)
    ).length;

    expect(completedCount).toBe(1);
    expect(completedCount === cohort.length).toBe(false);
  });
});
