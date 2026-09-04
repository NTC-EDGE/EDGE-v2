using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class PermitsCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000004");

    public static readonly Guid Svc109Id        = Guid.Parse("50000000-0000-0000-0000-000000000009");
    public static readonly Guid SvcAeroId       = Guid.Parse("50000000-0000-0000-0000-000000000060");
    public static readonly Guid SvcMarId        = Guid.Parse("50000000-0000-0000-0000-000000000061");
    public static readonly Guid SvcFlmId        = Guid.Parse("50000000-0000-0000-0000-000000000062");
    public static readonly Guid SvcPteId        = Guid.Parse("50000000-0000-0000-0000-000000000063");
    public static readonly Guid SvcEquipId      = Guid.Parse("50000000-0000-0000-0000-000000000064");
    public static readonly Guid SvcMpId         = Guid.Parse("50000000-0000-0000-0000-000000000065");
    public static readonly Guid SvcCopyId       = Guid.Parse("50000000-0000-0000-0000-000000000066");

    #region Contracts
    public static readonly string Ntc109Contract = @"
    {
        ""formNo"": ""NTC 1-09"",
        ""revisionNo"": ""03"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Permits"",
        ""group"": ""Permits in the Amateur Service"",
        ""applicationTypes"": [""PURCHASE"", ""POSSESS"", ""SELL/TRANSFER"", ""Permit to Purchase"", ""Permit to Possess for Storage"", ""Permit to Purchase/Possess"", ""Permit to Sell/Transfer"", ""Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor"", ""Special Permit for Use of Vanity Call Sign"", ""Special Permit for the Use of Special Event Call Sign""],
        ""elements"": [""Class A"", ""Class B"", ""Class C""],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""stationEquipment"", ""required"": true },
            { ""key"": ""sourceOfEquipment"", ""required"": false },
            { ""key"": ""intendedUse"", ""required"": false }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""typeOfRadioService"": [""FIXED AND LAND MOBILE"",""BROADCAST"",""AERONAUTICAL"",""AMATEUR"",""MARITIME"",""OTHERS, specify""],
            ""natureOfService"": [""CV (PRIVATE)"",""CO (GOVERNMENT)"",""CP (PUBLIC CORRESPONDENCE)""],
            ""classOfStation"": [""RT"",""FX"",""ML"",""FC"",""TC"",""P"",""FA"",""FB"",""BC"",""MA"",""OTHERS, specify""],
            ""intendedUse"": [""New Radio Station"",""Additional Equipment"",""Additional Radio Station"",""Storage at:"",""Change of Equipment"",""Others, specify""]
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
            { ""key"": ""natureOfService"", ""required"": true },
            { ""key"": ""classOfStation"", ""required"": true },
            { ""key"": ""typeOfRadioService"", ""required"": true },
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""station"", ""required"": true },
            { ""key"": ""equipment"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true },
            { ""key"": ""payment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""natureOfService"": [""CV (PRIVATE)"",""CO (GOVERNMENT)"",""CP (PUBLIC CORRESPONDENCE)""],
            ""typeOfRadioService"": [""FIXED AND LAND MOBILE"",""AERONAUTICAL"",""BROADCAST"",""P"",""BC"",""OTHERS, specify""],
            ""classOfStation"": [""RT"",""FA"",""FX"",""MA"",""FB"",""TC"",""ML"",""OTHERS, specify""]
        },
        ""entityType"": ""Application""
    }";
    #endregion

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_09"] = Ntc109Contract,
        ["NTC_1_14"] = Ntc114Contract,
        ["NTC_AERO_PERMITS"] = Ntc109Contract,
        ["NTC_MAR_PERMITS"] = Ntc109Contract,
        ["NTC_FLM_PERMITS"] = Ntc109Contract,
        ["NTC_PTE_PERMITS"] = Ntc109Contract,
        ["NTC_EQUIP_PERMITS"] = AccreditationsCategorySeederData.Ntc118Contract,
        ["NTC_MP_PERMITS"] = AccreditationsCategorySeederData.Ntc118Contract,
        ["NTC_COPY_PERMITS"] = CertificatesCategorySeederData.Ntc121Contract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_1_09", Svc109Id, categoryId, "PERMITS IN THE AMATEUR SERVICE", "Permits in the Amateur Service", "NTC_1_09", "PERMITS IN THE AMATEUR SERVICE (NTC 1-09)", Ntc109Contract),
        new("NTC_AERO_PERMITS", SvcAeroId, categoryId, "PERMITS IN THE AERONAUTICAL SERVICE", null, "NTC_AERO_PERMITS", "PERMITS IN THE AERONAUTICAL SERVICE", Ntc109Contract),
        new("NTC_MAR_PERMITS", SvcMarId, categoryId, "PERMITS IN THE MARITIME SERVICE", null, "NTC_MAR_PERMITS", "PERMITS IN THE MARITIME SERVICE", Ntc109Contract),
        new("NTC_FLM_PERMITS", SvcFlmId, categoryId, "PERMITS TO GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", null, "NTC_FLM_PERMITS", "PERMITS TO FIXED AND LAND MOBILE STATIONS", Ntc109Contract),
        new("NTC_PTE_PERMITS", SvcPteId, categoryId, "PERMITS FOR PUBLIC TELECOMMUNICATIONS ENTITIES (PTEs)", null, "NTC_PTE_PERMITS", "PERMITS FOR PTEs", Ntc109Contract),
        new("NTC_EQUIP_PERMITS", SvcEquipId, categoryId, "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT", null, "NTC_EQUIP_PERMITS", "PERMITS FOR EQUIPMENT", AccreditationsCategorySeederData.Ntc118Contract),
        new("NTC_MP_PERMITS", SvcMpId, categoryId, "PERMITS FOR MOBILE PHONE", null, "NTC_MP_PERMITS", "PERMITS FOR MOBILE PHONE", AccreditationsCategorySeederData.Ntc118Contract),
        new("NTC_COPY_PERMITS", SvcCopyId, categoryId, "COPY OF PERMITS", null, "NTC_COPY_PERMITS", "COPY OF PERMITS", CertificatesCategorySeederData.Ntc121Contract)
    };

    // Variant IDs
    public static readonly Guid VarAmPur           = Guid.Parse("60000000-0000-0000-0000-000000000060");
    public static readonly Guid VarAmStorage       = Guid.Parse("60000000-0000-0000-0000-000000000061");
    public static readonly Guid VarAmPurPoss       = Guid.Parse("60000000-0000-0000-0000-000000000062");
    public static readonly Guid VarAmSell          = Guid.Parse("60000000-0000-0000-0000-000000000063");
    public static readonly Guid VarAmForeign       = Guid.Parse("60000000-0000-0000-0000-000000000064");
    public static readonly Guid VarAmVanityNew     = Guid.Parse("60000000-0000-0000-0000-000000000067");
    public static readonly Guid VarAmVanityRen     = Guid.Parse("60000000-0000-0000-0000-000000000065");
    public static readonly Guid VarAmSpecialEvent  = Guid.Parse("60000000-0000-0000-0000-000000000066");

    public static readonly Guid VarAeroStnPur      = Guid.Parse("60000000-0000-0000-0000-000000000070");
    public static readonly Guid VarAeroStnPoss     = Guid.Parse("60000000-0000-0000-0000-000000000071");
    public static readonly Guid VarAeroStnPurPoss  = Guid.Parse("60000000-0000-0000-0000-000000000072");
    public static readonly Guid VarAeroStorage     = Guid.Parse("60000000-0000-0000-0000-000000000078");
    public static readonly Guid VarAeroStnSell     = Guid.Parse("60000000-0000-0000-0000-000000000073");
    public static readonly Guid VarAirStnPur       = Guid.Parse("60000000-0000-0000-0000-000000000074");
    public static readonly Guid VarAirStnPoss      = Guid.Parse("60000000-0000-0000-0000-000000000075");
    public static readonly Guid VarAirStnPurPoss   = Guid.Parse("60000000-0000-0000-0000-000000000076");
    public static readonly Guid VarAirStnSell      = Guid.Parse("60000000-0000-0000-0000-000000000077");

    public static readonly Guid VarMarShipPur      = Guid.Parse("60000000-0000-0000-0000-000000000080");
    public static readonly Guid VarMarShipPoss     = Guid.Parse("60000000-0000-0000-0000-000000000081");
    public static readonly Guid VarMarShipStorage  = Guid.Parse("60000000-0000-0000-0000-000000000082");
    public static readonly Guid VarMarShipPurPoss  = Guid.Parse("60000000-0000-0000-0000-000000000083");
    public static readonly Guid VarMarShipSell     = Guid.Parse("60000000-0000-0000-0000-000000000084");
    public static readonly Guid VarMarPrivCoastPur = Guid.Parse("60000000-0000-0000-0000-000000000085");
    public static readonly Guid VarMarPrivCoastPoss= Guid.Parse("60000000-0000-0000-0000-000000000086");
    public static readonly Guid VarMarPrivCoastPP  = Guid.Parse("60000000-0000-0000-0000-000000000087");
    public static readonly Guid VarMarPubCoastPur  = Guid.Parse("60000000-0000-0000-0000-000000000088");
    public static readonly Guid VarMarPubCoastPoss = Guid.Parse("60000000-0000-0000-0000-000000000089");
    public static readonly Guid VarMarPubCoastPP   = Guid.Parse("60000000-0000-0000-0000-000000000090");
    public static readonly Guid VarMarPubCoastSell = Guid.Parse("60000000-0000-0000-0000-000000000091");

    public static readonly Guid VarFlmPurVsat      = Guid.Parse("60000000-0000-0000-0000-000000000100");
    public static readonly Guid VarFlmPurPriv      = Guid.Parse("60000000-0000-0000-0000-000000000107");
    public static readonly Guid VarFlmPurCag       = Guid.Parse("60000000-0000-0000-0000-000000000108");
    public static readonly Guid VarFlmPurGov       = Guid.Parse("60000000-0000-0000-0000-000000000109");
    public static readonly Guid VarFlmPossVsat     = Guid.Parse("60000000-0000-0000-0000-000000000101");
    public static readonly Guid VarFlmPossPriv     = Guid.Parse("60000000-0000-0000-0000-000000000110");
    public static readonly Guid VarFlmPossCag      = Guid.Parse("60000000-0000-0000-0000-000000000111");
    public static readonly Guid VarFlmPossGov      = Guid.Parse("60000000-0000-0000-0000-000000000112");
    public static readonly Guid VarFlmPPVsat       = Guid.Parse("60000000-0000-0000-0000-000000000102");
    public static readonly Guid VarFlmPPPriv       = Guid.Parse("60000000-0000-0000-0000-000000000113");
    public static readonly Guid VarFlmPPCag        = Guid.Parse("60000000-0000-0000-0000-000000000114");
    public static readonly Guid VarFlmPPGov        = Guid.Parse("60000000-0000-0000-0000-000000000115");
    public static readonly Guid VarFlmStorage      = Guid.Parse("60000000-0000-0000-0000-000000000103");
    public static readonly Guid VarFlmSell         = Guid.Parse("60000000-0000-0000-0000-000000000104");
    public static readonly Guid VarFlmConstNew     = Guid.Parse("60000000-0000-0000-0000-000000000105");
    public static readonly Guid VarFlmConstMod     = Guid.Parse("60000000-0000-0000-0000-000000000116");
    public static readonly Guid VarFlmDemo         = Guid.Parse("60000000-0000-0000-0000-000000000106");

    public static readonly Guid VarPteStorage      = Guid.Parse("60000000-0000-0000-0000-000000000120");

    public static readonly Guid VarEquipTransport  = Guid.Parse("60000000-0000-0000-0000-000000000130");
    public static readonly Guid VarEquipDealerNew  = Guid.Parse("60000000-0000-0000-0000-000000000131");
    public static readonly Guid VarEquipDealerRen  = Guid.Parse("60000000-0000-0000-0000-000000000134");
    public static readonly Guid VarEquipDealerMod  = Guid.Parse("60000000-0000-0000-0000-000000000135");
    public static readonly Guid VarEquipMfgNew     = Guid.Parse("60000000-0000-0000-0000-000000000132");
    public static readonly Guid VarEquipMfgRen     = Guid.Parse("60000000-0000-0000-0000-000000000136");
    public static readonly Guid VarEquipMfgMod     = Guid.Parse("60000000-0000-0000-0000-000000000137");
    public static readonly Guid VarEquipSvcNew     = Guid.Parse("60000000-0000-0000-0000-000000000133");
    public static readonly Guid VarEquipSvcRen     = Guid.Parse("60000000-0000-0000-0000-000000000138");
    public static readonly Guid VarEquipSvcMod     = Guid.Parse("60000000-0000-0000-0000-000000000139");

    public static readonly Guid VarMpDealerNew     = Guid.Parse("60000000-0000-0000-0000-000000000140");
    public static readonly Guid VarMpDealerRen     = Guid.Parse("60000000-0000-0000-0000-000000000144");
    public static readonly Guid VarMpDealerMod     = Guid.Parse("60000000-0000-0000-0000-000000000146");
    public static readonly Guid VarMpRetailerNew   = Guid.Parse("60000000-0000-0000-0000-000000000141");
    public static readonly Guid VarMpRetailerRen   = Guid.Parse("60000000-0000-0000-0000-000000000148");
    public static readonly Guid VarMpRetailerMod   = Guid.Parse("60000000-0000-0000-0000-000000000149");
    public static readonly Guid VarMpSvcNew        = Guid.Parse("60000000-0000-0000-0000-000000000142");
    public static readonly Guid VarMpSvcRen        = Guid.Parse("60000000-0000-0000-0000-000000000152");
    public static readonly Guid VarMpSvcMod        = Guid.Parse("60000000-0000-0000-0000-000000000153");

    public static readonly Guid VarPermitTrueCopy  = Guid.Parse("60000000-0000-0000-0000-000000000150");
    public static readonly Guid VarPermitDuplicate = Guid.Parse("60000000-0000-0000-0000-000000000151");

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        // 1. PERMITS IN THE AMATEUR SERVICE
        new(VarAmPur, Svc109Id, ServiceVariantType.NA, "Amateur Radio Station Permit to Purchase", false),
        new(VarAmStorage, Svc109Id, ServiceVariantType.NA, "Amateur Radio Station Permit to Possess for Storage", false),
        new(VarAmPurPoss, Svc109Id, ServiceVariantType.NA, "Amateur Radio Station Permit to Purchase/Possess", false),
        new(VarAmSell, Svc109Id, ServiceVariantType.NA, "Amateur Radio Station Permit to Sell/Transfer", false),
        new(VarAmForeign, Svc109Id, ServiceVariantType.NA, "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor", false),
        new(VarAmVanityNew, Svc109Id, ServiceVariantType.New, "Special Permit for Use of Vanity Call Sign"),
        new(VarAmVanityRen, Svc109Id, ServiceVariantType.Renewal, "Special Permit for Use of Vanity Call Sign"),
        new(VarAmSpecialEvent, Svc109Id, ServiceVariantType.NA, "Special Permit for the Use of Special Event Call Sign"),

        // 2. PERMITS IN THE AERONAUTICAL SERVICE
        new(VarAeroStnPur, SvcAeroId, ServiceVariantType.NA, "Aeronautical Station Permit to Purchase", false),
        new(VarAeroStnPoss, SvcAeroId, ServiceVariantType.NA, "Aeronautical Station Permit to Possess", false),
        new(VarAeroStnPurPoss, SvcAeroId, ServiceVariantType.NA, "Aeronautical Station Permit to Purchase/Possess", false),
        new(VarAeroStorage, SvcAeroId, ServiceVariantType.NA, "Permit to Possess for Storage", false),
        new(VarAeroStnSell, SvcAeroId, ServiceVariantType.NA, "Aeronautical Station Permit to Sell/Transfer", false),
        new(VarAirStnPur, SvcAeroId, ServiceVariantType.NA, "Aircraft Station Permit to Purchase", false),
        new(VarAirStnPoss, SvcAeroId, ServiceVariantType.NA, "Aircraft Station Permit to Possess", false),
        new(VarAirStnPurPoss, SvcAeroId, ServiceVariantType.NA, "Aircraft Station Permit to Purchase/Possess", false),
        new(VarAirStnSell, SvcAeroId, ServiceVariantType.NA, "Aircraft Station Permit to Sell/Transfer", false),

        // 3. PERMITS IN THE MARITIME SERVICE
        new(VarMarShipPur, SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Purchase (Domestic Trade)", false),
        new(VarMarShipPoss, SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Possess (Domestic Trade)", false),
        new(VarMarShipStorage, SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Possess (Storage)", false),
        new(VarMarShipPurPoss, SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Purchase/Possess (Domestic Trade)", false),
        new(VarMarShipSell, SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Sell/Transfer", false),
        new(VarMarPrivCoastPur, SvcMarId, ServiceVariantType.NA, "Private Coastal Station Permit to Purchase", false),
        new(VarMarPrivCoastPoss, SvcMarId, ServiceVariantType.NA, "Private Coastal Station Permit to Possess", false),
        new(VarMarPrivCoastPP, SvcMarId, ServiceVariantType.NA, "Private Coastal Station Permit to Purchase/Possess", false),
        new(VarMarPubCoastPur, SvcMarId, ServiceVariantType.NA, "Public Coastal Station Permit to Purchase", false),
        new(VarMarPubCoastPoss, SvcMarId, ServiceVariantType.NA, "Public Coastal Station Permit to Possess", false),
        new(VarMarPubCoastPP, SvcMarId, ServiceVariantType.NA, "Public Coastal Station Permit to Purchase/Possess", false),
        new(VarMarPubCoastSell, SvcMarId, ServiceVariantType.NA, "Public Coastal Station Permit to Sell/Transfer", false),

        // 4. PERMITS TO GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE
        new(VarFlmPurVsat, SvcFlmId, ServiceVariantType.NA, "Permit to Purchase (VSAT)", false),
        new(VarFlmPurPriv, SvcFlmId, ServiceVariantType.NA, "Permit to Purchase (Private)", false),
        new(VarFlmPurCag, SvcFlmId, ServiceVariantType.NA, "Permit to Purchase (Civic Action Group)", false),
        new(VarFlmPurGov, SvcFlmId, ServiceVariantType.NA, "Permit to Purchase (Government)", false),
        new(VarFlmPossVsat, SvcFlmId, ServiceVariantType.NA, "Permit to Possess (VSAT)", false),
        new(VarFlmPossPriv, SvcFlmId, ServiceVariantType.NA, "Permit to Possess (Private)", false),
        new(VarFlmPossCag, SvcFlmId, ServiceVariantType.NA, "Permit to Possess (Civic Action Group)", false),
        new(VarFlmPossGov, SvcFlmId, ServiceVariantType.NA, "Permit to Possess (Government)", false),
        new(VarFlmPPVsat, SvcFlmId, ServiceVariantType.NA, "Permit to Purchase/Possess (VSAT)", false),
        new(VarFlmPPPriv, SvcFlmId, ServiceVariantType.NA, "Permit to Purchase/Possess (Private)", false),
        new(VarFlmPPCag, SvcFlmId, ServiceVariantType.NA, "Permit to Purchase/Possess (Civic Action Group)", false),
        new(VarFlmPPGov, SvcFlmId, ServiceVariantType.NA, "Permit to Purchase/Possess (Government)", false),
        new(VarFlmStorage, SvcFlmId, ServiceVariantType.NA, "Permit to Possess for Storage", false),
        new(VarFlmSell, SvcFlmId, ServiceVariantType.NA, "Permit to Sell/Transfer", false),
        new(VarFlmConstNew, SvcFlmId, ServiceVariantType.New, "Construction Permit", false),
        new(VarFlmConstMod, SvcFlmId, ServiceVariantType.Modification, "Construction Permit", false),
        new(VarFlmDemo, SvcFlmId, ServiceVariantType.NA, "Temporary Permit to Demonstrate and Propagate", false),

        // 5. PERMITS FOR PUBLIC TELECOMMUNICATIONS ENTITIES (PTEs)
        new(VarPteStorage, SvcPteId, ServiceVariantType.NA, "Permit to Possess for Storage (PTEs)", false),

        // 6. PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT
        new(VarEquipTransport, SvcEquipId, ServiceVariantType.NA, "Permit to Transport", false),
        new(VarEquipDealerNew, SvcEquipId, ServiceVariantType.New, "Dealer Permit", false),
        new(VarEquipDealerRen, SvcEquipId, ServiceVariantType.Renewal, "Dealer Permit", false),
        new(VarEquipDealerMod, SvcEquipId, ServiceVariantType.Modification, "Dealer Permit", false),
        new(VarEquipMfgNew, SvcEquipId, ServiceVariantType.New, "Manufacturer Permit", false),
        new(VarEquipMfgRen, SvcEquipId, ServiceVariantType.Renewal, "Manufacturer Permit", false),
        new(VarEquipMfgMod, SvcEquipId, ServiceVariantType.Modification, "Manufacturer Permit", false),
        new(VarEquipSvcNew, SvcEquipId, ServiceVariantType.New, "Service Center Permit", false),
        new(VarEquipSvcRen, SvcEquipId, ServiceVariantType.Renewal, "Service Center Permit", false),
        new(VarEquipSvcMod, SvcEquipId, ServiceVariantType.Modification, "Service Center Permit", false),

        // 7. PERMITS FOR MOBILE PHONE
        new(VarMpDealerNew, SvcMpId, ServiceVariantType.New, "Dealer Permit", false),
        new(VarMpDealerRen, SvcMpId, ServiceVariantType.Renewal, "Dealer Permit", false),
        new(VarMpDealerMod, SvcMpId, ServiceVariantType.Modification, "Dealer Permit", false),
        new(VarMpRetailerNew, SvcMpId, ServiceVariantType.New, "Retailer/Reseller Permit", false),
        new(VarMpRetailerRen, SvcMpId, ServiceVariantType.Renewal, "Retailer/Reseller Permit", false),
        new(VarMpRetailerMod, SvcMpId, ServiceVariantType.Modification, "Retailer/Reseller Permit", false),
        new(VarMpSvcNew, SvcMpId, ServiceVariantType.New, "Service Center Permit", false),
        new(VarMpSvcRen, SvcMpId, ServiceVariantType.Renewal, "Service Center Permit", false),
        new(VarMpSvcMod, SvcMpId, ServiceVariantType.Modification, "Service Center Permit", false),

        // 8. COPY OF PERMITS
        new(VarPermitTrueCopy, SvcCopyId, ServiceVariantType.NA, "Certified True Copy"),
        new(VarPermitDuplicate, SvcCopyId, ServiceVariantType.NA, "Duplicate Copy")
    };

    public static List<VariantElementDef> GetBackfillElements() => new()
    {
        // Foreign Visitor Amateur
        new(VarAmForeign, "Class A", "Class A Amateur Operator"),
        new(VarAmForeign, "Class B", "Class B Amateur Operator"),
        new(VarAmForeign, "Class C", "Class C Amateur Operator"),

        // Mobile Phone Dealer Permit Elements
        new(VarMpDealerNew, "MAIN", "Main Office / Establishment"),
        new(VarMpDealerNew, "BRANCH", "Branch Office / Outlet"),
        new(VarMpDealerRen, "MAIN", "Main Office / Establishment"),
        new(VarMpDealerRen, "BRANCH", "Branch Office / Outlet"),
        new(VarMpDealerMod, "MAIN", "Main Office / Establishment"),
        new(VarMpDealerMod, "BRANCH", "Branch Office / Outlet")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["AM_NEW_STATION_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000050"), "Proof for New Amateur Radio Station License", "1. For new Amateur Radio Station License:\n(a) Valid Report of Rating, OR\n(b) Valid Amateur Radio Operator Certificate\n\n2. For Change of Equipment and/or Additional Equipment:\nValid Amateur Radio Station License"),
        ["AM_SELLER_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000052"), "1. Amateur Radio Station License of the Seller", "1. Amateur Radio Station License of the Seller"),
        ["LETTER_OF_INTENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000053"), "1. Letter of Intent*", "1. Letter of Intent*"),
        ["FOREIGN_AMA_ROC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000054"), "2. Copy of valid Amateur Radio Operator Certificate issued by the country of citizenship*", "2. Copy of valid Amateur Radio Operator Certificate issued by the country of citizenship*"),
        ["RECIPROCAL_PROOF"] = new(Guid.Parse("70000000-0000-0000-0000-000000000055"), "3. Any proof that his/her country provides the same privilege with the Filipino Amateurs*", "3. Any proof that his/her country provides the same privilege with the Filipino Amateurs*"),
        ["PARA_ENDORSEMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000056"), "4. Endorsement from recognized national organization (i.e. Philippine Amateur Radio Association (PARA), Inc.)*", "4. Endorsement from recognized national organization (i.e. Philippine Amateur Radio Association (PARA), Inc.)*"),
        ["PHOTO_1X1"] = new(Guid.Parse("70000000-0000-0000-0000-000000000003"), "5. Please provide a clear 1x1 ID picture taken within the last six (6) months.*", "5. Please provide a clear 1x1 ID picture taken within the last six (6) months.*"),
        ["AM_ROC_OR_RSL_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000057"), "Copy of valid Amateur Radio Operator Certificate or Amateur Radio Station License*", "Copy of valid Amateur Radio Operator Certificate or Amateur Radio Station License*"),
        ["SPECIAL_PERMIT_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000058"), "Special Permit*", "Special Permit*"),
        ["AM_SPECIAL_EVENT_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000078"), "1. Letter Request stating, among others, nature of event, duration of event, etc.*", "1. Letter Request stating, among others, nature of event, duration of event, etc.*"),
        ["AM_VANITY_NEW_REQ_2"] = new(Guid.Parse("70000000-0000-0000-0000-000000000079"), "2. ANY of the following:*\n• Endorsement from the Philippine Amateur Radio Association (PARA), Inc.; OR\n• Proof of ANY of the following radio amateur activities:\n   • DXCentury Club (DXCC) 5B awards\n   • Continental Champion for three (3) consecutive years of a major amateur radio contest\n   • DXpedition in any of the top twenty (20) Most Wanted DXCC entities", "2. ANY of the following:*\n• Endorsement from the Philippine Amateur Radio Association (PARA), Inc.; OR\n• Proof of ANY of the following radio amateur activities:\n   • DXCentury Club (DXCC) 5B awards\n   • Continental Champion for three (3) consecutive years of a major amateur radio contest\n   • DXpedition in any of the top twenty (20) Most Wanted DXCC entities"),

        ["AERO_CAAP_FREQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000059"), "For new Aeronautical Fixed Station:\nFrequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)", "1. For new Aeronautical Fixed Station:\nFrequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)"),
        ["AERO_AC_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000060"), "1. Valid Aircraft Station License(s)", "1. Valid Aircraft Station License(s)"),
        ["RADIO_STATION_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000074"), "Valid Radio Station License", "3. For Change of Equipment and/or Additional Equipment for Fixed Aeronautical Station:\nValid Radio Station License"),
        ["AERO_STORAGE_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000080"), "1.  Photocopy of valid RSL or ASL *", "1.  Photocopy of valid RSL or ASL *"),
        ["AERO_SELLER_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000075"), "1. Aeronautical Station License of the Seller", "1. Aeronautical Station License of the Seller"),

        ["MARINA_REG_OR_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000061"), "1. Copy of ANY of the following:*\n• Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)\n• Ship Station License", "1. Copy of ANY of the following:*\n• Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)\n• Ship Station License"),
        ["RADIO_STATION_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000062"), "1. Radio Station Permit*", "1. Radio Station Permit*"),
        ["SHIP_SELLER_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000063"), "1. Ship Station License of the Seller", "1. Ship Station License of the Seller"),
        ["DOMESTIC_TRADE_SHIP_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000064"), "1. Ship Station License(s) for ship(s) engaged in Domestic Trade*", "1. Ship Station License(s) for ship(s) engaged in Domestic Trade*"),
        ["PECE_ENGINEERING_PLANS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000065"), "1. Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:*", "1. Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:*\n\n1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)"),
        ["PROVISIONAL_AUTH_OR_CPCN"] = new(Guid.Parse("70000000-0000-0000-0000-000000000066"), "2. Copy of ANY of the following:*\n• Provisional Authority\n• Certificate of Public Convenience and Necessity", "2. Copy of ANY of the following:*\n• Provisional Authority\n• Certificate of Public Convenience and Necessity"),
        ["PUBLIC_COASTAL_SELLER_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000067"), "1. Public Coastal Station License of the Seller", "1. Public Coastal Station License of the Seller"),

        ["VSAT_AGREEMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000070"), "4. For VSAT, ANY of the following: *", "4. For VSAT, ANY of the following: *\n• Copy of valid Transponder Lease Agreement (TLA) with any Philippine or International Satellite Operator\n• Certification of assigned transponder(s) with the following parameters: (i) Transponder ID/Number (ii) Center Frequency (Uplink/Downlink), (iii) Bandwidth, (iv) Polarization (Uplink/Downlink)"),
        ["PRIVATE_BUSINESS_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000071"), "4. For Private Entities, ANY of the following: *", "4. For Private Entities, ANY of the following: *\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit"),
        ["CIVIC_ACTION_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000072"), "4. For Civic Action Groups: *", "4. For Civic Action Groups: *\n(a) Copy of SEC Registration, OR Copy of DTI Registration, OR Copy of valid Business/Mayor's Permit OR Copy of existing Radio Station License from national office of the Civic Action Group\n(b) List of Officers and at least 50 active Members\n(c) Copy of Memorandum of Agreement with the government & non-government organizations"),
        ["GOVT_LETTER_OF_INTENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000073"), "7. For Government Entities: *", "7. For Government Entities: *\n•Letter of Intent duly signed by the head of the agency or his duly authorized representative stating, among others, the technical information and availability of funds to support the proposal"),
        ["EQUIPMENT_DATASHEET"] = new(Guid.Parse("70000000-0000-0000-0000-000000000068"), "2. For applications requiring new frequency assignment:", "2. For applications requiring new frequency assignment:\n•Datasheet of proposed radio equipment"),
        ["LINK_BUDGET_ANALYSIS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000069"), "3. For Microwave Radio Link:", "3. For Microwave Radio Link:\n•Link Budget Analysis"),
        ["FLM_STORAGE_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000106"), "1. Radio Station License*", "1. Radio Station License*"),
        ["FLM_SELLER_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000107"), "1. License of the Seller", "1. License of the Seller"),
        ["RADIO_OPERATOR_CERTIFICATE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000005"), "2. Appropriate and valid Radio Operator Certificate*", "2. Appropriate and valid Radio Operator Certificate*"),
        ["FLM_CONST_NEW_1"] = new(Guid.Parse("70000000-0000-0000-0000-000000000108"), "1. Permit to Purchase/Possess*", "1. Permit to Purchase/Possess*"),
        ["EQUIPMENT_SOURCE_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000077"), "4. Copy of document indicating source of equipment:*", "4. Copy of document indicating source of equipment:*\n(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess"),
        ["VEHICLE_OR_CR"] = new(Guid.Parse("70000000-0000-0000-0000-000000000076"), "5. For land mobile station:\nVehicle's valid OR/CR", "5. For land mobile station:\nVehicle's valid OR/CR"),
        ["FLM_DEMO_3"] = new(Guid.Parse("70000000-0000-0000-0000-000000000109"), "3. If VSAT Outdoor Unit will be utilized in the Demo:\nTransponder Lease Agreement (TLA) with any satellite operator", "3. If VSAT Outdoor Unit will be utilized in the Demo:\nTransponder Lease Agreement (TLA) with any satellite operator"),

        ["PTE_STORAGE_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000110"), "1. Radio Station License*", "1. Radio Station License*"),

        ["PERMIT_TO_TRANSPORT_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000081"), "1. Copy of ANY of the following:*\n• Permit to Purchase\n• Permit to Possess\n• Construction Permit/Radio Station License\n• Permit to Transfer\n• Radio Communication Equipment Dealer Permit", "1. Copy of ANY of the following:*\n• Permit to Purchase\n• Permit to Possess\n• Construction Permit/Radio Station License\n• Permit to Transfer\n• Radio Communication Equipment Dealer Permit"),
        ["DEALER_PERMIT_NEW_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000082"), "RCE Dealer Permit (New) Requirements", "1. Copy of ANY of the following:*\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.\n\n2. Proof of Paid-Up Capital*\nMinimum of PHP350,000\n\n3. List of Test Equipment and Measuring Instruments\nRefer to Section 6.1, M.C. No. 2-05-88\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers\n\n4. Copy of the following:\nCertificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers\n\n5. Copy of the following:\nCertificate of Employment and copy of valid license of Supervising Electronics Engineer (ECE) or Professional Electronics Engineer (PECE)\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers"),
        ["DEALER_PERMIT_REN_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000083"), "RCE Dealer Permit (Renewal) Requirements", "1. Radio Communication Equipment Dealer Permit*\n\n2. Business/Mayor's Permit*\n\n3. Copy of the following:\nCertificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers\n\n4. Copy of the following:\nCertificate of Employment and copy of valid license of Supervising Electronics Engineer (ECE) or Professional Electronics Engineer (PECE)\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers"),
        ["EXISTING_DEALER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000087"), "1. Radio Communication Equipment Dealer Permit*", "1. Radio Communication Equipment Dealer Permit*"),

        ["MFG_PERMIT_NEW_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000088"), "RCE Manufacturer Permit (New) Requirements", "1. Copy of ANY of the following:*\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.\n\n2. Proof of Paid-Up Capital*\nMinimum of PHP1,000,000\n\n3. List of Test Equipment and Measuring Instruments*\nRefer to Section 6.2, M.C. No. 2-05-88\n\n4. Copy of the following:*\nCertificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis\n\n5. Copy of the following:*\nCertificate of Employment and copy of valid license of supervising Professional Electronics Engineer (PECE)"),
        ["MFG_PERMIT_REN_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000089"), "RCE Manufacturer Permit (Renewal) Requirements", "1. Radio Communication Equipment Manufacturer Permit*\n\n2. Business/Mayor's Permit*\n\n3. Copy of the following:*\nCertificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis\n\n4. Copy of the following:*\nCertificate of Employment and copy of valid license of supervising Professional Electronics Engineer (PECE)"),
        ["EXISTING_MFG_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000091"), "1. Radio Communication Equipment Manufacturer Permit*", "1. Radio Communication Equipment Manufacturer Permit*"),

        ["SVC_CENTER_PERMIT_NEW_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000092"), "RCE Service Center Permit (New) Requirements", "1. Copy of ANY of the following:*\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.\n\n2. Proof of Paid-Up Capital*\nMinimum of PHP100,000\n\n3. List of Test Equipment and Measuring Instruments*\nRefer to Section 6.1, M.C. No. 2-05-88\n\n4. Copy of the following:\nCertificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis\n\n5. Copy of the following:\nCertificate of Employment and copy of valid license of Supervising Electronics Engineer (ECE) or Professional Electronics Engineer (PECE)"),
        ["SVC_CENTER_PERMIT_REN_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000090"), "RCE Service Center Permit (Renewal) Requirements", "1. Radio Communication Equipment Service Center  Permit*\n\n2. Business/Mayor's Permit*\n\n3. Copy of the following:*\nCertificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis\n\n4. Copy of the following:*\nCertificate of Employment and copy of valid license of supervising Professional Electronics Engineer (PECE)"),
        ["EXISTING_SVC_CENTER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000093"), "1. Radio Communication Equipment Service Center Permit*", "1. Radio Communication Equipment Service Center Permit*"),

        ["MP_DEALER_NEW_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000094"), "Mobile Phone Dealer (New) Requirements", "1. Copy of ANY of the following:*\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\n2. Dealership agreement from Mobile Phone Distributor/Supplier duly accredited by the NTC\n\n3. Proof of Paid-Up Capitalization*\nMinimum of PHP 100,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship\n\nNote: List of stocks of spare parts and accessories sufficient enough to cover the warranty of mobile phone units for at least six (6) months, or in accordance with dealership agreement with the NTC accredited supplier/distributor"),
        ["MP_DEALER_REN_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000095"), "Mobile Phone Dealer (Renewal) Requirements", "1. Mobile Phone Dealer Permit*\n\n2. Business/Mayor's Permit*\n\n3. Dealership agreement from Mobile Phone Distributor/Supplier duly accredited by the NTC*\n𝐍𝐨𝐭𝐞: 𝘚𝘢𝘭𝘦𝘴 𝘢𝘯𝘥 𝘚𝘵𝘰𝘤𝘬𝘴 𝘙𝘦𝘱𝘰𝘳𝘵(𝘴) 𝘴𝘩𝘢𝘭𝘭 𝘣𝘦 𝘴𝘶𝘣𝘮𝘪𝘵𝘵𝘦𝘥 𝘪𝘯 𝘵𝘩𝘦 𝘱𝘳𝘦𝘴𝘤𝘳𝘪𝘣𝘦𝘥 𝘧𝘰𝘳𝘮 𝘯𝘰𝘵 𝘭𝘢𝘵𝘦𝘳 𝘵𝘩𝘢𝘯 𝘴𝘦𝘷𝘦𝘯 (7) 𝘥𝘢𝘺𝘴 𝘢𝘧𝘵𝘦𝘳 𝘵𝘩𝘦 𝘦𝘯𝘥 𝘰𝘧 𝘦𝘢𝘤𝘩 𝘲𝘶𝘢𝘳𝘵𝘦𝘳 𝘵𝘰 𝘵𝘩𝘦 𝘙𝘦𝘨𝘪𝘰𝘯𝘢𝘭 𝘖𝘧𝘧𝘪𝘤𝘦"),
        ["MP_DEALER_MOD_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000096"), "Mobile Phone Dealer (Modification) Requirements", "1. Letter of Intent*\n\n2. Mobile Phone Dealer Permit*"),

        ["MP_RETAILER_NEW_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000098"), "Mobile Phone Retailer/Reseller (New) Requirements", "1. Copy of ANY of the following:*\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\n2. Proof of Paid-Up Capitalization*\nMinimum of PHP 50,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship"),
        ["MP_RETAILER_REN_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000099"), "Mobile Phone Retailer/Reseller (Renewal) Requirements", "1. Mobile Phone Retailer/Reseller Permit*\n\n2. Copy of ANY of the following:*\n• Business/Mayor's Permit"),
        ["MP_RETAILER_MOD_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000100"), "Mobile Phone Retailer/Reseller (Modification) Requirements", "1. Mobile Phone Retailer/Reseller Permit*\n\n2. If modification is due to:*\n2.1 𝘾𝙝𝙖𝙣𝙜𝙚 𝙤𝙛 𝙉𝙖𝙢𝙚 𝙤𝙛 𝙋𝙚𝙧𝙢𝙞𝙩𝙩𝙚𝙚, Photocopy of SEC Registration, OR Photocopy of DTI Registration, OR Photocopy of valid Business/Mayor’s Permit \n\n2.2 𝘾𝙝𝙖𝙣𝙜𝙚 𝙤𝙛 𝘾𝙤𝙢𝙥𝙖𝙣𝙮 𝘼𝙙𝙙𝙧𝙚𝙨𝙨, Photocopy of valid Business/Mayor’s Permit"),

        ["MP_SVC_NEW_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000101"), "Mobile Phone Service Center (New) Requirements", "1. Copy of ANY of the following:*\n• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\n2. List of Test Equipment and Measuring Instruments*\n\n3. Certificate of employment of qualified electronic technician who has completed a formal training course in the repair, servicing and maintenance of mobile phone*"),
        ["MP_SVC_REN_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000102"), "Mobile Phone Service Center (Renewal) Requirements", "1. Mobile Phone Service Center Permit*\n\n2. Business/Mayor's Permit*\n\n3. List of Test Equipment and Measuring Instruments*\n\n4. Certificate of employment of qualified electronic technician who has completed a formal training course in the repair, servicing and maintenance of mobile phone*"),
        ["MP_SVC_MOD_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000103"), "1. Mobile Phone Service Center Permit*", "1. Mobile Phone Service Center Permit*"),

        ["AUTH_COPY_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000104"), "1. Copy of document to be authenticated*", "1. Copy of document to be authenticated*"),
        ["DUPLICATE_PERMIT_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000105"), "Duplicate Permit Requirements", "1. Copy of Permit:\nA scanned or photocopied copy of the original Radio Operator Certificate.\n\n2. For Radio Operator Certificate:\nPlease provide a clear 1x1 ID picture taken within the last six (6) months.")
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // 1. Amateur Permits
        new(VarAmPur, Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
        new(VarAmStorage, Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
        new(VarAmPurPoss, Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
        new(VarAmSell, Guid.Parse("70000000-0000-0000-0000-000000000052"), true),
        new(VarAmForeign, Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
        new(VarAmForeign, Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
        new(VarAmForeign, Guid.Parse("70000000-0000-0000-0000-000000000055"), true),
        new(VarAmForeign, Guid.Parse("70000000-0000-0000-0000-000000000056"), true),
        new(VarAmForeign, Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(VarAmVanityNew, Guid.Parse("70000000-0000-0000-0000-000000000057"), true),
        new(VarAmVanityNew, Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
        new(VarAmVanityRen, Guid.Parse("70000000-0000-0000-0000-000000000057"), true),
        new(VarAmVanityRen, Guid.Parse("70000000-0000-0000-0000-000000000058"), true),
        new(VarAmSpecialEvent, Guid.Parse("70000000-0000-0000-0000-000000000078"), true),
        new(VarAmSpecialEvent, Guid.Parse("70000000-0000-0000-0000-000000000057"), true),

        // 2. Aeronautical Permits
        new(VarAeroStnPur, Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(VarAeroStnPoss, Guid.Parse("70000000-0000-0000-0000-000000000060"), true),
        new(VarAeroStnPoss, Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(VarAeroStnPurPoss, Guid.Parse("70000000-0000-0000-0000-000000000060"), true),
        new(VarAeroStnPurPoss, Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(VarAeroStnPurPoss, Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(VarAeroStorage, Guid.Parse("70000000-0000-0000-0000-000000000080"), true),
        new(VarAeroStnSell, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(VarAirStnPur, Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(VarAirStnPoss, Guid.Parse("70000000-0000-0000-0000-000000000060"), true),
        new(VarAirStnPoss, Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(VarAirStnPurPoss, Guid.Parse("70000000-0000-0000-0000-000000000060"), true),
        new(VarAirStnPurPoss, Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(VarAirStnPurPoss, Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(VarAirStnSell, Guid.Parse("70000000-0000-0000-0000-000000000075"), true),

        // 3. Maritime Permits
        new(VarMarShipPur, Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(VarMarShipPoss, Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(VarMarShipStorage, Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
        new(VarMarShipPurPoss, Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(VarMarShipSell, Guid.Parse("70000000-0000-0000-0000-000000000063"), true),
        new(VarMarPrivCoastPur, Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
        new(VarMarPrivCoastPoss, Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
        new(VarMarPrivCoastPP, Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
        new(VarMarPubCoastPur, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarMarPubCoastPur, Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
        new(VarMarPubCoastPoss, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarMarPubCoastPoss, Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
        new(VarMarPubCoastPP, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarMarPubCoastPP, Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
        new(VarMarPubCoastSell, Guid.Parse("70000000-0000-0000-0000-000000000067"), true),

        // 4. FLM Permits
        new(VarFlmPurVsat, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPurVsat, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPurVsat, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPurVsat, Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

        new(VarFlmPurPriv, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPurPriv, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPurPriv, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPurPriv, Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

        new(VarFlmPurCag, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPurCag, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPurCag, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPurCag, Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

        new(VarFlmPurGov, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPurGov, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPurGov, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPurGov, Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

        new(VarFlmPossVsat, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPossVsat, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPossVsat, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPossVsat, Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

        new(VarFlmPossPriv, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPossPriv, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPossPriv, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPossPriv, Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

        new(VarFlmPossCag, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPossCag, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPossCag, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPossCag, Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

        new(VarFlmPossGov, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPossGov, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPossGov, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPossGov, Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

        new(VarFlmPPVsat, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPPVsat, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPPVsat, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPPVsat, Guid.Parse("70000000-0000-0000-0000-000000000070"), true),

        new(VarFlmPPPriv, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPPPriv, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPPPriv, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPPPriv, Guid.Parse("70000000-0000-0000-0000-000000000071"), true),

        new(VarFlmPPCag, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPPCag, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPPCag, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPPCag, Guid.Parse("70000000-0000-0000-0000-000000000072"), true),

        new(VarFlmPPGov, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmPPGov, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmPPGov, Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(VarFlmPPGov, Guid.Parse("70000000-0000-0000-0000-000000000073"), true),

        new(VarFlmStorage, Guid.Parse("70000000-0000-0000-0000-000000000106"), true),
        new(VarFlmSell, Guid.Parse("70000000-0000-0000-0000-000000000107"), true),

        new(VarFlmConstNew, Guid.Parse("70000000-0000-0000-0000-000000000108"), true),
        new(VarFlmConstNew, Guid.Parse("70000000-0000-0000-0000-000000000005"), true),
        new(VarFlmConstNew, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmConstNew, Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
        new(VarFlmConstNew, Guid.Parse("70000000-0000-0000-0000-000000000076"), false),
        new(VarFlmConstMod, Guid.Parse("70000000-0000-0000-0000-000000000106"), true),

        new(VarFlmDemo, Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(VarFlmDemo, Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(VarFlmDemo, Guid.Parse("70000000-0000-0000-0000-000000000109"), false),

        // 5. PTE Permits
        new(VarPteStorage, Guid.Parse("70000000-0000-0000-0000-000000000110"), true),

        // 6. Equipment Permits
        new(VarEquipTransport, Guid.Parse("70000000-0000-0000-0000-000000000081"), true),
        new(VarEquipDealerNew, Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
        new(VarEquipDealerRen, Guid.Parse("70000000-0000-0000-0000-000000000083"), true),
        new(VarEquipDealerMod, Guid.Parse("70000000-0000-0000-0000-000000000087"), true),
        new(VarEquipMfgNew, Guid.Parse("70000000-0000-0000-0000-000000000088"), true),
        new(VarEquipMfgRen, Guid.Parse("70000000-0000-0000-0000-000000000089"), true),
        new(VarEquipMfgMod, Guid.Parse("70000000-0000-0000-0000-000000000091"), true),
        new(VarEquipSvcNew, Guid.Parse("70000000-0000-0000-0000-000000000092"), true),
        new(VarEquipSvcRen, Guid.Parse("70000000-0000-0000-0000-000000000090"), true),
        new(VarEquipSvcMod, Guid.Parse("70000000-0000-0000-0000-000000000093"), true),

        // 7. Mobile Phone Permits
        new(VarMpDealerNew, Guid.Parse("70000000-0000-0000-0000-000000000094"), true),
        new(VarMpDealerRen, Guid.Parse("70000000-0000-0000-0000-000000000095"), true),
        new(VarMpDealerMod, Guid.Parse("70000000-0000-0000-0000-000000000096"), true),
        new(VarMpRetailerNew, Guid.Parse("70000000-0000-0000-0000-000000000098"), true),
        new(VarMpRetailerRen, Guid.Parse("70000000-0000-0000-0000-000000000099"), true),
        new(VarMpRetailerMod, Guid.Parse("70000000-0000-0000-0000-000000000100"), true),
        new(VarMpSvcNew, Guid.Parse("70000000-0000-0000-0000-000000000101"), true),
        new(VarMpSvcRen, Guid.Parse("70000000-0000-0000-0000-000000000102"), true),
        new(VarMpSvcMod, Guid.Parse("70000000-0000-0000-0000-000000000103"), true),

        // 8. Copy of Permits
        new(VarPermitTrueCopy, Guid.Parse("70000000-0000-0000-0000-000000000104"), true),
        new(VarPermitDuplicate, Guid.Parse("70000000-0000-0000-0000-000000000105"), true)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_09", Guid.Parse("f0900000-0000-0000-0000-000000000001"), Guid.Parse("f09a0000-0000-0000-0000-000000000000"), new()
        {
            new("typeOfApplication", "Application Type", new() { "permitType", "preferredCallSign", "licenseNo", "dateOfExpiry" }),
            new("applicant", "Applicant Details", new() { "fullName", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("stationEquipment", "Station/Equipment", new() { "callSign", "serviceArea", "frequency", "bandwidth", "bandwidthUnit", "emission", "powerOutput", "hoursOfOperation", "stationClass", "exactLocation", "longitude", "latitude", "configuration", "dataRate", "remarks", "equipmentDetails", "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "antennaRemarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_AERO_PERMITS", Guid.Parse("fa000000-0000-0000-0000-000000000001"), Guid.Parse("fa0a0000-0000-0000-0000-000000000000"), new()
        {
            new("typeOfApplication", "Application Type", new() { "permitType", "natureOfService" }),
            new("applicant", "Applicant Details", new() { "fullName", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("stationEquipment", "Particulars of Proposed Station / Equipment", new() { "aeroStationParticulars", "callSign", "serviceArea", "frequency", "bandwidth", "bandwidthUnit", "emission", "powerOutput", "hoursOfOperation", "stationClass", "exactLocation", "longitude", "latitude", "configuration", "dataRate", "remarks", "equipmentDetails", "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "antennaRemarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_MAR_PERMITS", Guid.Parse("fb100000-0000-0000-0000-000000000001"), Guid.Parse("fb1a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("stationEquipment", "Particulars of Proposed Station / Equipment", new() { "callSign", "serviceArea", "frequency", "bandwidth", "bandwidthUnit", "emission", "powerOutput", "hoursOfOperation", "stationClass", "exactLocation", "longitude", "latitude", "configuration", "dataRate", "remarks", "equipmentDetails", "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "antennaRemarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_FLM_PERMITS", Guid.Parse("fb200000-0000-0000-0000-000000000001"), Guid.Parse("fb2a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("stationEquipment", "Particulars of Proposed Station / Equipment", new() { "callSign", "serviceArea", "frequency", "bandwidth", "bandwidthUnit", "emission", "powerOutput", "hoursOfOperation", "stationClass", "exactLocation", "longitude", "latitude", "configuration", "dataRate", "remarks", "equipmentDetails", "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "antennaRemarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_PTE_PERMITS", Guid.Parse("fbe00000-0000-0000-0000-000000000001"), Guid.Parse("fbea0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("stationEquipment", "Particulars of Proposed Station / Equipment", new() { "callSign", "serviceArea", "frequency", "bandwidth", "bandwidthUnit", "emission", "powerOutput", "hoursOfOperation", "stationClass", "exactLocation", "longitude", "latitude", "configuration", "dataRate", "remarks", "equipmentDetails", "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "antennaRemarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_EQUIP_PERMITS", Guid.Parse("fb300000-0000-0000-0000-000000000001"), Guid.Parse("fb3a0000-0000-0000-0000-000000000000"), new()
        {
            new("typeOfApplication", "Type of Application & Permit Category", new() { "permitType", "classOfStation" }),
            new("applicant", "Applicant Details", new() { "fullName", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("personnel", "Supervising ECE & Service Technicians", new() { "officerName", "certificateNumber" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_MP_PERMITS", Guid.Parse("fb400000-0000-0000-0000-000000000001"), Guid.Parse("fb4a0000-0000-0000-0000-000000000000"), new()
        {
            new("typeOfApplication", "Type of Application & Permit Category", new() { "permitType", "classOfStation" }),
            new("applicant", "Applicant Details", new() { "fullName", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("personnel", "Supervising ECE & Service Technicians", new() { "officerName", "certificateNumber" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_COPY_PERMITS", Guid.Parse("fb500000-0000-0000-0000-000000000001"), Guid.Parse("fb5a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "region", "province", "city", "barangay", "street", "zipCode", "contactNo", "email" }),
            new("permitLicenseCertificateNo", "Permit / Certificate Particulars", new() { "permitRslNo", "stationClass" }),
            new("circumstances", "Circumstances of Loss/Damage", new() { "circumstances" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000016"),
            new[] { "Permits in the Amateur Service", "Amateur Permit" },
            "Permits in the Amateur Service\n\nThe Amateur Radio Station Permit is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Station Permit and/or Special Permit for the Use of Vanity Call Sign is/are required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Station Permit is required for changes in the particulars indicated in the Permit.",
            "WHO MAY AVAIL:\n\n1. Individuals who have passed the Amateur Radio Operator Examination conducted by NTC\n2. Duly accredited amateur radio clubs\n3. Foreign amateurs qualified under the reciprocity agreement\n4. Licensed amateur radio operators"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000017"),
            new[] { "Permits in the Aeronautical Service", "Aeronautical Permit" },
            "Permits in the Aeronautical Service\n\nA Permit to Purchase/Possess is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.",
            "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000018"),
            new[] { "Permits in the Maritime Service", "Maritime Permit" },
            "Permits in the Maritime Service\n\nA Permit to Purchase/Possess is a written authority issued by the Commission to a public telecommunications entity (PTEs) authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.",
            "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000019"),
            new[] { "Permits for Government and Private Radio Stations", "Permit to Purchase" },
            "Permits for Government and Private Radio Stations in the Fixed and Land Mobile Service\n\nA Permit to Purchase/Possess is a written authority issued by the Commission to an individual or private or government entities authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.\n\nA Permit to Possess for Storage is a written authority issued by the Commission to an individual, private and government entities authorizing the storage of radio communications equipment.\n\nA Construction Permit is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to construct or install radio transceivers or radio station(s).",
            "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000020"),
            new[] { "Permits for Public Telecommunications Entities", "PTE Storage Permit" },
            "Permits for Public Telecommunications Entities (PTEs)\n\nA Permit to Possess for Storage is a written authority issued by the Commission to public telecommunications entities authorizing the storage of radio communications equipment.",
            "WHO MAY AVAIL:\n\n1. Public Telecommunications Entities (PTEs)"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000021"),
            new[] { "Radio Communications Equipment", "RCE Dealer" },
            "Permits for Radio Communications Equipment\n\nA Permit to Transport is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to transport radio communications equipment.\n\nAn Accreditation for Radio Communications Equipment (RCE) Dealer or RCE Manufacturer or RCE Service Center is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition and purchase/sale, or manufacture, or servicing and maintenance of radio communications equipment.",
            "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000022"),
            new[] { "PERMITS FOR MOBILE PHONE", "Permits for mobile phone" },
            "Permits for Mobile Phone\n\nAn Accreditation for Mobile Phone Dealer or Mobile Phone Retailer/Reseller or Mobile Phone Service Center is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition and purchase/sale, or servicing and maintenance of mobile phones.",
            "WHO MAY AVAIL:\n\n1. Individuals and Private Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000023"),
            new[] { "Copy of Permits", "Permits" },
            "Copy of Permits\n\nA Certified True Copy of a Permit is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a Permit is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
            "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
        )
    };
}
