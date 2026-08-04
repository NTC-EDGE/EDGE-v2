using System;
using System.Collections.Generic;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence;

public static class FastTrackSeederData
{
    public static readonly string Ntc101Contract = @"
    {
        ""formNo"": ""NTC 1-01"",
        ""revisionNo"": ""03"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Exams"",
        ""group"": null,
        ""applicationTypes"": [""New""],
        ""examineeTypes"": [""FirstTaker"", ""Retaker""],
        ""elements"": [
            { ""code"": ""1RTG"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 5, 6 & Code (25/20 wpm)"" },
            { ""code"": ""1RTG"", ""condition"": ""For removal"", ""description"": ""Code (25/20 wpm)"" },
            { ""code"": ""1RTG"", ""condition"": ""For upgrade (2RTG Holder)"", ""description"": ""& Code (25/20 wpm)"" },
            { ""code"": ""2RTG"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 5, 6 & Code (16 wpm)"" },
            { ""code"": ""2RTG"", ""condition"": ""For removal"", ""description"": ""Code (16 wpm)"" },
            { ""code"": ""3RTG"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 5 & Code (16 wpm)"" },
            { ""code"": ""3RTG"", ""condition"": ""For removal"", ""description"": ""Code (16 wpm)"" },
            { ""code"": ""1PHN"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 3 & 4"" },
            { ""code"": ""1PHN"", ""condition"": ""For upgrade (2PHN Holder)"", ""description"": ""Element 4"" },
            { ""code"": ""1PHN"", ""condition"": ""For upgrade (3PHN Holder)"", ""description"": ""Element 3 & 4"" },
            { ""code"": ""2PHN"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2 & 3"" },
            { ""code"": ""3PHN"", ""condition"": ""Standard"", ""description"": ""Elements 1 & 2"" },
            { ""code"": ""Class A"", ""condition"": ""Standard"", ""description"": ""Elements 8, 9, 10 & Code (5 wpm)"" },
            { ""code"": ""Class A"", ""condition"": ""For removal"", ""description"": ""Code (5 wpm)"" },
            { ""code"": ""Class B"", ""condition"": ""Standard"", ""description"": ""Elements 5, 6 & 7"" },
            { ""code"": ""Class B"", ""condition"": ""For Registered ECE/1PHN/1RTG/2RTG Holder"", ""description"": ""Element 2"" },
            { ""code"": ""Class C"", ""condition"": ""Standard"", ""description"": ""Elements 2, 3 & 4"" },
            { ""code"": ""Class C"", ""condition"": ""For Class D Holder"", ""description"": ""Elements 3 & 4"" },
            { ""code"": ""Class D"", ""condition"": ""Standard"", ""description"": ""Element 2"" },
            { ""code"": ""RROC-Aircraft"", ""condition"": ""Standard"", ""description"": ""Element 1"" }
        ],
        ""requiredSections"": [
            { ""key"": ""applicantPerson"", ""required"": true },
            { ""key"": ""examSelection"", ""required"": true },
            { ""key"": ""assistanceRequest"", ""required"": false },
            { ""key"": ""admissionSlip"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true }
        ],
        ""allowsBulkSubmission"": true,
        ""categorySpecific"": {
            ""examCategories"": [""Radiotelegraphy"", ""Radiotelephony"", ""Amateur"", ""Restricted Radio Operator Certificate - Aircraft""]
        },
        ""requirementDiscriminatorFields"": [""Exam Category"", ""Examinee Type""],
        ""entityType"": ""Application""
    }";

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
        ""requirementDiscriminatorFields"": [""Type of Certificate""],
        ""requirementContextGroups"": {
            ""1RTG"": ""CommercialROC"",
            ""2RTG"": ""CommercialROC"",
            ""3RTG"": ""CommercialROC"",
            ""1PHN"": ""CommercialROC"",
            ""2PHN"": ""CommercialROC"",
            ""3PHN"": ""CommercialROC"",
            ""SROP"": ""SROP"",
            ""RROC-Land Mobile"": ""RROC-Land Mobile"",
            ""RROC-Aircraft"": ""RROC-Aircraft"",
            ""GROC"": ""GROC"",
            ""TP RROC-Aircraft"": ""TP RROC-Aircraft"",
            ""Other"": null
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc103Contract = @"
    {
        ""formNo"": ""NTC 1-03"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Licenses"",
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
            ""permitType"": [""Amateur Radio Operator Certificate"",""Amateur Radio Station License"",""Club Radio Station License"",""Temporary Permit for Foreign Visitor"",""Special Permit for Vanity/Special Call Sign""],
            ""classOfStation"": [""A"",""B"",""C"",""D""]
        },
        ""requirementDiscriminatorFields"": [""Permit Type""],
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc104Contract = @"
    {
        ""formNo"": ""NTC 1-04"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Licenses"",
        ""group"": ""Ship/Ship-Earth Station"",
        ""applicationTypes"": [""New"", ""Renewal""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""vessel"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""radioOfficers"", ""required"": false },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""typeOfPermit"": [""Ship Station License"",""Ship-Earth Station License"",""Cargo Ship Safety Radio Certificate"",""Temporary Permit"",""Ferrying Permit""],
            ""tradingRoute"": [""Domestic"",""International""],
            ""vehicleType"": [""Ship"",""Aircraft"",""Other""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc105Contract = @"
    {
        ""formNo"": ""NTC 1-05"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2025-03-31"",
        ""serviceCategory"": null,
        ""group"": null,
        ""applicationTypes"": [],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""equipment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""note"": ""Continuation sheet only — extends equipment[] on parent application (1-04, 1-09, 1-11, 1-18).""
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc109Contract = @"
    {
        ""formNo"": ""NTC 1-09"",
        ""revisionNo"": ""03"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Permits"",
        ""group"": ""Permits in the Amateur Service"",
        ""applicationTypes"": [""Purchase"", ""Possess"", ""Sell/Transfer""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""proposedStation"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""sourceOfEquipment"", ""required"": true },
            { ""key"": ""intendedUse"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""typeOfRadioService"": [""Fixed and Land Mobile"",""Aeronautical"",""Maritime"",""Broadcast"",""Amateur"",""Other""],
            ""natureOfService"": [""CV Private"",""CO Government"",""CP Public Correspondence""],
            ""classOfStation"": [""RT"",""FX"",""FB"",""ML"",""P"",""BC"",""FC"",""FA"",""MA"",""TC"",""Other""],
            ""intendedUse"": [""New Radio Station"",""Additional Radio Station"",""Change of Equipment"",""Additional Equipment"",""Storage"",""Other""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc110Contract = @"
    {
        ""formNo"": ""NTC 1-10"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2021-03-31"",
        ""serviceCategory"": null,
        ""group"": null,
        ""applicationTypes"": [],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""stations"", ""required"": true },
            { ""key"": ""antennas"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""note"": ""Continuation sheet only — extends stations[]/antennas[] on parent application (1-11, 1-14, 1-22).""
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc111Contract = @"
    {
        ""formNo"": ""NTC 1-11"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Permits"",
        ""group"": null,
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""stations"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""antennas"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""permitSubtype"": [""Construction Permit"",""Radio Station License""],
            ""typeOfRadioService"": [""Fixed and Land Mobile"",""Aeronautical"",""Maritime (Public/Private Coastal)"",""Broadcast"",""Other""],
            ""natureOfService"": [""CV Private"",""CO Government"",""CP Public Correspondence""],
            ""classOfStation"": [""RT"",""FX"",""FB"",""ML"",""P"",""BC"",""FC"",""FA"",""MA"",""TC"",""Other""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc114Contract = @"
    {
        ""formNo"": ""NTC 1-14"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Permits"",
        ""group"": null,
        ""applicationTypes"": [""New""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""station"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""natureOfService"": [""CV Private"",""CO Government"",""CP Public Correspondence""],
            ""typeOfRadioService"": [""Fixed and Land Mobile"",""Aeronautical"",""Broadcast"",""Other""],
            ""classOfStation"": [""RT"",""FX"",""FB"",""ML"",""P"",""BC"",""FA"",""MA"",""TC"",""Other""]
        },
        ""entityType"": ""Application""
    }";

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
            ""category"": [""RCE"",""Mobile Phone"",""CPE Supplier Accreditation""],
            ""rceSubtype"": [""Dealer (Radio Transmitter/Transceiver)"",""Dealer (WDN Indoor/SRD/RFID)"",""Manufacturer"",""Service Center"", null],
            ""mobileSubtype"": [""Dealer MPDP"",""Retailer/Reseller MPRR"",""Service Center MPSCP"", null]
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
            ""equipmentDeviceType"": [""WDN Indoor"",""SRD"",""RFID"",""SRRS"",""Public Trunked Radio (Mobile/Portable)""]
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
            ""registrationCategory"": [""VAS Provider"",""PCSOTSP"",""VoIP Provider"",""VoIP Reseller""],
            ""valueAddedServices"": [""Messaging service"",""Audio conferencing"",""Audio and Video Conferencing"",""Voice mail service"",""Electronic mail service"",""Information service"",""Application service"",""Content and Program service"",""Audiotext service"",""Facsimile service"",""Virtual Private Network service"",""Hosting service"",""Electronic Gaming Services, except gambling"",""Other""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc121Contract = @"
    {
        ""formNo"": ""NTC 1-21"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2021-03-31"",
        ""serviceCategory"": ""Certificates"",
        ""group"": null,
        ""applicationTypes"": [],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""permitLicenseCertificateNo"", ""required"": true },
            { ""key"": ""circumstances"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {},
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc122Contract = @"
    {
        ""formNo"": ""NTC 1-22"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Licenses"",
        ""group"": null,
        ""applicationTypes"": [""New"", ""Renewal""],
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
            ""licenseSubtype"": [""TVRO Registration Certificate"",""TVRO Station License"",""CATV Station License""],
            ""classificationOfApplicant"": [""Commercial"",""Non-Commercial""],
            ""serviceType"": [""Broadcasting"",""CATV"",""Other""]
        },
        ""entityType"": ""Application""
    }";

    public static Dictionary<string, string> GetContractMap()
    {
        return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["NTC_1_01"] = Ntc101Contract,
            ["EXAM_RTG"] = Ntc101Contract,
            ["EXAM_RTP"] = Ntc101Contract,
            ["EXAM_AMA"] = Ntc101Contract,
            ["EXAM_RROC_AC"] = Ntc101Contract,
            ["NTC_1_02"] = Ntc102Contract,
            ["NTC_1_03"] = Ntc103Contract,
            ["NTC_1_04"] = Ntc104Contract,
            ["NTC_1_05"] = Ntc105Contract,
            ["NTC_1_09"] = Ntc109Contract,
            ["NTC_1_10"] = Ntc110Contract,
            ["NTC_1_11"] = Ntc111Contract,
            ["NTC_1_14"] = Ntc114Contract,
            ["NTC_1_18"] = Ntc118Contract,
            ["NTC_1_19"] = Ntc119Contract,
            ["NTC_1_20"] = Ntc120Contract,
            ["NTC_1_21"] = Ntc121Contract,
            ["NTC_1_22"] = Ntc122Contract
        };
    }

    public static List<(string Key, Guid Id, Guid CategoryId, string Name, string? Group, string Code, string Desc, string Contract)> GetServiceDefs(Dictionary<string, Guid> categoryIds)
    {
        return new List<(string Key, Guid Id, Guid CategoryId, string Name, string? Group, string Code, string Desc, string Contract)>
        {
            ("NTC_1_01", Guid.Parse("50000000-0000-0000-0000-000000000001"), categoryIds["Exams"], "Application for Radio Operator Examination", null, "NTC_1_01", "Application for Radio Operator Examination (NTC 1-01)", Ntc101Contract),
            ("NTC_1_02", Guid.Parse("50000000-0000-0000-0000-000000000002"), categoryIds["Certificates"], "Application for Radio Operator Certificate", "Radio Operator Certificates (ROC) excluding Amateur ROC", "NTC_1_02", "Application for Radio Operator Certificate (NTC 1-02)", Ntc102Contract),
            ("NTC_1_03", Guid.Parse("50000000-0000-0000-0000-000000000003"), categoryIds["Licenses"], "Application for Amateur Radio Operator Certificate / Station License", "License in the Amateur Service", "NTC_1_03", "Application for Amateur Radio License (NTC 1-03)", Ntc103Contract),
            ("NTC_1_04", Guid.Parse("50000000-0000-0000-0000-000000000004"), categoryIds["Licenses"], "Application for Ship/Ship-Earth Station License", "Ship/Ship-Earth Station", "NTC_1_04", "Application for Ship/Ship-Earth Station License (NTC 1-04)", Ntc104Contract),
            ("NTC_1_05", Guid.Parse("50000000-0000-0000-0000-000000000005"), categoryIds["Permits"], "Form A (Multiple Stations/Equipment)", null, "NTC_1_05", "Form A Continuation Sheet (NTC 1-05)", Ntc105Contract),
            ("NTC_1_09", Guid.Parse("50000000-0000-0000-0000-000000000009"), categoryIds["Permits"], "Application for Permit to Purchase/Possess/Sell/Transfer", "Permits in the Amateur Service", "NTC_1_09", "Application for Permit to Purchase/Possess/Sell/Transfer (NTC 1-09)", Ntc109Contract),
            ("NTC_1_10", Guid.Parse("50000000-0000-0000-0000-000000000010"), categoryIds["Permits"], "Form E (Multiple Stations/Equipment)", null, "NTC_1_10", "Form E Continuation Sheet (NTC 1-10)", Ntc110Contract),
            ("NTC_1_11", Guid.Parse("50000000-0000-0000-0000-000000000011"), categoryIds["Permits"], "Application for Construction Permit / Radio Station License", null, "NTC_1_11", "Application for Construction Permit / Radio Station License (NTC 1-11)", Ntc111Contract),
            ("NTC_1_14", Guid.Parse("50000000-0000-0000-0000-000000000014"), categoryIds["Permits"], "Application for Temporary Permit to Propagate/Demonstrate", null, "NTC_1_14", "Application for Temporary Permit to Propagate/Demonstrate (NTC 1-14)", Ntc114Contract),
            ("NTC_1_18", Guid.Parse("50000000-0000-0000-0000-000000000018"), categoryIds["Accreditations"], "Application for Dealer/Manufacturer/Service Center/CPE Supplier Accreditation", "Customer Premises Equipment Supplier Accreditation", "NTC_1_18", "Application for CPE Supplier Accreditation (NTC 1-18)", Ntc118Contract),
            ("NTC_1_19", Guid.Parse("50000000-0000-0000-0000-000000000019"), categoryIds["Certificates"], "Application for Certificate of Registration (WDN/SRD/RFID)", null, "NTC_1_19", "Application for Certificate of Registration WDN/SRD/RFID (NTC 1-19)", Ntc119Contract),
            ("NTC_1_20", Guid.Parse("50000000-0000-0000-0000-000000000020"), categoryIds["Certificates"], "Application for Certificate of Registration (VAS/PCSOTSP/VoIP)", null, "NTC_1_20", "Application for Certificate of Registration VAS/VoIP (NTC 1-20)", Ntc120Contract),
            ("NTC_1_21", Guid.Parse("50000000-0000-0000-0000-000000000021"), categoryIds["Certificates"], "Application for Duplicate of Permit/License/Certificate", null, "NTC_1_21", "Application for Duplicate Permit/License/Certificate (NTC 1-21)", Ntc121Contract),
            ("NTC_1_22", Guid.Parse("50000000-0000-0000-0000-000000000022"), categoryIds["Licenses"], "Application for TVRO Registration Certificate / TVRO Station License / CATV Station License", null, "NTC_1_22", "Application for TVRO/CATV License (NTC 1-22)", Ntc122Contract)
        };
    }

    public static List<(Guid Id, Guid ServiceId, ServiceVariantType Type, string Description)> GetVariantDefs()
    {
        var svc101 = Guid.Parse("50000000-0000-0000-0000-000000000001");
        var svc102 = Guid.Parse("50000000-0000-0000-0000-000000000002");
        var svc103 = Guid.Parse("50000000-0000-0000-0000-000000000003");
        var svc104 = Guid.Parse("50000000-0000-0000-0000-000000000004");
        var svc111 = Guid.Parse("50000000-0000-0000-0000-000000000011");
        var svc118 = Guid.Parse("50000000-0000-0000-0000-000000000018");
        var svc119 = Guid.Parse("50000000-0000-0000-0000-000000000019");
        var svc120 = Guid.Parse("50000000-0000-0000-0000-000000000020");
        var svc122 = Guid.Parse("50000000-0000-0000-0000-000000000022");

        var svcRtg = Guid.Parse("50000000-0000-0000-0000-000000000031");
        var svcRtp = Guid.Parse("50000000-0000-0000-0000-000000000032");
        var svcAma = Guid.Parse("50000000-0000-0000-0000-000000000033");
        var svcRrocAc = Guid.Parse("50000000-0000-0000-0000-000000000034");

        return new List<(Guid, Guid, ServiceVariantType, string)>
        {
            (Guid.Parse("60000000-0000-0000-0000-000000000001"), svc101, ServiceVariantType.New, "New Radio Operator Exam Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), svc102, ServiceVariantType.New, "New Radio Operator Certificate Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), svc102, ServiceVariantType.Renewal, "Renew Radio Operator Certificate"),
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), svc102, ServiceVariantType.Modification, "Modify Radio Operator Certificate"),
            (Guid.Parse("60000000-0000-0000-0000-000000000004"), svc103, ServiceVariantType.New, "New Amateur Radio License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000008"), svc103, ServiceVariantType.Renewal, "Renew Amateur Radio License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), svc103, ServiceVariantType.Modification, "Modify Amateur Radio License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000005"), svc104, ServiceVariantType.New, "New Ship Station License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000010"), svc104, ServiceVariantType.Renewal, "Renew Ship Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000006"), svc111, ServiceVariantType.New, "New Radio Station License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000007"), svc111, ServiceVariantType.Renewal, "Renew Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000012"), svc111, ServiceVariantType.Modification, "Modify Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000013"), svc118, ServiceVariantType.New, "New CPE Supplier Accreditation"),
            (Guid.Parse("60000000-0000-0000-0000-000000000014"), svc118, ServiceVariantType.Renewal, "Renew CPE Supplier Accreditation"),
            (Guid.Parse("60000000-0000-0000-0000-000000000015"), svc118, ServiceVariantType.Modification, "Modify CPE Supplier Accreditation"),
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), svc119, ServiceVariantType.New, "New Certificate of Registration (WDN/SRD/RFID)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000017"), svc120, ServiceVariantType.New, "New Certificate of Registration (VAS/VoIP)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), svc120, ServiceVariantType.Renewal, "Renew Certificate of Registration (VAS/VoIP)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000019"), svc120, ServiceVariantType.Modification, "Modify Certificate of Registration (VAS/VoIP)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), svc122, ServiceVariantType.New, "New TVRO/CATV License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000021"), svc122, ServiceVariantType.Renewal, "Renew TVRO/CATV License"),

            // Radiotelegraphy (RTG)
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), svcRtg, ServiceVariantType.FirstTaker, "Radiotelegraphy First Taker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000032"), svcRtg, ServiceVariantType.Retaker, "Radiotelegraphy Retaker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000033"), svcRtg, ServiceVariantType.Upgrade, "Radiotelegraphy Upgrade"),

            // Radiotelephony (RTP)
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), svcRtp, ServiceVariantType.FirstTaker, "Radiotelephony First Taker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000035"), svcRtp, ServiceVariantType.Retaker, "Radiotelephony Retaker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000036"), svcRtp, ServiceVariantType.Upgrade, "Radiotelephony Upgrade"),

            // Amateur (AMA)
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), svcAma, ServiceVariantType.FirstTaker, "Amateur Radio First Taker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000038"), svcAma, ServiceVariantType.Retaker, "Amateur Radio Retaker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000039"), svcAma, ServiceVariantType.Upgrade, "Amateur Radio Upgrade"),

