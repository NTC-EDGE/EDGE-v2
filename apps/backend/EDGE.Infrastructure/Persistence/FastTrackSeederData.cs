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
        ""applicationTypes"": [""Permit to Purchase"", ""Purchase to Possess"", ""Possess for Storage"", ""Permit to Sell/Transfer"", ""Purchase"", ""Possess"", ""Sell/Transfer""],
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
            ""classOfStation"": [""RT"",""FX"",""FB"",""FX/FB"",""ML"",""P"",""BC"",""FC"",""FA"",""MA"",""TC"",""Other""],
            ""intendedUse"": [""New Radio Station"",""Additional Radio Equipment"",""Change of Equipment"",""Storage"",""Other""]
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
            ""category"": [""MOBILE"", ""MOBILE PHONES"", ""NON-MOBILE PHONES""],
            ""applicationType"": [""MOBILE"", ""MOBILE PHONES"", ""NON-MOBILE PHONES""]
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

    public static readonly string NtcReqComplaintsContract = @"
    {
        ""formNo"": ""NTC-REQ-01"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Requests and Complaints"",
        ""group"": ""Requests and Complaints of Consumers/Subscribers"",
        ""applicationTypes"": [
            ""Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone"",
            ""Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone"",
            ""Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages"",
            ""Complaints on Services Offered by Telecommunications or Broadcast Service Providers"",
            ""Request for Mandatory Tape Preservation""
        ],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""details"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""applicationType"": [
                ""Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone"",
                ""Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone"",
                ""Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages"",
                ""Complaints on Services Offered by Telecommunications or Broadcast Service Providers"",
                ""Request for Mandatory Tape Preservation""
            ]
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
            ["NTC_1_22"] = Ntc122Contract,
            ["NTC_REQ_COMPLAINTS"] = NtcReqComplaintsContract
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
            ("NTC_1_09", Guid.Parse("50000000-0000-0000-0000-000000000009"), categoryIds["Permits"], "PERMITS IN THE AMATEUR SERVICE", "Permits in the Amateur Service", "NTC_1_09", "PERMITS IN THE AMATEUR SERVICE (NTC 1-09)", Ntc109Contract),
            ("NTC_1_18", Guid.Parse("50000000-0000-0000-0000-000000000018"), categoryIds["Accreditations"], "CUSTOMER PREMISES EQUIPMENT SUPPLIER ACCREDITATION", "Customer Premises Equipment Supplier Accreditation", "NTC_1_18", "CUSTOMER PREMISES EQUIPMENT SUPPLIER ACCREDITATION (NTC 1-18)", Ntc118Contract),
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
            ("NTC_COPY_PERMITS", Guid.Parse("50000000-0000-0000-0000-000000000066"), categoryIds["Permits"], "COPY OF PERMITS", null, "NTC_COPY_PERMITS", "COPY OF PERMITS", Ntc109Contract),

            // New Licenses Services added from the spreadsheet
            ("NTC_AMA_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000070"), categoryIds["Licenses"], "LICENSE IN THE AMATEUR SERVICE", "License in the Amateur Service", "NTC_AMA_LICENSES", "LICENSE IN THE AMATEUR SERVICE", Ntc103Contract),
            ("NTC_AERO_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000071"), categoryIds["Licenses"], "LICENSE IN THE AERONAUTICAL SERVICE", null, "NTC_AERO_LICENSES", "LICENSE IN THE AERONAUTICAL SERVICE", Ntc111Contract),
            ("NTC_MAR_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000072"), categoryIds["Licenses"], "LICENSE IN THE MARITIME SERVICE", null, "NTC_MAR_LICENSES", "LICENSE IN THE MARITIME SERVICE", Ntc104Contract),
            ("NTC_FLM_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000073"), categoryIds["Licenses"], "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", null, "NTC_FLM_LICENSES", "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", Ntc111Contract),
            ("NTC_OTHER_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000074"), categoryIds["Licenses"], "OTHER RADIO STATION LICENSES/SERVICES", null, "NTC_OTHER_LICENSES", "OTHER RADIO STATION LICENSES/SERVICES", Ntc111Contract),
            ("NTC_TVRO_CATV_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000075"), categoryIds["Licenses"], "TVRO/CATV STATION LICENSE", null, "NTC_TVRO_CATV_LICENSES", "TVRO/CATV STATION LICENSE", Ntc122Contract),
            ("NTC_COPY_LICENSES", Guid.Parse("50000000-0000-0000-0000-000000000076"), categoryIds["Licenses"], "COPY OF LICENSES", null, "NTC_COPY_LICENSES", "COPY OF LICENSES", Ntc121Contract),

            // Requests and Complaints of Consumers/Subscribers
            ("NTC_REQ_COMPLAINTS", Guid.Parse("50000000-0000-0000-0000-000000000080"), categoryIds["RequestsAndComplaints"], "REQUESTS AND COMPLAINTS OF CONSUMERS/SUBSCRIBERS", "Requests and Complaints of Consumers/Subscribers", "NTC_REQ_COMPLAINTS", "REQUESTS AND COMPLAINTS OF CONSUMERS/SUBSCRIBERS", NtcReqComplaintsContract)
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

        // Requests and Complaints Service GUID
        var svcReqComp = Guid.Parse("50000000-0000-0000-0000-000000000080");

        return new List<(Guid, Guid, ServiceVariantType, string)>
        {
            (Guid.Parse("60000000-0000-0000-0000-000000000001"), svc101, ServiceVariantType.New, "Radio Operator Exam Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), svc102, ServiceVariantType.New, "Radio Operator Certificate Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), svc102, ServiceVariantType.Renewal, "Radio Operator Certificate Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), svc102, ServiceVariantType.Modification, "Radio Operator Certificate Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000004"), svc103, ServiceVariantType.New, "Amateur Radio License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000008"), svc103, ServiceVariantType.Renewal, "Amateur Radio License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), svc103, ServiceVariantType.Modification, "Amateur Radio License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000005"), svc104, ServiceVariantType.New, "Ship Station License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000010"), svc104, ServiceVariantType.Renewal, "Ship Station License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000006"), svc111, ServiceVariantType.New, "Radio Station License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000007"), svc111, ServiceVariantType.Renewal, "Radio Station License Application"),
            (Guid.Parse("60000000-0000-0000-0000-000000000012"), svc111, ServiceVariantType.Modification, "Radio Station License Application"),

            // --- CUSTOMER PREMISES EQUIPMENT SUPPLIER ACCREDITATION (svc118) ---
            // Mobile
            (Guid.Parse("60000000-0000-0000-0000-000000000013"), svc118, ServiceVariantType.New, "Customer Premises Equipment Supplier Accreditation - Mobile"),
            (Guid.Parse("60000000-0000-0000-0000-000000000014"), svc118, ServiceVariantType.Renewal, "Customer Premises Equipment Supplier Accreditation - Mobile"),
            (Guid.Parse("60000000-0000-0000-0000-000000000015"), svc118, ServiceVariantType.Modification, "Customer Premises Equipment Supplier Accreditation - Mobile"),

            // Non-Mobile Phones
            (Guid.Parse("60000000-0000-0000-0000-000000000304"), svc118, ServiceVariantType.New, "Customer Premises Equipment Supplier Accreditation - Non-Mobile Phones"),
            (Guid.Parse("60000000-0000-0000-0000-000000000305"), svc118, ServiceVariantType.Renewal, "Customer Premises Equipment Supplier Accreditation - Non-Mobile Phones"),
            (Guid.Parse("60000000-0000-0000-0000-000000000306"), svc118, ServiceVariantType.Modification, "Customer Premises Equipment Supplier Accreditation - Non-Mobile Phones"),
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), svc119, ServiceVariantType.NA, "Certificate of Registration for RFID, SRD, WDN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000017"), svc120, ServiceVariantType.New, "Certificate of Registration as VAS Provider"),
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), svc120, ServiceVariantType.Renewal, "Certificate of Registration as VAS Provider"),
            (Guid.Parse("60000000-0000-0000-0000-000000000019"), svc120, ServiceVariantType.Modification, "Certificate of Registration as VAS Provider"),
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), svc122, ServiceVariantType.NA, "TVRO Registration Certificate"),
            (Guid.Parse("60000000-0000-0000-0000-000000000050"), svc121, ServiceVariantType.NA, "Duplicate Copy"),
            (Guid.Parse("60000000-0000-0000-0000-000000000051"), svc121, ServiceVariantType.NA, "Certified True Copy"),

            // --- Permits in the Amateur Service (svc109) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000060"), svc109, ServiceVariantType.New, "Amateur Radio Station Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000061"), svc109, ServiceVariantType.NA, "Amateur Radio Station Permit to Possess for Storage"),
            (Guid.Parse("60000000-0000-0000-0000-000000000062"), svc109, ServiceVariantType.NA, "Amateur Radio Station Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000063"), svc109, ServiceVariantType.New, "Amateur Radio Station Permit to Sell/Transfer"),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), svc109, ServiceVariantType.NA, "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor"),
            (Guid.Parse("60000000-0000-0000-0000-000000000067"), svc109, ServiceVariantType.New, "Special Permit for Use of Vanity Call Sign"),
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), svc109, ServiceVariantType.Renewal, "Special Permit for Use of Vanity Call Sign"),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), svc109, ServiceVariantType.New, "Special Permit for the Use of Special Event Call Sign"),

            // --- Permits in the Aeronautical Service (svcAero) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000070"), svcAero, ServiceVariantType.NA, "Aeronautical Station Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), svcAero, ServiceVariantType.NA, "Aeronautical Station Permit to Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), svcAero, ServiceVariantType.NA, "Aeronautical Station Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000078"), svcAero, ServiceVariantType.NA, "Permit to Possess for Storage"),
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
            // Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), svcFlm, ServiceVariantType.VSAT, "Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), svcFlm, ServiceVariantType.Private, "Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), svcFlm, ServiceVariantType.CivicActionGroup, "Permit to Purchase"),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), svcFlm, ServiceVariantType.Government, "Permit to Purchase"),
            // Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), svcFlm, ServiceVariantType.VSAT, "Permit to Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), svcFlm, ServiceVariantType.Private, "Permit to Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), svcFlm, ServiceVariantType.CivicActionGroup, "Permit to Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), svcFlm, ServiceVariantType.Government, "Permit to Possess"),
            // Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), svcFlm, ServiceVariantType.VSAT, "Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), svcFlm, ServiceVariantType.Private, "Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), svcFlm, ServiceVariantType.CivicActionGroup, "Permit to Purchase/Possess"),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), svcFlm, ServiceVariantType.Government, "Permit to Purchase/Possess"),
            
            (Guid.Parse("60000000-0000-0000-0000-000000000103"), svcFlm, ServiceVariantType.New, "Permit to Possess for Storage"),
            (Guid.Parse("60000000-0000-0000-0000-000000000104"), svcFlm, ServiceVariantType.New, "Permit to Sell/Transfer"),
            // Construction Permit
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), svcFlm, ServiceVariantType.New, "Construction Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000116"), svcFlm, ServiceVariantType.Modification, "Construction Permit"),
            // Temporary Permit to Demonstrate and Propagate
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), svcFlm, ServiceVariantType.VSAT, "Temporary Permit to Demonstrate and Propagate"),
            (Guid.Parse("60000000-0000-0000-0000-000000000117"), svcFlm, ServiceVariantType.Private, "Temporary Permit to Demonstrate and Propagate"),
            (Guid.Parse("60000000-0000-0000-0000-000000000118"), svcFlm, ServiceVariantType.CivicActionGroup, "Temporary Permit to Demonstrate and Propagate"),
            (Guid.Parse("60000000-0000-0000-0000-000000000119"), svcFlm, ServiceVariantType.Government, "Temporary Permit to Demonstrate and Propagate"),

            // --- Permits for Public Telecommunication Entities (svcPte) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000120"), svcPte, ServiceVariantType.NA, "Permit to Possess for Storage (PTEs)"),

            // --- Permits for Radio Communication Equipment (svcEquip) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000130"), svcEquip, ServiceVariantType.NA, "Permit to Transport"),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), svcEquip, ServiceVariantType.New, "Dealer Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), svcEquip, ServiceVariantType.Renewal, "Dealer Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000135"), svcEquip, ServiceVariantType.Modification, "Dealer Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), svcEquip, ServiceVariantType.New, "Manufacturer Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), svcEquip, ServiceVariantType.Renewal, "Manufacturer Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000137"), svcEquip, ServiceVariantType.Modification, "Manufacturer Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), svcEquip, ServiceVariantType.New, "Service Center Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), svcEquip, ServiceVariantType.Renewal, "Service Center Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000139"), svcEquip, ServiceVariantType.Modification, "Service Center Permit"),

            // --- Permits for Mobile Phone (svcMp) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), svcMp, ServiceVariantType.New, "Dealer Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), svcMp, ServiceVariantType.Renewal, "Dealer Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), svcMp, ServiceVariantType.Modification, "Dealer Permit"),

            (Guid.Parse("60000000-0000-0000-0000-000000000141"), svcMp, ServiceVariantType.New, "Retailer/Reseller Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000148"), svcMp, ServiceVariantType.Renewal, "Retailer/Reseller Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000149"), svcMp, ServiceVariantType.Modification, "Retailer/Reseller Permit"),

            (Guid.Parse("60000000-0000-0000-0000-000000000142"), svcMp, ServiceVariantType.New, "Service Center Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000152"), svcMp, ServiceVariantType.Renewal, "Service Center Permit"),
            (Guid.Parse("60000000-0000-0000-0000-000000000153"), svcMp, ServiceVariantType.Modification, "Service Center Permit"),

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
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), svcLicAma, ServiceVariantType.New, "Amateur Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), svcLicAma, ServiceVariantType.Renewal, "Amateur Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000202"), svcLicAma, ServiceVariantType.Modification, "Amateur Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), svcLicAma, ServiceVariantType.NA, "Lifetime Amateur Radio Station License for Class A"),
            (Guid.Parse("60000000-0000-0000-0000-000000000204"), svcLicAma, ServiceVariantType.New, "Amateur Club Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000205"), svcLicAma, ServiceVariantType.Renewal, "Amateur Club Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000206"), svcLicAma, ServiceVariantType.Modification, "Amateur Club Radio Station License"),

            // --- LICENSE IN THE AERONAUTICAL SERVICE (svcLicAero) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), svcLicAero, ServiceVariantType.New, "Fixed Aeronautical Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), svcLicAero, ServiceVariantType.Renewal, "Fixed Aeronautical Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), svcLicAero, ServiceVariantType.Modification, "Fixed Aeronautical Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), svcLicAero, ServiceVariantType.New, "Aircraft Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), svcLicAero, ServiceVariantType.Renewal, "Aircraft Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000215"), svcLicAero, ServiceVariantType.Modification, "Aircraft Station License"),

            // --- LICENSE IN THE MARITIME SERVICE (svcLicMar) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), svcLicMar, ServiceVariantType.New, "Ship Station License Domestic Trade (Without originally-installed equipment)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), svcLicMar, ServiceVariantType.New, "Ship Station License Domestic Trade (With originally-installed equipment)"),
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), svcLicMar, ServiceVariantType.Renewal, "Ship Station License Domestic Trade"),
            (Guid.Parse("60000000-0000-0000-0000-000000000223"), svcLicMar, ServiceVariantType.Modification, "Ship Station License Domestic Trade"),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), svcLicMar, ServiceVariantType.Renewal, "Ship Station License International Trade"),
            (Guid.Parse("60000000-0000-0000-0000-000000000225"), svcLicMar, ServiceVariantType.Modification, "Ship Station License International Trade"),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), svcLicMar, ServiceVariantType.Renewal, "Ship Earth Station License International Trade"),
            (Guid.Parse("60000000-0000-0000-0000-000000000227"), svcLicMar, ServiceVariantType.Modification, "Ship Earth Station License International Trade"),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), svcLicMar, ServiceVariantType.New, "Private Coastal Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), svcLicMar, ServiceVariantType.Renewal, "Private Coastal Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000230"), svcLicMar, ServiceVariantType.Modification, "Private Coastal Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), svcLicMar, ServiceVariantType.New, "Public Coastal Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000232"), svcLicMar, ServiceVariantType.Renewal, "Public Coastal Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000233"), svcLicMar, ServiceVariantType.Modification, "Public Coastal Station License"),

            // --- LICENSES FOR FIXED AND LAND MOBILE SERVICE (svcLicFlm) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), svcLicFlm, ServiceVariantType.New, "Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000241"), svcLicFlm, ServiceVariantType.Renewal, "Radio Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000242"), svcLicFlm, ServiceVariantType.Modification, "Radio Station License"),

            // --- OTHER RADIO STATION LICENSES/SERVICES (svcLicOther) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000250"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - Microwave"),
            (Guid.Parse("60000000-0000-0000-0000-000000000251"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - Microwave"),
            (Guid.Parse("60000000-0000-0000-0000-000000000252"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - VSAT"),
            (Guid.Parse("60000000-0000-0000-0000-000000000253"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - VSAT"),
            (Guid.Parse("60000000-0000-0000-0000-000000000254"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - Public Trunked"),
            (Guid.Parse("60000000-0000-0000-0000-000000000255"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - Public Trunked"),
            (Guid.Parse("60000000-0000-0000-0000-000000000256"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - BWA"),
            (Guid.Parse("60000000-0000-0000-0000-000000000257"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - BWA"),
            (Guid.Parse("60000000-0000-0000-0000-000000000258"), svcLicOther, ServiceVariantType.New, "Radio Station License - WDN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000259"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - WDN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000260"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - WDN"),
            (Guid.Parse("60000000-0000-0000-0000-000000000261"), svcLicOther, ServiceVariantType.Renewal, "Radio Station License - BTS"),
            (Guid.Parse("60000000-0000-0000-0000-000000000262"), svcLicOther, ServiceVariantType.Modification, "Radio Station License - BTS"),

            // --- TVRO/CATV STATION LICENSE (svcLicTvroCatv) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), svcLicTvroCatv, ServiceVariantType.New, "TVRO Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), svcLicTvroCatv, ServiceVariantType.Renewal, "TVRO Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), svcLicTvroCatv, ServiceVariantType.New, "CATV Station License"),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), svcLicTvroCatv, ServiceVariantType.Renewal, "CATV Station License"),

            // --- COPY OF LICENSES (svcLicCopy) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000280"), svcLicCopy, ServiceVariantType.NA, "Certified True Copy"),
            (Guid.Parse("60000000-0000-0000-0000-000000000281"), svcLicCopy, ServiceVariantType.NA, "Duplicate Copy"),

            // --- REQUESTS AND COMPLAINTS OF CONSUMERS/SUBSCRIBERS (svcReqComp) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000401"), svcReqComp, ServiceVariantType.NA, "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone"),
            (Guid.Parse("60000000-0000-0000-0000-000000000402"), svcReqComp, ServiceVariantType.NA, "Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone"),
            (Guid.Parse("60000000-0000-0000-0000-000000000403"), svcReqComp, ServiceVariantType.NA, "Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages"),
            (Guid.Parse("60000000-0000-0000-0000-000000000404"), svcReqComp, ServiceVariantType.NA, "Complaints on Services Offered by Telecommunications or Broadcast Service Providers"),
            (Guid.Parse("60000000-0000-0000-0000-000000000405"), svcReqComp, ServiceVariantType.NA, "Request for Mandatory Tape Preservation")
        };
    }

    public static Dictionary<string, Field> GetFieldsPool()
    {
        return new Dictionary<string, Field>
        {
            // Core Personal / Applicant
            ["fullName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000001"), FieldType = "text", Label = "Full Legal Name", SyncBackOnSubmit = true },
            ["birthDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000002"), FieldType = "date", Label = "Date of Birth", SyncBackOnSubmit = true },
            ["sex"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000041"), FieldType = "dropdown", Label = "Sex / Gender", SyncBackOnSubmit = true, ValidationRules = @"[""Male"",""Female""]" },
            ["civilStatus"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000042"), FieldType = "dropdown", Label = "Civil Status", SyncBackOnSubmit = true, ValidationRules = @"[""Single"",""Married"",""Widowed"",""Separated""]" },
            ["nationality"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000043"), FieldType = "dropdown", Label = "Nationality / Citizenship", SyncBackOnSubmit = true, ValidationRules = @"[""Filipino"",""Foreign National / Others""]" },

            // Granular Address
            ["region"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000051"), FieldType = "dropdown", Label = "Region", SyncBackOnSubmit = true },
            ["province"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000052"), FieldType = "dropdown", Label = "Province", SyncBackOnSubmit = true },
            ["city"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000053"), FieldType = "dropdown", Label = "City / Municipality", SyncBackOnSubmit = true },
            ["barangay"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000054"), FieldType = "dropdown", Label = "Barangay", SyncBackOnSubmit = true },
            ["street"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000055"), FieldType = "text", Label = "Street Address / Unit / Building", SyncBackOnSubmit = true },
            ["zipCode"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000056"), FieldType = "text", Label = "Zip / Postal Code", SyncBackOnSubmit = true },
            ["address"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000003"), FieldType = "text", Label = "Complete Address", SyncBackOnSubmit = true },

            // Contact & Emergency
            ["contactNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000004"), FieldType = "text", Label = "Contact / Mobile Number", SyncBackOnSubmit = true },
            ["email"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000005"), FieldType = "text", Label = "Email Address", SyncBackOnSubmit = true },
            ["emergencyContactPerson"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000071"), FieldType = "text", Label = "Emergency Contact Person", SyncBackOnSubmit = false },
            ["emergencyContactNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000072"), FieldType = "text", Label = "Emergency Contact Number", SyncBackOnSubmit = false },

            // Education
            ["schoolName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000061"), FieldType = "text", Label = "School / University Attended", SyncBackOnSubmit = false },
            ["courseDegree"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000062"), FieldType = "text", Label = "Course / Degree Program", SyncBackOnSubmit = false },
            ["yearGraduated"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000063"), FieldType = "text", Label = "Year Graduated", SyncBackOnSubmit = false },
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
            ["employmentStatus"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000017"), FieldType = "dropdown", Label = "Status", SyncBackOnSubmit = false, ValidationRules = @"[""Employed"",""Unemployed""]" },
            ["employmentType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000018"), FieldType = "dropdown", Label = "Type", SyncBackOnSubmit = false, ValidationRules = @"[""Local"",""Foreign""]" },
            ["employmentLocation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000046"), FieldType = "text", Label = "Employment Location", SyncBackOnSubmit = false },
            ["examSeminarAddress"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000047"), FieldType = "text", Label = "Seminar / Exam Address", SyncBackOnSubmit = false },
            ["examSeminarDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000019"), FieldType = "date", Label = "Date", SyncBackOnSubmit = false },
            ["examSeminarRating"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000020"), FieldType = "text", Label = "Rating", SyncBackOnSubmit = false },

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
            ["tvroDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000038"), FieldType = "text", Label = "TVRO / CATV Receiver & Satellite Details", SyncBackOnSubmit = false },

            // NTC 1-09 Permit Fields
            ["stationClass"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000101"), FieldType = "text", Label = "Station Class", SyncBackOnSubmit = false },
            ["serviceArea"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000102"), FieldType = "text", Label = "Service Area", SyncBackOnSubmit = false },
            ["frequency"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000103"), FieldType = "text", Label = "Frequency / Frequencies", SyncBackOnSubmit = false },
            ["bandwidth"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000104"), FieldType = "text", Label = "Bandwidth", SyncBackOnSubmit = false },
            ["emission"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000105"), FieldType = "text", Label = "Emission", SyncBackOnSubmit = false },
            ["powerOutput"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000106"), FieldType = "text", Label = "Power Output", SyncBackOnSubmit = false },
            ["hoursOfOperation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000107"), FieldType = "text", Label = "Hours of Operation", SyncBackOnSubmit = false },
            ["configuration"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000108"), FieldType = "text", Label = "Configuration", SyncBackOnSubmit = false },
            ["dataRate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000109"), FieldType = "text", Label = "Data Rate", SyncBackOnSubmit = false },
            ["remarks"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000110"), FieldType = "text", Label = "Remarks", SyncBackOnSubmit = false },
            ["serialNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000111"), FieldType = "text", Label = "Serial Number", SyncBackOnSubmit = false },
            ["frequencyRange"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000112"), FieldType = "text", Label = "Frequency Range", SyncBackOnSubmit = false },
            ["antennaType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000113"), FieldType = "text", Label = "Antenna Type", SyncBackOnSubmit = false },
            ["height"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000114"), FieldType = "text", Label = "Antenna Height", SyncBackOnSubmit = false },
            ["gain"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000115"), FieldType = "text", Label = "Antenna Gain", SyncBackOnSubmit = false },
            ["directivity"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000116"), FieldType = "text", Label = "Antenna Directivity", SyncBackOnSubmit = false },
            ["diameter"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000117"), FieldType = "text", Label = "Antenna Diameter", SyncBackOnSubmit = false },
            ["polarization"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000118"), FieldType = "text", Label = "Antenna Polarization", SyncBackOnSubmit = false },
            ["beamwidth"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000119"), FieldType = "text", Label = "Antenna Beamwidth", SyncBackOnSubmit = false },
            ["dealerName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000120"), FieldType = "text", Label = "Dealer Name", SyncBackOnSubmit = false },
            ["authorizedSellerBuyer"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000121"), FieldType = "text", Label = "Authorized Seller / Buyer", SyncBackOnSubmit = false },
            ["orInvoiceNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000122"), FieldType = "text", Label = "OR / Invoice No", SyncBackOnSubmit = false },
            ["permitRslNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000123"), FieldType = "text", Label = "Permit / RSL No", SyncBackOnSubmit = false },
            ["sellerAddress"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000124"), FieldType = "text", Label = "Seller Address", SyncBackOnSubmit = false },
            ["amateurLicenseNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000125"), FieldType = "text", Label = "Amateur License No", SyncBackOnSubmit = false },
            ["intendedUseType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000126"), FieldType = "text", Label = "Intended Use Type", SyncBackOnSubmit = false },
            ["specifyDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000127"), FieldType = "text", Label = "Specify Details", SyncBackOnSubmit = false },

            // Amateur Radio Station License (NTC_AMA_LICENSES) specific fields
            ["appType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000200"), FieldType = "dropdown", Label = "Application Type", SyncBackOnSubmit = false, ValidationRules = "[\"NEW\",\"RENEWAL\",\"MODIFICATION\"]" },
            ["noOfYears"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000201"), FieldType = "dropdown", Label = "Number of Years", SyncBackOnSubmit = false, ValidationRules = "[\"1\",\"2\",\"3\",\"5\"]" },
            ["licenseNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000202"), FieldType = "text", Label = "Existing License No", SyncBackOnSubmit = false },
            ["dateOfExpiry"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000203"), FieldType = "date", Label = "License Expiry Date", SyncBackOnSubmit = false },
            ["modificationDueTo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000204"), FieldType = "dropdown", Label = "Modification Due To", SyncBackOnSubmit = false, ValidationRules = "[\"Change of Station Location\",\"Change / Additional Equipment\",\"Upgrade of Class of Station\",\"Change of Call Sign\",\"Change of Name / Personal Info\"]" },
            ["placeOfExamSeminar"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000205"), FieldType = "text", Label = "Place of Exam / Seminar", SyncBackOnSubmit = false },
            ["dateOfExamSeminar"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000206"), FieldType = "date", Label = "Date of Exam / Seminar", SyncBackOnSubmit = false },
            ["ratings"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000207"), FieldType = "text", Label = "Ratings / Exam Score Details", SyncBackOnSubmit = false },
            ["particularsEquipment"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000208"), FieldType = "text", Label = "Particulars of Radio Equipment (JSON)", SyncBackOnSubmit = false },
            ["location"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000209"), FieldType = "text", Label = "Station Location / Installation Address", SyncBackOnSubmit = false },
            ["middleName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000210"), FieldType = "text", Label = "Middle Name", SyncBackOnSubmit = false },
            ["suffix"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000211"), FieldType = "text", Label = "Suffix", SyncBackOnSubmit = false }
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
            ["ROC_PHOTO"] = (Guid.Parse("70000000-0000-0000-0000-000000000261"), "For Radio Operator Certificate: Please provide a clear 1x1 ID picture taken within the last six (6) months.", "For Radio Operator Certificate:\nPlease provide a clear 1x1 ID picture taken within the last six (6) months."),

            // New Accreditations-specific requirements (CPE Supplier Accreditation)
            ["PAID_UP_CAPITAL_250K"] = (Guid.Parse("70000000-0000-0000-0000-000000000301"), "Proof of Paid-Up Capital (Minimum of PHP 250,000.00)", "Proof of Paid-Up Capital*\nMinimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship"),
            ["DISTRIBUTORSHIP_AGREEMENT"] = (Guid.Parse("70000000-0000-0000-0000-000000000302"), "Distributorship OR Representation Agreement on products to be sold", "Distributorship OR Representation Agreement on products to be sold*"),
            ["TYPE_APPROVAL_OR_GRANT_OF_EQUIPMENT_CONFORMITY"] = (Guid.Parse("70000000-0000-0000-0000-000000000303"), "Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold", "Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold*"),
            ["TWO_TECH_EMPLOYMENT_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000304"), "Certificate of Employment and ROC/license of two (2) qualified radio technicians employed full-time", "Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis*"),
            ["ECE_PECE_EMPLOYMENT_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000305"), "Certificate of Employment and valid license of supervising Electronics Engineer (ECE) OR PECE", "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)*"),
            ["CPE_SUPPLIER_ACCREDITATION_DOC"] = (Guid.Parse("70000000-0000-0000-0000-000000000306"), "CPE Supplier Accreditation", "CPE Supplier Accreditation*"),
            ["BUSINESS_MAYORS_PERMIT"] = (Guid.Parse("70000000-0000-0000-0000-000000000307"), "Business/Mayor's Permit", "Business/Mayor's Permit*"),
            ["TYPE_APPROVAL_NOT_PREVIOUSLY_INDICATED"] = (Guid.Parse("70000000-0000-0000-0000-000000000308"), "For equipment not previously indicated: Copy of Type Approval Certificate OR Grant of Equipment Conformity", "For equipment not previously indicated in the CPE Supplier Accreditation:\nCopy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold"),

            // New Requests and Complaints requirements
            ["REQ_PROOF_OF_OWNERSHIP"] = (Guid.Parse("70000000-0000-0000-0000-000000000401"), "Proof of ownership (Official Receipt, Box with IMEI, or Police Blotter)", "Proof of ownership, ANY of the following:*\n• Official Receipt of the mobile phone\n• Box of the mobile phone with International Mobile Equipment Identity (IMEI)\n• Police Blotter"),
            ["REQ_VALID_ID_STUDENT_PASSPORT"] = (Guid.Parse("70000000-0000-0000-0000-000000000402"), "Copy of valid Identification (Government ID, Passport, School ID, Birth Certificate, or NBI Clearance)", "Copy of valid Identification:*\n• Any government-issued ID OR Passport\n• For students, School ID\n• For cases when ID is not available, Birth Certificate OR NBI Clearance"),
            ["REQ_BLOCKING_FORM_PROOF"] = (Guid.Parse("70000000-0000-0000-0000-000000000403"), "Blocking Form OR Proof of Blocking", "ANY of the following:*\n• Blocking Form\n• Proof of Blocking"),
            ["REQ_VALID_ID_SIMPLE"] = (Guid.Parse("70000000-0000-0000-0000-000000000404"), "Valid ID", "Valid ID*"),
            ["REQ_SCREENSHOT_TEXT_MSG"] = (Guid.Parse("70000000-0000-0000-0000-000000000405"), "Screenshot of text message", "Screenshot of text message*"),
            ["REQ_NOTARIZED_COMPLAINT"] = (Guid.Parse("70000000-0000-0000-0000-000000000406"), "If complaint proceeds to administrative case: Copy of duly notarized Complaint", "If complaint proceeds to administrative case:\nCopy of duly notarized Complaint"),
            ["REQ_TELCO_SERVICE_DOCS"] = (Guid.Parse("70000000-0000-0000-0000-000000000407"), "Service Contract, Billing Statement, OR Document indicating services availed by the complainant", "ANY of the following:*\n• Service Contract\n• Billing Statement\n• Document indicating services availed by the complainant"),
            ["REQ_LETTER_REQUEST_MANDATORY_TAPE"] = (Guid.Parse("70000000-0000-0000-0000-000000000408"), "Letter Request", "Letter Request*")
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
            (Guid.Parse("60000000-0000-0000-0000-000000000041"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true),

            // --- ROC Certificates (excluding Amateur) ---
            // CommercialROC - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000010"), true), // ROC_RATING
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000005"), false), // ROC (upgrade option)
            // CommercialROC - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // CORRECTION_NAME_DOCS

            // RROC-Aircraft - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000010"), true), // ROC_RATING
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // RROC-Aircraft - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // RROC-Aircraft - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // CORRECTION_NAME_DOCS

            // TP RROC-Aircraft - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000011"), true), // FOREIGN_PILOT_LICENSE
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // TP RROC-Aircraft - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // CORRECTION_NAME_DOCS

            // GROC - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000012"), true), // GOOD_MORAL
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000013"), true), // GOVT_SERVICE
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000014"), true), // GOVT_SEMINAR
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // GROC - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true), // COE
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // GROC - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // CORRECTION_NAME_DOCS

            // RROC-Land Mobile - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000014"), true), // GOVT_SEMINAR
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // RROC-Land Mobile - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // RROC-Land Mobile - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // CORRECTION_NAME_DOCS

            // SROP - New
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000014"), true), // GOVT_SEMINAR
            (Guid.Parse("60000000-0000-0000-0000-000000000002"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // SROP - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000003"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // SROP - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000011"), Guid.Parse("70000000-0000-0000-0000-000000000027"), false), // CORRECTION_NAME_DOCS

            // --- Amateur Certificates ---
            // AmateurROC - New
            (Guid.Parse("60000000-0000-0000-0000-000000000004"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true), // RATING
            (Guid.Parse("60000000-0000-0000-0000-000000000004"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // AmateurROC - Renewal
            (Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true), // AT_ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true), // AMA_ACTIVITIES
            (Guid.Parse("60000000-0000-0000-0000-000000000008"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // AmateurROC - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true), // AT_ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000028"), false), // AMA_UPGRADE_RATING

            // LifetimeSupplementaryCert - Modification
            (Guid.Parse("60000000-0000-0000-0000-000000000009"), Guid.Parse("70000000-0000-0000-0000-000000000017"), true), // SUPPLEMENTARY_CERT

            // --- Certificate of Registration (WDN/SRD/RFID) ---
            // Dealers - New
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000018"), true), // DEALER_PERMIT
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000019"), false), // IMPORTED_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000020"), false), // LOCAL_MFG_DOCS
            // Non-Dealers - New
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000019"), false), // IMPORTED_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000016"), Guid.Parse("70000000-0000-0000-0000-000000000020"), false), // LOCAL_MFG_DOCS

            // --- TVRO Registration Certificate ---
            // Commercial TVRO
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true), // PROVISIONAL_AUTHORITY
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true), // HEADEND_EQUIP_LIST
            // Non-Commercial TVRO
            (Guid.Parse("60000000-0000-0000-0000-000000000020"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true), // HEADEND_EQUIP_LIST

            // --- VAS Provider Registration Renewal ---
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000029"), true), // COR (VAS)
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000023"), true), // LEASE_AGREEMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000018"), Guid.Parse("70000000-0000-0000-0000-000000000024"), true), // VAS_QUARTERLY_REPORTS

            // --- Certified / Duplicate Copy (Copy of Certificates) ---
            // Duplicate Copy
            (Guid.Parse("60000000-0000-0000-0000-000000000050"), Guid.Parse("70000000-0000-0000-0000-000000000026"), true), // SCANNED_CERT
            (Guid.Parse("60000000-0000-0000-0000-000000000050"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true), // PHOTO
            // Certified True Copy
            (Guid.Parse("60000000-0000-0000-0000-000000000051"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true), // AUTH_COPY

            // --- PERMITS IN THE AMATEUR SERVICE (svc109) ---
            // Amateur Radio Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000060"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000060"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true),
            // Amateur Radio Station Permit Permit to Possess for Storage
            (Guid.Parse("60000000-0000-0000-0000-000000000061"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000061"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true),
            // Amateur Radio Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000062"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000062"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true),
            // Amateur Radio Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000063"), Guid.Parse("70000000-0000-0000-0000-000000000052"), true),
            // Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor (Class A, B, C)
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            // Special Permit for Use of Vanity Call Sign (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000067"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000067"), Guid.Parse("70000000-0000-0000-0000-000000000057"), true),
            // Special Permit for Use of Vanity Call Sign (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000057"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000058"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),

            // --- PERMITS IN THE AERONAUTICAL SERVICE (svcAero) ---
            // Aeronautical Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000070"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aeronautical Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aeronautical Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Permit to Possess for Storage (Aeronautical)
            (Guid.Parse("60000000-0000-0000-0000-000000000078"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            // Aeronautical Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000073"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true),
            // Aircraft Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000074"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aircraft Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aircraft Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aircraft Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000077"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true),

            // --- PERMITS IN THE MARITIME SERVICE (svcMar) ---
            // Ship Station Permit to Purchase (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000080"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
            // Ship Station Permit to Possess (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000081"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
            // Ship Station Permit to Possess (Storage)
            (Guid.Parse("60000000-0000-0000-0000-000000000082"), Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
            // Ship Station Permit to Purchase/Possess (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000083"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
            // Ship Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000084"), Guid.Parse("70000000-0000-0000-0000-000000000063"), true),
            // Private Coastal Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000085"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
            // Private Coastal Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000086"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
            // Private Coastal Station Permit to Purchase /Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000087"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
            // Public Coastal Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
            // Public Coastal Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
            // Public Coastal Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
            // Public Coastal Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000091"), Guid.Parse("70000000-0000-0000-0000-000000000067"), true),

            // --- PERMITS TO FIXED & LAND MOBILE STATIONS (svcFlm) ---
            // Permit to Purchase (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

            // Permit to Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

            // Permit to Purchase/Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

            // Permit to Possess for Storage
            (Guid.Parse("60000000-0000-0000-0000-000000000103"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            // Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000104"), Guid.Parse("70000000-0000-0000-0000-000000000075"), true),

            // Construction Permit (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // Engineering Plan
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true), // Equip Source
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000078"), false), // OR/CR
            // Construction Permit (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000116"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

            // Temporary Permit to Demonstrate and Propagate (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000080"), false),

            (Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),

            // --- PERMITS FOR PUBLIC TELECOMMUNICATIONS ENTITIES (PTEs) (svcPte) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000120"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

            // --- PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT (svcEquip) ---
            // Permit to Transport
            (Guid.Parse("60000000-0000-0000-0000-000000000130"), Guid.Parse("70000000-0000-0000-0000-000000000081"), true),
            
            // Dealer Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000083"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000084"), false),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false),

            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false),

            (Guid.Parse("60000000-0000-0000-0000-000000000135"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true),

            // Manufacturer Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000088"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000089"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000137"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
            // Special Permit for Use of Vanity Call Sign (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000067"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000067"), Guid.Parse("70000000-0000-0000-0000-000000000057"), true),
            // Special Permit for Use of Vanity Call Sign (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000057"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000058"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),

            // --- PERMITS IN THE AERONAUTICAL SERVICE (svcAero) ---
            // Aeronautical Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000070"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aeronautical Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aeronautical Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Permit to Possess for Storage (Aeronautical)
            (Guid.Parse("60000000-0000-0000-0000-000000000078"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            // Aeronautical Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000073"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true),
            // Aircraft Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000074"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aircraft Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aircraft Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
            // Aircraft Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000077"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true),

            // --- PERMITS IN THE MARITIME SERVICE (svcMar) ---
            // Ship Station Permit to Purchase (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000080"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
            // Ship Station Permit to Possess (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000081"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
            // Ship Station Permit to Possess (Storage)
            (Guid.Parse("60000000-0000-0000-0000-000000000082"), Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
            // Ship Station Permit to Purchase/Possess (Domestic Trade)
            (Guid.Parse("60000000-0000-0000-0000-000000000083"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
            // Ship Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000084"), Guid.Parse("70000000-0000-0000-0000-000000000063"), true),
            // Private Coastal Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000085"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
            // Private Coastal Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000086"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
            // Private Coastal Station Permit to Purchase /Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000087"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
            // Public Coastal Station Permit to Purchase
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
            // Public Coastal Station Permit to Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
            // Public Coastal Station Permit to Purchase/Possess
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
            // Public Coastal Station Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000091"), Guid.Parse("70000000-0000-0000-0000-000000000067"), true),

            // --- PERMITS TO FIXED & LAND MOBILE STATIONS (svcFlm) ---
            // Permit to Purchase (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

            // Permit to Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

            // Permit to Purchase/Possess (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // VSAT
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // PRIVATE
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // CIVIC ACTION GROUP
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // GOVERNMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

            // Permit to Possess for Storage
            (Guid.Parse("60000000-0000-0000-0000-000000000103"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            // Permit to Sell/Transfer
            (Guid.Parse("60000000-0000-0000-0000-000000000104"), Guid.Parse("70000000-0000-0000-0000-000000000075"), true),

            // Construction Permit (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true), // ROC
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true), // Engineering Plan
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true), // Equip Source
            (Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000078"), false), // OR/CR
            // Construction Permit (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000116"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

            // Temporary Permit to Demonstrate and Propagate (VSAT, PRIVATE, CIVIC ACTION GROUP, GOVERNMENT)
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000080"), false),

            (Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),

            // --- PERMITS FOR PUBLIC TELECOMMUNICATIONS ENTITIES (PTEs) (svcPte) ---
            (Guid.Parse("60000000-0000-0000-0000-000000000120"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

            // --- PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT (svcEquip) ---
            // Permit to Transport
            (Guid.Parse("60000000-0000-0000-0000-000000000130"), Guid.Parse("70000000-0000-0000-0000-000000000081"), true),
            
            // Dealer Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000083"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000084"), false),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false),
            (Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false),

            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false),
            (Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false),

            (Guid.Parse("60000000-0000-0000-0000-000000000135"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true),

            // Manufacturer Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000088"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000089"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000137"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true),

            // Service Center Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000092"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000089"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000086"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000093"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000139"), Guid.Parse("70000000-0000-0000-0000-000000000093"), true),

            // --- PERMITS FOR MOBILE PHONE (svcMp) ---
            // Dealer Permit NEW (MAIN / BRANCH)
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000095"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000095"), true),

            // Dealer Permit RENEWAL (MAIN / BRANCH)
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true),

            // Dealer Permit MODIFICATION (MAIN / BRANCH)
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true),

            // Retailer/Reseller Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000141"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000141"), Guid.Parse("70000000-0000-0000-0000-000000000098"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000148"), Guid.Parse("70000000-0000-0000-0000-000000000099"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000148"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000149"), Guid.Parse("70000000-0000-0000-0000-000000000099"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000149"), Guid.Parse("70000000-0000-0000-0000-000000000100"), true),

            // Mobile Phone Service Center Permit (NEW, RENEWAL, MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000101"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000102"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000103"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000101"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000102"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000153"), Guid.Parse("70000000-0000-0000-0000-000000000103"), true),

            // --- COPY OF PERMITS (svcCopy) ---
            // Certified True Copy
            (Guid.Parse("60000000-0000-0000-0000-000000000150"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true),
            // Duplicate Copy
            (Guid.Parse("60000000-0000-0000-0000-000000000151"), Guid.Parse("70000000-0000-0000-0000-000000000104"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000151"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            // --- LICENSE IN THE AMATEUR SERVICE (svcLicAma) ---
            // Amateur Radio Station License (NEW) - Class A, B, C, D
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            // Amateur Radio Station License (RENEWAL) - Class A, B, C, D
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            // Amateur Radio Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000202"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            // Lifetime Amateur Radio Station License for Class A
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000202"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000203"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000204"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000205"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

            // Amateur Club Radio Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000204"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000204"), Guid.Parse("70000000-0000-0000-0000-000000000206"), true),

            // Amateur Club Radio Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000205"), Guid.Parse("70000000-0000-0000-0000-000000000207"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000205"), Guid.Parse("70000000-0000-0000-0000-000000000208"), true),

            // Amateur Club Radio Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000206"), Guid.Parse("70000000-0000-0000-0000-000000000207"), true),

            // Fixed Aeronautical Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000210"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000211"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Fixed Aeronautical Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000214"), true),

            // Fixed Aeronautical Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000214"), true),

            // Aircraft Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000215"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000216"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000217"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Aircraft Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000218"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000215"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000216"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000217"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Aircraft Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000215"), Guid.Parse("70000000-0000-0000-0000-000000000218"), true),

            // Ship Station License Domestic Trade (Without originally-installed equipment) (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Ship Station License Domestic Trade (With originally-installed equipment) (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Ship Station License Domestic Trade (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000221"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Ship Station License Domestic Trade (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000223"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true),

            // Ship Station License International Trade (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000223"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000224"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000225"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000226"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000227"), true),

            // Ship Station License International Trade (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000225"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true),

            // Ship Earth Station License International Trade (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000228"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000223"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000224"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000225"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000226"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000227"), true),

            // Ship Earth Station License International Trade (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000227"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true),

            // Private Coastal Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000229"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Private Coastal Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Private Coastal Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000230"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000230"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),

            // Public Coastal Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),

            // Public Coastal Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),

            // Public Coastal Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000233"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

            // Radio Station License (NEW) - Fixed & Land Mobile Service
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000230"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000078"), false),

            // Radio Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000241"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000241"), Guid.Parse("70000000-0000-0000-0000-000000000230"), true),

            // Radio Station License (MODIFICATION)
            (Guid.Parse("60000000-0000-0000-0000-000000000242"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

            // Other Radio Station Licenses (Microwave, VSAT, Public Trunked, BWA, WDN, BTS)
            (Guid.Parse("60000000-0000-0000-0000-000000000250"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000251"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000252"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000253"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000254"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000255"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000256"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000257"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000258"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000259"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000260"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000261"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000262"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

            // TVRO Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000240"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true),

            // TVRO Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000243"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true),

            // CATV Station License (NEW)
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000250"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000251"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000252"), true),

            // CATV Station License (RENEWAL)
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000253"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000250"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000252"), true),

            // Certified True Copy (License)
            (Guid.Parse("60000000-0000-0000-0000-000000000280"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true),

            // Duplicate Copy (License)
            (Guid.Parse("60000000-0000-0000-0000-000000000281"), Guid.Parse("70000000-0000-0000-0000-000000000260"), true),
            (Guid.Parse("60000000-0000-0000-0000-000000000281"), Guid.Parse("70000000-0000-0000-0000-000000000261"), true),

            // --- CUSTOMER PREMISES EQUIPMENT SUPPLIER ACCREDITATION (svc118) ---
            // Mobile - NEW (60000000-0000-0000-0000-000000000013)
            (Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true), // DEALER_REG_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000301"), true), // PAID_UP_CAPITAL_250K
            (Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000302"), true), // DISTRIBUTORSHIP_AGREEMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000303"), true), // TYPE_APPROVAL_OR_GRANT_OF_EQUIPMENT_CONFORMITY
            (Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000304"), true), // TWO_TECH_EMPLOYMENT_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000013"), Guid.Parse("70000000-0000-0000-0000-000000000305"), true), // ECE_PECE_EMPLOYMENT_DOCS

            // Mobile Phones - RENEWAL (60000000-0000-0000-0000-000000000014)
            (Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000306"), true), // CPE_SUPPLIER_ACCREDITATION_DOC
            (Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000307"), true), // BUSINESS_MAYORS_PERMIT
            (Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000302"), true), // DISTRIBUTORSHIP_AGREEMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000304"), true), // TWO_TECH_EMPLOYMENT_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000014"), Guid.Parse("70000000-0000-0000-0000-000000000305"), true), // ECE_PECE_EMPLOYMENT_DOCS

            // Mobile - MODIFICATION (60000000-0000-0000-0000-000000000015)
            (Guid.Parse("60000000-0000-0000-0000-000000000015"), Guid.Parse("70000000-0000-0000-0000-000000000306"), true), // CPE_SUPPLIER_ACCREDITATION_DOC
            (Guid.Parse("60000000-0000-0000-0000-000000000015"), Guid.Parse("70000000-0000-0000-0000-000000000308"), true), // TYPE_APPROVAL_NOT_PREVIOUSLY_INDICATED

            // Non-Mobile Phones - NEW (60000000-0000-0000-0000-000000000304)
            (Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true), // DEALER_REG_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000301"), true), // PAID_UP_CAPITAL_250K
            (Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000302"), true), // DISTRIBUTORSHIP_AGREEMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000303"), true), // TYPE_APPROVAL_OR_GRANT_OF_EQUIPMENT_CONFORMITY
            (Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000304"), true), // TWO_TECH_EMPLOYMENT_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000304"), Guid.Parse("70000000-0000-0000-0000-000000000305"), true), // ECE_PECE_EMPLOYMENT_DOCS

            // Non-Mobile Phones - RENEWAL (60000000-0000-0000-0000-000000000305)
            (Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000306"), true), // CPE_SUPPLIER_ACCREDITATION_DOC
            (Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000307"), true), // BUSINESS_MAYORS_PERMIT
            (Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000302"), true), // DISTRIBUTORSHIP_AGREEMENT
            (Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000304"), true), // TWO_TECH_EMPLOYMENT_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000305"), Guid.Parse("70000000-0000-0000-0000-000000000305"), true), // ECE_PECE_EMPLOYMENT_DOCS

            // Non-Mobile Phones - MODIFICATION (60000000-0000-0000-0000-000000000306)
            (Guid.Parse("60000000-0000-0000-0000-000000000306"), Guid.Parse("70000000-0000-0000-0000-000000000306"), true), // CPE_SUPPLIER_ACCREDITATION_DOC
            (Guid.Parse("60000000-0000-0000-0000-000000000306"), Guid.Parse("70000000-0000-0000-0000-000000000308"), true),  // TYPE_APPROVAL_NOT_PREVIOUSLY_INDICATED

            // --- REQUESTS AND COMPLAINTS OF CONSUMERS/SUBSCRIBERS (svcReqComp) ---
            // 1. Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone (60000000-0000-0000-0000-000000000401)
            (Guid.Parse("60000000-0000-0000-0000-000000000401"), Guid.Parse("70000000-0000-0000-0000-000000000401"), true), // REQ_PROOF_OF_OWNERSHIP
            (Guid.Parse("60000000-0000-0000-0000-000000000401"), Guid.Parse("70000000-0000-0000-0000-000000000402"), true), // REQ_VALID_ID_STUDENT_PASSPORT

            // 2. Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone (60000000-0000-0000-0000-000000000402)
            (Guid.Parse("60000000-0000-0000-0000-000000000402"), Guid.Parse("70000000-0000-0000-0000-000000000403"), true), // REQ_BLOCKING_FORM_PROOF
            (Guid.Parse("60000000-0000-0000-0000-000000000402"), Guid.Parse("70000000-0000-0000-0000-000000000404"), true), // REQ_VALID_ID_SIMPLE

            // 3. Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages (60000000-0000-0000-0000-000000000403)
            (Guid.Parse("60000000-0000-0000-0000-000000000403"), Guid.Parse("70000000-0000-0000-0000-000000000402"), true), // REQ_VALID_ID_STUDENT_PASSPORT
            (Guid.Parse("60000000-0000-0000-0000-000000000403"), Guid.Parse("70000000-0000-0000-0000-000000000405"), true), // REQ_SCREENSHOT_TEXT_MSG
            (Guid.Parse("60000000-0000-0000-0000-000000000403"), Guid.Parse("70000000-0000-0000-0000-000000000406"), false), // REQ_NOTARIZED_COMPLAINT (Conditional on admin case)

            // 4. Complaints on Services Offered by Telecommunications or Broadcast Service Providers (60000000-0000-0000-0000-000000000404)
            (Guid.Parse("60000000-0000-0000-0000-000000000404"), Guid.Parse("70000000-0000-0000-0000-000000000402"), true), // REQ_VALID_ID_STUDENT_PASSPORT
            (Guid.Parse("60000000-0000-0000-0000-000000000404"), Guid.Parse("70000000-0000-0000-0000-000000000407"), true), // REQ_TELCO_SERVICE_DOCS
            (Guid.Parse("60000000-0000-0000-0000-000000000404"), Guid.Parse("70000000-0000-0000-0000-000000000406"), false), // REQ_NOTARIZED_COMPLAINT (Conditional on admin case)

            // 5. Request for Mandatory Tape Preservation (60000000-0000-0000-0000-000000000405)
            (Guid.Parse("60000000-0000-0000-0000-000000000405"), Guid.Parse("70000000-0000-0000-0000-000000000408"), true)  // REQ_LETTER_REQUEST_MANDATORY_TAPE
        };
    }
}
