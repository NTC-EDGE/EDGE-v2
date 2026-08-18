using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class AccreditationsCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000005");
    public static readonly Guid Svc118Id   = Guid.Parse("50000000-0000-0000-0000-000000000018");

    public static readonly string Ntc118Contract = @"
    {
        ""formNo"": ""NTC 1-18"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Accreditations"",
        ""group"": ""Customer Premises Equipment Supplier Accreditation"",
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""personnel"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""category"": [""MOBILE"", ""MOBILE PHONES"", ""NON-MOBILE PHONES""],
            ""applicationType"": [""MOBILE"", ""MOBILE PHONES"", ""NON-MOBILE PHONES""]
        },
        ""entityType"": ""Application""
    }";

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_18"] = Ntc118Contract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_1_18", Svc118Id, categoryId, "CUSTOMER PREMISES EQUIPMENT SUPPLIER ACCREDITATION", "Customer Premises Equipment Supplier Accreditation", "NTC_1_18", "CUSTOMER PREMISES EQUIPMENT SUPPLIER ACCREDITATION (NTC 1-18)", Ntc118Contract)
    };

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        new(Guid.Parse("60000000-0000-0000-0000-000000000013"), Svc118Id, ServiceVariantType.New, "Customer Premises Equipment Supplier Accreditation (Mobile)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000014"), Svc118Id, ServiceVariantType.Renewal, "Customer Premises Equipment Supplier Accreditation (Mobile)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000015"), Svc118Id, ServiceVariantType.Modification, "Customer Premises Equipment Supplier Accreditation (Mobile)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000304"), Svc118Id, ServiceVariantType.New, "Customer Premises Equipment Supplier Accreditation (Non-Mobile Phones)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000305"), Svc118Id, ServiceVariantType.Renewal, "Customer Premises Equipment Supplier Accreditation (Non-Mobile Phones)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000306"), Svc118Id, ServiceVariantType.Modification, "Customer Premises Equipment Supplier Accreditation (Non-Mobile Phones)")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["DEALER_REG_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000082"), "Valid Registration/Permit Documents (DTI/SEC/CDA/Mayor's Permit)", "Valid Certificate of Registration or Business Permit."),
        ["PAID_UP_CAPITAL_250K"] = new(Guid.Parse("70000000-0000-0000-0000-000000000301"), "Proof of Paid-Up Capital (Php 250,000)", "Bank certificate or financial statement showing minimum paid-up capital of Php 250,000."),
        ["DISTRIBUTORSHIP_AGREEMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000302"), "Distributorship Agreement / Certificate", "Authenticated agreement or appointment letter from manufacturer or principal distributor."),
        ["TYPE_APPROVAL_OR_GRANT_OF_EQUIPMENT_CONFORMITY"] = new(Guid.Parse("70000000-0000-0000-0000-000000000303"), "Type Approval Certificate / Grant of Equipment Conformity", "Valid NTC Type Approval / Acceptance certificate for equipment to be distributed."),
        ["TWO_TECH_EMPLOYMENT_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000304"), "Proof of Employment of at least Two (2) Technicians", "Contract of employment, SSS/PhilHealth registration of at least 2 qualified technicians."),
        ["ECE_PECE_EMPLOYMENT_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000305"), "Proof of Employment of Validly Registered ECE/PECE", "PRC License and employment contract of supervising ECE or PECE."),
        ["CPE_SUPPLIER_ACCREDITATION_DOC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000306"), "Previous CPE Supplier Accreditation Certificate", "Copy of existing or expiring Accreditation Certificate."),
        ["BUSINESS_MAYORS_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000307"), "Current Business / Mayor's Permit", "Valid Mayor's / Business Permit for the current calendar year."),
        ["TYPE_APPROVAL_NOT_PREVIOUSLY_INDICATED"] = new(Guid.Parse("70000000-0000-0000-0000-000000000308"), "Type Approval Certificate of New/Additional Equipment", "Type approval documentation for items not covered by initial accreditation.")
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // Mobile - NEW
        new(Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000301"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000302"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000303"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000304"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000305"), true),

        // Mobile - RENEWAL
        new(Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000306"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000307"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000302"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000304"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000305"), true),

        // Mobile - MODIFICATION
        new(Guid.Parse("60000000-0000-0000-0000-000000000015"), Guid.Parse("70000000-0000-0000-0000-000000000306"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000015"), Guid.Parse("70000000-0000-0000-0000-000000000308"), true),

        // Non-Mobile Phones - NEW
        new(Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000301"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000302"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000303"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000304"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000305"), true),

        // Non-Mobile Phones - RENEWAL
        new(Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000306"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000307"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000302"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000304"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000305"), true),

        // Non-Mobile Phones - MODIFICATION
        new(Guid.Parse("60000000-0000-0000-0000-000000000306"), Guid.Parse("70000000-0000-0000-0000-000000000306"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000306"), Guid.Parse("70000000-0000-0000-0000-000000000308"), true)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_18", Guid.Parse("f1800000-0000-0000-0000-000000000001"), Guid.Parse("f18a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("personnel", "Personnel Credentials", new() { "personnelDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000001"),
            new[] { "Customer Premises Equipment", "Premises Equipment", "CPE", "Accreditation" },
            "Customer Premises Equipment Supplier Accreditation\n\nAn Accreditation for Customer Premises Equipment Supplier is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition, servicing, maintenance, purchase or sale of equipment located in the premises of a customer which is not part of but connected to the system or network of a public telecommunications entity.",
            "WHO MAY AVAIL:\n\n1. Individuals and Private Entities"
        )
    };
}