            // RROC Aircraft
            (Guid.Parse("60000000-0000-0000-0000-000000000040"), svcRrocAc, ServiceVariantType.FirstTaker, "RROC Aircraft First Taker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000041"), svcRrocAc, ServiceVariantType.Retaker, "RROC Aircraft Retaker")
        };
    }

    public static Dictionary<string, Field> GetFieldsPool()
    {
        return new Dictionary<string, Field>
        {
            // Core Personal / Applicant
            ["fullName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000001"), FieldType = "text", Label = "Full Name / Company Name", SyncBackOnSubmit = true },
            ["birthDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000002"), FieldType = "date", Label = "Birth Date", SyncBackOnSubmit = true },
            ["address"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000003"), FieldType = "text", Label = "Address", SyncBackOnSubmit = true },
            ["contactNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000004"), FieldType = "text", Label = "Contact Number", SyncBackOnSubmit = true },
            ["email"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000005"), FieldType = "text", Label = "Email Address", SyncBackOnSubmit = true },
            ["education"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000006"), FieldType = "text", Label = "Education / School Attended", SyncBackOnSubmit = false },

            // NTC 1-01 Exam Specific
            ["examCategory"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000007"), FieldType = "dropdown", Label = "Exam Category", SyncBackOnSubmit = false, ValidationRules = @"[""Radiotelegraphy"",""Radiotelephony"",""Amateur"",""Restricted Radiotelephone""]" },
            ["examineeType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000008"), FieldType = "dropdown", Label = "Examinee Type", SyncBackOnSubmit = false, ValidationRules = @"[""FirstTaker"",""Retaker"",""Upgrade""]" },
            ["elements"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000009"), FieldType = "text", Label = "Selected Exam Elements", SyncBackOnSubmit = false },
            ["specialNeeds"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000010"), FieldType = "text", Label = "Special Assistance Details", SyncBackOnSubmit = false },
            ["admissionNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000011"), FieldType = "text", Label = "Admission Slip Number", SyncBackOnSubmit = false },

            // Core Declarations & Payment
            ["signatureField"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000012"), FieldType = "signature", Label = "Applicant Signature", SyncBackOnSubmit = false },
            ["declarationCheckbox"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000013"), FieldType = "checkbox", Label = "I hereby declare that all information is true and correct.", SyncBackOnSubmit = false },
            ["paymentOrNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000021"), FieldType = "text", Label = "Official Receipt (OR) Number", SyncBackOnSubmit = false },
            ["paymentAmount"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000022"), FieldType = "number", Label = "Amount Paid", SyncBackOnSubmit = false },
            ["paymentDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000023"), FieldType = "date", Label = "Payment Date", SyncBackOnSubmit = false },

            // NTC 1-02 Certificate Specific
            ["typeOfCertificate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000014"), FieldType = "dropdown", Label = "Type of Certificate", SyncBackOnSubmit = false, ValidationRules = @"[""1RTG"",""2RTG"",""3RTG"",""1PHN"",""2PHN"",""3PHN"",""SROP"",""RROC-Land Mobile"",""RROC-Aircraft"",""GROC"",""TP RROC-Aircraft"",""Other""]" },
            ["weight_kg"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000015"), FieldType = "number", Label = "Weight (kg)", SyncBackOnSubmit = false },
            ["height_cm"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000016"), FieldType = "number", Label = "Height (cm)", SyncBackOnSubmit = false },
            ["employmentStatus"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000017"), FieldType = "text", Label = "Employment Status", SyncBackOnSubmit = false },
            ["employmentLocation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000018"), FieldType = "text", Label = "Employment Location", SyncBackOnSubmit = false },
            ["examSeminarDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000019"), FieldType = "text", Label = "Exam / Seminar Details", SyncBackOnSubmit = false },

            // NTC 1-03 Amateur Specific
            ["permitType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000024"), FieldType = "dropdown", Label = "Permit / License Type", SyncBackOnSubmit = false, ValidationRules = @"[""Amateur Radio Operator Certificate"",""Amateur Radio Station License"",""Club Radio Station License"",""Temporary Permit for Foreign Visitor"",""Special Permit for Vanity/Special Call Sign""]" },
            ["classOfStation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000025"), FieldType = "dropdown", Label = "Class of Station", SyncBackOnSubmit = false, ValidationRules = @"[""Class A"",""Class B"",""Class C"",""Class D""]" },
            ["clubDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000026"), FieldType = "text", Label = "Amateur Club Details", SyncBackOnSubmit = false },

            // Technical Vessel & Station & Equipment
            ["vesselName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000027"), FieldType = "text", Label = "Vessel Name", SyncBackOnSubmit = false },
            ["callSign"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000028"), FieldType = "text", Label = "Call Sign", SyncBackOnSubmit = false },
            ["imoNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000029"), FieldType = "text", Label = "IMO Number / Gross Tonnage", SyncBackOnSubmit = false },
            ["equipmentDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000030"), FieldType = "text", Label = "Equipment Technical Details (Make/Model/Serial/Power/Freq)", SyncBackOnSubmit = false },
            ["radioOfficers"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000031"), FieldType = "text", Label = "Radio Officers Details", SyncBackOnSubmit = false },
            ["stationLocation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000032"), FieldType = "text", Label = "Station Location / Coordinates", SyncBackOnSubmit = false },
            ["antennaDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000033"), FieldType = "text", Label = "Antenna Technical Details (Type/Gain/Height)", SyncBackOnSubmit = false },

            // Accreditations & Regs
            ["personnelDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000034"), FieldType = "text", Label = "ECE / Technician Personnel Details", SyncBackOnSubmit = false },
            ["devicesDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000035"), FieldType = "text", Label = "Registered Devices Details (WDN/SRD/RFID)", SyncBackOnSubmit = false },
            ["valueAddedServices"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000036"), FieldType = "text", Label = "Value-Added Services / Category", SyncBackOnSubmit = false },
            ["circumstances"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000037"), FieldType = "text", Label = "Circumstances / Reason for Duplicate", SyncBackOnSubmit = false },
            ["tvroDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000038"), FieldType = "text", Label = "TVRO / CATV Receiver & Satellite Details", SyncBackOnSubmit = false }
        };
    }

    public static List<(Guid VariantId, string Code, string Description)> GetBackfillElements()
    {
        return new List<(Guid, string, string)>
        {
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), "1RTG-STD", "1RTG - Elements 1, 2, 5, 6 & Code (25/20 wpm)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), "1RTG-RMV", "1RTG - For removal , Code (25/20 wpm)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), "1RTG-UPG", "1RTG - For upgrade (2RTG Holder) & Code (25/20 wpm)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), "2RTG-STD", "2RTG - Elements 1, 2, 5, 6 & Code (16 wpm)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), "2RTG-RMV", "2RTG - For removal, Code (16 wpm)"),

            (Guid.Parse("60000000-0000-0000-0000-000000000034"), "1PHN-STD", "1PHN - Elements 1, 2, 3 & 4"),
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), "1PHN-UPG2", "1PHN - For upgrade (2PHN Holder) , Element 4"),
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), "1PHN-UPG3", "1PHN - For upgrade (3PHN Holder), Element 3 & 4"),

            (Guid.Parse("60000000-0000-0000-0000-000000000037"), "AM-A-STD", "Class A - Elements 8, 9, 10 & Code (5 wpm)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), "AM-A-RMV", "Class A - For removal, Code (5 wmp)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), "AM-B-STD", "Class B - Elements 5, 6 & 7"),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), "AM-B-ECE", "Class B - For Registered ECE, 1PHN, 1RTG & 2RTG , Element 2"),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), "AM-C-STD", "Class C - Elements 2, 3 & 4"),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), "AM-C-DHLD", "Class C - For Class D Holder, Elements 3 & 4"),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), "AM-D-STD", "Class D - Element 2"),

            (Guid.Parse("60000000-0000-0000-0000-000000000040"), "RROC-D-STD", "Class D - Element 2")
        };
    }

    public static List<(Guid ServiceId, Guid? ServiceVariantId, string Content)> GetBackfillNotes(Guid svcRtg, Guid svcRtp, Guid svcAma, Guid svcRrocAc)
    {
        var list = new List<(Guid ServiceId, Guid? ServiceVariantId, string Content)>();
        var examNotes = new[]
        {
            "1. Examinees shall present this Admission Slip and any valid government issued ID with picture or School ID, for students. (No Admission Slip and ID, No Exam.)",
            "2. Examinees who are late for more than 30 minutes shall not be allowed to take the examination.",
            "3. Request for re-schedule of examination must be filed at least 1 week before the date of examination.",
            "4. In case of suspension/cancellation of work in government offices due to force majeure, the scheduled regular examination shall be conducted on the next regular working day"
        };

        // Radiotelegraphy variants
        var rtgVariants = new[] { Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("60000000-0000-0000-0000-000000000032"), Guid.Parse("60000000-0000-0000-0000-000000000033") };
        // Radiotelephony variants
        var rtpVariants = new[] { Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("60000000-0000-0000-0000-000000000035"), Guid.Parse("60000000-0000-0000-0000-000000000036") };
        // Amateur variants
        var amaVariants = new[] { Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("60000000-0000-0000-0000-000000000038"), Guid.Parse("60000000-0000-0000-0000-000000000039") };
        // RROC Aircraft variants
        var rrocVariants = new[] { Guid.Parse("60000000-0000-0000-0000-000000000040"), Guid.Parse("60000000-0000-0000-0000-000000000041") };

        foreach (var note in examNotes)
        {
            foreach (var v in rtgVariants) list.Add((svcRtg, v, note));
            foreach (var v in rtpVariants) list.Add((svcRtp, v, note));
            foreach (var v in amaVariants) list.Add((svcAma, v, note));
            foreach (var v in rrocVariants) list.Add((svcRrocAc, v, note));
        }
        return list;
    }

    public static Dictionary<string, (Guid Id, string Name, string Desc)> GetBackfillRequirements()
    {
        return new Dictionary<string, (Guid Id, string Name, string Desc)>
        {
            ["AGE"] = (Guid.Parse("70000000-0000-0000-0000-000000000001"), "Proof of Age / Identity", "ANY of the following: Birth Certificate, Baptismal Certificate, Passport, PRC License, Driver's License, any document which can serve as the basis for age requirement"),
            ["TOR"] = (Guid.Parse("70000000-0000-0000-0000-000000000002"), "Transcript of Records with Special Order (SO)", "Transcript of Records with Special Order (SO) (Note: SO not required for State Universities/Colleges)"),
            ["PHOTO"] = (Guid.Parse("70000000-0000-0000-0000-000000000003"), "1x1 ID Picture", "Please provide a clear 1x1 ID picture taken within the last six (6) months."),
            ["RATING"] = (Guid.Parse("70000000-0000-0000-0000-000000000004"), "Proof of Rating", "Official proof of rating from past exams."),
            ["ROC"] = (Guid.Parse("70000000-0000-0000-0000-000000000005"), "Copy of Valid ROC", "Copy of Valid Radio Operator Certificate."),
            ["SEMINAR"] = (Guid.Parse("70000000-0000-0000-0000-000000000006"), "Proof of Attendance of Seminar", "Proof of attendance of seminar conducted by NTC accredited Amateur Radio Club."),
            ["AT_ROC"] = (Guid.Parse("70000000-0000-0000-0000-000000000007"), "Copy of Valid AT-ROC", "Copy of Valid Amateur Radio Operator Certificate."),
            ["CAAP"] = (Guid.Parse("70000000-0000-0000-0000-000000000008"), "CAAP Pilot License", "Aircraft pilot's license or student pilot's license issued by the CAAP / foreign aviation authority.")
        };
    }

    public static List<(Guid VariantId, Guid ReqId, bool IsRequired)> GetBackfillVariantRequirements()
    {
        return new List<(Guid VariantId, Guid ReqId, bool IsRequired)>
        {
            // Radiotelegraphy (RTG)
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000002"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000032"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000032"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000033"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000033"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true),

            // Radiotelephony (RTP)
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000002"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000035"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000035"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000036"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000036"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true),

            // Amateur (AMA)
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000006"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000038"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000038"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000039"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000039"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),

            // RROC Aircraft
            (Guid.Parse("60000000-0000-0000-0000-000000000040"), Guid.Parse("70000000-0000-0000-0000-000000000008"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000040"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000041"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000041"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true)
        };
    }
}
