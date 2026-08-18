using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class CertificatesCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000002");

    public static readonly Guid Svc102Id = Guid.Parse("50000000-0000-0000-0000-000000000002");
    public static readonly Guid Svc103Id = Guid.Parse("50000000-0000-0000-0000-000000000003");
    public static readonly Guid Svc119Id = Guid.Parse("50000000-0000-0000-0000-000000000019");
    public static readonly Guid Svc120Id = Guid.Parse("50000000-0000-0000-0000-000000000020");
    public static readonly Guid Svc121Id = Guid.Parse("50000000-0000-0000-0000-000000000021");
    public static readonly Guid Svc122Id = Guid.Parse("50000000-0000-0000-0000-000000000022");

    public static readonly string Ntc102Contract = @"
    {
        ""formNo"": ""NTC 1-02"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Certificates"",
        ""group"": ""Radio Operator Certificates (ROC) excluding Amateur ROC"",
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicantPerson"", ""required"": true },
            { ""key"": ""typeOfCertificate"", ""required"": true },
            { ""key"": ""examSeminarDetails"", ""required"": false },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": true,
        ""categorySpecific"": {
            ""typeOfCertificate"": [""1RTG"",""2RTG"",""3RTG"",""1PHN"",""2PHN"",""3PHN"",""SROP"",""RROC-Land Mobile"",""RROC-Aircraft"",""GROC"",""TP RROC-Aircraft"",""Other""],
            ""applicantPersonExtension"": [""weight_kg"",""height_cm"",""employment_status"",""employment_location""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc103Contract = @"
    {
        ""formNo"": ""NTC 1-03"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Certificates"",
        ""group"": ""License in the Amateur Service"",
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""examineeTypes"": [""FirstTaker"", ""Retaker"", ""Upgrade""],
        ""elements"": [
            { ""code"": ""Class A"", ""condition"": ""Standard"", ""description"": ""Elements 8, 9, 10 & Code (5 wpm)"" },
            { ""code"": ""Class B"", ""condition"": ""Standard"", ""description"": ""Elements 5, 6 & 7"" },
            { ""code"": ""Class C"", ""condition"": ""Standard"", ""description"": ""Elements 2, 3 & 4"" },
            { ""code"": ""Class D"", ""condition"": ""Standard"", ""description"": ""Element 2"" }
        ],
        ""requiredSections"": [
            { ""key"": ""applicantPerson"", ""required"": true },
            { ""key"": ""permitType"", ""required"": true },
            { ""key"": ""classOfStation"", ""required"": true },
            { ""key"": ""club"", ""required"": false },
            { ""key"": ""examination"", ""required"": false },
            { ""key"": ""equipment"", ""required"": false },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""permitType"": [""Amateur Radio Operator Certificate"",""Amateur Radio Station License"",""Club Radio Station License"",""Temporary Permit for Foreign Visitor"",""Special Permit for Vanity/Special Call Sign"",""Lifetime Amateur Radio Station Supplementary Certificate""],
            ""classOfStation"": [""A"",""B"",""C"",""D""]
        },
        ""requirementDiscriminatorFields"": [""Permit Type""],
        ""requirementContextGroups"": {
            ""Amateur Radio Operator Certificate"": ""AmateurROC"",
            ""Amateur Radio Station License"": ""AmateurStationLicense"",
            ""Club Radio Station License"": ""ClubRadioStationLicense"",
            ""Temporary Permit for Foreign Visitor"": ""ForeignVisitorPermit"",
            ""Special Permit for Vanity/Special Call Sign"": ""VanityCallSignPermit"",
            ""Lifetime Amateur Radio Station Supplementary Certificate"": ""LifetimeSupplementaryCert""
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc119Contract = @"
    {
        ""formNo"": ""NTC 1-19"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Certificates"",
        ""group"": null,
        ""applicationTypes"": [""New""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""devices"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""deviceType"": [""RFID"",""Short Range Device"",""Wireless Data Network""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc120Contract = @"
    {
        ""formNo"": ""NTC 1-20"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Certificates"",
        ""group"": null,
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""knownByAnotherName"", ""required"": false },
            { ""key"": ""valueAddedServices"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""natureOfServices"": [""Messaging"",""Audio Information"",""Audio/Video Content Stream"",""Voice Mail"",""Internet Access Provider"",""Other""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc121Contract = @"
    {
        ""formNo"": ""NTC 1-21"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Certificates"",
        ""group"": null,
        ""applicationTypes"": [""Certified True Copy"", ""Duplicate Copy""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""permitLicenseCertificateNo"", ""required"": true },
            { ""key"": ""circumstances"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""copyType"": [""Certified True Copy"",""Duplicate Copy""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc122Contract = @"
    {
        ""formNo"": ""NTC 1-22"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Certificates"",
        ""group"": null,
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""tvroEquipment"", ""required"": true },
            { ""key"": ""antennaSystem"", ""required"": true },
            { ""key"": ""signalReception"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""typeOfApplication"": [""Commercial"",""Non-Commercial""]
        },
        ""entityType"": ""Application""
    }";

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_02"] = Ntc102Contract,
        ["NTC_1_03"] = Ntc103Contract,
        ["NTC_1_19"] = Ntc119Contract,
        ["NTC_1_20"] = Ntc120Contract,
        ["NTC_1_21"] = Ntc121Contract,
        ["NTC_1_22"] = Ntc122Contract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_1_02", Svc102Id, categoryId, "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC", "Radio Operator Certificates (ROC) excluding Amateur ROC", "NTC_1_02", "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC (NTC 1-02)", Ntc102Contract),
        new("NTC_1_03", Svc103Id, categoryId, "CERTIFICATES IN THE AMATEUR SERVICE", "License in the Amateur Service", "NTC_1_03", "CERTIFICATES IN THE AMATEUR SERVICE (NTC 1-03)", Ntc103Contract),
        new("NTC_1_19", Svc119Id, categoryId, "CERTIFICATE OF REGISTRATION FOR RFID, SRD, WDN, DEVICES- INDOOR", null, "NTC_1_19", "CERTIFICATE OF REGISTRATION FOR RFID, SRD, WDN, DEVICES- INDOOR (NTC 1-19)", Ntc119Contract),
        new("NTC_1_20", Svc120Id, categoryId, "CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER", null, "NTC_1_20", "CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER (NTC 1-20)", Ntc120Contract),
        new("NTC_1_21", Svc121Id, categoryId, "COPY OF CERTIFICATES", null, "NTC_1_21", "COPY OF CERTIFICATES (NTC 1-21)", Ntc121Contract),
        new("NTC_1_22", Svc122Id, categoryId, "TVRO REGISTRATION CERTIFICATE", null, "NTC_1_22", "TVRO REGISTRATION CERTIFICATE (NTC 1-22)", Ntc122Contract)
    };

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        new(Guid.Parse("60000000-0000-0000-0000-000000000002"), Svc102Id, ServiceVariantType.New, "Radio Operator Certificate Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000003"), Svc102Id, ServiceVariantType.Renewal, "Radio Operator Certificate Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000011"), Svc102Id, ServiceVariantType.Modification, "Radio Operator Certificate Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000004"), Svc103Id, ServiceVariantType.New, "Amateur Radio License Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000008"), Svc103Id, ServiceVariantType.Renewal, "Amateur Radio License Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000009"), Svc103Id, ServiceVariantType.Modification, "Amateur Radio License Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000016"), Svc119Id, ServiceVariantType.NA, "Certificate of Registration for RFID, SRD, WDN"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000017"), Svc120Id, ServiceVariantType.New, "Certificate of Registration as VAS Provider"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000018"), Svc120Id, ServiceVariantType.Renewal, "Certificate of Registration as VAS Provider"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000019"), Svc120Id, ServiceVariantType.Modification, "Certificate of Registration as VAS Provider"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000020"), Svc122Id, ServiceVariantType.NA, "TVRO Registration Certificate"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000050"), Svc121Id, ServiceVariantType.NA, "Duplicate Copy"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000051"), Svc121Id, ServiceVariantType.NA, "Certified True Copy")
    };

    public static List<VariantElementDef> GetBackfillElements() => new()
    {
        new(Guid.Parse("60000000-0000-0000-0000-000000000004"), "Class A", "Elements 8, 9, 10 & Code (5 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000004"), "Class B", "Elements 5, 6 & 7"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000004"), "Class C", "Elements 2, 3 & 4"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000004"), "Class D", "Element 2")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["ROC_RATING"] = new(Guid.Parse("70000000-0000-0000-0000-000000000010"), "Original valid Report of Rating", "Original valid Report of Rating issued by NTC."),
        ["FOREIGN_PILOT_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000011"), "Pilot license issued from country of origin", "Pilot license issued from country of origin."),
        ["GOOD_MORAL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000012"), "Certificate of Good Moral Character", "Certificate of Good Moral Character."),
        ["GOVT_SERVICE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000013"), "Certification of Government Service", "Certification of at least 6 months government radio operator service."),
        ["GOVT_SEMINAR"] = new(Guid.Parse("70000000-0000-0000-0000-000000000014"), "Certificate of Completion of Seminar", "Certificate of Completion of Seminar."),
        ["COE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000015"), "Certificate of Employment", "Certificate of Employment."),
        ["AMA_ACTIVITIES"] = new(Guid.Parse("70000000-0000-0000-0000-000000000016"), "Proof of Amateur Activities", "Proof of Amateur Activities."),
        ["SUPPLEMENTARY_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000017"), "Supplementary Certificate", "Supplementary Certificate."),
        ["DEALER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000018"), "Dealer Permit OR Manufacturer Permit", "Dealer Permit OR Manufacturer Permit."),
        ["IMPORTED_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000019"), "Imported Equipment Documents", "Permit to Import, Invoice, and BOC Release Clearance."),
        ["LOCAL_MFG_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000020"), "Locally-Manufactured Equipment Documents", "Sales and Stocks Report."),
        ["PROVISIONAL_AUTHORITY"] = new(Guid.Parse("70000000-0000-0000-0000-000000000021"), "Provisional Authority (PA)", "Provisional Authority or Motion for Renewal of PA."),
        ["HEADEND_EQUIP_LIST"] = new(Guid.Parse("70000000-0000-0000-0000-000000000022"), "Head-End Equipment List", "List of Head-End Equipment signed by licensed PECE/ECE."),
        ["LEASE_AGREEMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000023"), "Facilities Lease Agreement", "Facilities lease agreement with authorized network provider."),
        ["VAS_QUARTERLY_REPORTS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000024"), "Quarterly Reports of VAS Provider", "Quarterly Reports of VAS Provider."),
        ["AUTH_COPY"] = new(Guid.Parse("70000000-0000-0000-0000-000000000025"), "Copy of Document to be Authenticated", "Original or copy of document to be authenticated."),
        ["SCANNED_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000026"), "Copy of Certificate", "Scanned copy of original Certificate."),
        ["CORRECTION_NAME_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000027"), "Correction of Name Supporting Documents", "Valid ID, Birth Certificate, or Marriage Certificate."),
        ["AMA_UPGRADE_RATING"] = new(Guid.Parse("70000000-0000-0000-0000-000000000028"), "Report of Rating for Upgrade", "Valid Report of Rating for upgrade to higher class."),
        ["COR"] = new(Guid.Parse("70000000-0000-0000-0000-000000000029"), "Certificate of Registration", "Certificate of Registration.")
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // ROC Certificates
        new(Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000010"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000005"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false),

        // Amateur Certificates
        new(Guid.Parse("60000000-0000-0000-0000-000000000004"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000004"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000028"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000017"), true),

        // RFID/SRD/WDN (svc119)
        new(Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000018"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000019"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000020"), false),

        // VAS Provider (svc120)
        new(Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000029"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000023"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000024"), true),

        // Copy of Certificates (svc121)
        new(Guid.Parse("60000000-0000-0000-0000-000000000050"), Guid.Parse("70000000-0000-0000-0000-000000000026"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000050"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000051"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true),

        // TVRO Registration (svc122)
        new(Guid.Parse("60000000-0000-0000-0000-000000000020"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000020"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_02", Guid.Parse("f0200000-0000-0000-0000-000000000001"), Guid.Parse("f02a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "sex", "nationality", "weight_kg", "height_cm" }),
            new("applicantAddress", "Address Information", new() { "region", "province", "city", "barangay", "street", "zipCode" }),
            new("employmentStatus", "Employment Status", new() { "employmentStatus", "employmentType" }),
            new("applicantContact", "Contact Information", new() { "contactNo", "email" }),
            new("typeOfCertificate", "Type of Certificate", new() { "typeOfCertificate" }),
            new("examSeminarDetails", "Exam / Seminar Details", new() { "examSeminarAddress", "examSeminarDate", "examSeminarRating" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_1_03", Guid.Parse("f0300000-0000-0000-0000-000000000001"), Guid.Parse("f03a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "sex", "nationality" }),
            new("applicantAddress", "Address Information", new() { "region", "province", "city", "barangay", "street", "zipCode" }),
            new("employmentStatus", "Employment Status", new() { "employmentStatus", "employmentType" }),
            new("applicantContact", "Contact Information", new() { "contactNo", "email" }),
            new("permitType", "Permit / License Type", new() { "permitType" }),
            new("classOfStation", "Class of Station", new() { "classOfStation" }),
            new("club", "Club Details", new() { "clubDetails" }),
            new("examSeminarDetails", "Exam / Seminar Details", new() { "examSeminarAddress", "examSeminarDate", "examSeminarRating" }),
            new("equipment", "Equipment Details", new() { "equipmentDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_1_19", Guid.Parse("f1900000-0000-0000-0000-000000000001"), Guid.Parse("f19a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("devices", "Registered Devices", new() { "devicesDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_1_20", Guid.Parse("f2000000-0000-0000-0000-000000000001"), Guid.Parse("f20a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("knownByAnotherName", "Trade Name", new() { "fullName" }),
            new("valueAddedServices", "Value-Added Services", new() { "valueAddedServices" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_1_21", Guid.Parse("f2100000-0000-0000-0000-000000000001"), Guid.Parse("f21a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("permitLicenseCertificateNo", "Existing Permit/License Number", new() { "circumstances" }),
            new("circumstances", "Circumstances of Loss/Damage", new() { "circumstances" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_1_22", Guid.Parse("f2200000-0000-0000-0000-000000000001"), Guid.Parse("f22a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("tvroEquipment", "TVRO Equipment Details", new() { "tvroDetails" }),
            new("antennaSystem", "Antenna System Details", new() { "antennaDetails" }),
            new("signalReception", "Signal Reception Details", new() { "tvroDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000002"),
            new[] { "RADIO OPERATOR CERTIFICATES", "ROC", "Commercial Radio Operator" },
            "Radio Operator Certificates (ROC) excluding Amateur ROC\n\nA Radio Operator Certificate is a written authority issued by the Commission authorizing the holder thereof to operate a particular class of radio station under a specific radio service.\n\nThe RENEWAL of a Radio Operator Certificate is required for the continuous operation of a particular class of radio station under a specific radio service.\n\nThe MODIFICATION of a Radio Operator Certificate is required for changes in the particulars indicated in the Certificate.",
            "WHO MAY AVAIL:\n\n1. Individuals who have passed the Commercial Radio Operator's Examination conducted by NTC\n2. Commercial pilots and student pilots\n3. Government radio operators who have completed the Government Radio Operator's Seminar conducted by NTC\n4. Individuals working in the maritime service who have completed the Special Radio Operator's Seminar conducted by NTC\n5. Individuals who have completed the Restricted Land Mobile Radiotelephone Operator's Seminar conducted by NTC\n6. Licensed pilots of foreign countries"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000003"),
            new[] { "CERTIFICATES IN THE AMATEUR SERVICE", "Amateur Certificate", "Amateur Service" },
            "Certificates in the Amateur Service\n\nThe Amateur Radio Operator Certificate is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Operator Certificate is required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Operator Certificate is required for changes in the particulars indicated in the Certificate.",
            "WHO MAY AVAIL:\n\n1. Individuals who have passed the Amateur Radio Operator Examination conducted by NTC\n2. Duly accredited amateur radio clubs\n3. Foreign amateurs qualified under the reciprocity agreement\n4. Licensed amateur radio operators"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000004"),
            new[] { "RFID", "Short Range Devices", "WDN", "Registration for RFID" },
            "Certificate of Registration for RFID, SRD, WDN Devices - Indoor\n\nA Certificate of Registration is a written authority issued by the Commission to an individual, accredited radio dealer/manufacturer, private and government entities for the registration of Radio Frequency Identification (RFID) Devices, Short Range Devices (SRD), or Wireless Data Network (WDN) Devices – Indoor.",
            "WHO MAY AVAIL:\n\n1. Individuals, Accredited Radio Dealers/Manufacturers, and Private and Government Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000005"),
            new[] { "TVRO REGISTRATION", "TVRO Certificate", "TVRO" },
            "TVRO Registration Certificate\n\nA TVRO Registration Certificate is a certificate or a written authority issued by the Commission to a person, firm, company, association, or corporation authorizing the holder thereof to possess television receive-only equipment.",
            "WHO MAY AVAIL:\n\n1. Cable TV Operators and Private and Government Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000006"),
            new[] { "VALUE-ADDED SERVICE", "VAS Provider", "VAS" },
            "Certificate of Registration as a Value-Added Service (VAS) Provider\n\nThe Certificate of Registration as a VAS Provider is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to offer value added services.\n\nThe RENEWAL of a Certificate of Registration is required for the continuous operation as a VAS Provider.",
            "WHO MAY AVAIL:\n\n1. Private Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000007"),
            new[] { "COPY OF CERTIFICATES", "Duplicate Certificate", "Certificates" },
            "Copy of Certificates\n\nA Certified True Copy of a Certificate is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a Certificate is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
            "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
        )
    };
}
