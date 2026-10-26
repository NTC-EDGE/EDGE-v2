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

    // Variant GUIDs for NTC 1-02 (Commercial & Specialty ROCs)
    public static readonly Guid VarRocCommNew       = Guid.Parse("60000000-0000-0000-0000-000000000002");
    public static readonly Guid VarRocCommRen       = Guid.Parse("60000000-0000-0000-0000-000000000003");
    public static readonly Guid VarRocCommMod       = Guid.Parse("60000000-0000-0000-0000-000000000011");
    public static readonly Guid VarRocAirNew        = Guid.Parse("60000000-0000-0000-0000-000000000021");
    public static readonly Guid VarRocAirRen        = Guid.Parse("60000000-0000-0000-0000-000000000022");
    public static readonly Guid VarRocAirMod        = Guid.Parse("60000000-0000-0000-0000-000000000023");
    public static readonly Guid VarRocPilotNew      = Guid.Parse("60000000-0000-0000-0000-000000000024");
    public static readonly Guid VarRocPilotMod      = Guid.Parse("60000000-0000-0000-0000-000000000025");
    public static readonly Guid VarRocGovNew        = Guid.Parse("60000000-0000-0000-0000-000000000026");
    public static readonly Guid VarRocGovRen        = Guid.Parse("60000000-0000-0000-0000-000000000027");
    public static readonly Guid VarRocGovMod        = Guid.Parse("60000000-0000-0000-0000-000000000028");
    public static readonly Guid VarRocLandNew       = Guid.Parse("60000000-0000-0000-0000-000000000029");
    public static readonly Guid VarRocLandRen       = Guid.Parse("60000000-0000-0000-0000-000000000030");
    public static readonly Guid VarRocLandMod       = Guid.Parse("60000000-0000-0000-0000-000000000031");
    public static readonly Guid VarRocSpecNew       = Guid.Parse("60000000-0000-0000-0000-000000000032");
    public static readonly Guid VarRocSpecRen       = Guid.Parse("60000000-0000-0000-0000-000000000033");
    public static readonly Guid VarRocSpecMod       = Guid.Parse("60000000-0000-0000-0000-000000000034");

    // Variant GUIDs for NTC 1-03 (Amateur Certificates)
    public static readonly Guid VarAmaRocNew        = Guid.Parse("60000000-0000-0000-0000-000000000004");
    public static readonly Guid VarAmaRocRen        = Guid.Parse("60000000-0000-0000-0000-000000000008");
    public static readonly Guid VarAmaRocMod        = Guid.Parse("60000000-0000-0000-0000-000000000009");
    public static readonly Guid VarAmaLifetimeMod   = Guid.Parse("60000000-0000-0000-0000-000000000035");

    // Variant GUIDs for NTC 1-19 (RFID, SRD, WDN)
    public static readonly Guid VarRfidDealers      = Guid.Parse("60000000-0000-0000-0000-000000000016");
    public static readonly Guid VarRfidNonDealers   = Guid.Parse("60000000-0000-0000-0000-000000000036");

    // Variant GUIDs for NTC 1-22 (TVRO Registration)
    public static readonly Guid VarTvroComm         = Guid.Parse("60000000-0000-0000-0000-000000000020");
    public static readonly Guid VarTvroNonComm      = Guid.Parse("60000000-0000-0000-0000-000000000037");

    // Variant GUIDs for NTC 1-20 (VAS Provider)
    public static readonly Guid VarVasNew           = Guid.Parse("60000000-0000-0000-0000-000000000038");
    public static readonly Guid VarVasRenewal       = Guid.Parse("60000000-0000-0000-0000-000000000018");
    public static readonly Guid VarVasMod           = Guid.Parse("60000000-0000-0000-0000-000000000039");

    // Variant GUIDs for NTC 1-21 (Copy of Certificates)
    public static readonly Guid VarCertTrueCopy     = Guid.Parse("60000000-0000-0000-0000-000000000051");
    public static readonly Guid VarCertDuplicate    = Guid.Parse("60000000-0000-0000-0000-000000000050");

    public static readonly string Ntc102Contract = @"
    {
        ""formNo"": ""NTC 1-02"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Certificates"",
        ""group"": ""Radio Operator Certificates (ROC) excluding Amateur ROC"",
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [
            { ""code"": ""1RTG"", ""condition"": ""Standard"", ""description"": ""First Class Radiotelegraph Operator"" },
            { ""code"": ""2RTG"", ""condition"": ""Standard"", ""description"": ""Second Class Radiotelegraph Operator"" },
            { ""code"": ""3RTG"", ""condition"": ""Standard"", ""description"": ""Third Class Radiotelegraph Operator"" },
            { ""code"": ""1PHN"", ""condition"": ""Standard"", ""description"": ""First Class Radiotelephone Operator"" },
            { ""code"": ""2PHN"", ""condition"": ""Standard"", ""description"": ""Second Class Radiotelephone Operator"" },
            { ""code"": ""3PHN"", ""condition"": ""Standard"", ""description"": ""Third Class Radiotelephone Operator"" }
        ],
        ""requiredSections"": [
            { ""key"": ""examSeminarDetails"", ""required"": false }
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
        ""group"": ""Certificates in the Amateur Service"",
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""certificateParticulars"", ""required"": false },
            { ""key"": ""examSeminarDetails"", ""required"": false }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""permitType"": [""Amateur Radio Operator Certificate"",""Lifetime Amateur Radio Station Supplementary Certificate""]
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
        ""applicationTypes"": [""For Dealers"", ""For Non-Dealers""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""invoiceDetails"", ""required"": false },
            { ""key"": ""devices"", ""required"": true }
        ],
        ""allowsBulkSubmission"": true,
        ""categorySpecific"": {
            ""deviceType"": [
                ""Wireless Data Network (WDN) - Indoor"",
                ""Short Range Devices (SRD)"",
                ""Radio Frequency Identification (RFID) Devices"",
                ""Short Range Radio Services (SRRS) Devices"",
                ""Public Trunked Radio Equipment (Mobile/Portable)""
            ]
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
        ""applicationTypes"": [""Renewal""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""vasParticulars"", ""required"": true },
            { ""key"": ""valueAddedServices"", ""required"": true },
            { ""key"": ""knownByAnotherName"", ""required"": false }
        ],
        ""allowsBulkSubmission"": true,
        ""categorySpecific"": {
            ""serviceClassification"": [""VALUE-ADDED SERVICE (VAS) PROVIDER"", ""PUBLIC CALLING STATION/OFFICE/TELECENTER SERVICE PROVIDER (PCSOTSP)"", ""RESELLER"", ""VOICE OVER INTERNET PROTOCOL (VOIP) PROVIDER"", ""Others""],
            ""entityType"": [""Corporation"", ""Single Proprietorship"", ""Partnership"", ""Others""],
            ""natureOfServices"": [""Messaging Service"", ""Audio Conferencing"", ""Audio and Video Conferencing"", ""Voice mail service"", ""Electronic mail service"", ""Information service"", ""Content and Program service"", ""Audiotext service"", ""Facsimile service"", ""Hosting service"", ""Electronic Gaming Services, except gambling"", ""Others""]
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
            { ""key"": ""copyParticulars"", ""required"": true }
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
        ""applicationTypes"": [""NEW"", ""RENEWAL"", ""Modification, use Form B"", ""Commercial"", ""Non-Commercial""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""location"", ""required"": true },
            { ""key"": ""tvroEquipment"", ""required"": true },
            { ""key"": ""antennaSystem"", ""required"": false },
            { ""key"": ""signalReception"", ""required"": false }
        ],
        ""allowsBulkSubmission"": true,
        ""categorySpecific"": {
            ""typeOfApplication"": [""NEW"", ""RENEWAL"", ""Modification, use Form B""],
            ""typeOfLicenseCertificate"": [""TVRO REGISTRATION CERTIFICATE"", ""TVRO STATION LICENSE"", ""CATV STATION LICENSE""],
            ""classificationOfApplicant"": [""COMMERCIAL"", ""BROADCASTING"", ""NON-COMMERCIAL"", ""CATV"", ""OTHERS, specify""]
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
        new("NTC_1_22", Svc122Id, categoryId, "TVRO REGISTRATION CERTIFICATE", null, "NTC_1_22", "TVRO REGISTRATION CERTIFICATE (NTC 1-22)", Ntc122Contract),
        new("NTC_1_20", Svc120Id, categoryId, "CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER", null, "NTC_1_20", "CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER (NTC 1-20)", Ntc120Contract),
        new("NTC_1_21", Svc121Id, categoryId, "COPY OF CERTIFICATES", null, "NTC_1_21", "COPY OF CERTIFICATES (NTC 1-21)", Ntc121Contract)
    };

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        // RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC (NTC 1-02)
        new(VarRocCommNew, Svc102Id, ServiceVariantType.New, "Commercial Radio Operator Certificate"),
        new(VarRocCommRen, Svc102Id, ServiceVariantType.Renewal, "Commercial Radio Operator Certificate"),
        new(VarRocCommMod, Svc102Id, ServiceVariantType.Modification, "Commercial Radio Operator Certificate"),

        new(VarRocAirNew, Svc102Id, ServiceVariantType.New, "Restricted Radiotelephone Operator's Certificate - Aircraft"),
        new(VarRocAirRen, Svc102Id, ServiceVariantType.Renewal, "Restricted Radiotelephone Operator's Certificate - Aircraft"),
        new(VarRocAirMod, Svc102Id, ServiceVariantType.Modification, "Restricted Radiotelephone Operator's Certificate - Aircraft"),

        new(VarRocPilotNew, Svc102Id, ServiceVariantType.New, "Temporary Radio Operator Certificate for Foreign Pilot"),
        new(VarRocPilotMod, Svc102Id, ServiceVariantType.Modification, "Temporary Radio Operator Certificate for Foreign Pilot"),

        new(VarRocGovNew, Svc102Id, ServiceVariantType.New, "Government Radio Operator Certificate"),
        new(VarRocGovRen, Svc102Id, ServiceVariantType.Renewal, "Government Radio Operator Certificate"),
        new(VarRocGovMod, Svc102Id, ServiceVariantType.Modification, "Government Radio Operator Certificate"),

        new(VarRocLandNew, Svc102Id, ServiceVariantType.New, "Restricted Radiotelephone Operator's Certificate for Land Mobile Station"),
        new(VarRocLandRen, Svc102Id, ServiceVariantType.Renewal, "Restricted Radiotelephone Operator's Certificate for Land Mobile Station"),
        new(VarRocLandMod, Svc102Id, ServiceVariantType.Modification, "Restricted Radiotelephone Operator's Certificate for Land Mobile Station"),

        new(VarRocSpecNew, Svc102Id, ServiceVariantType.New, "Special Radio Operator Certificate"),
        new(VarRocSpecRen, Svc102Id, ServiceVariantType.Renewal, "Special Radio Operator Certificate"),
        new(VarRocSpecMod, Svc102Id, ServiceVariantType.Modification, "Special Radio Operator Certificate"),

        // CERTIFICATES IN THE AMATEUR SERVICE (NTC 1-03)
        new(VarAmaRocNew, Svc103Id, ServiceVariantType.New, "Amateur Radio Operator Certificate"),
        new(VarAmaRocRen, Svc103Id, ServiceVariantType.Renewal, "Amateur Radio Operator Certificate"),
        new(VarAmaRocMod, Svc103Id, ServiceVariantType.Modification, "Amateur Radio Operator Certificate"),
        new(VarAmaLifetimeMod, Svc103Id, ServiceVariantType.Modification, "Lifetime Amateur Radio Station Supplementary Certificate"),

        // CERTIFICATE OF REGISTRATION FOR RFID, SRD, WDN, DEVICES- INDOOR (NTC 1-19)
        new(VarRfidDealers, Svc119Id, ServiceVariantType.NA, "For Dealers", false),
        new(VarRfidNonDealers, Svc119Id, ServiceVariantType.NA, "For Non-Dealers", false),

        // TVRO REGISTRATION CERTIFICATE (NTC 1-22)
        new(VarTvroComm, Svc122Id, ServiceVariantType.NA, "TVRO Registration Certificate (Commercial)", false),
        new(VarTvroNonComm, Svc122Id, ServiceVariantType.NA, "TVRO Registration Certificate (Non-Commercial)", false),

        // CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER (NTC 1-20)
        new(VarVasRenewal, Svc120Id, ServiceVariantType.Renewal, "Certificate of Registration as a Value-Added Service (VAS) Provider (RENEWAL)", false),

        // COPY OF CERTIFICATES (NTC 1-21)
        new(VarCertTrueCopy, Svc121Id, ServiceVariantType.NA, "Certified True Copy"),
        new(VarCertDuplicate, Svc121Id, ServiceVariantType.NA, "Duplicate Copy")
    };

    public static List<VariantElementDef> GetBackfillElements() => new()
    {
        new(VarRocCommNew, "1RTG", "First Class Radiotelegraph Operator"),
        new(VarRocCommNew, "2RTG", "Second Class Radiotelegraph Operator"),
        new(VarRocCommNew, "3RTG", "Third Class Radiotelegraph Operator"),
        new(VarRocCommNew, "1PHN", "First Class Radiotelephone Operator"),
        new(VarRocCommNew, "2PHN", "Second Class Radiotelephone Operator"),
        new(VarRocCommNew, "3PHN", "Third Class Radiotelephone Operator"),

        new(VarRocCommRen, "1RTG", "First Class Radiotelegraph Operator"),
        new(VarRocCommRen, "2RTG", "Second Class Radiotelegraph Operator"),
        new(VarRocCommRen, "3RTG", "Third Class Radiotelegraph Operator"),
        new(VarRocCommRen, "1PHN", "First Class Radiotelephone Operator"),
        new(VarRocCommRen, "2PHN", "Second Class Radiotelephone Operator"),
        new(VarRocCommRen, "3PHN", "Third Class Radiotelephone Operator"),

        new(VarRocCommMod, "1RTG", "First Class Radiotelegraph Operator"),
        new(VarRocCommMod, "2RTG", "Second Class Radiotelegraph Operator"),
        new(VarRocCommMod, "3RTG", "Third Class Radiotelegraph Operator"),
        new(VarRocCommMod, "1PHN", "First Class Radiotelephone Operator"),
        new(VarRocCommMod, "2PHN", "Second Class Radiotelephone Operator"),
        new(VarRocCommMod, "3PHN", "Third Class Radiotelephone Operator")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["ORIGINAL_REPORT_OF_RATING"] = new(Guid.Parse("70000000-0000-0000-0000-000000000010"), "Original valid Report of Rating*\nNote 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available.", "Original valid Report of Rating*\nNote 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available."),
        ["ID_PICTURE_1X1"] = new(Guid.Parse("70000000-0000-0000-0000-000000000003"), "Please provide a clear 1x1 ID picture taken within the last six (6) months.*", "Please provide a clear 1x1 ID picture taken within the last six (6) months.*"),
        ["VALID_REPORT_OF_RATING"] = new(Guid.Parse("70000000-0000-0000-0000-000000000004"), "Valid Report of Rating*", "Valid Report of Rating*"),
        ["ROC_CERTIFICATE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000005"), "Radio Operator Certificate*", "Radio Operator Certificate*"),
        ["UPGRADE_ROC_CERTIFICATE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000032"), "For upgrade to higher class, Radio Operator Certificate", "For upgrade to higher class, Radio Operator Certificate"),
        ["PROOF_OF_SERVICE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000006"), "Proof of Service", "Proof of continuous radio service or employment certification."),
        ["AMATEUR_ROC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000007"), "Amateur Radio Operator Certificate*", "Amateur Radio Operator Certificate*"),
        ["AMATEUR_STATION_LIC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000008"), "Amateur Radio Station License*", "Amateur Radio Station License*"),
        ["RADIO_LOGBOOK"] = new(Guid.Parse("70000000-0000-0000-0000-000000000009"), "Radio Station Logbook", "Radio Station Logbook certified by club or licensee."),
        ["FOREIGN_PILOT_LIC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000011"), "Pilot license issued from country of origin*\nNote 1: The applicant has to show the original.", "Pilot license issued from country of origin*\nNote 1: The applicant has to show the original."),
        ["GOOD_MORAL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000012"), "Certificate of Good Moral Character*", "Certificate of Good Moral Character*"),
        ["GOV_SERVICE_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000013"), "Certification that the applicant is in the government service as a radio operator for at least six (6) months and duly certified by the Head of Office*", "Certification that the applicant is in the government service as a radio operator for at least six (6) months and duly certified by the Head of Office*"),
        ["SERVICE_RECORD"] = new(Guid.Parse("70000000-0000-0000-0000-000000000031"), "Service Record*", "Service Record*"),
        ["SEMINAR_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000014"), "Certificate of Completion of Seminar", "Certificate of Completion of Seminar"),
        ["EMPLOYMENT_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000015"), "Certificate of Employment*", "Certificate of Employment*"),
        ["AMATEUR_ACTIVITIES_PROOF"] = new(Guid.Parse("70000000-0000-0000-0000-000000000016"), "Proof of Amateur Activities*", "Proof of Amateur Activities*"),
        ["LIFETIME_SUPP_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000017"), "Supplementary Certificate*", "Supplementary Certificate*"),
        ["DEALER_MANUFACTURER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000018"), "Dealer Permit OR Manufacturer Permit*", "Dealer Permit OR Manufacturer Permit*"),
        ["IMPORT_PERMIT_INVOICE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000019"), "For imported equipment:\n(a) Permit to Import\n(b) Invoice\n(c) Bureau of Customs (BOC) Release Clearance and Import Entry Declaration", "For imported equipment:\n(a) Permit to Import\n(b) Invoice\n(c) Bureau of Customs (BOC) Release Clearance and Import Entry Declaration"),
        ["SALES_STOCKS_REPORT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000020"), "For locally-manufactured equipment:\nSales and Stocks Report", "For locally-manufactured equipment:\nSales and Stocks Report"),
        ["COMMERCIAL_INVOICE_NONDEALER"] = new(Guid.Parse("70000000-0000-0000-0000-000000000030"), "Commercial Invoice / Sales Invoice", "Official Commercial Invoice or Sales Invoice bearing the purchase details and equipment serial numbers for Non-Dealer registration."),
        ["PROVISIONAL_AUTHORITY_PA"] = new(Guid.Parse("70000000-0000-0000-0000-000000000021"), "Provisional Authority (PA) OR duly received Motion for Renewal of PA*", "Provisional Authority (PA) OR duly received Motion for Renewal of PA*"),
        ["HEAD_END_EQUIPMENT_LIST"] = new(Guid.Parse("70000000-0000-0000-0000-000000000022"), "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment*\nPrepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)", "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment*\nPrepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)"),
        ["NETWORK_LEASE_AGREEMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000023"), "Facilities/network lease agreement with duly authorized facilities/network providers*", "Facilities/network lease agreement with duly authorized facilities/network providers*"),
        ["QUARTERLY_REPORT_VAS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000024"), "Quarterly Report(s) of VAS Provider*", "Quarterly Report(s) of VAS Provider*"),
        ["DOC_AUTHENTICATION_COPY"] = new(Guid.Parse("70000000-0000-0000-0000-000000000025"), "Copy of document to be authenticated*", "Copy of document to be authenticated*"),
        ["AFFIDAVIT_LOSS_MUTILATION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000026"), "Copy of Certificate:\nA scanned or photocopied copy of the original Radio Operator Certificate.", "Copy of Certificate:\nA scanned or photocopied copy of the original Radio Operator Certificate."),
        ["ID_PICTURE_FOR_ROC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000033"), "For Radio Operator Certificate:\nPlease provide a clear 1x1 ID picture taken within the last six (6) months.", "For Radio Operator Certificate:\nPlease provide a clear 1x1 ID picture taken within the last six (6) months."),
        ["SUPPORTING_DOCS_MOD"] = new(Guid.Parse("70000000-0000-0000-0000-000000000027"), "For correction of name, ANY of the following:\n• Valid government ID\n• Birth Certificate\n• Marriage Certificate", "For correction of name, ANY of the following:\n• Valid government ID\n• Birth Certificate\n• Marriage Certificate"),
        ["REPORT_OF_RATING_UPGRADE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000028"), "For Upgrade to higher class, valid Report of Rating", "For Upgrade to higher class, valid Report of Rating"),
        ["COR_CERTIFICATE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000029"), "Certificate of Registration*", "Certificate of Registration*")
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // 1. Commercial Radio Operator Certificate - NEW
        new(VarRocCommNew, Guid.Parse("70000000-0000-0000-0000-000000000010"), true), // Original valid Report of Rating*
        new(VarRocCommNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // Please provide a clear 1x1 ID picture taken within the last six (6) months.*
        new(VarRocCommNew, Guid.Parse("70000000-0000-0000-0000-000000000032"), false),// For upgrade to higher class, Radio Operator Certificate

        // 2. Commercial Radio Operator Certificate - RENEWAL
        new(VarRocCommRen, Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // Radio Operator Certificate*
        new(VarRocCommRen, Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 3. Commercial Radio Operator Certificate - MODIFICATION
        new(VarRocCommMod, Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // Radio Operator Certificate*
        new(VarRocCommMod, Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // Please provide a clear 1x1 ID picture taken within the last six (6) months.*
        new(VarRocCommMod, Guid.Parse("70000000-0000-0000-0000-000000000027"), false),// For correction of name, ANY of the following:...

        // 4. Restricted Radiotelephone Operator's Certificate - Aircraft - NEW
        new(VarRocAirNew, Guid.Parse("70000000-0000-0000-0000-000000000010"), true),  // Original valid Report of Rating*
        new(VarRocAirNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 5. Restricted Radiotelephone Operator's Certificate - Aircraft - RENEWAL
        new(VarRocAirRen, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),  // Radio Operator Certificate*
        new(VarRocAirRen, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 6. Restricted Radiotelephone Operator's Certificate - Aircraft - MODIFICATION
        new(VarRocAirMod, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),  // Radio Operator Certificate*
        new(VarRocAirMod, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*
        new(VarRocAirMod, Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // For correction of name, ANY of the following:...

        // 7. Temporary Radio Operator Certificate for Foreign Pilot - NEW
        new(VarRocPilotNew, Guid.Parse("70000000-0000-0000-0000-000000000011"), true), // Pilot license issued from country of origin*
        new(VarRocPilotNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 8. Temporary Radio Operator Certificate for Foreign Pilot - MODIFICATION
        new(VarRocPilotMod, Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // Radio Operator Certificate*
        new(VarRocPilotMod, Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // Please provide a clear 1x1 ID picture taken within the last six (6) months.*
        new(VarRocPilotMod, Guid.Parse("70000000-0000-0000-0000-000000000027"), false),// For correction of name, ANY of the following:...

        // 9. Government Radio Operator Certificate - NEW
        new(VarRocGovNew, Guid.Parse("70000000-0000-0000-0000-000000000012"), true),  // Certificate of Good Moral Character*
        new(VarRocGovNew, Guid.Parse("70000000-0000-0000-0000-000000000013"), true),  // Certification that the applicant is in the government service as a radio operator for at least six (6) months and duly certified by the Head of Office*
        new(VarRocGovNew, Guid.Parse("70000000-0000-0000-0000-000000000014"), false), // Certificate of Completion of Seminar
        new(VarRocGovNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 10. Government Radio Operator Certificate - RENEWAL
        new(VarRocGovRen, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),  // Radio Operator Certificate*
        new(VarRocGovRen, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),  // Certificate of Employment*
        new(VarRocGovRen, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 11. Government Radio Operator Certificate - MODIFICATION
        new(VarRocGovMod, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),  // Radio Operator Certificate*
        new(VarRocGovMod, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*
        new(VarRocGovMod, Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // For correction of name, ANY of the following:...

        // 12. Restricted Radiotelephone Operator's Certificate for Land Mobile Station - NEW
        new(VarRocLandNew, Guid.Parse("70000000-0000-0000-0000-000000000014"), false),// Certificate of Completion of Seminar
        new(VarRocLandNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 13. Restricted Radiotelephone Operator's Certificate for Land Mobile Station - RENEWAL
        new(VarRocLandRen, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),  // Radio Operator Certificate*
        new(VarRocLandRen, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 14. Restricted Radiotelephone Operator's Certificate for Land Mobile Station - MODIFICATION
        new(VarRocLandMod, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),  // Radio Operator Certificate*
        new(VarRocLandMod, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*
        new(VarRocLandMod, Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // For correction of name, ANY of the following:...

        // 15. Special Radio Operator Certificate - NEW
        new(VarRocSpecNew, Guid.Parse("70000000-0000-0000-0000-000000000014"), false), // Certificate of Completion of Seminar
        new(VarRocSpecNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 16. Special Radio Operator Certificate - RENEWAL
        new(VarRocSpecRen, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),  // Radio Operator Certificate*
        new(VarRocSpecRen, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 17. Special Radio Operator Certificate - MODIFICATION
        new(VarRocSpecMod, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),  // Radio Operator Certificate*
        new(VarRocSpecMod, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),  // Please provide a clear 1x1 ID picture taken within the last six (6) months.*
        new(VarRocSpecMod, Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // For correction of name, ANY of the following:...

        // 18. Amateur Radio Operator Certificate - NEW
        new(VarAmaRocNew, Guid.Parse("70000000-0000-0000-0000-000000000004"), true),   // Valid Report of Rating*
        new(VarAmaRocNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),   // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 19. Amateur Radio Operator Certificate - RENEWAL
        new(VarAmaRocRen, Guid.Parse("70000000-0000-0000-0000-000000000007"), true),   // Amateur Radio Operator Certificate*
        new(VarAmaRocRen, Guid.Parse("70000000-0000-0000-0000-000000000016"), true),   // Proof of Amateur Activities*
        new(VarAmaRocRen, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),   // Please provide a clear 1x1 ID picture taken within the last six (6) months.*

        // 20. Amateur Radio Operator Certificate - MODIFICATION
        new(VarAmaRocMod, Guid.Parse("70000000-0000-0000-0000-000000000007"), true),   // Amateur Radio Operator Certificate*
        new(VarAmaRocMod, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),   // Please provide a clear 1x1 ID picture taken within the last six (6) months.*
        new(VarAmaRocMod, Guid.Parse("70000000-0000-0000-0000-000000000028"), false),  // For Upgrade to higher class, valid Report of Rating

        // 21. Lifetime Amateur Radio Station Supplementary Certificate - MODIFICATION
        new(VarAmaLifetimeMod, Guid.Parse("70000000-0000-0000-0000-000000000017"), true), // Supplementary Certificate*

        // 22. Certificate of Registration for RFID, SRD, WDN - For Dealers
        new(VarRfidDealers, Guid.Parse("70000000-0000-0000-0000-000000000018"), true),  // Dealer Permit OR Manufacturer Permit*
        new(VarRfidDealers, Guid.Parse("70000000-0000-0000-0000-000000000019"), false), // For imported equipment: (a) Permit to Import (b) Invoice (c) Bureau of Customs (BOC) Release Clearance and Import Entry Declaration
        new(VarRfidDealers, Guid.Parse("70000000-0000-0000-0000-000000000020"), false), // For locally-manufactured equipment: Sales and Stocks Report

        // 23. Certificate of Registration for RFID, SRD, WDN - For Non-Dealers
        new(VarRfidNonDealers, Guid.Parse("70000000-0000-0000-0000-000000000019"), false), // For imported equipment: (a) Permit to Import (b) Invoice (c) Bureau of Customs (BOC) Release Clearance and Import Entry Declaration
        new(VarRfidNonDealers, Guid.Parse("70000000-0000-0000-0000-000000000020"), false), // For locally-manufactured equipment: Sales and Stocks Report

        // 24. TVRO Registration Certificate (Commercial)
        new(VarTvroComm, Guid.Parse("70000000-0000-0000-0000-000000000021"), true),    // Provisional Authority (PA) OR duly received Motion for Renewal of PA*
        new(VarTvroComm, Guid.Parse("70000000-0000-0000-0000-000000000022"), true),    // List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment*

        // 25. TVRO Registration Certificate (Non-Commercial)
        new(VarTvroNonComm, Guid.Parse("70000000-0000-0000-0000-000000000022"), true), // List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment*

        // 26. Certificate of Registration as a VAS Provider - RENEWAL
        new(VarVasRenewal, Guid.Parse("70000000-0000-0000-0000-000000000029"), true),  // Certificate of Registration*
        new(VarVasRenewal, Guid.Parse("70000000-0000-0000-0000-000000000023"), true),  // Facilities/network lease agreement with duly authorized facilities/network providers*
        new(VarVasRenewal, Guid.Parse("70000000-0000-0000-0000-000000000024"), true),  // Quarterly Report(s) of VAS Provider*

        // 27. Copy of Certificates - Certified True Copy
        new(VarCertTrueCopy, Guid.Parse("70000000-0000-0000-0000-000000000025"), true),// Copy of document to be authenticated*

        // 28. Copy of Certificates - Duplicate Copy
        new(VarCertDuplicate, Guid.Parse("70000000-0000-0000-0000-000000000026"), true),// Copy of Certificate: A scanned or photocopied copy of the original Radio Operator Certificate.
        new(VarCertDuplicate, Guid.Parse("70000000-0000-0000-0000-000000000033"), false),// For Radio Operator Certificate: Please provide a clear 1x1 ID picture taken within the last six (6) months.
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_02", Guid.Parse("f0200000-0000-0000-0000-000000000001"), Guid.Parse("f02a0000-0000-0000-0000-000000000000"), new()
        {
            new("examSeminarDetails", "Exam / Seminar Details", new() { "examSeminarAddress", "examSeminarDate", "examSeminarRating" })
        }),
        new("NTC_1_03", Guid.Parse("f0300000-0000-0000-0000-000000000001"), Guid.Parse("f03a0000-0000-0000-0000-000000000000"), new()
        {
            new("certificateParticulars", "Certificate Particulars", new() { "licenseNo", "dateOfExpiry", "modificationDueTo" }),
            new("examSeminarDetails", "Exam / Seminar Details", new() { "examSeminarAddress", "examSeminarDate", "examSeminarRating" })
        }),
        new("NTC_1_19", Guid.Parse("f1900000-0000-0000-0000-000000000001"), Guid.Parse("f19a0000-0000-0000-0000-000000000000"), new()
        {
            new("invoiceDetails", "Commercial Invoice Information", new() { "invoiceNumber" }),
            new("devices", "Registered Devices", new() { "devicesDetails" })
        }),
        new("NTC_1_20", Guid.Parse("f2000000-0000-0000-0000-000000000001"), Guid.Parse("f20a0000-0000-0000-0000-000000000000"), new()
        {
            new("vasParticulars", "VAS Registration Particulars", new() { "entityType", "cpcnPaCaNo", "cpcnDateOfExpiry", "corVasNo", "corVasExpiryDate" }),
            new("valueAddedServices", "Value Added Service", new() { "valueAddedServices" }),
            new("knownByAnotherName", "Known by other Name", new() { "knownByAnotherName", "otherTradeName" })
        }),
        new("NTC_1_22", Guid.Parse("f2200000-0000-0000-0000-000000000001"), Guid.Parse("f22a0000-0000-0000-0000-000000000000"), new()
        {
            new("location", "Location", new() { "serviceArea", "exactLocation", "longitude", "latitude" }),
            new("tvroEquipment", "Particulars of Equipment", new() { "tvroEquipment" }),
            new("antennaSystem", "Particulars of Antenna System", new() { "tvroAntenna" }),
            new("signalReception", "Particulars of Signal to be Received", new() { "tvroSignal" })
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
