using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class LicensesCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000003");

    public static readonly Guid Svc104Id         = Guid.Parse("50000000-0000-0000-0000-000000000004");
    public static readonly Guid Svc111Id         = Guid.Parse("50000000-0000-0000-0000-000000000011");
    public static readonly Guid SvcLicAmaId      = Guid.Parse("50000000-0000-0000-0000-000000000070");
    public static readonly Guid SvcLicAeroId     = Guid.Parse("50000000-0000-0000-0000-000000000071");
    public static readonly Guid SvcLicMarId      = Guid.Parse("50000000-0000-0000-0000-000000000072");
    public static readonly Guid SvcLicFlmId      = Guid.Parse("50000000-0000-0000-0000-000000000073");
    public static readonly Guid SvcLicOtherId    = Guid.Parse("50000000-0000-0000-0000-000000000074");
    public static readonly Guid SvcLicTvroCatvId = Guid.Parse("50000000-0000-0000-0000-000000000075");
    public static readonly Guid SvcLicCopyId     = Guid.Parse("50000000-0000-0000-0000-000000000076");

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

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_04"] = Ntc104Contract,
        ["NTC_1_11"] = Ntc111Contract,
        ["NTC_AMA_LICENSES"] = CertificatesCategorySeederData.Ntc103Contract,
        ["NTC_AERO_LICENSES"] = Ntc111Contract,
        ["NTC_MAR_LICENSES"] = Ntc104Contract,
        ["NTC_FLM_LICENSES"] = Ntc111Contract,
        ["NTC_OTHER_LICENSES"] = Ntc111Contract,
        ["NTC_TVRO_CATV_LICENSES"] = CertificatesCategorySeederData.Ntc122Contract,
        ["NTC_COPY_LICENSES"] = CertificatesCategorySeederData.Ntc121Contract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_1_04", Svc104Id, categoryId, "Application for Ship/Ship-Earth Station License", "Ship/Ship-Earth Station", "NTC_1_04", "Application for Ship/Ship-Earth Station License (NTC 1-04)", Ntc104Contract),
        new("NTC_AMA_LICENSES", SvcLicAmaId, categoryId, "LICENSE IN THE AMATEUR SERVICE", "License in the Amateur Service", "NTC_AMA_LICENSES", "LICENSE IN THE AMATEUR SERVICE", CertificatesCategorySeederData.Ntc103Contract),
        new("NTC_AERO_LICENSES", SvcLicAeroId, categoryId, "LICENSE IN THE AERONAUTICAL SERVICE", null, "NTC_AERO_LICENSES", "LICENSE IN THE AERONAUTICAL SERVICE", Ntc111Contract),
        new("NTC_MAR_LICENSES", SvcLicMarId, categoryId, "LICENSE IN THE MARITIME SERVICE", null, "NTC_MAR_LICENSES", "LICENSE IN THE MARITIME SERVICE", Ntc104Contract),
        new("NTC_FLM_LICENSES", SvcLicFlmId, categoryId, "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", null, "NTC_FLM_LICENSES", "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", Ntc111Contract),
        new("NTC_OTHER_LICENSES", SvcLicOtherId, categoryId, "OTHER RADIO STATION LICENSES/SERVICES", null, "NTC_OTHER_LICENSES", "OTHER RADIO STATION LICENSES/SERVICES", Ntc111Contract),
        new("NTC_TVRO_CATV_LICENSES", SvcLicTvroCatvId, categoryId, "TVRO/CATV STATION LICENSE", null, "NTC_TVRO_CATV_LICENSES", "TVRO/CATV STATION LICENSE", CertificatesCategorySeederData.Ntc122Contract),
        new("NTC_COPY_LICENSES", SvcLicCopyId, categoryId, "COPY OF LICENSES", null, "NTC_COPY_LICENSES", "COPY OF LICENSES", CertificatesCategorySeederData.Ntc121Contract)
    };

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        new(Guid.Parse("60000000-0000-0000-0000-000000000005"), Svc104Id, ServiceVariantType.New, "Ship Station License Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000010"), Svc104Id, ServiceVariantType.Renewal, "Ship Station License Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000006"), Svc111Id, ServiceVariantType.New, "Radio Station License Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000007"), Svc111Id, ServiceVariantType.Renewal, "Radio Station License Application"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000012"), Svc111Id, ServiceVariantType.Modification, "Radio Station License Application"),

        // Amateur Station License
        new(Guid.Parse("60000000-0000-0000-0000-000000000200"), SvcLicAmaId, ServiceVariantType.New, "Amateur Radio Station License (Class A, B, C, D)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000201"), SvcLicAmaId, ServiceVariantType.Renewal, "Amateur Radio Station License (Class A, B, C, D)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000202"), SvcLicAmaId, ServiceVariantType.Modification, "Amateur Radio Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000203"), SvcLicAmaId, ServiceVariantType.New, "Lifetime Amateur Radio Station License for Class A"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000204"), SvcLicAmaId, ServiceVariantType.New, "Amateur Club Radio Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000205"), SvcLicAmaId, ServiceVariantType.Renewal, "Amateur Club Radio Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000206"), SvcLicAmaId, ServiceVariantType.Modification, "Amateur Club Radio Station License"),

        // Aeronautical Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000210"), SvcLicAeroId, ServiceVariantType.New, "Fixed Aeronautical Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000211"), SvcLicAeroId, ServiceVariantType.Renewal, "Fixed Aeronautical Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000212"), SvcLicAeroId, ServiceVariantType.Modification, "Fixed Aeronautical Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000213"), SvcLicAeroId, ServiceVariantType.New, "Aircraft Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000214"), SvcLicAeroId, ServiceVariantType.Renewal, "Aircraft Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000215"), SvcLicAeroId, ServiceVariantType.Modification, "Aircraft Station License"),

        // Maritime Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000220"), SvcLicMarId, ServiceVariantType.New, "Ship Station License Domestic Trade (Without installed equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000221"), SvcLicMarId, ServiceVariantType.New, "Ship Station License Domestic Trade (With installed equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000222"), SvcLicMarId, ServiceVariantType.Renewal, "Ship Station License Domestic Trade"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000223"), SvcLicMarId, ServiceVariantType.Modification, "Ship Station License Domestic Trade"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000224"), SvcLicMarId, ServiceVariantType.Renewal, "Ship Station License International Trade"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000225"), SvcLicMarId, ServiceVariantType.Modification, "Ship Station License International Trade"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000226"), SvcLicMarId, ServiceVariantType.Renewal, "Ship Earth Station License International Trade"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000227"), SvcLicMarId, ServiceVariantType.Modification, "Ship Earth Station License International Trade"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000228"), SvcLicMarId, ServiceVariantType.New, "Private Coastal Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000229"), SvcLicMarId, ServiceVariantType.Renewal, "Private Coastal Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000230"), SvcLicMarId, ServiceVariantType.Modification, "Private Coastal Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000231"), SvcLicMarId, ServiceVariantType.New, "Public Coastal Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000232"), SvcLicMarId, ServiceVariantType.Renewal, "Public Coastal Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000233"), SvcLicMarId, ServiceVariantType.Modification, "Public Coastal Station License"),

        // Fixed & Land Mobile Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000240"), SvcLicFlmId, ServiceVariantType.New, "Radio Station License - Fixed & Land Mobile"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000241"), SvcLicFlmId, ServiceVariantType.Renewal, "Radio Station License - Fixed & Land Mobile"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000242"), SvcLicFlmId, ServiceVariantType.Modification, "Radio Station License - Fixed & Land Mobile"),

        // Other Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000250"), SvcLicOtherId, ServiceVariantType.NA, "Microwave Radio Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000251"), SvcLicOtherId, ServiceVariantType.NA, "Very Small Aperture Terminal (VSAT) Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000252"), SvcLicOtherId, ServiceVariantType.NA, "Public Trunked Radio Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000253"), SvcLicOtherId, ServiceVariantType.NA, "Broadband Wireless Access (BWA) Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000254"), SvcLicOtherId, ServiceVariantType.NA, "Wireless Data Network (WDN) Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000255"), SvcLicOtherId, ServiceVariantType.NA, "Base Transceiver Station (BTS) License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000256"), SvcLicOtherId, ServiceVariantType.NA, "Broadcast Radio Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000257"), SvcLicOtherId, ServiceVariantType.NA, "Television Broadcast Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000258"), SvcLicOtherId, ServiceVariantType.NA, "Earth Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000259"), SvcLicOtherId, ServiceVariantType.NA, "Direct-To-Home (DTH) Earth Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000260"), SvcLicOtherId, ServiceVariantType.NA, "Satellite News Gathering (SNG) Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000261"), SvcLicOtherId, ServiceVariantType.NA, "Radio Navigation Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000262"), SvcLicOtherId, ServiceVariantType.NA, "Radiolocation Station License"),

        // TVRO & CATV Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000270"), SvcLicTvroCatvId, ServiceVariantType.New, "TVRO Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000271"), SvcLicTvroCatvId, ServiceVariantType.Renewal, "TVRO Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000272"), SvcLicTvroCatvId, ServiceVariantType.New, "CATV Station License"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000273"), SvcLicTvroCatvId, ServiceVariantType.Renewal, "CATV Station License"),

        // Copy of Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000280"), SvcLicCopyId, ServiceVariantType.NA, "Certified True Copy (License)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000281"), SvcLicCopyId, ServiceVariantType.NA, "Duplicate Copy (License)")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["AM_CALL_SIGN_ASSIGN"] = new(Guid.Parse("70000000-0000-0000-0000-000000000200"), "Official Call Sign Assignment", "Proof of official Call Sign Assignment issued by NTC."),
        ["AM_EXPIRING_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000201"), "Copy of Expiring Amateur Radio Station License", "Copy of expiring Amateur Radio Station License."),
        ["CLASS_A_SUPP_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000202"), "Lifetime Class A Supplementary Certificate", "Lifetime Amateur Radio Station Supplementary Certificate."),
        ["CLASS_A_PROOF_20YRS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000203"), "Proof of 20 Years Continuous Class A License", "Proof of holding Class A license continuously for at least 20 years."),
        ["AGE_PROOF_60YRS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000204"), "Proof of Age 60+", "Birth certificate, senior citizen ID, or passport showing age 60 or above."),
        ["NTC_COMMENDATION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000205"), "Certificate of Commendation from NTC / Accredited Org", "Commendation certificate or board resolution."),
        ["CLUB_ACCREDITATION_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000206"), "Certificate of Accreditation as Amateur Radio Club", "Valid Certificate of Club Accreditation from NTC."),
        ["CLUB_BOARD_RESOLUTION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000207"), "Board Resolution Authorizing Trustee", "Duly notarized Board Resolution authorizing the club trustee."),
        ["CLUB_EXPIRING_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000208"), "Copy of Expiring Club Radio Station License", "Copy of expiring Club Radio Station License."),
        ["AERO_CAAP_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000210"), "CAAP Certificate of Aerodrome Registration", "Valid CAAP Aerodrome Registration or Certificate of Operating Authority."),
        ["AERO_FREQ_CLEARANCE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000211"), "CAAP Frequency Coordination Clearance", "Frequency clearance issued by CAAP Air Traffic Service."),
        ["AERO_APPROVED_ENGINEERING"] = new(Guid.Parse("70000000-0000-0000-0000-000000000212"), "Approved Aeronautical Engineering Plan", "Engineering plans prepared and signed by registered PECE/ECE."),
        ["OPERATOR_ROC_COPY"] = new(Guid.Parse("70000000-0000-0000-0000-000000000213"), "Copy of Radio Operator Certificate (ROC)", "Valid Commercial Radio Operator Certificate of designated operator."),
        ["EXPIRING_AERO_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000214"), "Copy of Expiring Aeronautical Station License", "Copy of expiring Aeronautical Radio Station License."),
        ["AIRCRAFT_COA"] = new(Guid.Parse("70000000-0000-0000-0000-000000000215"), "CAAP Certificate of Airworthiness (COA)", "Valid Certificate of Airworthiness issued by CAAP."),
        ["AIRCRAFT_COR"] = new(Guid.Parse("70000000-0000-0000-0000-000000000216"), "CAAP Certificate of Aircraft Registration (COR)", "Certificate of Aircraft Registration issued by CAAP."),
        ["AIRCRAFT_RADIO_INSP"] = new(Guid.Parse("70000000-0000-0000-0000-000000000217"), "CAAP/NTC Aircraft Radio Inspection Report", "Official radio station inspection report for aircraft unit."),
        ["EXPIRING_AIRCRAFT_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000218"), "Copy of Expiring Aircraft Station License", "Copy of expiring Aircraft Radio Station License."),
        ["MARINA_CPCN_OR_PA"] = new(Guid.Parse("70000000-0000-0000-0000-000000000220"), "MARINA CPCN or Certificate of Public Convenience", "Valid MARINA CPCN, Provisional Authority, or Special Permit."),
        ["MARITIME_INSP_REPORT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000221"), "NTC Ship Radio Inspection Report", "Official on-board ship radio station inspection report."),
        ["EXPIRING_SHIP_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000222"), "Copy of Expiring Ship Station License", "Copy of expiring Ship Station License."),
        ["SAFETY_RADIO_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000223"), "Cargo Ship Safety Radio Certificate", "Valid Cargo Ship Safety Radio Certificate issued by MARINA/NTC."),
        ["MARINA_COR"] = new(Guid.Parse("70000000-0000-0000-0000-000000000224"), "MARINA Certificate of Vessel Registry", "Certificate of Philippine Registry or Certificate of Ownership."),
        ["CLASS_CERTIFICATE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000225"), "Recognized Classification Society Certificate", "Classification certificate from IACS-recognized organization."),
        ["AAIC_CONFIRMATION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000226"), "Accounting Authority Identification Code (AAIC) Confirmation", "Official confirmation from designated maritime accounting authority."),
        ["ITU_NOTIFICATION_PROOF"] = new(Guid.Parse("70000000-0000-0000-0000-000000000227"), "Proof of ITU Notification (MARS Database)", "Proof of registration in the ITU MARS database."),
        ["EXPIRING_SHIP_EARTH_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000228"), "Copy of Expiring Ship Earth Station License", "Copy of expiring Ship Earth Station License."),
        ["COASTAL_PTE_CONCESSION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000229"), "Public Telecommunications Entity (PTE) Franchise / Authorization", "Legislative Franchise or NTC Certificate of Public Convenience and Necessity."),
        ["FLM_ENGINEERING_REPORT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000230"), "Fixed & Land Mobile Engineering Report signed by PECE", "Complete technical engineering analysis prepared and signed by PECE."),
        ["TVRO_HEADEND_SCHEMATIC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000240"), "Head-End Schematic Diagram & Layout Plan", "Schematic diagram and equipment layout plan signed by PECE."),
        ["TVRO_SATELLITE_COORDINATES"] = new(Guid.Parse("70000000-0000-0000-0000-000000000241"), "Satellite Transponder & Technical Reception Parameters", "Geographical coordinates, azimuth, elevation, transponder and EIRP parameters."),
        ["TVRO_INSPECTION_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000242"), "NTC Technical Site Inspection Report", "Official NTC technical inspection certificate for TVRO site."),
        ["EXPIRING_TVRO_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000243"), "Copy of Expiring TVRO Station License", "Copy of expiring TVRO Station License."),
        ["CATV_PROVISIONAL_AUTHORITY"] = new(Guid.Parse("70000000-0000-0000-0000-000000000250"), "CATV Provisional Authority (PA) or Certificate of Authority", "Valid NTC Provisional Authority or Certificate of Authority for CATV operation."),
        ["CATV_SYSTEM_DESIGN"] = new(Guid.Parse("70000000-0000-0000-0000-000000000251"), "CATV Distribution System Engineering Design", "Complete trunkline, feeder, and optical/RF distribution design signed by PECE."),
        ["CATV_BARANGAY_PERMITS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000252"), "LGU Right-of-Way / Pole Attachment Agreements", "Agreements for pole attachment and local government right-of-way clearance."),
        ["EXPIRING_CATV_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000253"), "Copy of Expiring CATV Station License", "Copy of expiring CATV Station License."),
        ["NOTARIZED_AFFIDAVIT_LOSS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000260"), "Duly Notarized Affidavit of Loss / Explanation of Mutilation", "Duly notarized Affidavit of Loss or damaged license explanation."),
        ["SCANNED_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000261"), "Copy of Previously Issued Station License", "Scanned copy of existing station license.")
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // Amateur Radio Station License
        new(Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000200"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000200"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000201"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000016"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000201"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000202"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000202"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000203"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000204"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000205"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000203"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000204"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000204"), Guid.Parse("70000000-0000-0000-0000-000000000206"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000205"), Guid.Parse("70000000-0000-0000-0000-000000000207"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000205"), Guid.Parse("70000000-0000-0000-0000-000000000208"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000206"), Guid.Parse("70000000-0000-0000-0000-000000000207"), true),

        // Aeronautical Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000210"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000211"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000210"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000211"), Guid.Parse("70000000-0000-0000-0000-000000000214"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000212"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000212"), Guid.Parse("70000000-0000-0000-0000-000000000214"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000215"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000216"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000217"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000213"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000218"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000215"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000216"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000217"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000214"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000215"), Guid.Parse("70000000-0000-0000-0000-000000000218"), true),

        // Maritime Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000220"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000221"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000221"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000222"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000223"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000223"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000224"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000225"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000226"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000224"), Guid.Parse("70000000-0000-0000-0000-000000000227"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000225"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000228"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000223"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000224"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000225"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000226"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000226"), Guid.Parse("70000000-0000-0000-0000-000000000227"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000227"), Guid.Parse("70000000-0000-0000-0000-000000000222"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000229"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000228"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000229"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000230"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000230"), Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000231"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000232"), Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000233"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

        // Fixed & Land Mobile Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000230"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000240"), Guid.Parse("70000000-0000-0000-0000-000000000078"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000241"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000241"), Guid.Parse("70000000-0000-0000-0000-000000000230"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000242"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

        // Other Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000250"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000251"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000252"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000253"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000254"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000255"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000256"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000257"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000258"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000259"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000260"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000261"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000262"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

        // TVRO & CATV Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000240"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000270"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000243"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000021"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000271"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000250"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000251"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000272"), Guid.Parse("70000000-0000-0000-0000-000000000252"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000253"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000250"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000242"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000273"), Guid.Parse("70000000-0000-0000-0000-000000000252"), true),

        // Copy of Licenses
        new(Guid.Parse("60000000-0000-0000-0000-000000000280"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000281"), Guid.Parse("70000000-0000-0000-0000-000000000260"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000281"), Guid.Parse("70000000-0000-0000-0000-000000000261"), true)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_04", Guid.Parse("f0400000-0000-0000-0000-000000000001"), Guid.Parse("f04a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "birthDate", "sex", "nationality" }),
            new("applicantAddress", "Address Information", new() { "region", "province", "city", "barangay", "street", "zipCode" }),
            new("applicantContact", "Contact Information", new() { "contactNo", "email" }),
            new("vessel", "Vessel Details", new() { "vesselName", "callSign", "imoNumber" }),
            new("equipment", "Equipment List", new() { "equipmentDetails" }),
            new("radioOfficers", "Radio Officers", new() { "radioOfficers" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_1_11", Guid.Parse("f1100000-0000-0000-0000-000000000001"), Guid.Parse("f11a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("stations", "Station Details", new() { "stationLocation" }),
            new("equipment", "Equipment Details", new() { "equipmentDetails" }),
            new("antennas", "Antenna Details", new() { "antennaDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_AMA_LICENSES", Guid.Parse("f7000000-0000-0000-0000-000000000001"), Guid.Parse("f70a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicantPerson", "Basic Applicant Information", new() { "fullName", "middleName", "suffix", "birthDate", "contactNo", "email", "address", "location", "callSign" }),
            new("permitType", "Transaction & License Options", new() { "appType", "classOfStation", "noOfYears" }),
            new("classOfStation", "Class of Station", new() { "classOfStation" }),
            new("existingLicense", "Existing License Details", new() { "licenseNo", "dateOfExpiry", "modificationDueTo" }),
            new("examBackground", "Examination / Seminar Background", new() { "placeOfExamSeminar", "dateOfExamSeminar", "ratings" }),
            new("equipment", "Particulars of Radio Equipment", new() { "particularsEquipment" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_AERO_LICENSES", Guid.Parse("f7100000-0000-0000-0000-000000000001"), Guid.Parse("f71a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant/Station Owner Details", new() { "fullName", "address", "contactNo", "email" }),
            new("stations", "Station Details", new() { "stationLocation" }),
            new("equipment", "Equipment Details", new() { "equipmentDetails" }),
            new("antennas", "Antenna Details", new() { "antennaDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_MAR_LICENSES", Guid.Parse("f7200000-0000-0000-0000-000000000001"), Guid.Parse("f72a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant/Station Owner Details", new() { "fullName", "address", "contactNo", "email" }),
            new("vessel", "Vessel Details", new() { "vesselName", "callSign", "imoNumber" }),
            new("equipment", "Equipment List", new() { "equipmentDetails" }),
            new("radioOfficers", "Radio Officers", new() { "radioOfficers" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_FLM_LICENSES", Guid.Parse("f7300000-0000-0000-0000-000000000001"), Guid.Parse("f73a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant/Station Owner Details", new() { "fullName", "address", "contactNo", "email" }),
            new("stations", "Station Details", new() { "stationLocation" }),
            new("equipment", "Equipment Details", new() { "equipmentDetails" }),
            new("antennas", "Antenna Details", new() { "antennaDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_OTHER_LICENSES", Guid.Parse("f7400000-0000-0000-0000-000000000001"), Guid.Parse("f74a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant/Station Owner Details", new() { "fullName", "address", "contactNo", "email" }),
            new("stations", "Station Details", new() { "stationLocation" }),
            new("equipment", "Equipment Details", new() { "equipmentDetails" }),
            new("antennas", "Antenna Details", new() { "antennaDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_TVRO_CATV_LICENSES", Guid.Parse("f7500000-0000-0000-0000-000000000001"), Guid.Parse("f75a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("tvroEquipment", "TVRO Equipment Details", new() { "tvroDetails" }),
            new("antennaSystem", "Antenna System Details", new() { "antennaDetails" }),
            new("signalReception", "Signal Reception Details", new() { "tvroDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_COPY_LICENSES", Guid.Parse("f7600000-0000-0000-0000-000000000001"), Guid.Parse("f76a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("permitLicenseCertificateNo", "Existing Permit/License Number", new() { "circumstances" }),
            new("circumstances", "Circumstances of Loss/Damage", new() { "circumstances" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000009"),
            new[] { "LICENSE IN THE AMATEUR SERVICE", "Amateur License" },
            "License in the Amateur Service\n\nThe Amateur Radio Station License is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Station License is required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Station License is required for changes in the particulars indicated in the License.",
            "WHO MAY AVAIL:\n\n1. Individuals who have passed the Amateur Radio Operator Examination conducted by NTC\n2. Duly accredited amateur radio clubs\n3. Foreign amateurs qualified under the reciprocity agreement\n4. Licensed amateur radio operators"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000010"),
            new[] { "LICENSE IN THE AERONAUTICAL SERVICE", "Aeronautical" },
            "Licenses in the Aeronautical Service\n\nA Fixed Aeronautical Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate an aeronautical fixed station in the Aeronautical Fixed Service.\n\nAn Aircraft Station License is a written authority issued by the Commission to an individual or private or government entities authorizing the holder thereof to operate a mobile station installed onboard any type of aircraft.\n\nThe RENEWAL of Fixed Aeronautical Station License or Aircraft Station License is required for the continuous operation of an existing radio station.\n\nThe MODIFICATION of Fixed Aeronautical Station License or Aircraft Station License is required for changes in the particulars indicated in the License.",
            "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000011"),
            new[] { "LICENSE IN THE MARITIME SERVICE", "Maritime" },
            "Licenses in the Maritime Service\n\nThe Ship Station License or Ship Earth Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate ship radio station (radio and navigation equipment) in the Maritime Mobile Service.\n\nA Private Coastal Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate a radio station in the Maritime Service.\n\nA Public Coastal Station License is a written authority issued by the Commission to a public telecommunications entity (PTEs) authorizing the holder thereof to operate a public coastal station in the Maritime Service.\n\nThe RENEWAL of a Ship Station License or Ship Earth Station License is required for the continuous operation of an existing radio stations.\n\nThe RENEWAL of a Private Coastal Station License is required for the continuous operation of a private coastal station.\n\nThe RENEWAL of Public Coastal Station License is required for the continuous operation of public coastal stations in the Maritime Service.\n\nThe MODIFICATION of a Ship Station License, Ship Earth Station License, or Private Coastal Radio Station License is required for changes in the particulars indicated in the License.\n\nThe MODIFICATION of Public Coastal Station License is required for changes in the particulars indicated in the License.",
            "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000012"),
            new[] { "FIXED AND LAND MOBILE SERVICE", "Fixed Radio" },
            "Licenses for Government and Private Radio Stations in the Fixed and Land Mobile Service\n\nA Radio Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate a radio station.\n\nThe RENEWAL of a Radio Station License is required from an individual or private or government entities for the continuous operation of an existing radio station.\n\nThe MODIFICATION of a Radio Station License is required from the Commission to an individual, private and government entities for changes in the particulars indicated in the License.",
            "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000013"),
            new[] { "OTHER RADIO STATION", "Other License" },
            "Radio Station License\n\nThe RENEWAL of a Radio Station License is required from the public telecommunications entity for the continuous operation of an existing radio station.\n\nThe MODIFICATION of a Radio Station License is required from the public telecommunications entity for changes in the particulars indicated in the License.",
            "WHO MAY AVAIL:\n\n1. Public Telecommunications Entities (PTEs)\n2. Private and Government Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000014"),
            new[] { "TVRO/CATV", "Cable TV License" },
            "TVRO/CATV Station License\n\nA TVRO Station License or CATV Station License is a written authority issued by the Commission to cable TV operators, private and government entities authorizing the holder thereof to operate a TVRO for commercial purposes or operate a CATV system.\n\nThe RENEWAL of a TVRO Station License or CATV Station License is required for the continuous operation of the subject station.",
            "WHO MAY AVAIL:\n\n1. Cable TV Operators and Private and Government Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000015"),
            new[] { "COPY OF LICENSES", "Duplicate License" },
            "Copy of Licenses\n\nA Certified True Copy of a License is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a License is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
            "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
        )
    };
}
