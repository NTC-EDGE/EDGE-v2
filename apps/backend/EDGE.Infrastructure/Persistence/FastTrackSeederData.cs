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
            ""equipmentDeviceType"": [""WDN Indoor"",""SRD"",""RFID"",""SRRS"",""Public Trunked Radio (Mobile/Portable)""],
            ""registrationType"": [""Dealers"", ""Non-Dealers""]
        },
        ""requirementDiscriminatorFields"": [""Registration Type""],
        ""requirementContextGroups"": {
            ""Dealers"": ""Dealers"",
            ""Non-Dealers"": ""Non-Dealers""
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
        ""applicationTypes"": [""New"", ""Renewal""],
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
        ""serviceCategory"": ""Certificates"",
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
        ""requirementDiscriminatorFields"": [""Classification of Applicant""],
        ""requirementContextGroups"": {
            ""Commercial"": ""Commercial"",
            ""Non-Commercial"": ""Non-Commercial""
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
            ("NTC_1_01", Guid.Parse("50000000-0000-0000-0000-000000000001"), categoryIds["Exams"], "Admission Slip for Radio Operator Examination", null, "NTC_1_01", "Admission Slip for Radio Operator Examination (NTC 1-01)", Ntc101Contract),
            ("NTC_1_02", Guid.Parse("50000000-0000-0000-0000-000000000002"), categoryIds["Certificates"], "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC", "Radio Operator Certificates (ROC) excluding Amateur ROC", "NTC_1_02", "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC (NTC 1-02)", Ntc102Contract),
            ("NTC_1_03", Guid.Parse("50000000-0000-0000-0000-000000000003"), categoryIds["Certificates"], "CERTIFICATES IN THE AMATEUR SERVICE", "License in the Amateur Service", "NTC_1_03", "CERTIFICATES IN THE AMATEUR SERVICE (NTC 1-03)", Ntc103Contract),
            ("NTC_1_04", Guid.Parse("50000000-0000-0000-0000-000000000004"), categoryIds["Licenses"], "Application for Ship/Ship-Earth Station License", "Ship/Ship-Earth Station", "NTC_1_04", "Application for Ship/Ship-Earth Station License (NTC 1-04)", Ntc104Contract),
            ("NTC_1_05", Guid.Parse("50000000-0000-0000-0000-000000000005"), categoryIds["Permits"], "Form A (Multiple Stations/Equipment)", null, "NTC_1_05", "Form A Continuation Sheet (NTC 1-05)", Ntc105Contract),
            ("NTC_1_09", Guid.Parse("50000000-0000-0000-0000-000000000009"), categoryIds["Permits"], "PERMITS IN THE AMATEUR SERVICE", "Permits in the Amateur Service", "NTC_1_09", "PERMITS IN THE AMATEUR SERVICE (NTC 1-09)", Ntc109Contract),
            ("NTC_1_10", Guid.Parse("50000000-0000-0000-0000-000000000010"), categoryIds["Permits"], "Form E (Multiple Stations/Equipment)", null, "NTC_1_10", "Form E Continuation Sheet (NTC 1-10)", Ntc110Contract),
            ("NTC_1_11", Guid.Parse("50000000-0000-0000-0000-000000000011"), categoryIds["Permits"], "Application for Construction Permit / Radio Station License", null, "NTC_1_11", "Application for Construction Permit / Radio Station License (NTC 1-11)", Ntc111Contract),
            ("NTC_1_14", Guid.Parse("50000000-0000-0000-0000-000000000014"), categoryIds["Permits"], "Application for Temporary Permit to Propagate/Demonstrate", null, "NTC_1_14", "Application for Temporary Permit to Propagate/Demonstrate (NTC 1-14)", Ntc114Contract),
            ("NTC_1_18", Guid.Parse("50000000-0000-0000-0000-000000000018"), categoryIds["Accreditations"], "Application for Dealer/Manufacturer/Service Center/CPE Supplier Accreditation", "Customer Premises Equipment Supplier Accreditation", "NTC_1_18", "Application for CPE Supplier Accreditation (NTC 1-18)", Ntc118Contract),
            ("NTC_1_19", Guid.Parse("50000000-0000-0000-0000-000000000019"), categoryIds["Certificates"], "CERTIFICATE OF REGISTRATION FOR RFID, SRD, WDN, DEVICES- INDOOR", null, "NTC_1_19", "CERTIFICATE OF REGISTRATION FOR RFID, SRD, WDN, DEVICES- INDOOR (NTC 1-19)", Ntc119Contract),
            ("NTC_1_20", Guid.Parse("50000000-0000-0000-0000-000000000020"), categoryIds["Certificates"], "CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER", null, "NTC_1_20", "CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER (NTC 1-20)", Ntc120Contract),
            ("NTC_1_21", Guid.Parse("50000000-0000-0000-0000-000000000021"), categoryIds["Certificates"], "COPY OF CERTIFICATES", null, "NTC_1_21", "COPY OF CERTIFICATES (NTC 1-21)", Ntc121Contract),
            ("NTC_1_22", Guid.Parse("50000000-0000-0000-0000-000000000022"), categoryIds["Certificates"], "TVRO REGISTRATION CERTIFICATE", null, "NTC_1_22", "TVRO REGISTRATION CERTIFICATE (NTC 1-22)", Ntc122Contract),
            
            // New Permits Services added from the spreadsheet
            ("NTC_AERO_PERMITS", Guid.Parse("50000000-0000-0000-0000-000000000060"), categoryIds["Permits"], "PERMITS IN THE AERONAUTICAL SERVICE", null, "NTC_AERO_PERMITS", "PERMITS IN THE AERONAUTICAL SERVICE", Ntc109Contract),
            ("NTC_MAR_PERMITS", Guid.Parse("50000000-0000-0000-0000-000000000061"), categoryIds["Permits"], "PERMITS IN THE MARITIME SERVICE", null, "NTC_MAR_PERMITS", "PERMITS IN THE MARITIME SERVICE", Ntc109Contract),
            ("NTC_FLM_PERMITS", Guid.Parse("50000000-0000-0000-0000-000000000062"), categoryIds["Permits"], "PERMITS TO GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", null, "NTC_FLM_PERMITS", "PERMITS TO FIXED AND LAND MOBILE STATIONS", Ntc109Contract),
            ("NTC_PTE_PERMITS", Guid.Parse("50000000-0000-0000-0000-000000000063"), categoryIds["Permits"], "PERMITS FOR PUBLIC TELECOMMUNICATIONS ENTITIES (PTEs)", null, "NTC_PTE_PERMITS", "PERMITS FOR PTEs", Ntc109Contract),
            ("NTC_EQUIP_PERMITS", Guid.Parse("50000000-0000-0000-0000-000000000064"), categoryIds["Permits"], "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT", null, "NTC_EQUIP_PERMITS", "PERMITS FOR EQUIPMENT", Ntc109Contract),
            ("NTC_MP_PERMITS", Guid.Parse("50000000-0000-0000-0000-000000000065"), categoryIds["Permits"], "PERMITS FOR MOBILE PHONE", null, "NTC_MP_PERMITS", "PERMITS FOR MOBILE PHONE", Ntc109Contract),
            ("NTC_COPY_PERMITS", Guid.Parse("50000000-0000-0000-0000-000000000066"), categoryIds["Permits"], "COPYY OF PERMITS", null, "NTC_COPY_PERMITS", "COPY OF PERMITS", Ntc109Contract),

            // New Licenses Services added from the spreadsheet
            ("NTC_AMA_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000070"), categoryIds["Licenses"], "LICENSE IN THE AMATEUR SERVICE", "License in the Amateur Service", "NTC_AMA_LICENSES", "LICENSE IN THE AMATEUR SERVICE", Ntc103Contract),
            ("NTC_AERO_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000071"), categoryIds["Licenses"], "LICENSE IN THE AERONAUTICAL SERVICE", null, "NTC_AERO_LICENSES", "LICENSE IN THE AERONAUTICAL SERVICE", Ntc111Contract),
            ("NTC_MAR_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000072"), categoryIds["Licenses"], "LICENSE IN THE MARITIME SERVICE", null, "NTC_MAR_LICENSES", "LICENSE IN THE MARITIME SERVICE", Ntc104Contract),
            ("NTC_FLM_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000073"), categoryIds["Licenses"], "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", null, "NTC_FLM_LICENSES", "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", Ntc111Contract),
            ("NTC_OTHER_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000074"), categoryIds["Licenses"], "OTHER RADIO STATION LICENSES/SERVICES", null, "NTC_OTHER_LICENSES", "OTHER RADIO STATION LICENSES/SERVICES", Ntc111Contract),
            ("NTC_TVRO_CATV_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000075"), categoryIds["Licenses"], "TVRO/CATV STATION LICENSE", null, "NTC_TVRO_CATV_LICENSES", "TVRO/CATV STATION LICENSE", Ntc122Contract),
            ("NTC_COPY_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000076"), categoryIds["Licenses"], "COPY OF LICENSES", null, "NTC_COPY_LICENSES", "COPY OF LICENSES", Ntc121Contract)
        };
    }

    public static List<(Guid Id, Guid ServiceId, ServiceVariantType Type, string Description)> GetVariantDefs()
    {
        var svc101 = Guid.Parse("50000000-0000-0000-0000-000000000001");
        var svc102 = Guid.Parse("50000000-0000-0000-0000-000000000002");
        var svc103 = Guid.Parse("50000000-0000-0000-0000-000000000003");
        var svc104 = Guid.Parse("50000000-0000-0000-0000-000000000004");
        var svc109 = Guid.Parse("50000000-0000-0000-0000-000000000009");
        var svc111 = Guid.Parse("50000000-0000-0000-0000-000000000011");
        var svc118 = Guid.Parse("50000000-0000-0000-0000-000000000018");
        var svc119 = Guid.Parse("50000000-0000-0000-0000-000000000019");
        var svc120 = Guid.Parse("50000000-0000-0000-0000-000000000020");
        var svc121 = Guid.Parse("50000000-0000-0000-0000-000000000021");
        var svc122 = Guid.Parse("50000000-0000-0000-0000-000000000022");

        // New Permits Service GUIDs
        var svcAero = Guid.Parse("50000000-0000-0000-0000-000000000060");
        var svcMar = Guid.Parse("50000000-0000-0000-0000-000000000061");
        var svcFlm = Guid.Parse("50000000-0000-0000-0000-000000000062");
        var svcPte = Guid.Parse("50000000-0000-0000-0000-000000000063");
        var svcEquip = Guid.Parse("50000000-0000-0000-0000-000000000064");
        var svcMp = Guid.Parse("50000000-0000-0000-0000-000000000065");
        var svcCopy = Guid.Parse("50000000-0000-0000-0000-000000000066");

        // New Licenses Service GUIDs
        var svcLicAma = Guid.Parse("50000000-0000-0000-0000-000000000070");
        var svcLicAero = Guid.Parse("50000000-0000-0000-0000-000000000071");
        var svcLicMar = Guid.Parse("50000000-0000-0000-0000-000000000072");
        var svcLicFlm = Guid.Parse("50000000-0000-0000-0000-000000000073");
        var svcLicOther = Guid.Parse("50000000-0000-0000-0000-000000000074");
        var svcLicTvroCatv = Guid.Parse("50000000-0000-0000-0000-000000000075");
        var svcLicCopy = Guid.Parse("50000000-0000-0000-0000-000000000076");

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
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), svc119, ServiceVariantType.NA, "Certificate of Registration for RFID, SRD, WDN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000017"), svc120, ServiceVariantType.New, "New Certificate of Registration as VAS Provider"),
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), svc120, ServiceVariantType.Renewal, "Renewal of Certificate of Registration as VAS Provider"),
            (Guid.Parse("60000000-0000-0000-0000-000000000019"), svc120, ServiceVariantType.Modification, "Modification of Certificate of Registration as VAS Provider"),
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), svc122, ServiceVariantType.NA, "TVRO Registration Certificate"),
            (Guid.Parse("60000000-0000-0000-0000-000000000050"), svc121, ServiceVariantType.NA, "Duplicate Copy"),
            (Guid.Parse("60000000-0000-0000-0000-000000000051"), svc121, ServiceVariantType.NA, "Certified True Copy"),

            // --- Permits in the Amateur Service (svc109) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000060"), svc109, ServiceVariantType.New, "Amateur Radio Station Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000061"), svc109, ServiceVariantType.NA, "Amateur Radio Station Permit Permit to Possess for Storage"),
            (Guid.Parse("60000000-0000-0000-0000-000000000062"), svc109, ServiceVariantType.NA, "Amateur Radio Station Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000063"), svc109, ServiceVariantType.New, "Amateur Radio Station Permit to Sell/Transfer"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), svc109, ServiceVariantType.NA, "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor"),
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), svc109, ServiceVariantType.Renewal, "Special Permit for Use of Vanity Call Sign (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), svc109, ServiceVariantType.New, "Special Permit for the Use of Special Event Call Sign"),

            // --- Permits in the Aeronautical Service (svcAero) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000070"), svcAero, ServiceVariantType.NA, "Aeronautical Station Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), svcAero, ServiceVariantType.NA, "Aeronautical Station Permit to Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), svcAero, ServiceVariantType.NA, "Aeronautical Station Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000073"), svcAero, ServiceVariantType.NA, "Aeronautical Station Permit to Sell/Transfer"),
            (Guid.Parse("60000000-0000-0000-0000-000000000074"), svcAero, ServiceVariantType.NA, "Aircraft Station Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), svcAero, ServiceVariantType.NA, "Aircraft Station Permit to Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), svcAero, ServiceVariantType.NA, "Aircraft Station Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000077"), svcAero, ServiceVariantType.NA, "Aircraft Station Permit to Sell/Transfer"),

            // --- Permits in the Maritime Service (svcMar) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000080"), svcMar, ServiceVariantType.NA, "Ship Station Permit to Purchase (Domestic Trade)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000081"), svcMar, ServiceVariantType.NA, "Ship Station Permit to Possess (Domestic Trade)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000082"), svcMar, ServiceVariantType.NA, "Ship Station Permit to Possess (Storage)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000083"), svcMar, ServiceVariantType.NA, "Ship Station Permit to Purchase/Possess (Domestic Trade)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000084"), svcMar, ServiceVariantType.NA, "Ship Station Permit to Sell/Transfer"),
            (Guid.Parse("60000000-0000-0000-0000-000000000085"), svcMar, ServiceVariantType.NA, "Private Coastal Station Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000086"), svcMar, ServiceVariantType.NA, "Private Coastal Station Permit to Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000087"), svcMar, ServiceVariantType.NA, "Private Coastal Station Permit to Purchase /Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), svcMar, ServiceVariantType.NA, "Public Coastal Station Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), svcMar, ServiceVariantType.NA, "Public Coastal Station Permit to Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), svcMar, ServiceVariantType.NA, "Public Coastal Station Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000091"), svcMar, ServiceVariantType.NA, "Public Coastal Station Permit to Sell/Transfer"),

            // --- Permits to Fixed & Land Mobile stations (svcFlm) ---
            // Permit to Purchase (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), svcFlm, ServiceVariantType.VSAT, "Permit to Purchase (VSAT)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), svcFlm, ServiceVariantType.Private, "Permit to Purchase (PRIVATE)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), svcFlm, ServiceVariantType.CivicActionGroup, "Permit to Purchase (CIVIC ACTION GROUP)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), svcFlm, ServiceVariantType.Government, "Permit to Purchase (GOVERNMENT)"),
            // Permit to Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), svcFlm, ServiceVariantType.VSAT, "Permit to Possess (VSAT)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), svcFlm, ServiceVariantType.Private, "Permit to Possess (PRIVATE)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), svcFlm, ServiceVariantType.CivicActionGroup, "Permit to Possess (CIVIC ACTION GROUP)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), svcFlm, ServiceVariantType.Government, "Permit to Possess (GOVERNMENT)"),
            // Permit to Purchase/Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), svcFlm, ServiceVariantType.VSAT, "Permit to Purchase/Possess (VSAT)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), svcFlm, ServiceVariantType.Private, "Permit to Purchase/Possess (PRIVATE)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), svcFlm, ServiceVariantType.CivicActionGroup, "Permit to Purchase/Possess (CIVIC ACTION GROUP)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), svcFlm, ServiceVariantType.Government, "Permit to Purchase/Possess (GOVERNMENT)"),
            
            (Guid.Parse("60000000-0000-0000-0000-000000000103"), svcFlm, ServiceVariantType.New, "Permit to Possess for Storage"),
            (Guid.Parse("60000000-0000-0000-0000-000000000104"), svcFlm, ServiceVariantType.New, "Permit to Sell/Transfer"),
            // Construction Permit (NEW / MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), svcFlm, ServiceVariantType.New, "Construction Permit (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000116"), svcFlm, ServiceVariantType.Modification, "Construction Permit (MODIFICATION)"),
            // Temporary Permit to Demonstrate and Propagate (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), svcFlm, ServiceVariantType.VSAT, "Temporary Permit to Demonstrate and Propagate (VSAT)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000117"), svcFlm, ServiceVariantType.Private, "Temporary Permit to Demonstrate and Propagate (PRIVATE)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000118"), svcFlm, ServiceVariantType.CivicActionGroup, "Temporary Permit to Demonstrate and Propagate (CIVIC ACTION GROUP)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000119"), svcFlm, ServiceVariantType.Government, "Temporary Permit to Demonstrate and Propagate (GOVERNMENT)"),

            // --- Permits for Public Telecommunication Entities (svcPte) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000120"), svcPte, ServiceVariantType.NA, "Permit to Possess for Storage (PTEs)"),

            // --- Permits for Radio Communication Equipment (svcEquip) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000130"), svcEquip, ServiceVariantType.NA, "Permit to Transport"),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), svcEquip, ServiceVariantType.New, "Dealer Permit (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), svcEquip, ServiceVariantType.Renewal, "Dealer Permit (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000135"), svcEquip, ServiceVariantType.Modification, "Dealer Permit (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), svcEquip, ServiceVariantType.New, "Manufacturer Permit (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), svcEquip, ServiceVariantType.Renewal, "Manufacturer Permit (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000137"), svcEquip, ServiceVariantType.Modification, "Manufacturer Permit (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), svcEquip, ServiceVariantType.New, "Service Center Permit (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), svcEquip, ServiceVariantType.Renewal, "Service Center Permit (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000139"), svcEquip, ServiceVariantType.Modification, "Service Center Permit (MODIFICATION)"),

            // --- Permits for Mobile Phone (svcMp) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), svcMp, ServiceVariantType.New, "Dealer Permit (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), svcMp, ServiceVariantType.Renewal, "Dealer Permit (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), svcMp, ServiceVariantType.Modification, "Dealer Permit (MODIFICATION)"),

            (Guid.Parse("60000000-0000-0000-0000-000000000141"), svcMp, ServiceVariantType.New, "Retailer/Reseller Permit (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000148"), svcMp, ServiceVariantType.Renewal, "Retailer/Reseller Permit (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000149"), svcMp, ServiceVariantType.Modification, "Retailer/Reseller Permit (MODIFICATION)"),

            (Guid.Parse("60000000-0000-0000-0000-000000000142"), svcMp, ServiceVariantType.New, "Service Center Permit (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000152"), svcMp, ServiceVariantType.Renewal, "Service Center Permit (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000153"), svcMp, ServiceVariantType.Modification, "Service Center Permit (MODIFICATION)"),

            // --- Copy of Permits (svcCopy) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000150"), svcCopy, ServiceVariantType.NA, "Certified True Copy"),
            (Guid.Parse("60000000-0000-0000-0000-000000000151"), svcCopy, ServiceVariantType.NA, "Duplicate Copy"),

            // Radiotelegraphy (RTG)
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), svc101, ServiceVariantType.FirstTaker, "Radiotelegraphy First Taker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000032"), svc101, ServiceVariantType.Retaker, "Radiotelegraphy Retaker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000033"), svc101, ServiceVariantType.Upgrade, "Radiotelegraphy Upgrade"),

            // Radiotelephony (RTP)
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), svc101, ServiceVariantType.FirstTaker, "Radiotelephony First Taker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000035"), svc101, ServiceVariantType.Retaker, "Radiotelephony Retaker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000036"), svc101, ServiceVariantType.Upgrade, "Radiotelephony Upgrade"),

            // Amateur (AMA)
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), svc101, ServiceVariantType.FirstTaker, "Amateur Radio First Taker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000038"), svc101, ServiceVariantType.Retaker, "Amateur Radio Retaker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000039"), svc101, ServiceVariantType.Upgrade, "Amateur Radio Upgrade"),

            // RROC Aircraft
            (Guid.Parse("60000000-0000-0000-0000-000000000040"), svc101, ServiceVariantType.FirstTaker, "RROC Aircraft First Taker"),
            (Guid.Parse("60000000-0000-0000-0000-000000000041"), svc101, ServiceVariantType.Retaker, "RROC Aircraft Retaker"),

            // --- LICENSE IN THE AMATEUR SERVICE (svcLicAma) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), svcLicAma, ServiceVariantType.New, "Amateur Radio Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), svcLicAma, ServiceVariantType.Renewal, "Amateur Radio Station License (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000202"), svcLicAma, ServiceVariantType.Modification, "Amateur Radio Station License (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), svcLicAma, ServiceVariantType.NA, "Lifetime Amateur Radio Station License for Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000204"), svcLicAma, ServiceVariantType.New, "Amateur Club Radio Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000205"), svcLicAma, ServiceVariantType.Renewal, "Amateur Club Radio Station License (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000206"), svcLicAma, ServiceVariantType.Modification, "Amateur Club Radio Station License (MODIFICATION)"),

            // --- LICENSE IN THE AERONAUTICAL SERVICE (svcLicAero) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), svcLicAero, ServiceVariantType.New, "Fixed Aeronautical Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), svcLicAero, ServiceVariantType.Renewal, "Fixed Aeronautical Station License (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), svcLicAero, ServiceVariantType.Modification, "Fixed Aeronautical Station License (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), svcLicAero, ServiceVariantType.New, "Aircraft Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), svcLicAero, ServiceVariantType.Renewal, "Aircraft Station License (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000215"), svcLicAero, ServiceVariantType.Modification, "Aircraft Station License (MODIFICATION)"),

            // --- LICENSE IN THE MARITIME SERVICE (svcLicMar) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), svcLicMar, ServiceVariantType.New, "Ship Station License Domestic Trade (Without originally-installed equipment)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), svcLicMar, ServiceVariantType.New, "Ship Station License Domestic Trade (With originally-installed equipment)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), svcLicMar, ServiceVariantType.Renewal, "Ship Station License Domestic Trade (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000223"), svcLicMar, ServiceVariantType.Modification, "Ship Station License Domestic Trade (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), svcLicMar, ServiceVariantType.Renewal, "Ship Station License International Trade (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000225"), svcLicMar, ServiceVariantType.Modification, "Ship Station License International Trade (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), svcLicMar, ServiceVariantType.Renewal, "Ship Earth Station License International Trade (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000227"), svcLicMar, ServiceVariantType.Modification, "Ship Earth Station License International Trade (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), svcLicMar, ServiceVariantType.New, "Private Coastal Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), svcLicMar, ServiceVariantType.Renewal, "Private Coastal Station License (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000230"), svcLicMar, ServiceVariantType.Modification, "Private Coastal Station License (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), svcLicMar, ServiceVariantType.New, "Public Coastal Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000232"), svcLicMar, ServiceVariantType.Renewal, "Public Coastal Station License (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000233"), svcLicMar, ServiceVariantType.Modification, "Public Coastal Station License (MODIFICATION)"),

            // --- LICENSES FOR FIXED AND LAND MOBILE SERVICE (svcLicFlm) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), svcLicFlm, ServiceVariantType.New, "Radio Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000241"), svcLicFlm, ServiceVariantType.Renewal, "Radio Station License (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000242"), svcLicFlm, ServiceVariantType.Modification, "Radio Station License (MODIFICATION)"),

            // --- OTHER RADIO STATION LICENSES/SERVICES (svcLicOther) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000250"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - Microwave (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000251"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - Microwave (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000252"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - VSAT (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000253"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - VSAT (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000254"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - Public Trunked (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000255"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - Public Trunked (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000256"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - BWA (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000257"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - BWA (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000258"), svcLicOther, ServiceVariantType.New, "Radio Station License - WDN (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000259"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - WDN (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000260"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - WDN (MODIFICATION)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000261"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - BTS (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000262"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - BTS (MODIFICATION)"),

            // --- TVRO/CATV STATION LICENSE (svcLicTvroCatv) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), svcLicTvroCatv, ServiceVariantType.New, "TVRO Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), svcLicTvroCatv, ServiceVariantType.Renewal, "TVRO Station License (RENEWAL)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), svcLicTvroCatv, ServiceVariantType.New, "CATV Station License (NEW)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), svcLicTvroCatv, ServiceVariantType.Renewal, "CATV Station License (RENEWAL)"),

            // --- COPY OF LICENSES (svcLicCopy) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000280"), svcLicCopy, ServiceVariantType.NA, "Certified True Copy"),
            (Guid.Parse("60000000-0000-0000-0000-000000000281"), svcLicCopy, ServiceVariantType.NA, "Duplicate Copy")
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

            ["permitType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000024"), FieldType = "dropdown", Label = "Permit / License Type", SyncBackOnSubmit = false, ValidationRules = @"[""Amateur Radio Operator Certificate"",""Amateur Radio Station License"",""Club Radio Station License"",""Temporary Permit for Foreign Visitor"",""Special Permit for Vanity/Special Call Sign"",""Lifetime Amateur Radio Station Supplementary Certificate""]" },
            ["classOfStation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000025"), FieldType = "dropdown", Label = "Class of Station", SyncBackOnSubmit = false, ValidationRules = @"[""Class A"",""Class B"",""Class C"",""Class D""]" },
            ["clubDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000026"), FieldType = "text", Label = "Amateur Club Details", SyncBackOnSubmit = false },
            ["registrationType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000045"), FieldType = "dropdown", Label = "Registration Type", SyncBackOnSubmit = false, ValidationRules = @"[""Dealers"",""Non-Dealers""]" },

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
        // RTG elements — shared across First Taker (031), Retaker (032), and Upgrade (033)
        var rtgElements = new[]
        {
            ("1RTG-STD",  "1RTG - Elements 1, 2, 5, 6 & Code (25/20 wpm)"),
            ("1RTG-RMV",  "1RTG - For removal , Code (25/20 wpm)"),
            ("1RTG-UPG",  "1RTG - For upgrade (2RTG Holder) & Code (25/20 wpm)"),
            ("2RTG-STD",  "2RTG - Elements 1, 2, 5, 6 & Code (16 wpm)"),
            ("2RTG-RMV",  "2RTG - For removal, Code (16 wpm)")
        };
        var rtgVariants = new[]
        {
            Guid.Parse("60000000-0000-0000-0000-000000000031"), // First Taker
            Guid.Parse("60000000-0000-0000-0000-000000000032"), // Retaker
            Guid.Parse("60000000-0000-0000-0000-000000000033")  // Upgrade
        };

        // RTP elements — shared across First Taker (034), Retaker (035), and Upgrade (036)
        var rtpElements = new[]
        {
            ("1PHN-STD",  "1PHN - Elements 1, 2, 3 & 4"),
            ("1PHN-UPG2", "1PHN - For upgrade (2PHN Holder) , Element 4"),
            ("1PHN-UPG3", "1PHN - For upgrade (3PHN Holder), Element 3 & 4")
        };
        var rtpVariants = new[]
        {
            Guid.Parse("60000000-0000-0000-0000-000000000034"), // First Taker
            Guid.Parse("60000000-0000-0000-0000-000000000035"), // Retaker
            Guid.Parse("60000000-0000-0000-0000-000000000036")  // Upgrade
        };

        // Amateur elements — shared across First Taker (037), Retaker (038), and Upgrade (039)
        var amaElements = new[]
        {
            ("AM-A-STD",  "Class A - Elements 8, 9, 10 & Code (5 wpm)"),
            ("AM-A-RMV",  "Class A - For removal, Code (5 wmp)"),
            ("AM-B-STD",  "Class B - Elements 5, 6 & 7"),
            ("AM-B-ECE",  "Class B - For Registered ECE, 1PHN, 1RTG & 2RTG , Element 2"),
            ("AM-C-STD",  "Class C - Elements 2, 3 & 4"),
            ("AM-C-DHLD", "Class C - For Class D Holder, Elements 3 & 4"),
            ("AM-D-STD",  "Class D - Element 2")
        };
        var amaVariants = new[]
        {
            Guid.Parse("60000000-0000-0000-0000-000000000037"), // First Taker
            Guid.Parse("60000000-0000-0000-0000-000000000038"), // Retaker
            Guid.Parse("60000000-0000-0000-0000-000000000039")  // Upgrade
        };

        // RROC-Aircraft elements — shared across First Taker (040) and Retaker (041)
        var rrocElements = new[]
        {
            ("RROC-D-STD", "Class D - Element 2")
        };
        var rrocVariants = new[]
        {
            Guid.Parse("60000000-0000-0000-0000-000000000040"), // First Taker
            Guid.Parse("60000000-0000-0000-0000-000000000041")  // Retaker
        };

        // ROC Certificate elements — shared across New, Renewal, and Modification for svc102
        var certificateRocElements = new[]
        {
            ("1RTG", "First Class Radiotelegraph Operator Certificate"),
            ("2RTG", "Second Class Radiotelegraph Operator Certificate"),
            ("3RTG", "General Operator Certificate (GOC) / Third Class Radiotelegraph"),
            ("1PHN", "First Class Radiotelephone Operator Certificate"),
            ("2PHN", "Second Class Radiotelephone Operator Certificate"),
            ("3PHN", "Third Class Radiotelephone Operator Certificate")
        };
        var certificateRocVariants = new[]
        {
            Guid.Parse("60000000-0000-0000-0000-000000000002"), // New
            Guid.Parse("60000000-0000-0000-0000-000000000003"), // Renewal
            Guid.Parse("60000000-0000-0000-0000-000000000011")  // Modification
        };

        var result = new List<(Guid VariantId, string Code, string Description)>();

        foreach (var variantId in rtgVariants)
            foreach (var (code, desc) in rtgElements)
                result.Add((variantId, code, desc));

        foreach (var variantId in rtpVariants)
            foreach (var (code, desc) in rtpElements)
                result.Add((variantId, code, desc));

        foreach (var variantId in amaVariants)
            foreach (var (code, desc) in amaElements)
                result.Add((variantId, code, desc));

        foreach (var variantId in rrocVariants)
            foreach (var (code, desc) in rrocElements)
                result.Add((variantId, code, desc));

        foreach (var variantId in certificateRocVariants)
            foreach (var (code, desc) in certificateRocElements)
                result.Add((variantId, code, desc));

        return result;
    }

    public static List<(Guid ServiceId, Guid? ServiceVariantId, string Content)> GetBackfillNotes(Guid svc101)
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
            foreach (var v in rtgVariants) list.Add((svc101, v, note));
            foreach (var v in rtpVariants) list.Add((svc101, v, note));
            foreach (var v in amaVariants) list.Add((svc101, v, note));
            foreach (var v in rrocVariants) list.Add((svc101, v, note));
        }

        // Add Radio Operator Certificate (svc102) notes from spreadsheet
        var svc102Id = Guid.Parse("50000000-0000-0000-0000-000000000002");
        var svc102NewVariantId = Guid.Parse("60000000-0000-0000-0000-000000000002");
        list.Add((svc102Id, svc102NewVariantId, "Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available."));
        list.Add((svc102Id, svc102NewVariantId, "For Foreign Pilots: The applicant has to show the original pilot license."));

        return list;
    }

    public static Dictionary<string, (Guid Id, string Name, string Desc)> GetBackfillRequirements()
    {
        return new Dictionary<string, (Guid Id, string Name, string Desc)>
        {
            ["AGE"] = (Guid.Parse("70000000-0000-0000-0000-000000000001"), "Proof of Age / Identity", "ANY of the following:\n• Birth Certificate\n• Baptismal Certificate\n• Passport\n• PRC License\n• Driver's License\n• any document which can serve as the basis for age requirement"),
            ["TOR"] = (Guid.Parse("70000000-0000-0000-0000-000000000002"), "Transcript of Records with Special Order (SO)", "Transcript of Records with Special Order (SO)\nNote 1: The applicant has to show the original copy.\nNote 2: SO is not required for State Universities/Colleges"),
            ["PHOTO"] = (Guid.Parse("70000000-0000-0000-0000-000000000003"), "Please provide a clear 1x1 ID picture taken within the last six (6) months.", "Please provide a clear 1x1 ID picture taken within the last six (6) months."),
            ["RATING"] = (Guid.Parse("70000000-0000-0000-0000-000000000004"), "Proof of Rating", "Official proof of rating from past exams."),
            ["ROC"] = (Guid.Parse("70000000-0000-0000-0000-000000000005"), "Radio Operator Certificate", "Copy of Valid Radio Operator Certificate."),
            ["SEMINAR"] = (Guid.Parse("70000000-0000-0000-0000-000000000006"), "Proof of Attendance of Seminar", "Proof of attendance of seminar conducted by NTC accredited Amateur Radio Club."),
            ["AT_ROC"] = (Guid.Parse("70000000-0000-0000-0000-000000000007"), "Amateur Radio Operator Certificate", "Copy of Valid Amateur Radio Operator Certificate."),
            ["CAAP"] = (Guid.Parse("70000000-0000-0000-0000-000000000008"), "CAAP Pilot License", "Aircraft pilot's license or student pilot's license issued by the Civil Aviation Authority of the Philippines (CAAP) / Pilot license issued by the aviation authority of the Administration for foreign applicants"),
            
            ["ROC_RATING"] = (Guid.Parse("70000000-0000-0000-0000-000000000010"), "Original valid Report of Rating", "Original valid Report of Rating*\nNote 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available."),
            ["FOREIGN_PILOT_LICENSE"] = (Guid.Parse("70000000-0000-0000-0000-000000000011"), "Pilot license issued from country of origin", "Pilot license issued from country of origin*\nNote 1: The applicant has to show the original."),
            ["GOOD_MORAL"] = (Guid.Parse("70000000-0000-0000-0000-000000000012"), "Certificate of Good Moral Character", "Certificate of Good Moral Character*"),
            ["GOVT_SERVICE"] = (Guid.Parse("70000000-0000-0000-0000-000000000013"), "Certification that the applicant is in the government service as a radio operator for at least six (6) months and duly certified by the Head of Office", "Certification that the applicant is in the government service as a radio operator for at least six (6) months and duly certified by the Head of Office*"),
            ["GOVT_SEMINAR"] = (Guid.Parse("70000000-0000-0000-0000-000000000014"), "Certificate of Completion of Seminar", "Certificate of Completion of Seminar*"),
            ["COE"] = (Guid.Parse("70000000-0000-0000-0000-000000000015"), "Certificate of Employment", "Certificate of Employment*"),
            ["AMA_ACTIVITIES"] = (Guid.Parse("70000000-0000-0000-0000-000000000016"), "Proof of Amateur Activities", "Proof of Amateur Activities*"),
            ["SUPPLEMENTARY_CERT"] = (Guid.Parse("70000000-0000-0000-0000-000000000017"), "Supplementary Certificate", "Supplementary Certificate*"),
            ["DEALER_PERMIT"] = (Guid.Parse("70000000-0000-0000-0000-000000000018"), "Dealer Permit OR Manufacturer Permit", "Dealer Permit OR Manufacturer Permit*"),
            ["IMPORTED_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000019"), "For imported equipment: (a) Permit to Import, (b) Invoice, (c) Bureau of Customs (BOC) Release Clearance and Import Entry Declaration", "(a) Permit to Import\n(b) Invoice\n(c) Bureau of Customs (BOC) Release Clearance and Import Entry Declaration"),
            ["LOCAL_MFG_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000020"), "For locally-manufactured equipment: Sales and Stocks Report", "Sales and Stocks Report"),
            ["PROVISIONAL_AUTHORITY"] = (Guid.Parse("70000000-0000-0000-0000-000000000021"), "Provisional Authority (PA) OR duly received Motion for Renewal of PA", "Provisional Authority (PA) OR duly received Motion for Renewal of PA*"),
            ["HEADEND_EQUIP_LIST"] = (Guid.Parse("70000000-0000-0000-0000-000000000022"), "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment Prepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)", "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment*\nPrepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)"),
            ["LEASE_AGREEMENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000023"), "Facilities/network lease agreement with duly authorized facilities/network providers", "Facilities/network lease agreement with duly authorized facilities/network providers*"),
            ["VAS_QUARTERLY_REPORTS"] = (Guid.Parse("70000000-0000-0000-0000-000000000024"), "Quarterly Report(s) of VAS Provider", "Quarterly Report(s) of VAS Provider*"),
            ["AUTH_COPY"] = (Guid.Parse("70000000-0000-0000-0000-000000000025"), "Copy of document to be authenticated", "Copy of document to be authenticated*"),
            ["SCANNED_CERT"] = (Guid.Parse("70000000-0000-0000-0000-000000000026"), "Copy of Certificate: A scanned or photocopied copy of the original Radio Operator Certificate.", "Copy of Certificate:\nA scanned or photocopied copy of the original Radio Operator Certificate."),
            ["CORRECTION_NAME_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000027"), "For correction of name, ANY of the following: Valid government ID, Birth Certificate, Marriage Certificate", "For correction of name, ANY of the following:\n• Valid government ID\n• Birth Certificate\n• Marriage Certificate"),
            ["AMA_UPGRADE_RATING"] = (Guid.Parse("70000000-0000-0000-0000-000000000028"), "For Upgrade to higher class, valid Report of Rating", "For Upgrade to higher class, valid Report of Rating"),
            ["COR"] = (Guid.Parse("70000000-0000-0000-0000-000000000029"), "Certificate of Registration", "Certificate of Registration*"),

            // New Permit-specific requirements from the spreadsheet
            ["AM_NEW_STATION_REQ"] = (Guid.Parse("70000000-0000-0000-0000-000000000050"), "For new Amateur Radio Station License: (a) Valid Report of Rating, OR (b) Valid Amateur Radio Operator Certificate", "For new Amateur Radio Station License: (a) Valid Report of Rating, OR (b) Valid Amateur Radio Operator Certificate"),
            ["AM_CHANGE_EQUIP"] = (Guid.Parse("70000000-0000-0000-0000-000000000051"), "For Change of Equipment and/or Additional Equipment: Valid Amateur Radio Station License", "For Change of Equipment and/or Additional Equipment: Valid Amateur Radio Station License"),
            ["AM_SELLER_LICENSE"] = (Guid.Parse("70000000-0000-0000-0000-000000000052"), "Amateur Radio Station License of the Seller", "Amateur Radio Station License of the Seller"),
            ["LETTER_OF_INTENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000053"), "Letter of Intent", "Letter of Intent*"),
            ["FOREIGN_AMA_ROC"] = (Guid.Parse("70000000-0000-0000-0000-000000000054"), "Copy of valid Amateur Radio Operator Certificate issued by the country of citizenship", "Copy of valid Amateur Radio Operator Certificate issued by the country of citizenship*"),
            ["RECIPROCAL_PROOF"] = (Guid.Parse("70000000-0000-0000-0000-000000000055"), "Any proof that his/her country provides the same privilege with the Filipino Amateurs", "Any proof that his/her country provides the same privilege with the Filipino Amateurs*"),
            ["PARA_ENDORSEMENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000056"), "Endorsement from recognized national organization (i.e. Philippine Amateur Radio Association (PARA), Inc.)", "Endorsement from recognized national organization (i.e. Philippine Amateur Radio Association (PARA), Inc.)*"),
            ["SPECIAL_PERMIT"] = (Guid.Parse("70000000-0000-0000-0000-000000000057"), "Special Permit", "Special Permit*"),
            ["LETTER_REQUEST_EVENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000058"), "Letter Request stating nature, duration, etc. of event", "Letter Request stating, among others, nature of event, duration of event, etc.*"),
            ["AERO_FREQ_ASSIGN"] = (Guid.Parse("70000000-0000-0000-0000-000000000059"), "For new Aeronautical Fixed Station: Frequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)", "Frequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)"),
            ["AERO_STATION_LICENSE_SELLER"] = (Guid.Parse("70000000-0000-0000-0000-000000000060"), "Aeronautical Station License of the Seller", "Aeronautical Station License of the Seller"),
            ["MARINA_REGISTRY"] = (Guid.Parse("70000000-0000-0000-0000-000000000061"), "Copy of Certificate of Vessel Registry and Ownership OR LGU Permit OR Ship Station License", "Copy of ANY of the following:\n• Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)\n• Ship Station License*"),
            ["RADIO_STATION_PERMIT"] = (Guid.Parse("70000000-0000-0000-0000-000000000062"), "Radio Station Permit", "Radio Station Permit*"),
            ["SHIP_STATION_LICENSE_SELLER"] = (Guid.Parse("70000000-0000-0000-0000-000000000063"), "Ship Station License of the Seller", "Ship Station License of the Seller"),
            ["SHIP_STATION_LICENSE_DOMESTIC"] = (Guid.Parse("70000000-0000-0000-0000-000000000064"), "Ship Station License(s) for ship(s) engaged in Domestic Trade", "Ship Station License(s) for ship(s) engaged in Domestic Trade*"),
            ["PUBLIC_COASTAL_PLAN"] = (Guid.Parse("70000000-0000-0000-0000-000000000065"), "Engineering Plans signed and sealed by a PECE (Network Diagram, Coordinates Map, Antenna Plan)", "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:\n1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)*"),
            ["PTE_PROVISIONAL_AUTHORITY"] = (Guid.Parse("70000000-0000-0000-0000-000000000066"), "Copy of Provisional Authority OR CPCN", "Copy of ANY of the following:\n• Provisional Authority\n• Certificate of Public Convenience and Necessity*"),
            ["PUBLIC_COASTAL_LICENSE_SELLER"] = (Guid.Parse("70000000-0000-0000-0000-000000000067"), "Public Coastal Station License of the Seller", "Public Coastal Station License of the Seller"),
            ["EQUIP_DATASHEET"] = (Guid.Parse("70000000-0000-0000-0000-000000000068"), "Datasheet of proposed radio equipment", "Datasheet of proposed radio equipment*"),
            ["LINK_BUDGET"] = (Guid.Parse("70000000-0000-0000-0000-000000000069"), "Link Budget Analysis", "Link Budget Analysis"),
            ["VSAT_TLA"] = (Guid.Parse("70000000-0000-0000-0000-000000000070"), "For VSAT: Transponder Lease Agreement (TLA) OR assigned transponder certification", "For VSAT, ANY of the following:\n• Copy of valid Transponder Lease Agreement (TLA) with any satellite operator\n• Certification of assigned transponder(s) with technical parameters"),
            ["PRIVATE_ENTITY_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000071"), "For Private Entities: SEC/DTI Registration OR Business/Mayor's Permit", "For Private Entities, ANY of the following:\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit*"),
            ["CIVIC_GROUP_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000072"), "For Civic Action Groups: SEC/DTI/Business Permit, Officers/Members List, MOA", "For Civic Action Groups:\n(a) Copy of SEC Registration, OR Copy of DTI Registration, OR Copy of valid Business/Mayor's Permit OR Copy of existing Radio Station License from national office\n(b) List of Officers and at least 50 active Members\n(c) Copy of Memorandum of Agreement with the government & non-government organizations*"),
            ["GOVT_LETTER_INTENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000073"), "For Government Entities: Letter of Intent signed by Head of Agency", "For Government Entities:\n•Letter of Intent duly signed by the head of the agency or his duly authorized representative stating technical information and availability of funds*"),
            ["RADIO_STATION_LICENSE"] = (Guid.Parse("70000000-0000-0000-0000-000000000074"), "Radio Station License", "Radio Station License*"),
            ["LICENSE_SELLER"] = (Guid.Parse("70000000-0000-0000-0000-000000000075"), "License of the Seller", "License of the Seller"),
            ["PERMIT_PURCHASE_POSSESS"] = (Guid.Parse("70000000-0000-0000-0000-000000000076"), "Permit to Purchase/Possess", "Permit to Purchase/Possess*"),
            ["EQUIP_SOURCE_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000077"), "Document indicating source of equipment (OR/Invoice, Import Invoice & Permit, or Permit to Possess)", "Copy of document indicating source of equipment:\n(a) For locally-sourced equipment, OR or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Supplier Invoice AND Permit to Import, OR\n(c) For registered equipment, Permit to Possess*"),
            ["VEHICLE_OR_CR"] = (Guid.Parse("70000000-0000-0000-0000-000000000078"), "For land mobile station: Vehicle's valid OR/CR", "For land mobile station: Vehicle's valid OR/CR"),
            ["DEMO_PLANS"] = (Guid.Parse("70000000-0000-0000-0000-000000000079"), "For Demo: Engineering Plans (Network Diagram, Coordinates Map) signed and sealed by a PECE", "For Demo:\n1. Network Diagram indicating locations of all stations and proposed frequency band\n2. Map showing exact location with coordinates*"),
            ["DEMO_TLA"] = (Guid.Parse("70000000-0000-0000-0000-000000000080"), "If VSAT Outdoor Unit is used in Demo: Transponder Lease Agreement (TLA)", "If VSAT Outdoor Unit will be utilized in the Demo: Transponder Lease Agreement (TLA)*"),
            ["EQUIP_TRANSPORT_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000081"), "Copy of Permit to Purchase/Possess/Transport/Transfer or Construction Permit/Radio Station License", "Copy of ANY of the following:\n• Permit to Purchase\n• Permit to Possess\n• Construction Permit/Radio Station License\n• Permit to Transfer\n• Radio Communication Equipment Dealer Permit*"),
            ["DEALER_REG_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000082"), "Copy of SEC/DTI Registration OR Business/Mayor's Permit (purpose must include accreditation)", "Copy of ANY of the following:\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\nNote: Purpose must include information related to the accreditation applied for.*"),
            ["PAID_UP_CAPITAL_350K"] = (Guid.Parse("70000000-0000-0000-0000-000000000083"), "Proof of Paid-Up Capital (Minimum of PHP350,000)", "Proof of Paid-Up Capital: Minimum of PHP350,000*"),
            ["TEST_EQUIP_DEALER"] = (Guid.Parse("70000000-0000-0000-0000-000000000084"), "List of Test Equipment and Measuring Instruments (Section 6.1, MC 2-05-88)", "List of Test Equipment and Measuring Instruments (Refer to Section 6.1, M.C. No. 2-05-88)"),
            ["TECH_EMPLOYMENT_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000085"), "COE and valid license/ROC of at least one (1) qualified Radio Technician employed full-time", "Certificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the PRC OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis"),
            ["ECE_EMPLOYMENT_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000086"), "COE and valid license of Supervising Electronics Engineer (ECE) or PECE", "Certificate of Employment and copy of valid license of Supervising Electronics Engineer (ECE) or Professional Electronics Engineer (PECE)"),
            ["DEALER_PERMIT_DOC"] = (Guid.Parse("70000000-0000-0000-0000-000000000087"), "Radio Communication Equipment Dealer Permit", "Radio Communication Equipment Dealer Permit*"),
            ["PAID_UP_CAPITAL_1M"] = (Guid.Parse("70000000-0000-0000-0000-000000000088"), "Proof of Paid-Up Capital (Minimum of PHP1,000,000)", "Proof of Paid-Up Capital: Minimum of PHP1,000,000*"),
            ["TEST_EQUIP_MFG"] = (Guid.Parse("70000000-0000-0000-0000-000000000089"), "List of Test Equipment and Measuring Instruments (Section 6.2, MC 2-05-88)", "List of Test Equipment and Measuring Instruments (Refer to Section 6.2, M.C. No. 2-05-88)*"),
            ["PECE_EMPLOYMENT_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000090"), "COE and valid license of supervising Professional Electronics Engineer (PECE)", "Certificate of Employment and copy of valid license of supervising Professional Electronics Engineer (PECE)*"),
            ["MFG_PERMIT_DOC"] = (Guid.Parse("70000000-0000-0000-0000-000000000091"), "Radio Communication Equipment Manufacturer Permit", "Radio Communication Equipment Manufacturer Permit*"),
            ["PAID_UP_CAPITAL_100K"] = (Guid.Parse("70000000-0000-0000-0000-000000000092"), "Proof of Paid-Up Capital (Minimum of PHP100,000)", "Proof of Paid-Up Capital: Minimum of PHP100,000*"),
            ["SERVICE_CENTER_PERMIT_DOC"] = (Guid.Parse("70000000-0000-0000-0000-000000000093"), "Radio Communication Equipment Service Center Permit", "Radio Communication Equipment Service Center Permit*"),
            ["MP_DEALERSHIP_AGREEMENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000094"), "Dealership agreement from Mobile Phone Distributor/Supplier duly accredited by the NTC", "Dealership agreement from Mobile Phone Distributor/Supplier duly accredited by the NTC*"),
            ["MP_PAID_UP_CAPITAL_100K"] = (Guid.Parse("70000000-0000-0000-0000-000000000095"), "Proof of Paid-Up Capitalization (Minimum of PHP 100,000.00)", "Proof of Paid-Up Capitalization: Minimum of PHP 100,000.00, duly certified by the Treasurer/Partners/Owner*"),
            ["MP_DEALER_PERMIT_DOC"] = (Guid.Parse("70000000-0000-0000-0000-000000000096"), "Mobile Phone Dealer Permit", "Mobile Phone Dealer Permit*"),
            ["MP_RETAILER_REG_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000097"), "Copy of SEC/DTI Registration OR Business/Mayor's Permit", "Copy of SEC/DTI Registration OR Business/Mayor's Permit*"),
            ["MP_RETAILER_PAID_UP_CAPITAL_50K"] = (Guid.Parse("70000000-0000-0000-0000-000000000098"), "Proof of Paid-Up Capitalization (Minimum of PHP 50,000.00)", "Proof of Paid-Up Capitalization: Minimum of PHP 50,000.00, duly certified by the Treasurer/Partners/Owner*"),
            ["MP_RETAILER_PERMIT_DOC"] = (Guid.Parse("70000000-0000-0000-0000-000000000099"), "Mobile Phone Retailer/Reseller Permit", "Mobile Phone Retailer/Reseller Permit*"),
            ["MP_RETAILER_MOD_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000100"), "Photocopy of SEC/DTI/Business Permit for change of name, OR Business Permit for change of address", "If modification is due to: (2.1) Change of Name of Permittee (Photocopy of SEC/DTI/Business Permit) OR (2.2) Change of Company Address (Photocopy of valid Business/Mayor's Permit)*"),
            ["MP_TEST_EQUIP"] = (Guid.Parse("70000000-0000-0000-0000-000000000101"), "List of Test Equipment and Measuring Instruments", "List of Test Equipment and Measuring Instruments*"),
            ["MP_TECH_EMPLOYMENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000102"), "Certificate of employment of qualified electronic technician who completed a formal training course", "Certificate of employment of qualified electronic technician who has completed a formal training course in the repair, servicing and maintenance of mobile phone*"),
            ["MP_SERVICE_CENTER_PERMIT_DOC"] = (Guid.Parse("70000000-0000-0000-0000-000000000103"), "Mobile Phone Service Center Permit", "Mobile Phone Service Center Permit*"),
            ["COPY_PERMIT_AUTH"] = (Guid.Parse("70000000-0000-0000-0000-000000000104"), "Copy of Permit: A scanned or photocopied copy of the original permit.", "Copy of Permit: A scanned or photocopied copy of the original permit."),

            // New License-specific requirements
            ["AM_LICENSE_EQUIP_SOURCE"] = (Guid.Parse("70000000-0000-0000-0000-000000000200"), "Copy of document indicating source of equipment", "Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer AND Original AT-RSL of the Seller\n\nNote 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available."),
            ["PHOTOCOPY_AT_RSL"] = (Guid.Parse("70000000-0000-0000-0000-000000000201"), "Photocopy of AT-RSL", "Photocopy of AT-RSL*"),
            ["LIFETIME_AMA_RSL_REQUEST"] = (Guid.Parse("70000000-0000-0000-0000-000000000202"), "Letter request for Issuance of a Lifetime Radio Station License", "Letter request for Issuance of a Lifetime Radio Station License*"),
            ["AMA_CLUB_GOOD_STANDING"] = (Guid.Parse("70000000-0000-0000-0000-000000000203"), "Certificate of Good Standing as a Member from a registered amateur club or association with the NTC", "Certificate of Good Standing as a Member from a registered amateur club or association with the NTC*"),
            ["AMA_CLASS_A_RSL"] = (Guid.Parse("70000000-0000-0000-0000-000000000204"), "Amateur Class 'A' Radio Station License", "Amateur Class 'A' Radio Station License*"),
            ["AMA_15_CONSECUTIVE_YEARS_PROOF"] = (Guid.Parse("70000000-0000-0000-0000-000000000205"), "Proof of amateur service of at least fifteen (15) consecutive years", "Proof of amateur service of at least fifteen (15) consecutive years*"),
            ["AMA_CLUB_EQUIP_SOURCE"] = (Guid.Parse("70000000-0000-0000-0000-000000000206"), "Copy of document indicating source of equipment", "Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer"),
            ["AMA_CLUB_RSL"] = (Guid.Parse("70000000-0000-0000-0000-000000000207"), "Amateur Club Radio Station License", "Amateur Club Radio Station License*"),
            ["AMA_CLUB_TRUSTEE_OFFICERS_MEMBERS"] = (Guid.Parse("70000000-0000-0000-0000-000000000208"), "List providing the licensed Amateur Club Trustee, Officers and Members of the organization", "List providing the licensed Amateur Club Trustee, Officers and Members of the organization*\nNote 1: List must contain a minimum membership of twenty-five (25) duly licensed amateur radio operators.\nNote 2: The licenses of prospective members shall be validated.\nNote 3: The Amateur Club Trustee designated by the Club must be a licensed Class A for at least five (5) years.\nNote 4: The Amateur Fixed Station shall be issued only to the Club Trustee"),
            ["AERO_AIRCRAFT_LICENSE_AUTH_COPY"] = (Guid.Parse("70000000-0000-0000-0000-000000000210"), "Authenticated copy of existing aircraft station license", "Authenticated copy of existing aircraft station license*"),
            ["AERO_FIXED_EQUIP_SOURCE"] = (Guid.Parse("70000000-0000-0000-0000-000000000211"), "Copy of document indicating source of equipment", "Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import"),
            ["AERO_ROC_2PHN"] = (Guid.Parse("70000000-0000-0000-0000-000000000212"), "Valid Radio Operator Certificate (at least 2PHN)", "Valid Radio Operator Certificate (at least 2PHN)*"),
            ["NTC_INSPECTION_REPORT_SWORN_STATEMENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000213"), "NTC Inspection Report of the subject radio station", "NTC Inspection Report of the subject radio station\nDownload the \"SWORN STATEMENT and DECLARATION\" Form\nhttps://drive.google.com/file/d/1K_X2h6zOzn48voUmJOq6TOhBqZPPQ2J4/view?usp=sharing"),
            ["PHOTOCOPY_RSL"] = (Guid.Parse("70000000-0000-0000-0000-000000000214"), "Photocopy of RSL", "Photocopy of RSL*\nUpload a clear photocopy of your RSL in JPG/PNG/PDF format"),
            ["AERO_CAAP_REGISTRATION"] = (Guid.Parse("70000000-0000-0000-0000-000000000215"), "Valid Certificate of Registration issued by the Civil Aviation Authority of the Philippines (CAAP)", "Valid Certificate of Registration issued by the Civil Aviation Authority of the Philippines (CAAP)*"),
            ["AERO_REI_REPORT"] = (Guid.Parse("70000000-0000-0000-0000-000000000216"), "Valid latest Radio, Electronics and Instruments (REI) Inspection Report duly signed by the authorized CAAP Technician", "Valid latest Radio, Electronics and Instruments (REI) Inspection Report duly signed by the authorized Technician of the Civil Aviation Authority of the Philippines (CAAP)"),
            ["AERO_RROC_AIRCRAFT"] = (Guid.Parse("70000000-0000-0000-0000-000000000217"), "Restricted Radio Operator Certificate - Aircraft", "Restricted Radio Operator Certificate - Aircraft*"),
            ["AIRCRAFT_STATION_LICENSE"] = (Guid.Parse("70000000-0000-0000-0000-000000000218"), "Aircraft Station License", "Aircraft Station License*"),
            ["MAR_ROC_2ND_CLASS"] = (Guid.Parse("70000000-0000-0000-0000-000000000220"), "Radio Operator Certificate (at least 2nd Class Radiotelephone Operator)", "Radio Operator Certificate*\n(at least 2nd Class Radiotelephone Operator)"),
            ["SHIP_STATION_LICENSE"] = (Guid.Parse("70000000-0000-0000-0000-000000000221"), "Ship Station License", "Ship Station License"),
            ["SHIP_STATION_LICENSE_REQUIRED"] = (Guid.Parse("70000000-0000-0000-0000-000000000222"), "Ship Station License", "Ship Station License*"),
            ["MAR_CPR_MARINA"] = (Guid.Parse("70000000-0000-0000-0000-000000000223"), "Certificate of Philippine Registry (CPR) issued by the Maritime Industry Authority (MARINA)", "Certificate of Philippine Registry (CPR) issued by the Maritime Industry Authority (MARINA)*"),
            ["MAR_AA_INCLUSION"] = (Guid.Parse("70000000-0000-0000-0000-000000000224"), "Certificate of Inclusion from a Recognized Private Operating Agency or Accounting Authority (AA)", "Certificate of Inclusion from a Recognized Private Operating Agency or Accounting Authority (AA)*"),
            ["MAR_SBME_AGREEMENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000225"), "Shore-Based Maintenance Entity (SBME) Agreement from duly accredited SBME", "Shore-Based Maintenance Entity (SBME) Agreement from duly accredited SBME*"),
            ["MAR_GOC_DECK_OFFICERS"] = (Guid.Parse("70000000-0000-0000-0000-000000000226"), "General Operator Certificate (GOC) of two (2) deck officers (i.e. First Officer, or Second Officer, or Third Officer)", "General Operator Certificate (GOC) of two (2) deck officers (i.e. First Officer, or Second Officer, or Third Officer)*"),
            ["MAR_DECK_OFFICERS_EMPLOYMENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000227"), "Copy of Contract of Employment of the deck officers issued by the POEA, OR Certificate of Employment issued by Shipping Company", "Copy of ANY of the following:\n• Contract of Employment of the deck officers issued by the Philippine Overseas Employment Administration (POEA), OR\n• Certificate of Employment issued by Shipping Company"),
            ["SHIP_EARTH_LICENSE_REQUIRED"] = (Guid.Parse("70000000-0000-0000-0000-000000000228"), "Ship Earth License", "Ship Earth License*"),
            ["PERMIT_PURCHASE_POSSESS_OPT"] = (Guid.Parse("70000000-0000-0000-0000-000000000229"), "Permit to Purchase/Possess", "Permit to Purchase/Possess"),
            ["APPROPRIATE_VALID_ROC"] = (Guid.Parse("70000000-0000-0000-0000-000000000230"), "Appropriate and valid Radio Operator Certificate", "Appropriate and valid Radio Operator Certificate"),
            ["TVRO_ENGINEERING_PLANS"] = (Guid.Parse("70000000-0000-0000-0000-000000000240"), "Engineering Plans and Diagrams signed and sealed by a Professional Electronics Engineer (PECE)", "Engineering Plans and Diagrams signed and sealed by a Professional Electronics Engineer (PECE), to wit:\nPlan 1: Map showing the exact location of the TVRO station with geographical coordinates\nPlan 2: Block Diagram of the proposed TVRO system\nPlan 3: Antenna System (Type, Gain, Azimuth, Height Above Ground)*"),
            ["PECE_ECE_EMPLOYMENT_LICENSE"] = (Guid.Parse("70000000-0000-0000-0000-000000000241"), "Certificate of Employment and license of the Supervising PECE/ECE", "Certificate of Employment and license of the Supervising PECE/ECE*"),
            ["TECH_EMPLOYMENT_ROC"] = (Guid.Parse("70000000-0000-0000-0000-000000000242"), "Certificate of Employment and ROC of radio technician", "Certificate of Employment and ROC of radio technician*"),
            ["TVRO_STATION_LICENSE_REQUIRED"] = (Guid.Parse("70000000-0000-0000-0000-000000000243"), "TVRO Station License", "TVRO Station License*"),
            ["CATV_CA_OR_PA_MOTION"] = (Guid.Parse("70000000-0000-0000-0000-000000000250"), "Certificate of Authority (CA) OR duly received Motion for Renewal of PA", "Certificate of Authority (CA) OR duly received Motion for Renewal of PA*"),
            ["CATV_ENGINEERING_PLANS"] = (Guid.Parse("70000000-0000-0000-0000-000000000251"), "Engineering Plans signed and sealed by a Professional Electronics Engineer (PECE)", "Engineering Plans signed and sealed by a Professional Electronics Engineer (PECE)*"),
            ["CATV_PROGRAMS_LIST"] = (Guid.Parse("70000000-0000-0000-0000-000000000252"), "List of Programs Offered - Channel, Program, and Signal Source", "List of Programs Offered - Channel, Program, and Signal Source*"),
            ["CATV_STATION_LICENSE_REQUIRED"] = (Guid.Parse("70000000-0000-0000-0000-000000000253"), "CATV Station License", "CATV Station License*"),
            ["COPY_LIC_PERMIT"] = (Guid.Parse("70000000-0000-0000-0000-000000000260"), "Copy of Permit: A scanned or photocopied copy of the original permit.", "Copy of Permit:\nA scanned or photocopied copy of the original permit."),
            ["ROC_PHOTO"] = (Guid.Parse("70000000-0000-0000-0000-000000000261"), "For Radio Operator Certificate: Please provide a clear 1x1 ID picture taken within the last six (6) months.", "For Radio Operator Certificate:\nPlease provide a clear 1x1 ID picture taken within the last six (6) months.")
        };
    }

    public static List<(Guid VariantId, Guid ReqId, bool IsRequired, string? ContextKey)> GetBackfillVariantRequirements()
    {
        return new List<(Guid VariantId, Guid ReqId, bool IsRequired, string? ContextKey)>
        {
            // Radiotelegraphy (RTG)
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000002"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000032"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000032"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000033"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000033"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, null),

            // Radiotelephony (RTP)
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000002"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000035"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000035"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000036"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000036"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, null),

            // Amateur (AMA)
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000006"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000038"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000038"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000039"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000039"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true, null),

            // RROC Aircraft
            (Guid.Parse("60000000-0000-0000-0000-000000000040"), Guid.Parse("70000000-0000-0000-0000-000000000008"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000040"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000041"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000041"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true, null),

            // --- ROC Certificates (excluding Amateur) ---
            // CommercialROC - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000010"), true, "CommercialROC"), // ROC_RATING
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "CommercialROC"), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000005"), false, "CommercialROC"), // ROC (upgrade option)
            // CommercialROC - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "CommercialROC"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "CommercialROC"), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false, "CommercialROC"), // CORRECTION_NAME_DOCS

            // RROC-Aircraft - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000010"), true, "RROC-Aircraft"), // ROC_RATING
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "RROC-Aircraft"), // PHOTO
            // RROC-Aircraft - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "RROC-Aircraft"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "RROC-Aircraft"), // PHOTO
            // RROC-Aircraft - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "RROC-Aircraft"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "RROC-Aircraft"), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false, "RROC-Aircraft"), // CORRECTION_NAME_DOCS

            // TP RROC-Aircraft - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000011"), true, "TP RROC-Aircraft"), // FOREIGN_PILOT_LICENSE
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "TP RROC-Aircraft"), // PHOTO
            // TP RROC-Aircraft - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "TP RROC-Aircraft"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "TP RROC-Aircraft"), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false, "TP RROC-Aircraft"), // CORRECTION_NAME_DOCS

            // GROC - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000012"), true, "GROC"), // GOOD_MORAL
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000013"), true, "GROC"), // GOVT_SERVICE
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000014"), true, "GROC"), // GOVT_SEMINAR
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "GROC"), // PHOTO
            // GROC - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "GROC"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, "GROC"), // COE
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "GROC"), // PHOTO
            // GROC - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "GROC"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "GROC"), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false, "GROC"), // CORRECTION_NAME_DOCS

            // RROC-Land Mobile - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000014"), true, "RROC-Land Mobile"), // GOVT_SEMINAR
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "RROC-Land Mobile"), // PHOTO
            // RROC-Land Mobile - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "RROC-Land Mobile"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "RROC-Land Mobile"), // PHOTO
            // RROC-Land Mobile - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "RROC-Land Mobile"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "RROC-Land Mobile"), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false, "RROC-Land Mobile"), // CORRECTION_NAME_DOCS

            // SROP - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000014"), true, "SROP"), // GOVT_SEMINAR
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "SROP"), // PHOTO
            // SROP - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "SROP"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "SROP"), // PHOTO
            // SROP - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, "SROP"), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "SROP"), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false, "SROP"), // CORRECTION_NAME_DOCS

            // --- Amateur Certificates ---
            // AmateurROC - New
            (Guid.Parse("60000000-0000-0000-0000-000000000004"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true, "AmateurROC"), // RATING
            (Guid.Parse("60000000-0000-0000-0000-000000000004"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "AmateurROC"), // PHOTO
            // AmateurROC - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true, "AmateurROC"), // AT_ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true, "AmateurROC"), // AMA_ACTIVITIES
            (Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "AmateurROC"), // PHOTO
            // AmateurROC - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true, "AmateurROC"), // AT_ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "AmateurROC"), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000028"), false, "AmateurROC"), // AMA_UPGRADE_RATING

            // LifetimeSupplementaryCert - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000017"), true, "LifetimeSupplementaryCert"), // SUPPLEMENTARY_CERT

            // --- Certificate of Registration (WDN/SRD/RFID) ---
            // Dealers - New
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000018"), true, "Dealers"), // DEALER_PERMIT
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000019"), false, "Dealers"), // IMPORTED_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000020"), false, "Dealers"), // LOCAL_MFG_DOCS
            // Non-Dealers - New
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000019"), false, "Non-Dealers"), // IMPORTED_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000020"), false, "Non-Dealers"), // LOCAL_MFG_DOCS

            // --- TVRO Registration Certificate ---
            // Commercial TVRO
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true, "Commercial"), // PROVISIONAL_AUTHORITY
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true, "Commercial"), // HEADEND_EQUIP_LIST
            // Non-Commercial TVRO
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true, "Non-Commercial"), // HEADEND_EQUIP_LIST

            // --- VAS Provider Registration Renewal ---
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000029"), true, null), // COR (VAS)
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000023"), true, null), // LEASE_AGREEMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000024"), true, null), // VAS_QUARTERLY_REPORTS

            // --- Certified / Duplicate Copy (Copy of Certificates) ---
            // Duplicate Copy
            (Guid.Parse("60000000-0000-0000-0000-000000000050"), Guid.Parse("70000000-0000-0000-0000-000000000026"), true, null), // SCANNED_CERT
            (Guid.Parse("60000000-0000-0000-0000-000000000050"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null), // PHOTO
            // Certified True Copy
            (Guid.Parse("60000000-0000-0000-0000-000000000051"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true, null), // AUTH_COPY

            // --- PERMITS IN THE AMATEUR SERVICE (svc109) ---
            // Amateur Radio Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000060"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000060"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true, null),
            // Amateur Radio Station Permit Permit to Possess for Storage
            (Guid.Parse("60000000-0000-0000-0000-000000000061"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000061"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true, null),
            // Amateur Radio Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000062"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000062"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true, null),
            // Amateur Radio Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000063"), Guid.Parse("70000000-0000-0000-0000-000000000052"), true, null),
            // Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor (Class A, B, C)
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class C"),
            // Special Permit for Use of Vanity Call Sign (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000057"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000058"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, null),

            // --- PERMITS IN THE AERONAUTICAL SERVICE (svcAero) ---
            // Aeronautical Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000070"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aeronautical Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aeronautical Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aeronautical Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000073"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true, null),
            // Aircraft Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000074"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aircraft Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aircraft Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aircraft Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000077"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true, null),

            // --- PERMITS IN THE MARITIME SERVICE (svcMar) ---
            // Ship Station Permit to Purchase (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000080"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true, null),
            // Ship Station Permit to Possess (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000081"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true, null),
            // Ship Station Permit to Possess (Storage)
            (Guid.Parse("60000000-0000-0000-0000-000000000082"), Guid.Parse("70000000-0000-0000-0000-000000000062"), true, null),
            // Ship Station Permit to Purchase/Possess (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000083"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true, null),
            // Ship Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000084"), Guid.Parse("70000000-0000-0000-0000-000000000063"), true, null),
            // Private Coastal Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000085"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true, null),
            // Private Coastal Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000086"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true, null),
            // Private Coastal Station Permit to Purchase /Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000087"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true, null),
            // Public Coastal Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true, null),
            // Public Coastal Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true, null),
            // Public Coastal Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true, null),
            // Public Coastal Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000091"), Guid.Parse("70000000-0000-0000-0000-000000000067"), true, null),

            // --- PERMITS TO FIXED & LAND MOBILE STATIONS (svcFlm) ---
            // Permit to Purchase (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true, null),

            // Permit to Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true, null),

            // Permit to Purchase/Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true, null),

            // Permit to Possess for Storage
            (Guid.Parse("60000000-0000-0000-0000-000000000103"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            // Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000104"), Guid.Parse("70000000-0000-0000-0000-000000000075"), true, null),

            // Construction Permit (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, null), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // Engineering Plan
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true, null), // Equip Source
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000078"), false, null), // OR/CR
            // Construction Permit (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000116"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),

            // Temporary Permit to Demonstrate and Propagate (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000080"), false, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),

            // --- PERMITS FOR PUBLIC TELECOMMUNICATIONS ENTITIES (PTEs) (svcPte) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000120"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),

            // --- PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT (svcEquip) ---
            // Permit to Transport
            (Guid.Parse("60000000-0000-0000-0000-000000000130"), Guid.Parse("70000000-0000-0000-0000-000000000081"), true, null),
            
            // Dealer Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000083"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000084"), false, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000135"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true, null),

            // Manufacturer Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000088"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000089"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000137"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class C"),
            // Special Permit for Use of Vanity Call Sign (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000057"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000058"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true, null),

            // --- PERMITS IN THE AERONAUTICAL SERVICE (svcAero) ---
            // Aeronautical Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000070"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aeronautical Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aeronautical Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aeronautical Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000073"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true, null),
            // Aircraft Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000074"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aircraft Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aircraft Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true, null),
            // Aircraft Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000077"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true, null),

            // --- PERMITS IN THE MARITIME SERVICE (svcMar) ---
            // Ship Station Permit to Purchase (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000080"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true, null),
            // Ship Station Permit to Possess (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000081"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true, null),
            // Ship Station Permit to Possess (Storage)
            (Guid.Parse("60000000-0000-0000-0000-000000000082"), Guid.Parse("70000000-0000-0000-0000-000000000062"), true, null),
            // Ship Station Permit to Purchase/Possess (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000083"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true, null),
            // Ship Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000084"), Guid.Parse("70000000-0000-0000-0000-000000000063"), true, null),
            // Private Coastal Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000085"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true, null),
            // Private Coastal Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000086"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true, null),
            // Private Coastal Station Permit to Purchase /Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000087"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true, null),
            // Public Coastal Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true, null),
            // Public Coastal Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true, null),
            // Public Coastal Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true, null),
            // Public Coastal Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000091"), Guid.Parse("70000000-0000-0000-0000-000000000067"), true, null),

            // --- PERMITS TO FIXED & LAND MOBILE STATIONS (svcFlm) ---
            // Permit to Purchase (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true, null),

            // Permit to Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true, null),

            // Permit to Purchase/Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true, null),

            // Permit to Possess for Storage
            (Guid.Parse("60000000-0000-0000-0000-000000000103"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            // Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000104"), Guid.Parse("70000000-0000-0000-0000-000000000075"), true, null),

            // Construction Permit (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true, null), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null), // Engineering Plan
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true, null), // Equip Source
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000078"), false, null), // OR/CR
            // Construction Permit (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000116"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),

            // Temporary Permit to Demonstrate and Propagate (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000080"), false, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true, null),

            // --- PERMITS FOR PUBLIC TELECOMMUNICATIONS ENTITIES (PTEs) (svcPte) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000120"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),

            // --- PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT (svcEquip) ---
            // Permit to Transport
            (Guid.Parse("60000000-0000-0000-0000-000000000130"), Guid.Parse("70000000-0000-0000-0000-000000000081"), true, null),
            
            // Dealer Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000083"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000084"), false, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000135"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true, null),

            // Manufacturer Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000088"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000089"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000137"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true, null),

            // Service Center Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000092"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000089"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000086"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000093"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000139"), Guid.Parse("70000000-0000-0000-0000-000000000093"), true, null),

            // --- PERMITS FOR MOBILE PHONE (svcMp) ---
            // Dealer Permit NEW (MAIN / BRANCH)
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, "MAIN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true, "MAIN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000095"), true, "MAIN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, "BRANCH"),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true, "BRANCH"),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000095"), true, "BRANCH"),

            // Dealer Permit RENEWAL (MAIN / BRANCH)
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true, "MAIN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, "MAIN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true, "MAIN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true, "BRANCH"),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, "BRANCH"),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true, "BRANCH"),

            // Dealer Permit MODIFICATION (MAIN / BRANCH)
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true, "MAIN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true, "MAIN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true, "BRANCH"),
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true, "BRANCH"),

            // Retailer/Reseller Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000141"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000141"), Guid.Parse("70000000-0000-0000-0000-000000000098"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000148"), Guid.Parse("70000000-0000-0000-0000-000000000099"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000148"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000149"), Guid.Parse("70000000-0000-0000-0000-000000000099"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000149"), Guid.Parse("70000000-0000-0000-0000-000000000100"), true, null),

            // Mobile Phone Service Center Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000101"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000102"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000103"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000101"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000102"), true, null),

            (Guid.Parse("60000000-0000-0000-0000-000000000153"), Guid.Parse("70000000-0000-0000-0000-000000000103"), true, null),

            // --- COPY OF PERMITS (svcCopy) ---
            // Certified True Copy
            (Guid.Parse("60000000-0000-0000-0000-000000000150"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true, null),
            // Duplicate Copy
            (Guid.Parse("60000000-0000-0000-0000-000000000151"), Guid.Parse("70000000-0000-0000-0000-000000000104"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000151"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),

            // --- LICENSE IN THE AMATEUR SERVICE (svcLicAma) ---
            // Amateur Radio Station License (NEW) - Class A, B, C, D
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class A"),

            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class B"),

            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class C"),

            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, "Class D"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true, "Class D"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true, "Class D"),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class D"),

            // Amateur Radio Station License (RENEWAL) - Class A, B, C, D
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true, "Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class A"),

            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true, "Class B"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class B"),

            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true, "Class C"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class C"),

            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true, "Class D"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true, "Class D"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, "Class D"),

            // Amateur Radio Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000202"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),

            // Lifetime Amateur Radio Station License for Class A
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000202"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000203"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000204"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000205"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true, null),

            // Amateur Club Radio Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000204"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000204"), Guid.Parse("70000000-0000-0000-0000-000000000206"), true, null),

            // Amateur Club Radio Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000205"), Guid.Parse("70000000-0000-0000-0000-000000000207"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000205"), Guid.Parse("70000000-0000-0000-0000-000000000208"), true, null),

            // Amateur Club Radio Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000206"), Guid.Parse("70000000-0000-0000-0000-000000000207"), true, null),

            // Fixed Aeronautical Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000210"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000211"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Fixed Aeronautical Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000214"), true, null),

            // Fixed Aeronautical Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000214"), true, null),

            // Aircraft Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000215"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000216"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000217"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Aircraft Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000218"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000215"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000216"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000217"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Aircraft Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000215"), Guid.Parse("70000000-0000-0000-0000-000000000218"), true, null),

            // Ship Station License Domestic Trade (Without originally-installed equipment) (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Ship Station License Domestic Trade (With originally-installed equipment) (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Ship Station License Domestic Trade (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000221"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Ship Station License Domestic Trade (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000223"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true, null),

            // Ship Station License International Trade (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000223"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000224"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000225"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000226"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000227"), true, null),

            // Ship Station License International Trade (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000225"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true, null),

            // Ship Earth Station License International Trade (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000228"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000223"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000224"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000225"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000226"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000227"), true, null),

            // Ship Earth Station License International Trade (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000227"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true, null),

            // Private Coastal Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000229"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Private Coastal Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Private Coastal Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000230"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000230"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true, null),

            // Public Coastal Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),

            // Public Coastal Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true, null),

            // Public Coastal Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000233"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),

            // Radio Station License (NEW) - Fixed & Land Mobile Service
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000230"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000078"), false, null),

            // Radio Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000241"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000241"), Guid.Parse("70000000-0000-0000-0000-000000000230"), true, null),

            // Radio Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000242"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),

            // Other Radio Station Licenses (Microwave, VSAT, Public Trunked, BWA, WDN, BTS)
            (Guid.Parse("60000000-0000-0000-0000-000000000250"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000251"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000252"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000253"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000254"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000255"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000256"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000257"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000258"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000259"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000260"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000261"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000262"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true, null),

            // TVRO Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000240"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true, null),

            // TVRO Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000243"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true, null),

            // CATV Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000250"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000251"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000252"), true, null),

            // CATV Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000253"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000250"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000252"), true, null),

            // Certified True Copy (License)
            (Guid.Parse("60000000-0000-0000-0000-000000000280"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true, null),

            // Duplicate Copy (License)
            (Guid.Parse("60000000-0000-0000-0000-000000000281"), Guid.Parse("70000000-0000-0000-0000-000000000260"), true, null),
            (Guid.Parse("60000000-0000-0000-0000-000000000281"), Guid.Parse("70000000-0000-0000-0000-000000000261"), true, null)
        };
    }
}
