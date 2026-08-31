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
        ""group"": ""Dealer/Manufacturer/Service Center/Retailer/Reseller Permit / CPE Supplier Accreditation"",
        ""applicationTypes"": [""NEW"", ""RENEWAL"", ""MODIFICATION""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""typeOfApplication"", ""required"": true },
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""personnel"", ""required"": false },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""equipmentCategory"": [""Radio Communications Equipment (RCE)"", ""Radio Transmitter/Transceiver"", ""WDN Indoor/SRD/RFID"", ""Mobile Phone""],
            ""permitCategory"": [""Dealer"", ""Manufacturer"", ""Service Center"", ""Dealer (MPDP)"", ""Retailer/Reseller (MPRR)"", ""Service Center (MPSCP)"", ""Customer Premises Equipment (CPE) Supplier Accreditation""],
            ""entityType"": [""Corporation"", ""Single Proprietorship"", ""Partnership"", ""Others""]
        },
        ""entityType"": ""Application""
    }";

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_18"] = Ntc118Contract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_1_18", Svc118Id, categoryId, "Customer Premises Equipment Supplier Accreditation", "Customer Premises Equipment Supplier Accreditation", "NTC_1_18", "Customer Premises Equipment Supplier Accreditation", Ntc118Contract)
    };

    // Variant IDs
    public static readonly Guid VarCpeMobileNew       = Guid.Parse("60000000-0000-0000-0000-000000000013");
    public static readonly Guid VarCpeMobileRen       = Guid.Parse("60000000-0000-0000-0000-000000000014");
    public static readonly Guid VarCpeMobileMod       = Guid.Parse("60000000-0000-0000-0000-000000000015");
    public static readonly Guid VarCpeNonMobileNew    = Guid.Parse("60000000-0000-0000-0000-000000000304");
    public static readonly Guid VarCpeNonMobileRen    = Guid.Parse("60000000-0000-0000-0000-000000000305");
    public static readonly Guid VarCpeNonMobileMod    = Guid.Parse("60000000-0000-0000-0000-000000000306");

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        new(VarCpeMobileNew, Svc118Id, ServiceVariantType.New, "MOBILE", false),
        new(VarCpeMobileRen, Svc118Id, ServiceVariantType.Renewal, "MOBILE PHONES", false),
        new(VarCpeMobileMod, Svc118Id, ServiceVariantType.Modification, "MOBILE", false),
        new(VarCpeNonMobileNew, Svc118Id, ServiceVariantType.New, "NON-MOBILE PHONES", false),
        new(VarCpeNonMobileRen, Svc118Id, ServiceVariantType.Renewal, "NON-MOBILE PHONES", false),
        new(VarCpeNonMobileMod, Svc118Id, ServiceVariantType.Modification, "NON-MOBILE PHONES", false)
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["REGISTRATION_OR_PERMIT_DOCS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000082"),
            "Copy of ANY of the following:*\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.",
            "Copy of ANY of the following:*\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for."
        ),
        ["PROOF_OF_PAID_UP_CAPITAL"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000301"),
            "Proof of Paid-Up Capital*\nMinimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship",
            "Proof of Paid-Up Capital*\nMinimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship"
        ),
        ["DISTRIBUTORSHIP_AGREEMENT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000302"),
            "Distributorship OR Representation Agreement on products to be sold*",
            "Distributorship OR Representation Agreement on products to be sold*"
        ),
        ["TYPE_APPROVAL_OR_CONFORMITY"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000303"),
            "Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold*",
            "Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold*"
        ),
        ["TWO_TECHNICIANS_EMPLOYMENT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000304"),
            "Copy of the following:*\nCertificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis",
            "Copy of the following:*\nCertificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis"
        ),
        ["ECE_PECE_EMPLOYMENT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000305"),
            "Copy of the following:*\nCertificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)",
            "Copy of the following:*\nCertificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)"
        ),
        ["CPE_SUPPLIER_ACCREDITATION"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000306"),
            "CPE Supplier Accreditation*",
            "CPE Supplier Accreditation*"
        ),
        ["BUSINESS_MAYORS_PERMIT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000307"),
            "Business/Mayor's Permit*",
            "Business/Mayor's Permit*"
        ),
        ["TYPE_APPROVAL_NOT_PREVIOUSLY_INDICATED"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000308"),
            "For equipment not previously indicated in the CPE Supplier Accreditation:\nCopy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold",
            "For equipment not previously indicated in the CPE Supplier Accreditation:\nCopy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold"
        )
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // 1. MOBILE - NEW
        new(VarCpeMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
        new(VarCpeMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000301"), true),
        new(VarCpeMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000302"), true),
        new(VarCpeMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000303"), true),
        new(VarCpeMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000304"), true),
        new(VarCpeMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000305"), true),

        // 2. MOBILE PHONES - RENEWAL
        new(VarCpeMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000306"), true),
        new(VarCpeMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000307"), true),
        new(VarCpeMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000302"), true),
        new(VarCpeMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000304"), true),
        new(VarCpeMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000305"), true),

        // 3. MOBILE - MODIFICATION
        new(VarCpeMobileMod, Guid.Parse("70000000-0000-0000-0000-000000000306"), true),
        new(VarCpeMobileMod, Guid.Parse("70000000-0000-0000-0000-000000000308"), false),

        // 4. NON-MOBILE PHONES - NEW
        new(VarCpeNonMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
        new(VarCpeNonMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000301"), true),
        new(VarCpeNonMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000302"), true),
        new(VarCpeNonMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000303"), true),
        new(VarCpeNonMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000304"), true),
        new(VarCpeNonMobileNew, Guid.Parse("70000000-0000-0000-0000-000000000305"), true),

        // 5. NON-MOBILE PHONES - RENEWAL
        new(VarCpeNonMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000306"), true),
        new(VarCpeNonMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000307"), true),
        new(VarCpeNonMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000302"), true),
        new(VarCpeNonMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000304"), true),
        new(VarCpeNonMobileRen, Guid.Parse("70000000-0000-0000-0000-000000000305"), true),

        // 6. NON-MOBILE PHONES - MODIFICATION
        new(VarCpeNonMobileMod, Guid.Parse("70000000-0000-0000-0000-000000000306"), true),
        new(VarCpeNonMobileMod, Guid.Parse("70000000-0000-0000-0000-000000000308"), false)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_18", Guid.Parse("f1800000-0000-0000-0000-000000000001"), Guid.Parse("f18a0000-0000-0000-0000-000000000000"), new()
        {
            new("typeOfApplication", "Type of Application & Category", new() { "permitType", "noOfYears", "employmentType" }),
            new("applicant", "Applicant Details", new() { "companyName", "entityType", "dtiSecRegistration", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("personnel", "Technical Personnel", new() { "personnelName", "certificateEctNo", "certificateEctExpiryDate" }),
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
