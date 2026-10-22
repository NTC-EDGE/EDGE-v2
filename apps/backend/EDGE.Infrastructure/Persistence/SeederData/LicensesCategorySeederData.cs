using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class LicensesCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000003");

    // Exact 7 Services from spreadsheet
    public static readonly Guid SvcLicAmaId      = Guid.Parse("50000000-0000-0000-0000-000000000070");
    public static readonly Guid SvcLicAeroId     = Guid.Parse("50000000-0000-0000-0000-000000000071");
    public static readonly Guid SvcLicMarId      = Guid.Parse("50000000-0000-0000-0000-000000000072");
    public static readonly Guid SvcLicFlmId      = Guid.Parse("50000000-0000-0000-0000-000000000073");
    public static readonly Guid SvcLicOtherId    = Guid.Parse("50000000-0000-0000-0000-000000000074");
    public static readonly Guid SvcLicTvroCatvId = Guid.Parse("50000000-0000-0000-0000-000000000075");
    public static readonly Guid SvcLicCopyId     = Guid.Parse("50000000-0000-0000-0000-000000000076");

    #region Contracts
    public static readonly string NtcAmaLicenseContract = @"
    {
        ""formNo"": ""NTC-AMA-LICENSES"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Licenses"",
        ""group"": ""License in the Amateur Service"",
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [""Class A"", ""Class B"", ""Class C"", ""Class D""],
        ""requiredSections"": [
            { ""key"": ""station"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""antennas"", ""required"": true },
        ],
        ""allowsBulkSubmission"": false,
        ""entityType"": ""Application""
    }";

    public static readonly string NtcAeroLicenseContract = @"
    {
        ""formNo"": ""NTC-AERO-LICENSES"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Licenses"",
        ""group"": ""License in the Aeronautical Service"",
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""aircraft"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""antennas"", ""required"": true },
        ],
        ""allowsBulkSubmission"": false,
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc104Contract = @"
    {
        ""formNo"": ""NTC 1-04"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Licenses"",
        ""group"": ""Ship/Ship-Earth Station"",
        ""applicationTypes"": [""NEW"", ""RENEWAL"", ""MODIFICATION"", ""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""vessel"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""radioOfficers"", ""required"": false },
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""permitLicenseType"": [""SHIP STATION LICENSE"",""SHIP-EARTH STATION LICENSE"",""CARGO SHIP SAFETY RADIO CERTIFICATE"",""FERRYING PERMIT"",""TEMPORARY PERMIT""],
            ""ferryingPermitType"": [""Ship"",""Aircraft""],
            ""operationScope"": [""DOMESTIC"",""INTERNATIONAL""],
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
        ""serviceCategory"": ""Licenses"",
        ""group"": null,
        ""applicationTypes"": [""New"", ""Renewal"", ""Construction Permit"", ""Radio Station License"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""stations"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""antennas"", ""required"": true },
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""permitSubtype"": [""Construction Permit"",""Radio Station License""],
            ""typeOfRadioService"": [""FIXED AND LAND MOBILE"",""BROADCAST"",""AERONAUTICAL"",""MARITIME (Public/Private Coastal)"",""OTHERS, specify""],
            ""natureOfService"": [""P"",""CV (PRIVATE)"",""CO (GOVERNMENT)"",""CP (PUBLIC CORRESPONDENCE)""],
            ""classOfStation"": [""FX"",""FB"",""ML"",""FA"",""FC"",""MA"",""RT"",""BC"",""TC"",""OTHERS, specify""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string NtcTvroCatvLicenseContract = @"
    {
        ""formNo"": ""NTC-TVRO-CATV-LICENSES"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Licenses"",
        ""group"": ""TVRO/CATV Station License"",
        ""applicationTypes"": [""New"", ""Renewal"", ""Modification""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""headEnd"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""antennas"", ""required"": true },
        ],
        ""allowsBulkSubmission"": false,
        ""entityType"": ""Application""
    }";

    public static readonly string NtcCopyLicenseContract = @"
    {
        ""formNo"": ""NTC-COPY-LICENSES"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Licenses"",
        ""group"": ""Copy of Licenses"",
        ""applicationTypes"": [""Certified True Copy"", ""Duplicate Copy""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""permitLicenseCertificateNo"", ""required"": true },
            { ""key"": ""circumstances"", ""required"": true },
        ],
        ""allowsBulkSubmission"": false,
        ""entityType"": ""Application""
    }";
    #endregion

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_04"] = Ntc104Contract,
        ["NTC_1_11"] = Ntc111Contract,
        ["NTC_AMA_LICENSES"] = NtcAmaLicenseContract,
        ["NTC_AERO_LICENSES"] = NtcAeroLicenseContract,
        ["NTC_MAR_LICENSES"] = Ntc104Contract,
        ["NTC_FLM_LICENSES"] = Ntc111Contract,
        ["NTC_OTHER_LICENSES"] = Ntc111Contract,
        ["NTC_TVRO_CATV_LICENSES"] = NtcTvroCatvLicenseContract,
        ["NTC_COPY_LICENSES"] = NtcCopyLicenseContract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_AMA_LICENSES", SvcLicAmaId, categoryId, "LICENSE IN THE AMATEUR SERVICE", "License in the Amateur Service", "NTC_AMA_LICENSES", "LICENSE IN THE AMATEUR SERVICE", NtcAmaLicenseContract),
        new("NTC_AERO_LICENSES", SvcLicAeroId, categoryId, "LICENSE IN THE AERONAUTICAL SERVICE", null, "NTC_AERO_LICENSES", "LICENSE IN THE AERONAUTICAL SERVICE", NtcAeroLicenseContract),
        new("NTC_MAR_LICENSES", SvcLicMarId, categoryId, "LICENSE IN THE MARITIME SERVICE", null, "NTC_MAR_LICENSES", "LICENSE IN THE MARITIME SERVICE", Ntc104Contract),
        new("NTC_FLM_LICENSES", SvcLicFlmId, categoryId, "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", null, "NTC_FLM_LICENSES", "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", Ntc111Contract),
        new("NTC_OTHER_LICENSES", SvcLicOtherId, categoryId, "OTHER RADIO STATION LICENSES/SERVICES", null, "NTC_OTHER_LICENSES", "OTHER RADIO STATION LICENSES/SERVICES", Ntc111Contract),
        new("NTC_TVRO_CATV_LICENSES", SvcLicTvroCatvId, categoryId, "TVRO/CATV STATION LICENSE", null, "NTC_TVRO_CATV_LICENSES", "TVRO/CATV STATION LICENSE", NtcTvroCatvLicenseContract),
        new("NTC_COPY_LICENSES", SvcLicCopyId, categoryId, "COPY OF LICENSES", null, "NTC_COPY_LICENSES", "COPY OF LICENSES", NtcCopyLicenseContract)
    };

    // Variant IDs
    public static readonly Guid VarAmaRslNew        = Guid.Parse("60000000-0000-0000-0000-000000000200");
    public static readonly Guid VarAmaRslRen        = Guid.Parse("60000000-0000-0000-0000-000000000201");
    public static readonly Guid VarAmaRslMod        = Guid.Parse("60000000-0000-0000-0000-000000000202");
    public static readonly Guid VarAmaLifetimeNew   = Guid.Parse("60000000-0000-0000-0000-000000000203");
    public static readonly Guid VarAmaLifetimeMod   = Guid.Parse("60000000-0000-0000-0000-000000000207");
    public static readonly Guid VarAmaClubNew       = Guid.Parse("60000000-0000-0000-0000-000000000204");
    public static readonly Guid VarAmaClubRen       = Guid.Parse("60000000-0000-0000-0000-000000000205");
    public static readonly Guid VarAmaClubMod       = Guid.Parse("60000000-0000-0000-0000-000000000206");

    public static readonly Guid VarAeroFixedNew     = Guid.Parse("60000000-0000-0000-0000-000000000210");
    public static readonly Guid VarAeroFixedRen     = Guid.Parse("60000000-0000-0000-0000-000000000211");
    public static readonly Guid VarAeroFixedMod     = Guid.Parse("60000000-0000-0000-0000-000000000212");
    public static readonly Guid VarAeroAircraftNew  = Guid.Parse("60000000-0000-0000-0000-000000000213");
    public static readonly Guid VarAeroAircraftRen  = Guid.Parse("60000000-0000-0000-0000-000000000214");
    public static readonly Guid VarAeroAircraftMod  = Guid.Parse("60000000-0000-0000-0000-000000000215");

    public static readonly Guid VarMarDomWithoutNew = Guid.Parse("60000000-0000-0000-0000-000000000220");
    public static readonly Guid VarMarDomWithNew    = Guid.Parse("60000000-0000-0000-0000-000000000221");
    public static readonly Guid VarMarDomRen        = Guid.Parse("60000000-0000-0000-0000-000000000222");
    public static readonly Guid VarMarDomMod        = Guid.Parse("60000000-0000-0000-0000-000000000223");
    public static readonly Guid VarMarIntlRen       = Guid.Parse("60000000-0000-0000-0000-000000000224");
    public static readonly Guid VarMarIntlEarthRen  = Guid.Parse("60000000-0000-0000-0000-000000000226");
    public static readonly Guid VarMarIntlMod       = Guid.Parse("60000000-0000-0000-0000-000000000225");
    public static readonly Guid VarMarIntlEarthMod  = Guid.Parse("60000000-0000-0000-0000-000000000227");
    public static readonly Guid VarMarPrivCoastNew  = Guid.Parse("60000000-0000-0000-0000-000000000228");
    public static readonly Guid VarMarPrivCoastRen  = Guid.Parse("60000000-0000-0000-0000-000000000229");
    public static readonly Guid VarMarPrivCoastMod  = Guid.Parse("60000000-0000-0000-0000-000000000230");
    public static readonly Guid VarMarPubCoastNew   = Guid.Parse("60000000-0000-0000-0000-000000000231");
    public static readonly Guid VarMarPubCoastRen   = Guid.Parse("60000000-0000-0000-0000-000000000232");
    public static readonly Guid VarMarPubCoastMod   = Guid.Parse("60000000-0000-0000-0000-000000000233");

    public static readonly Guid VarFlmRslNew        = Guid.Parse("60000000-0000-0000-0000-000000000240");
    public static readonly Guid VarFlmRslRen        = Guid.Parse("60000000-0000-0000-0000-000000000241");
    public static readonly Guid VarFlmRslMod        = Guid.Parse("60000000-0000-0000-0000-000000000242");

    public static readonly Guid VarOtherMicrowaveRen= Guid.Parse("60000000-0000-0000-0000-000000000250");
    public static readonly Guid VarOtherMicrowaveMod= Guid.Parse("60000000-0000-0000-0000-000000000263");
    public static readonly Guid VarOtherVsatRen     = Guid.Parse("60000000-0000-0000-0000-000000000251");
    public static readonly Guid VarOtherVsatMod     = Guid.Parse("60000000-0000-0000-0000-000000000264");
    public static readonly Guid VarOtherTrunkedRen  = Guid.Parse("60000000-0000-0000-0000-000000000252");
    public static readonly Guid VarOtherTrunkedMod  = Guid.Parse("60000000-0000-0000-0000-000000000265");
    public static readonly Guid VarOtherBwaRen      = Guid.Parse("60000000-0000-0000-0000-000000000253");
    public static readonly Guid VarOtherBwaMod      = Guid.Parse("60000000-0000-0000-0000-000000000266");
    public static readonly Guid VarOtherWdnNew      = Guid.Parse("60000000-0000-0000-0000-000000000254");
    public static readonly Guid VarOtherWdnRen      = Guid.Parse("60000000-0000-0000-0000-000000000267");
    public static readonly Guid VarOtherWdnMod      = Guid.Parse("60000000-0000-0000-0000-000000000268");
    public static readonly Guid VarOtherBtsRen      = Guid.Parse("60000000-0000-0000-0000-000000000255");
    public static readonly Guid VarOtherBtsMod      = Guid.Parse("60000000-0000-0000-0000-000000000269");

    public static readonly Guid VarTvroNew          = Guid.Parse("60000000-0000-0000-0000-000000000270");
    public static readonly Guid VarTvroRen          = Guid.Parse("60000000-0000-0000-0000-000000000271");
    public static readonly Guid VarTvroMod          = Guid.Parse("60000000-0000-0000-0000-000000000274");
    public static readonly Guid VarCatvNew          = Guid.Parse("60000000-0000-0000-0000-000000000272");
    public static readonly Guid VarCatvRen          = Guid.Parse("60000000-0000-0000-0000-000000000273");
    public static readonly Guid VarCatvMod          = Guid.Parse("60000000-0000-0000-0000-000000000275");

    public static readonly Guid VarLicTrueCopy      = Guid.Parse("60000000-0000-0000-0000-000000000280");
    public static readonly Guid VarLicDuplicate     = Guid.Parse("60000000-0000-0000-0000-000000000281");

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        // 1. LICENSE IN THE AMATEUR SERVICE
        new(VarAmaRslNew, SvcLicAmaId, ServiceVariantType.New, "Amateur Radio Station License"),
        new(VarAmaRslRen, SvcLicAmaId, ServiceVariantType.Renewal, "Amateur radio Station License"),
        new(VarAmaRslMod, SvcLicAmaId, ServiceVariantType.Modification, "Amateur Radio Station License"),
        new(VarAmaLifetimeNew, SvcLicAmaId, ServiceVariantType.New, "Lifetime Amateur Radio Station License for Class A"),
        new(VarAmaLifetimeMod, SvcLicAmaId, ServiceVariantType.Modification, "Lifetime Amateur Radio Station License for Class A"),
        new(VarAmaClubNew, SvcLicAmaId, ServiceVariantType.New, "Amateur Club Radio Station License", false),
        new(VarAmaClubRen, SvcLicAmaId, ServiceVariantType.Renewal, "Amateur Club Radio Station License", false),
        new(VarAmaClubMod, SvcLicAmaId, ServiceVariantType.Modification, "Amateur Club Radio Station License", false),

        // 2. LICENSE IN THE AERONAUTICAL SERVICE
        new(VarAeroFixedNew, SvcLicAeroId, ServiceVariantType.New, "Fixed Aeronautical Station License", false),
        new(VarAeroFixedRen, SvcLicAeroId, ServiceVariantType.Renewal, "Fixed Aeronautical Station License", false),
        new(VarAeroFixedMod, SvcLicAeroId, ServiceVariantType.Modification, "Fixed Aeronautical Station License", false),
        new(VarAeroAircraftNew, SvcLicAeroId, ServiceVariantType.New, "Aircraft Station License", false),
        new(VarAeroAircraftRen, SvcLicAeroId, ServiceVariantType.Renewal, "Aircraft Station License", false),
        new(VarAeroAircraftMod, SvcLicAeroId, ServiceVariantType.Modification, "Aircraft Station License", false),

        // 3. LICENSE IN THE MARITIME SERVICE
        new(VarMarDomWithoutNew, SvcLicMarId, ServiceVariantType.New, "Ship Station License Domestic Trade (Without originally-installed equipment)", false),
        new(VarMarDomWithNew, SvcLicMarId, ServiceVariantType.New, "Ship Station License Domestic trade (With Originally0installed equipment)", false),
        new(VarMarDomRen, SvcLicMarId, ServiceVariantType.Renewal, "Ship Station License Domestic Trade", false),
        new(VarMarDomMod, SvcLicMarId, ServiceVariantType.Modification, "Ship Station License Domestic Trade", false),
        new(VarMarIntlRen, SvcLicMarId, ServiceVariantType.Renewal, "Ship Station License International Trade", false),
        new(VarMarIntlEarthRen, SvcLicMarId, ServiceVariantType.Renewal, "Ship Earth Station License International Trade", false),
        new(VarMarIntlMod, SvcLicMarId, ServiceVariantType.Modification, "Ship Station License International Trade", false),
        new(VarMarIntlEarthMod, SvcLicMarId, ServiceVariantType.Modification, "Ship Earth Station License International Trade", false),
        new(VarMarPrivCoastNew, SvcLicMarId, ServiceVariantType.New, "Private Coastal Station License", false),
        new(VarMarPrivCoastRen, SvcLicMarId, ServiceVariantType.Renewal, "Private Coastal Station License", false),
        new(VarMarPrivCoastMod, SvcLicMarId, ServiceVariantType.Modification, "Private Coastal Station License", false),
        new(VarMarPubCoastNew, SvcLicMarId, ServiceVariantType.New, "Public Coastal Station License", false),
        new(VarMarPubCoastRen, SvcLicMarId, ServiceVariantType.Renewal, "Public Coastal Station License", false),
        new(VarMarPubCoastMod, SvcLicMarId, ServiceVariantType.Modification, "Public Coastal Station License", false),

        // 4. LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE
        new(VarFlmRslNew, SvcLicFlmId, ServiceVariantType.New, "Radio Station License", false),
        new(VarFlmRslRen, SvcLicFlmId, ServiceVariantType.Renewal, "Radio Station License", false),
        new(VarFlmRslMod, SvcLicFlmId, ServiceVariantType.Modification, "Radio Station License", false),

        // 5. OTHER RADIO STATION LICENSES/SERVICES
        new(VarOtherMicrowaveRen, SvcLicOtherId, ServiceVariantType.Renewal, "Radio Station License - Microwave", false),
        new(VarOtherMicrowaveMod, SvcLicOtherId, ServiceVariantType.Modification, "Radio Station License - Microwave", false),
        new(VarOtherVsatRen, SvcLicOtherId, ServiceVariantType.Renewal, "Radio Station License - VSAT", false),
        new(VarOtherVsatMod, SvcLicOtherId, ServiceVariantType.Modification, "Radio Station License - VSAT", false),
        new(VarOtherTrunkedRen, SvcLicOtherId, ServiceVariantType.Renewal, "Radio Station License - Public Trunked", false),
        new(VarOtherTrunkedMod, SvcLicOtherId, ServiceVariantType.Modification, "Radio Station License- Public Trunked", false),
        new(VarOtherBwaRen, SvcLicOtherId, ServiceVariantType.Renewal, "Radio Station License - BWA", false),
        new(VarOtherBwaMod, SvcLicOtherId, ServiceVariantType.Modification, "Radio Station License- BWA", false),
        new(VarOtherWdnNew, SvcLicOtherId, ServiceVariantType.New, "Radio Station License - WDN", false),
        new(VarOtherWdnRen, SvcLicOtherId, ServiceVariantType.Renewal, "Radio Station License - WDN", false),
        new(VarOtherWdnMod, SvcLicOtherId, ServiceVariantType.Modification, "Radio Station License - WDN", false),
        new(VarOtherBtsRen, SvcLicOtherId, ServiceVariantType.Renewal, "Radio Station License - BTS", false),
        new(VarOtherBtsMod, SvcLicOtherId, ServiceVariantType.Modification, "Radio Station License - BTS", false),

        // 6. TVRO/CATV STATION LICENSE
        new(VarTvroNew, SvcLicTvroCatvId, ServiceVariantType.New, "TVRO Station License", false),
        new(VarTvroRen, SvcLicTvroCatvId, ServiceVariantType.Renewal, "TVRO Station License", false),
        new(VarTvroMod, SvcLicTvroCatvId, ServiceVariantType.Modification, "TVRO Station License", false),
        new(VarCatvNew, SvcLicTvroCatvId, ServiceVariantType.New, "CATV Station License", false),
        new(VarCatvRen, SvcLicTvroCatvId, ServiceVariantType.Renewal, "CATV Station License", false),
        new(VarCatvMod, SvcLicTvroCatvId, ServiceVariantType.Modification, "CATV Station License", false),

        // 7. COPY OF LICENSES
        new(VarLicTrueCopy, SvcLicCopyId, ServiceVariantType.NA, "Certified True Copy"),
        new(VarLicDuplicate, SvcLicCopyId, ServiceVariantType.NA, "Duplicate Copy")
    };

    public static List<VariantElementDef> GetBackfillElements() => new()
    {
        // Elements from spreadsheet
        new(VarAmaRslNew, "Class A", "Class A"),
        new(VarAmaRslNew, "Class B", "Class B"),
        new(VarAmaRslNew, "Class C", "Class C"),
        new(VarAmaRslNew, "Class D", "Class D"),

        new(VarAmaRslRen, "Class A", "Class A"),
        new(VarAmaRslRen, "Class B", "Class B"),
        new(VarAmaRslRen, "Class C", "Class C"),
        new(VarAmaRslRen, "Class D", "Class D")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["PERMIT_TO_PURCHASE_POSSESS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000062"),
            "Permit to Purchase/Possess",
            "Permit to Purchase/Possess"
        ),
        ["VALID_AT_ROC_FOR_HOLDERS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000007"),
            "For Amateur Radio Operator Certificate (AT-ROC) holders:\nValid AT-ROC",
            "For Amateur Radio Operator Certificate (AT-ROC) holders:\nValid AT-ROC"
        ),
        ["SOURCE_OF_EQUIPMENT_DOC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000077"),
            "Copy of document indicating source of equipment:",
            "Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer AND Original AT-RSL of the Seller\n\nNote 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available."
        ),
        ["PHOTO_1X1_RECENT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000003"),
            "Please provide a clear 1x1 ID picture taken within the last six (6) months.*",
            "Please provide a clear 1x1 ID picture taken within the last six (6) months.*"
        ),
        ["PHOTOCOPY_OF_AT_RSL"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000201"),
            "Photocopy of AT-RSL",
            "Photocopy of AT-RSL*"
        ),
        ["PROOF_OF_AMATEUR_ACTIVITIES"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000016"),
            "Proof of Amateur Activities",
            "Proof of Amateur Activities*"
        ),
        ["LIFETIME_REQ_LETTER"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000202"),
            "Letter request for Issuance of a Lifetime Radio Station License",
            "Letter request for Issuance of a Lifetime Radio Station License*"
        ),
        ["CERT_OF_GOOD_STANDING_AMATEUR"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000203"),
            "Certificate of Good Standing as a Member from a registered amateur club or association with the NTC",
            "Certificate of Good Standing as a Member from a registered amateur club or association with the NTC*"
        ),
        ["COPY_OF_ANY_ID_60YRS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000204"),
            "Copy of ANY of the following:\n• Birth Certificate\n• Passport\n• PRC License\n• Driver's License",
            "Copy of ANY of the following:*\n• Birth Certificate\n• Passport\n• PRC License\n• Driver's License\nNote 1: The applicant has to show the Original.\nNote 2: Applicant must be at least 60 years of age."
        ),
        ["AMATEUR_CLASS_A_RSL"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000205"),
            "Amateur Class 'A' Radio Station License",
            "Amateur Class 'A' Radio Station License*"
        ),
        ["PROOF_AMATEUR_SERVICE_15YRS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000206"),
            "Proof of amateur service of at least fifteen (15) consecutive years",
            "Proof of amateur service of at least fifteen (15) consecutive years*"
        ),
        ["CLUB_SOURCE_EQUIP"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000207"),
            "Copy of document indicating source of equipment:",
            "Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer"
        ),
        ["AMATEUR_CLUB_RSL"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000208"),
            "Amateur Club Radio Station License",
            "Amateur Club Radio Station License*"
        ),
        ["LIST_CLUB_TRUSTEE_OFFICERS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000209"),
            "List providing the licensed Amateur Club Trustee, Officers and Members of the organization",
            "List providing the licensed Amateur Club Trustee, Officers and Members of the organization*\nNote 1: List must contain a minimum membership of twenty-five (25) duly licensed amateur radio operators.\nNote 2: The licenses of prospective members shall be validated.\nNote 3: The Amateur Club Trustee designated by the Club must be a licensed Class A for at least five (5) years.\nNote 4: The Amateur Fixed Station shall be issued only to the Club Trustee"
        ),

        ["AERO_AUTH_AC_LICENSE"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000210"),
            "Authenticated copy of existing aircraft station license",
            "Authenticated copy of existing aircraft station license*"
        ),
        ["AERO_SOURCE_EQUIP"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000211"),
            "Copy of document indicating source of equipment:",
            "Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import"
        ),
        ["RADIO_OP_CERT_2PHN"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000213"),
            "Valid Radio Operator Certificate (at least 2PHN)",
            "Valid Radio Operator Certificate (at least 2PHN)*"
        ),
        ["CERTIFICATE_OF_EMPLOYMENT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000015"),
            "Certificate of Employment",
            "Certificate of Employment*"
        ),
        ["NTC_INSPECTION_REPORT_SWORN"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000214"),
            "NTC Inspection Report of the subject radio station",
            "NTC Inspection Report of the subject radio station\nDownload the \"SWORN STATEMENT and DECLARATION\" Form\nhttps://drive.google.com/file/d/1K_X2h6zOzn48voUmJOq6TOhBqZPPQ2J4/view?usp=sharing"
        ),
        ["PHOTOCOPY_OF_RSL_UPLOAD"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000074"),
            "Photocopy of RSL",
            "Photocopy of RSL*\nUpload a clear photocopy of your RSL in JPG/PNG/PDF format"
        ),
        ["RADIO_STATION_LICENSE_DOC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000075"),
            "Radio Station License",
            "Radio Station License*"
        ),
        ["CAAP_COR"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000215"),
            "Valid Certificate of Registration issued by the Civil Aviation Authority of the Philippines (CAAP)",
            "Valid Certificate of Registration issued by the Civil Aviation Authority of the Philippines (CAAP)*"
        ),
        ["CAAP_REI_REPORT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000216"),
            "Valid latest Radio, Electronics and Instruments (REI) Inspection Report duly signed by the authorized Technician of CAAP",
            "Valid latest Radio, Electronics and Instruments (REI) Inspection Report duly signed by the authorized Technician of the Civil Aviation Authority of the Philippines (CAAP)"
        ),
        ["RROC_AIRCRAFT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000217"),
            "Restricted Radio Operator Certificate - Aircraft",
            "Restricted Radio Operator Certificate - Aircraft*"
        ),
        ["AIRCRAFT_STATION_LICENSE_DOC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000218"),
            "Aircraft Station License",
            "Aircraft Station License*"
        ),

        ["MARINA_REG_OR_LGU"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000061"),
            "Copy of ANY of the following:\n• Certificate of Vessel Registry and Certificate of Ownership issued by MARINA\n• Permit issued by LGU",
            "Copy of ANY of the following:*\n• Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)"
        ),
        ["MARITIME_ROC_2PHN"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000219"),
            "Radio Operator Certificate (at least 2nd Class Radiotelephone Operator)",
            "Radio Operator Certificate*\n(at least 2nd Class Radiotelephone Operator)"
        ),
        ["MAR_SOURCE_EQUIP"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000220"),
            "Copy of document indicating source of equipment:",
            "Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b)For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import\n(c) For registered equipment, Copy of Permit to Possess"
        ),
        ["SHIP_STATION_LICENSE_DOC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000222"),
            "Ship Station License",
            "Ship Station License*"
        ),
        ["MARINA_CPR"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000224"),
            "Certificate of Philippine Registry (CPR) issued by the Maritime Industry Authority (MARINA)",
            "Certificate of Philippine Registry (CPR) issued by the Maritime Industry Authority (MARINA)*"
        ),
        ["ACCOUNTING_AUTH_INCLUSION"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000226"),
            "Certificate of Inclusion from a Recognized Private Operating Agency or Accounting Authority (AA)",
            "Certificate of Inclusion from a Recognized Private Operating Agency or Accounting Authority (AA)*"
        ),
        ["SBME_AGREEMENT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000225"),
            "Shore-Based Maintenance Entity (SBME) Agreement from duly accredited SBME",
            "Shore-Based Maintenance Entity (SBME) Agreement from duly accredited SBME*"
        ),
        ["DECK_OFFICERS_GOC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000227"),
            "General Operator Certificate (GOC) of two (2) deck officers",
            "General Operator Certificate (GOC) of two (2) deck officers (i.e. First Officer, or Second Officer, or Third Officer)*"
        ),
        ["POEA_OR_SHIPPING_CONTRACT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000228"),
            "Copy of ANY of the following:\n• Contract of Employment of the deck officers issued by POEA\n• Certificate of Employment issued by Shipping Company",
            "Copy of ANY of the following:*\n• Contract of Employment of the deck officers issued by the Philippine Overseas Employment Administration (POEA), OR\n• Certificate of Employment issued by Shipping Company"
        ),
        ["SHIP_EARTH_LICENSE_DOC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000229"),
            "Ship Earth License",
            "Ship Earth License*"
        ),

        ["APPROPRIATE_VALID_ROC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000005"),
            "Appropriate and valid Radio Operator Certificate",
            "Appropriate and valid Radio Operator Certificate"
        ),
        ["FLM_PECE_PLANS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000065"),
            "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE)",
            "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:*\n1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)"
        ),
        ["FLM_SOURCE_EQUIP"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000231"),
            "Copy of document indicating source of equipment:",
            "Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess"
        ),
        ["VEHICLE_VALID_OR_CR"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000076"),
            "For land mobile station:\nVehicle's valid OR/CR",
            "For land mobile station:\nVehicle's valid OR/CR"
        ),

        ["TVRO_PA_OR_RENEWAL"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000021"),
            "Provisional Authority (PA) OR duly received Motion for Renewal of PA",
            "Provisional Authority (PA) OR duly received Motion for Renewal of PA*"
        ),
        ["TVRO_PECE_PLANS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000240"),
            "Engineering Plans and Diagrams signed and sealed by a duly licensed Professional Electronics Engineer (PECE)",
            "Engineering Plans and Diagrams signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:*\nPlan 1: Map showing the exact location of the TVRO station with geographical coordinates\nPlan 2: Block Diagram of the proposed TVRO system\nPlan 3: Antenna System (Type, Gain, Azimuth, Height Above Ground)"
        ),
        ["TVRO_HEADEND_EQUIP"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000022"),
            "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment",
            "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment*\nPrepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)"
        ),
        ["SUPERVISING_PECE_DOCS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000241"),
            "Copy of the following:\nCertificate of Employment and license of the Supervising PECE/ECE",
            "Copy of the following:*\nCertificate of Employment and license of the Supervising PECE/ECE"
        ),
        ["TECHNICIAN_ROC_DOCS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000242"),
            "Copy of the following:\nCertificate of Employment and ROC of radio technician",
            "Copy of the following:*\nCertificate of Employment and ROC of radio technician"
        ),
        ["TVRO_STATION_LICENSE_DOC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000243"),
            "TVRO Station License",
            "TVRO Station License*"
        ),

        ["CATV_CA_OR_RENEWAL"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000250"),
            "Certificate of Authority (CA) OR duly received Motion for Renewal of PA",
            "Certificate of Authority (CA) OR duly received Motion for Renewal of PA*"
        ),
        ["CATV_PECE_PLANS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000251"),
            "Engineering Plans\nSigned and sealed by a duly licensed Professional Electronics Engineer (PECE)",
            "Engineering Plans *\nSigned and sealed by a duly licensed Professional Electronics Engineer (PECE)"
        ),
        ["CATV_PROGRAMS_OFFERED"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000252"),
            "List of Programs Offered - Channel, Program, and Signal Source",
            "List of Programs Offered - Channel, Program, and Signal Source*"
        ),
        ["CATV_STATION_LICENSE_DOC"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000253"),
            "CATV Station License",
            "CATV Station License*"
        ),

        ["COPY_AUTH_REQ"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000104"),
            "Copy of document to be authenticated",
            "Copy of document to be authenticated*"
        ),
        ["COPY_PERMIT_AND_PHOTO"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000105"),
            "Copy of Permit and 1x1 ID Picture",
            "1. Copy of Permit:\nA scanned or photocopied copy of the original Radio Operator Certificate.\n\n2. For Radio Operator Certificate:\nPlease provide a clear 1x1 ID picture taken within the last six (6) months."
        )
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // 1. LICENSE IN THE AMATEUR SERVICE
        // Amateur Radio Station License - NEW
        new(VarAmaRslNew, Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
        new(VarAmaRslNew, Guid.Parse("70000000-0000-0000-0000-000000000007"), false),
        new(VarAmaRslNew, Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
        new(VarAmaRslNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

        // Amateur radio Station License - RENEWAL
        new(VarAmaRslRen, Guid.Parse("70000000-0000-0000-0000-000000000201"), true),
        new(VarAmaRslRen, Guid.Parse("70000000-0000-0000-0000-000000000016"), true),
        new(VarAmaRslRen, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

        // Amateur Radio Station License - MODIFICATION
        new(VarAmaRslMod, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

        // Lifetime Amateur Radio Station License for Class A - NEW
        new(VarAmaLifetimeNew, Guid.Parse("70000000-0000-0000-0000-000000000202"), true),
        new(VarAmaLifetimeNew, Guid.Parse("70000000-0000-0000-0000-000000000203"), true),
        new(VarAmaLifetimeNew, Guid.Parse("70000000-0000-0000-0000-000000000204"), true),
        new(VarAmaLifetimeNew, Guid.Parse("70000000-0000-0000-0000-000000000205"), true),
        new(VarAmaLifetimeNew, Guid.Parse("70000000-0000-0000-0000-000000000206"), true),
        new(VarAmaLifetimeNew, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),

        // Amateur Club Radio Station License - NEW
        new(VarAmaClubNew, Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
        new(VarAmaClubNew, Guid.Parse("70000000-0000-0000-0000-000000000207"), true),

        // Amateur Club Radio Station License - RENEWAL
        new(VarAmaClubRen, Guid.Parse("70000000-0000-0000-0000-000000000208"), true),
        new(VarAmaClubRen, Guid.Parse("70000000-0000-0000-0000-000000000209"), true),

        // Amateur Club Radio Station License - MODIFICATION
        new(VarAmaClubMod, Guid.Parse("70000000-0000-0000-0000-000000000208"), true),

        // 2. LICENSE IN THE AERONAUTICAL SERVICE
        // Fixed Aeronautical Station License - NEW
        new(VarAeroFixedNew, Guid.Parse("70000000-0000-0000-0000-000000000210"), true),
        new(VarAeroFixedNew, Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
        new(VarAeroFixedNew, Guid.Parse("70000000-0000-0000-0000-000000000211"), true),
        new(VarAeroFixedNew, Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(VarAeroFixedNew, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarAeroFixedNew, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Fixed Aeronautical Station License - RENEWAL
        new(VarAeroFixedRen, Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(VarAeroFixedRen, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarAeroFixedRen, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),
        new(VarAeroFixedRen, Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

        // Fixed Aeronautical Station License - MODIFICATION
        new(VarAeroFixedMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarAeroFixedMod, Guid.Parse("70000000-0000-0000-0000-000000000213"), true),
        new(VarAeroFixedMod, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarAeroFixedMod, Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

        // Aircraft Station License - NEW
        new(VarAeroAircraftNew, Guid.Parse("70000000-0000-0000-0000-000000000215"), true),
        new(VarAeroAircraftNew, Guid.Parse("70000000-0000-0000-0000-000000000216"), false),
        new(VarAeroAircraftNew, Guid.Parse("70000000-0000-0000-0000-000000000217"), true),
        new(VarAeroAircraftNew, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarAeroAircraftNew, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Aircraft Station License - RENEWAL
        new(VarAeroAircraftRen, Guid.Parse("70000000-0000-0000-0000-000000000218"), true),
        new(VarAeroAircraftRen, Guid.Parse("70000000-0000-0000-0000-000000000215"), true),
        new(VarAeroAircraftRen, Guid.Parse("70000000-0000-0000-0000-000000000216"), false),
        new(VarAeroAircraftRen, Guid.Parse("70000000-0000-0000-0000-000000000217"), true),
        new(VarAeroAircraftRen, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarAeroAircraftRen, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Aircraft Station License - MODIFICATION
        new(VarAeroAircraftMod, Guid.Parse("70000000-0000-0000-0000-000000000218"), true),

        // 3. LICENSE IN THE MARITIME SERVICE
        // Ship Station License Domestic Trade (Without originally-installed equipment) - NEW
        new(VarMarDomWithoutNew, Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(VarMarDomWithoutNew, Guid.Parse("70000000-0000-0000-0000-000000000219"), true),
        new(VarMarDomWithoutNew, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarMarDomWithoutNew, Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
        new(VarMarDomWithoutNew, Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(VarMarDomWithoutNew, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Ship Station License Domestic trade (With Originally0installed equipment) - NEW
        new(VarMarDomWithNew, Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(VarMarDomWithNew, Guid.Parse("70000000-0000-0000-0000-000000000219"), true),
        new(VarMarDomWithNew, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarMarDomWithNew, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Ship Station License Domestic Trade - RENEWAL
        new(VarMarDomRen, Guid.Parse("70000000-0000-0000-0000-000000000222"), false),
        new(VarMarDomRen, Guid.Parse("70000000-0000-0000-0000-000000000219"), true),
        new(VarMarDomRen, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarMarDomRen, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Ship Station License Domestic Trade - MODIFICATION
        new(VarMarDomMod, Guid.Parse("70000000-0000-0000-0000-000000000222"), true),

        // Ship Station License International Trade - RENEWAL
        new(VarMarIntlRen, Guid.Parse("70000000-0000-0000-0000-000000000222"), true),
        new(VarMarIntlRen, Guid.Parse("70000000-0000-0000-0000-000000000224"), true),
        new(VarMarIntlRen, Guid.Parse("70000000-0000-0000-0000-000000000226"), true),
        new(VarMarIntlRen, Guid.Parse("70000000-0000-0000-0000-000000000225"), true),
        new(VarMarIntlRen, Guid.Parse("70000000-0000-0000-0000-000000000227"), true),
        new(VarMarIntlRen, Guid.Parse("70000000-0000-0000-0000-000000000228"), true),

        // Ship Earth Station License International Trade - RENEWAL
        new(VarMarIntlEarthRen, Guid.Parse("70000000-0000-0000-0000-000000000229"), true),
        new(VarMarIntlEarthRen, Guid.Parse("70000000-0000-0000-0000-000000000224"), true),
        new(VarMarIntlEarthRen, Guid.Parse("70000000-0000-0000-0000-000000000226"), true),
        new(VarMarIntlEarthRen, Guid.Parse("70000000-0000-0000-0000-000000000225"), true),
        new(VarMarIntlEarthRen, Guid.Parse("70000000-0000-0000-0000-000000000227"), true),
        new(VarMarIntlEarthRen, Guid.Parse("70000000-0000-0000-0000-000000000228"), true),

        // Ship Station License International Trade - MODIFICATION
        new(VarMarIntlMod, Guid.Parse("70000000-0000-0000-0000-000000000222"), true),

        // Ship Earth Station License International Trade - MODIFICATION
        new(VarMarIntlEarthMod, Guid.Parse("70000000-0000-0000-0000-000000000222"), true),

        // Private Coastal Station License - NEW
        new(VarMarPrivCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000062"), false),
        new(VarMarPrivCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000219"), true),
        new(VarMarPrivCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarMarPrivCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(VarMarPrivCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Private Coastal Station License - RENEWAL
        new(VarMarPrivCoastRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarMarPrivCoastRen, Guid.Parse("70000000-0000-0000-0000-000000000219"), true),
        new(VarMarPrivCoastRen, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),
        new(VarMarPrivCoastRen, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Private Coastal Station License - MODIFICATION
        new(VarMarPrivCoastMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarMarPrivCoastMod, Guid.Parse("70000000-0000-0000-0000-000000000214"), false),

        // Public Coastal Station License - NEW
        new(VarMarPubCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
        new(VarMarPubCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000220"), true),
        new(VarMarPubCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000219"), true),
        new(VarMarPubCoastNew, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),

        // Public Coastal Station License - RENEWAL
        new(VarMarPubCoastRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarMarPubCoastRen, Guid.Parse("70000000-0000-0000-0000-000000000219"), true),
        new(VarMarPubCoastRen, Guid.Parse("70000000-0000-0000-0000-000000000015"), true),

        // Public Coastal Station License - MODIFICATION
        new(VarMarPubCoastMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),

        // 4. LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE
        // Radio Station License - NEW
        new(VarFlmRslNew, Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
        new(VarFlmRslNew, Guid.Parse("70000000-0000-0000-0000-000000000005"), false),
        new(VarFlmRslNew, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmRslNew, Guid.Parse("70000000-0000-0000-0000-000000000231"), true),
        new(VarFlmRslNew, Guid.Parse("70000000-0000-0000-0000-000000000076"), false),

        // Radio Station License - RENEWAL
        new(VarFlmRslRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarFlmRslRen, Guid.Parse("70000000-0000-0000-0000-000000000005"), false),

        // Radio Station License - MODIFICATION
        new(VarFlmRslMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),

        // 5. OTHER RADIO STATION LICENSES/SERVICES
        new(VarOtherMicrowaveRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherMicrowaveMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherVsatRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherVsatMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherTrunkedRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherTrunkedMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherBwaRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherBwaMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherWdnNew, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherWdnRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherWdnMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherBtsRen, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarOtherBtsMod, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),

        // 6. TVRO/CATV STATION LICENSE
        // TVRO Station License - NEW
        new(VarTvroNew, Guid.Parse("70000000-0000-0000-0000-000000000021"), true),
        new(VarTvroNew, Guid.Parse("70000000-0000-0000-0000-000000000240"), true),
        new(VarTvroNew, Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
        new(VarTvroNew, Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
        new(VarTvroNew, Guid.Parse("70000000-0000-0000-0000-000000000242"), true),

        // TVRO Station License - RENEWAL
        new(VarTvroRen, Guid.Parse("70000000-0000-0000-0000-000000000243"), true),
        new(VarTvroRen, Guid.Parse("70000000-0000-0000-0000-000000000021"), true),
        new(VarTvroRen, Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
        new(VarTvroRen, Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
        new(VarTvroRen, Guid.Parse("70000000-0000-0000-0000-000000000242"), true),

        // CATV Station License - NEW
        new(VarCatvNew, Guid.Parse("70000000-0000-0000-0000-000000000250"), true),
        new(VarCatvNew, Guid.Parse("70000000-0000-0000-0000-000000000251"), true),
        new(VarCatvNew, Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
        new(VarCatvNew, Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
        new(VarCatvNew, Guid.Parse("70000000-0000-0000-0000-000000000242"), true),
        new(VarCatvNew, Guid.Parse("70000000-0000-0000-0000-000000000252"), true),

        // CATV Station License - RENEWAL
        new(VarCatvRen, Guid.Parse("70000000-0000-0000-0000-000000000253"), true),
        new(VarCatvRen, Guid.Parse("70000000-0000-0000-0000-000000000250"), true),
        new(VarCatvRen, Guid.Parse("70000000-0000-0000-0000-000000000022"), true),
        new(VarCatvRen, Guid.Parse("70000000-0000-0000-0000-000000000241"), true),
        new(VarCatvRen, Guid.Parse("70000000-0000-0000-0000-000000000242"), true),
        new(VarCatvRen, Guid.Parse("70000000-0000-0000-0000-000000000252"), true),

        // 7. COPY OF LICENSES
        new(VarLicTrueCopy, Guid.Parse("70000000-0000-0000-0000-000000000104"), true),
        new(VarLicDuplicate, Guid.Parse("70000000-0000-0000-0000-000000000105"), false)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_AMA_LICENSES", Guid.Parse("f7000000-0000-0000-0000-000000000001"), Guid.Parse("f70a0000-0000-0000-0000-000000000000"), new()
        {
            new("club", "Club Details (if Club Station)", new() { "clubName", "trusteeName", "trusteeCallSign", "trusteeLicenseNo", "clubAddress" }),
            new("station", "Station Details", new() { "stationLocation", "stationType", "authorizedPower", "frequencyBands" }),
            new("equipment", "Equipment Particulars", new() { "equipmentDetails", "makeModel", "serialNumber", "frequencyRange", "powerOutput" }),
            new("antennas", "Antenna Particulars", new() { "antennaType", "height", "gain" })
        }),
        new("NTC_AERO_LICENSES", Guid.Parse("f7100000-0000-0000-0000-000000000001"), Guid.Parse("f71a0000-0000-0000-0000-000000000000"), new()
        {
            new("aircraft", "Aircraft Particulars", new() { "aircraftRegNo", "aircraftMakeModel", "aircraftSerialNo", "registeredOwner", "baseOfOperation" }),
            new("equipment", "Equipment Particulars", new() { "equipmentDetails", "makeModel", "serialNumber", "frequencyRange", "powerOutput" }),
            new("antennas", "Antenna Particulars", new() { "antennaType", "height", "gain" })
        }),
        new("NTC_MAR_LICENSES", Guid.Parse("f7200000-0000-0000-0000-000000000001"), Guid.Parse("f72a0000-0000-0000-0000-000000000000"), new()
        {
            new("vessel", "Particulars of Station / Vessel", new() { "vesselName", "callSign", "stationLicenseNo", "imoNumber" }),
            new("equipment", "Equipment Particulars", new() { "equipmentDetails", "makeModel", "serialNumber", "frequencyRange", "powerOutput" }),
            new("radioOfficers", "Particulars of Radio Officers", new() { "officerName", "certificateNumber", "expiryDate", "citizenship" })
        }),
        new("NTC_FLM_LICENSES", Guid.Parse("f7300000-0000-0000-0000-000000000001"), Guid.Parse("f73a0000-0000-0000-0000-000000000000"), new()
        {
            new("stations", "Particulars of Station / Equipment / Antenna", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange", "powerOutput" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "polarization", "beamwidth", "diameter" })
        }),
        new("NTC_OTHER_LICENSES", Guid.Parse("f7400000-0000-0000-0000-000000000001"), Guid.Parse("f74a0000-0000-0000-0000-000000000000"), new()
        {
            new("stations", "Particulars of Station(s)", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "makeModel", "serialNumber" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity" })
        }),
        new("NTC_TVRO_CATV_LICENSES", Guid.Parse("f7500000-0000-0000-0000-000000000001"), Guid.Parse("f75a0000-0000-0000-0000-000000000000"), new()
        {
            new("headEnd", "Head-End Station Details", new() { "stationLocation", "carrierFrequency", "bandwidth", "serviceArea", "channelCapacity" }),
            new("equipment", "Head-End Equipment Particulars", new() { "equipmentDetails", "makeModel", "serialNumber" }),
            new("antennas", "Dish Antenna Particulars", new() { "antennaType", "diameter", "gain", "azimuth", "elevation" })
        }),
        new("NTC_COPY_LICENSES", Guid.Parse("f7600000-0000-0000-0000-000000000001"), Guid.Parse("f76a0000-0000-0000-0000-000000000000"), new()
        {
            new("permitLicenseCertificateNo", "License Reference Details", new() { "callSign", "permitRslNo", "stationLocation" }),
            new("circumstances", "Circumstances of Loss/Damage", new() { "circumstances" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000008"),
            new[] { "License in the Amateur Service", "Amateur License" },
            "License in the Amateur Service\n\nAn Amateur Radio Station License is a written authority issued by the Commission to a person or club authorizing the holder thereof to operate an amateur radio station.",
            "WHO MAY AVAIL:\n\n1. Licensed Amateur Radio Operators\n2. Duly accredited Amateur Radio Clubs\n3. Senior Amateurs (Lifetime Class A License)"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000009"),
            new[] { "License in the Aeronautical Service", "Aeronautical License" },
            "License in the Aeronautical Service\n\nA Radio Station License in the Aeronautical Service is a written authority issued by the Commission to operate fixed or mobile aircraft radio stations.",
            "WHO MAY AVAIL:\n\n1. Aircraft Owners / Airlines\n2. Aerodrome Operators / Aviation Ground Stations"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000010"),
            new[] { "License in the Maritime Service", "Maritime License" },
            "License in the Maritime Service\n\nA Ship Station License / Coastal Station License is a written authority issued by the Commission to operate shipboard or coastal maritime radio stations.",
            "WHO MAY AVAIL:\n\n1. Ship Owners / Maritime Shipping Companies\n2. Public / Private Coastal Radio Station Operators"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000011"),
            new[] { "Fixed and Land Mobile Service", "Fixed & Land Mobile License" },
            "Licenses for Government and Private Radio Stations in the Fixed and Land Mobile Service\n\nA Radio Station License is a written authority issued by the Commission authorizing the operation of fixed and land mobile radio transceivers.",
            "WHO MAY AVAIL:\n\n1. Private Commercial Entities\n2. Government Agencies\n3. Civic Action Groups"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000012"),
            new[] { "Other Radio Station Licenses", "Microwave VSAT BWA WDN" },
            "Other Radio Station Licenses / Services\n\nAuthorizations for specialized radio communications systems including Microwave Links, VSAT satellite terminals, Public Trunked networks, Broadband Wireless Access, and Base Transceiver Stations.",
            "WHO MAY AVAIL:\n\n1. Public Telecommunications Entities (PTEs)\n2. Private Telecommunications Network Operators"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000013"),
            new[] { "TVRO CATV Station License", "Cable TV TVRO License" },
            "TVRO / CATV Station License\n\nA License issued by the Commission authorizing the operation of Television Receive-Only (TVRO) and Community Antenna Television (CATV) cable broadcast head-end stations.",
            "WHO MAY AVAIL:\n\n1. Cable Television (CATV) Operators\n2. TVRO Station Operators"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000014"),
            new[] { "Copy of Licenses", "Licenses" },
            "Copy of Licenses\n\nCertified True Copy and Duplicate Copy issuances for active NTC Radio Station Licenses.",
            "WHO MAY AVAIL:\n\n1. License Holders\n2. Authorized Representatives"
        )
    };
}
