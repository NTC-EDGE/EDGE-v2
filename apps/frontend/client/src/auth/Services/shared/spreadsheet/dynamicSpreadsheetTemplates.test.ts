// @ts-expect-error - bun test runtime module
import { describe, it, expect } from "bun:test";
import { NTCService } from "../../data/servicesData";
import { FormDto } from "../../../../shared/components/dynamic-form/dynamicFormTypes";
import {
  getSpreadsheetTemplateForService,
  buildDynamicSpreadsheetTemplate,
  generateCsvContent,
} from "./spreadsheetTemplates";
import { parseSpreadsheetContent } from "./csvParser";

describe("Dynamic Form Builder Spreadsheet Templates & Parsing", () => {
  const dummyService: NTCService = {
    id: "serv-cpe-01",
    code: "NTC_1_18",
    title: "Customer Premises Equipment (CPE) Supplier Accreditation",
    category: "Accreditations",
    description: "CPE supplier accreditation service",
    requirements: ["SEC/DTI Registration"],
    fee: "PHP 2,500.00",
    time: "3 working days",
  };

  const dummyForm: FormDto = {
    formId: "form-cpe-101",
    version: "1.0",
    serviceId: "serv-cpe-01",
    serviceCode: "NTC_1_18",
    sections: [
      {
        key: "personnel",
        title: "Technical Personnel",
        orderIndex: 1,
        fields: [
          {
            fieldId: "fld-sup-eng",
            label: "Supervising Engineer Name",
            type: "text",
            isRequired: true,
            orderIndex: 1,
          },
          {
            fieldId: "fld-ece-no",
            label: "PRC ECE License No",
            type: "text",
            isRequired: true,
            orderIndex: 2,
          },
          {
            fieldId: "fld-ece-exp",
            label: "ECE Expiry Date",
            type: "date",
            isRequired: false,
            orderIndex: 3,
          },
          {
            fieldId: "fld-rad-tech",
            label: "Radio Technician Name",
            type: "text",
            isRequired: false,
            orderIndex: 4,
          },
        ],
      },
      {
        key: "documents",
        title: "Required Attachments",
        orderIndex: 2,
        fields: [
          {
            fieldId: "fld-doc-dti",
            label: "DTI Registration File",
            type: "file",
            isRequired: false,
            orderIndex: 1,
          },
          {
            fieldId: "fld-sig",
            label: "Applicant Signature",
            type: "signature",
            isRequired: false,
            orderIndex: 2,
          },
        ],
      },
    ],
  };

  it("generates template columns dynamically based on Form Builder sections and fields", () => {
    const template = getSpreadsheetTemplateForService(dummyService, dummyForm);

    expect(template).toBeDefined();
    expect(template.headers).toContain("Supervising Engineer Name");
    expect(template.headers).toContain("PRC ECE License No");
    expect(template.headers).toContain("ECE Expiry Date");
    expect(template.headers).toContain("Radio Technician Name");

    // Ensure non-tabular field types like files and signatures are excluded from CSV columns
    expect(template.headers).not.toContain("DTI Registration File");
    expect(template.headers).not.toContain("Applicant Signature");

    // Ensure corporate base applicant columns are present
    expect(template.headers).toContain("Business Name");
    expect(template.headers).toContain("Email");
    expect(template.headers).toContain("Contact Number");
    expect(template.headers).toContain("Province");
    expect(template.headers).toContain("City");

    // Verify sample rows match the generated header count
    expect(template.sampleRows.length).toBe(2);
    expect(template.sampleRows[0]?.length).toBe(template.headers.length);
    expect(template.sampleRows[1]?.length).toBe(template.headers.length);

    // Verify sample value generation for date and personnel fields
    const engColIdx = template.headers.indexOf("Supervising Engineer Name");
    expect(template.sampleRows[0]?.[engColIdx]).toBe("Engr. Roberto Dela Cruz");

    const dateColIdx = template.headers.indexOf("ECE Expiry Date");
    expect(template.sampleRows[0]?.[dateColIdx]).toBe("2026-12-31");
  });

  it("falls back to static template when form has no sections or is null", () => {
    const fallbackTemplate = getSpreadsheetTemplateForService(dummyService, null);
    expect(fallbackTemplate).toBeDefined();
    expect(fallbackTemplate.filename).toBe("NTC_CPE_Supplier_Accreditation_Template.csv");
    expect(fallbackTemplate.headers).toContain("Business Name");
  });

  it("parses CSV content and populates formFieldValues based on Form Builder configuration", () => {
    const template = getSpreadsheetTemplateForService(dummyService, dummyForm);
    const csvContent = generateCsvContent(template);

    const parseResult = parseSpreadsheetContent(csvContent, dummyService, dummyForm);

    expect(parseResult.totalRows).toBe(2);
    expect(parseResult.validCount).toBe(2);
    expect(parseResult.invalidCount).toBe(0);

    const firstApp = parseResult.applicants[0];
    expect(firstApp).toBeDefined();
    expect(firstApp?.companyName).toBe("Acme Communications Corp.");
    expect(firstApp?.email).toBe("regulatory@acme.ph");
    expect(firstApp?.contactNo).toBe("09171234567");

    // Verify formFieldValues contains the dynamic form builder values
    expect(firstApp?.formFieldValues).toBeDefined();
    const supEngValue = firstApp?.formFieldValues?.find((fv) => fv.fieldId === "fld-sup-eng");
    expect(supEngValue).toBeDefined();
    expect(supEngValue?.fieldLabel).toBe("Supervising Engineer Name");
    expect(supEngValue?.value).toBe("Engr. Roberto Dela Cruz");

    const eceNoValue = firstApp?.formFieldValues?.find((fv) => fv.fieldId === "fld-ece-no");
    expect(eceNoValue).toBeDefined();
    expect(eceNoValue?.value).toBe("PECE-0012948");
  });

  it("flags missing mandatory Form Builder fields as invalid rows with specific remarks", () => {
    const template = getSpreadsheetTemplateForService(dummyService, dummyForm);
    const engColIdx = template.headers.indexOf("Supervising Engineer Name");

    // Modify row 1 so that mandatory Supervising Engineer Name is empty
    const modifiedRow1 = [...(template.sampleRows[0] || [])];
    if (engColIdx !== -1) {
      modifiedRow1[engColIdx] = "";
    }

    const modifiedTemplate = {
      ...template,
      sampleRows: [modifiedRow1],
    };

    const csvContent = generateCsvContent(modifiedTemplate);
    const parseResult = parseSpreadsheetContent(csvContent, dummyService, dummyForm);

    expect(parseResult.totalRows).toBe(1);
    expect(parseResult.validCount).toBe(0);
    expect(parseResult.invalidCount).toBe(1);

    const rowResult = parseResult.results[0];
    expect(rowResult?.status).toBe("Invalid");
    expect(rowResult?.remarks.some((r) => r.includes("Supervising Engineer Name is required"))).toBe(true);
  });

  it("synchronizes educational fields between formFieldValues and applicant properties for exam services", () => {
    const examService: NTCService = {
      id: "serv-exam-01",
      code: "NTC_1_01",
      title: "Radio Operator Examination",
      category: "Exams",
      description: "Exam admission slip service",
      requirements: [],
      fee: "PHP 150.00",
      time: "1 working day",
    };

    const examForm: FormDto = {
      formId: "form-exam-01",
      version: "1.0",
      serviceId: "serv-exam-01",
      sections: [
        {
          key: "education",
          title: "Educational Background",
          orderIndex: 1,
          fields: [
            {
              fieldId: "fd000000-0000-0000-0000-000000000061",
              label: "School / University Attended",
              type: "text",
              isRequired: true,
              orderIndex: 1,
            },
            {
              fieldId: "fd000000-0000-0000-0000-000000000062",
              label: "Course / Degree Program",
              type: "text",
              isRequired: true,
              orderIndex: 2,
            },
            {
              fieldId: "fd000000-0000-0000-0000-000000000063",
              label: "Year Graduated",
              type: "text",
              isRequired: true,
              orderIndex: 3,
            },
          ],
        },
      ],
    };

    const template = getSpreadsheetTemplateForService(examService, examForm);
    expect(template.headers).toContain("School / University Attended");
    expect(template.headers).toContain("Course / Degree Program");
    expect(template.headers).toContain("Year Graduated");

    const csvContent = generateCsvContent(template);
    const parseResult = parseSpreadsheetContent(csvContent, examService, examForm);

    expect(parseResult.totalRows).toBe(2);
    const firstApplicant = parseResult.applicants[0];
    expect(firstApplicant).toBeDefined();

    // Verify properties on applicant
    expect(firstApplicant?.schoolName).toBe("University of the Philippines");
    expect(firstApplicant?.courseDegree).toBe("BS Electronics Engineering");
    expect(firstApplicant?.yearGraduated).toBe("2022");

    // Verify formFieldValues contains the exact values
    const schoolFv = firstApplicant?.formFieldValues?.find((fv) => fv.fieldId === "fd000000-0000-0000-0000-000000000061");
    expect(schoolFv?.value).toBe("University of the Philippines");
  });

  it("annotates dropdown fields in headers and populates dropdownValidations config", () => {
    const serviceWithDropdown: NTCService = {
      id: "serv-vas-01",
      code: "NTC_1_20",
      title: "Value Added Service Registration",
      category: "Registrations",
      description: "VAS Provider Registration",
      requirements: [],
      fee: "PHP 1,000.00",
      time: "2 working days",
    };

    const formWithDropdown: FormDto = {
      formId: "form-vas-01",
      version: "1.0",
      serviceId: "serv-vas-01",
      sections: [
        {
          key: "details",
          title: "Service Details",
          orderIndex: 1,
          fields: [
            {
              fieldId: "fld-sub-category",
              label: "Subscription Category",
              type: "select",
              isRequired: true,
              options: [
                { label: "Commercial Public", value: "COMM_PUB" },
                { label: "Internal Corporate", value: "INT_CORP" },
                { label: "Government Dedicated", value: "GOV_DED" },
              ],
              orderIndex: 1,
            },
          ],
        },
      ],
    };

    const template = getSpreadsheetTemplateForService(serviceWithDropdown, formWithDropdown);
    expect(template).toBeDefined();

    // Verify annotated header
    expect(template.headers.some((h) => h.includes("Subscription Category (Commercial Public | Internal Corporate | Government Dedicated)"))).toBe(true);

    // Verify dropdownValidations entry
    expect(template.dropdownValidations).toBeDefined();
    const subCatValidation = template.dropdownValidations?.find((v) => v.label === "Subscription Category");
    expect(subCatValidation).toBeDefined();
    expect(subCatValidation?.allowedOptions).toEqual(["Commercial Public", "Internal Corporate", "Government Dedicated"]);

    // Verify sample rows draw valid dropdown options
    const colIdx = template.headers.findIndex((h) => h.includes("Subscription Category"));
    expect(colIdx).toBeGreaterThanOrEqual(0);
    expect(template.sampleRows[0]?.[colIdx]).toBe("Commercial Public");
    expect(template.sampleRows[1]?.[colIdx]).toBe("Internal Corporate");
  });

  it("strictly accepts valid dropdown options and normalizes values to canonical option labels", () => {
    const serviceWithDropdown: NTCService = {
      id: "serv-vas-01",
      code: "NTC_1_20",
      title: "Value Added Service Registration",
      category: "Registrations",
      description: "VAS Provider Registration",
      requirements: [],
      fee: "PHP 1,000.00",
      time: "2 working days",
    };

    const formWithDropdown: FormDto = {
      formId: "form-vas-01",
      version: "1.0",
      serviceId: "serv-vas-01",
      sections: [
        {
          key: "details",
          title: "Service Details",
          orderIndex: 1,
          fields: [
            {
              fieldId: "fld-sub-category",
              label: "Subscription Category",
              type: "select",
              isRequired: true,
              options: [
                { label: "Commercial Public", value: "COMM_PUB" },
                { label: "Internal Corporate", value: "INT_CORP" },
              ],
              orderIndex: 1,
            },
          ],
        },
      ],
    };

    const template = getSpreadsheetTemplateForService(serviceWithDropdown, formWithDropdown);
    const colIdx = template.headers.findIndex((h) => h.includes("Subscription Category"));

    // Provide lowercase value matching value code "int_corp"
    const customRow = [...(template.sampleRows[0] || [])];
    customRow[colIdx] = "int_corp";

    const customTemplate = {
      ...template,
      sampleRows: [customRow],
    };

    const csvContent = generateCsvContent(customTemplate);
    const parseResult = parseSpreadsheetContent(csvContent, serviceWithDropdown, formWithDropdown);

    expect(parseResult.totalRows).toBe(1);
    expect(parseResult.validCount).toBe(1);
    expect(parseResult.invalidCount).toBe(0);

    const app = parseResult.applicants[0];
    expect(app).toBeDefined();
    const fv = app?.formFieldValues?.find((f) => f.fieldId === "fld-sub-category");
    expect(fv).toBeDefined();
    // Normalized to canonical option label
    expect(fv?.value).toBe("Internal Corporate");
  });

  it("strictly rejects invalid dropdown options and excludes invalid rows from applicants cohort", () => {
    const serviceWithDropdown: NTCService = {
      id: "serv-vas-01",
      code: "NTC_1_20",
      title: "Value Added Service Registration",
      category: "Registrations",
      description: "VAS Provider Registration",
      requirements: [],
      fee: "PHP 1,000.00",
      time: "2 working days",
    };

    const formWithDropdown: FormDto = {
      formId: "form-vas-01",
      version: "1.0",
      serviceId: "serv-vas-01",
      sections: [
        {
          key: "details",
          title: "Service Details",
          orderIndex: 1,
          fields: [
            {
              fieldId: "fld-sub-category",
              label: "Subscription Category",
              type: "select",
              isRequired: true,
              options: [
                { label: "Commercial Public", value: "COMM_PUB" },
                { label: "Internal Corporate", value: "INT_CORP" },
              ],
              orderIndex: 1,
            },
          ],
        },
      ],
    };

    const template = getSpreadsheetTemplateForService(serviceWithDropdown, formWithDropdown);
    const colIdx = template.headers.findIndex((h) => h.includes("Subscription Category"));

    // Provide completely illegal dropdown option
    const rowWithInvalidDropdown = [...(template.sampleRows[0] || [])];
    rowWithInvalidDropdown[colIdx] = "Military Restricted (Unauthorized)";

    // And a valid second row
    const rowWithValidDropdown = [...(template.sampleRows[1] || [])];
    rowWithValidDropdown[colIdx] = "Commercial Public";

    const customTemplate = {
      ...template,
      sampleRows: [rowWithInvalidDropdown, rowWithValidDropdown],
    };

    const csvContent = generateCsvContent(customTemplate);
    const parseResult = parseSpreadsheetContent(csvContent, serviceWithDropdown, formWithDropdown);

    expect(parseResult.totalRows).toBe(2);
    expect(parseResult.validCount).toBe(1);
    expect(parseResult.invalidCount).toBe(1);

    // Verify row 1 error
    const row1 = parseResult.results[0];
    expect(row1?.status).toBe("Invalid");
    expect(row1?.remarks.some((r) => r.includes("Must strictly match one of the allowed dropdown options"))).toBe(true);

    // Verify only the valid row was pushed to applicants
    expect(parseResult.applicants.length).toBe(1);
    expect(parseResult.applicants[0]?.formFieldValues?.find((f) => f.fieldId === "fld-sub-category")?.value).toBe("Commercial Public");
  });

  it("strictly enforces standard dropdown fields (Sex, Examinee Type, Entity Type)", () => {
    // 1. Invalid Sex
    const individualCsv = [
      "First Name,Last Name,Email,Contact Number,Date of Birth,Sex,Province,City,Barangay,Street,Zip Code",
      "Juan,Dela Cruz,juan@example.ph,09171234567,1995-01-01,InvalidSex,Metro Manila,Quezon City,Diliman,123 Main,1101",
    ].join("\r\n");

    const individualService: NTCService = {
      id: "serv-indiv-01",
      code: "NTC_1_05",
      title: "Individual Permit Service",
      category: "Permits",
      description: "Individual radio permit service",
      requirements: [],
      fee: "PHP 500.00",
      time: "1 day",
    };

    const indivResult = parseSpreadsheetContent(individualCsv, individualService, null);
    expect(indivResult.totalRows).toBe(1);
    expect(indivResult.validCount).toBe(0);
    expect(indivResult.invalidCount).toBe(1);
    expect(indivResult.results[0]?.remarks.some((r) => r.includes("Invalid Sex \"InvalidSex\". Must strictly be either \"Male\" or \"Female\"."))).toBe(true);
    expect(indivResult.applicants.length).toBe(0);

    // 2. Invalid Examinee Type in Exam Service
    const examCsv = [
      "First Name,Last Name,Email,Contact Number,Date of Birth,Sex,Province,City,Barangay,Street,Zip Code,School Name,Course / Degree,Year Graduated,Examinee Type",
      "Juan,Dela Cruz,juan@example.ph,09171234567,1995-01-01,Male,Metro Manila,Quezon City,Diliman,123 Main,1101,UP,BS ECE,2022,UnauthorizedTaker",
    ].join("\r\n");

    const examService: NTCService = {
      id: "serv-exam-01",
      code: "NTC_1_01",
      title: "Radio Operator Examination",
      category: "Exams",
      description: "Exam admission slip service",
      requirements: [],
      fee: "PHP 150.00",
      time: "1 day",
    };

    const examResult = parseSpreadsheetContent(examCsv, examService, null);
    expect(examResult.totalRows).toBe(1);
    expect(examResult.validCount).toBe(0);
    expect(examResult.invalidCount).toBe(1);
    expect(examResult.results[0]?.remarks.some((r) => r.includes("Invalid Examinee Type \"UnauthorizedTaker\". Must strictly be one of: First Taker, Retaker, Upgrade, Removal."))).toBe(true);
    expect(examResult.applicants.length).toBe(0);
  });

  it("strictly follows service variant conditions and excludedVariants for dropdowns in bulk template and CSV parser", () => {
    const variantForm: FormDto = {
      formId: "form-var-override-01",
      version: "1.0",
      serviceId: "serv-cpe-01",
      serviceVariantId: "var-renewal-id",
      serviceVariantName: "CPE Supplier Accreditation (RENEWAL)",
      sections: [
        {
          key: "accreditation_details",
          title: "Accreditation Details",
          orderIndex: 1,
          fields: [
            {
              // Base field excluded on Renewal variant
              fieldId: "fld-base-tier",
              label: "Accreditation Tier",
              type: "select",
              isRequired: true,
              orderIndex: 1,
              options: [
                { label: "Provisional New", value: "PROV_NEW" },
                { label: "Standard New", value: "STD_NEW" },
              ],
              validationRules: JSON.stringify({
                condition: {
                  excludedVariants: ["var-renewal-id"],
                },
              }),
            },
            {
              // Variant-specific field only for Renewal variant
              fieldId: "fld-renewal-tier",
              label: "Renewal Classification Tier",
              type: "select",
              isRequired: true,
              orderIndex: 2,
              options: [
                { label: "Tier 1 Renewal (3 Years)", value: "TIER_1_REN" },
                { label: "Tier 2 Renewal (5 Years)", value: "TIER_2_REN" },
              ],
              validationRules: JSON.stringify({
                condition: {
                  variants: ["var-renewal-id"],
                },
              }),
            },
            {
              // Field for Modification variant only (should NOT appear in Renewal)
              fieldId: "fld-mod-reason",
              label: "Modification Reason",
              type: "select",
              isRequired: true,
              orderIndex: 3,
              options: [
                { label: "Change of Address", value: "ADDR" },
                { label: "Additional Equipment", value: "EQUIP" },
              ],
              validationRules: JSON.stringify({
                condition: {
                  variants: ["var-modification-id"],
                },
              }),
            },
          ],
        },
      ],
    };

    const evalContext = {
      variantId: "var-renewal-id",
      variantName: "CPE Supplier Accreditation (RENEWAL)",
      variantType: "Renewal",
    };

    const template = getSpreadsheetTemplateForService(dummyService, variantForm, evalContext);

    // Excluded base field and other-variant field must NOT appear in template headers
    expect(template.headers.some((h) => h.includes("Accreditation Tier"))).toBe(false);
    expect(template.headers.some((h) => h.includes("Modification Reason"))).toBe(false);

    // Renewal variant dropdown field MUST appear with its exact options
    expect(
      template.headers.some((h) =>
        h.includes("Renewal Classification Tier (Tier 1 Renewal (3 Years) | Tier 2 Renewal (5 Years))")
      )
    ).toBe(true);

    // Verify CSV parser enforces only the active variant's dropdown options and required fields
    const csvContent = generateCsvContent(template);
    const validParse = parseSpreadsheetContent(csvContent, dummyService, variantForm, evalContext);
    expect(validParse.validCount).toBe(2);
    expect(validParse.invalidCount).toBe(0);
    expect(
      validParse.applicants[0]?.formFieldValues?.find((fv) => fv.fieldId === "fld-renewal-tier")?.value
    ).toBe("Tier 1 Renewal (3 Years)");

    // Providing an option from the excluded base field must fail validation
    const colIdx = template.headers.findIndex((h) => h.includes("Renewal Classification Tier"));
    const invalidRow = [...(template.sampleRows[0] || [])];
    invalidRow[colIdx] = "Provisional New";
    const invalidCsv = generateCsvContent({ ...template, sampleRows: [invalidRow] });
    const invalidParse = parseSpreadsheetContent(invalidCsv, dummyService, variantForm, evalContext);
    expect(invalidParse.validCount).toBe(0);
    expect(invalidParse.invalidCount).toBe(1);
    expect(
      invalidParse.results[0]?.remarks.some((r) =>
        r.includes("Invalid value \"Provisional New\" for \"Renewal Classification Tier\"")
      )
    ).toBe(true);
  });

  it("evaluates inter-field dependency conditions per row in bulk template and CSV parser", () => {
    const conditionalForm: FormDto = {
      formId: "form-cond-01",
      version: "1.0",
      serviceId: "serv-cpe-01",
      sections: [
        {
          key: "equipment_source",
          title: "Equipment Source Details",
          orderIndex: 1,
          fields: [
            {
              fieldId: "fld-acq-mode",
              label: "Acquisition Mode",
              type: "select",
              isRequired: true,
              orderIndex: 1,
              options: [
                { label: "Imported", value: "Imported" },
                { label: "Locally Sourced", value: "Locally Sourced" },
              ],
            },
            {
              // Only visible and required when Acquisition Mode === "Imported"
              fieldId: "fld-import-port",
              label: "Port of Entry",
              type: "select",
              isRequired: true,
              orderIndex: 2,
              options: [
                { label: "Port of Manila", value: "POM" },
                { label: "NAIA Customs", value: "NAIA" },
              ],
              visibilityCondition: JSON.stringify({
                field: "fld-acq-mode",
                operator: "equals",
                value: "Imported",
              }),
            },
          ],
        },
      ],
    };

    const template = getSpreadsheetTemplateForService(dummyService, conditionalForm);
    const acqIdx = template.headers.findIndex((h) => h.includes("Acquisition Mode"));
    const portIdx = template.headers.findIndex((h) => h.includes("Port of Entry"));

    expect(acqIdx).toBeGreaterThanOrEqual(0);
    expect(portIdx).toBeGreaterThanOrEqual(0);

    // Row 1 has Acquisition Mode = "Imported", so Port of Entry sample value is populated
    expect(template.sampleRows[0]?.[acqIdx]).toBe("Imported");
    expect(template.sampleRows[0]?.[portIdx]).toBe("Port of Manila");

    // Row 2 has Acquisition Mode = "Locally Sourced", so Port of Entry condition is false and sample is blank
    expect(template.sampleRows[1]?.[acqIdx]).toBe("Locally Sourced");
    expect(template.sampleRows[1]?.[portIdx]).toBe("");

    // Parsing the generated template must pass both rows (Row 2 is valid even though Port of Entry is empty)
    const csvContent = generateCsvContent(template);
    const parseResult = parseSpreadsheetContent(csvContent, dummyService, conditionalForm);
    expect(parseResult.totalRows).toBe(2);
    expect(parseResult.validCount).toBe(2);
    expect(parseResult.invalidCount).toBe(0);

    // Row 1 has Port of Entry populated, Row 2 skips hidden Port of Entry
    expect(parseResult.applicants[0]?.formFieldValues?.find((f) => f.fieldId === "fld-import-port")?.value).toBe(
      "Port of Manila"
    );
    expect(parseResult.applicants[1]?.formFieldValues?.find((f) => f.fieldId === "fld-import-port")).toBeUndefined();

    // If Row 1 has Acquisition Mode = "Imported" but Port of Entry is empty, it MUST fail validation
    const rowMissingRequiredPort = [...(template.sampleRows[0] || [])];
    rowMissingRequiredPort[portIdx] = "";
    const invalidCsv = generateCsvContent({ ...template, sampleRows: [rowMissingRequiredPort] });
    const invalidParse = parseSpreadsheetContent(invalidCsv, dummyService, conditionalForm);
    expect(invalidParse.validCount).toBe(0);
    expect(invalidParse.invalidCount).toBe(1);
    expect(invalidParse.results[0]?.remarks.some((r) => r.includes("Port of Entry is required"))).toBe(true);
  });
});
