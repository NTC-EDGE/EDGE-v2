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

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_09"] = Ntc109Contract,
        ["NTC_1_14"] = Ntc114Contract,
        ["NTC_AERO_PERMITS"] = Ntc109Contract,
        ["NTC_MAR_PERMITS"] = Ntc109Contract,
        ["NTC_FLM_PERMITS"] = Ntc109Contract,
        ["NTC_PTE_PERMITS"] = Ntc109Contract,
        ["NTC_EQUIP_PERMITS"] = Ntc109Contract,
        ["NTC_MP_PERMITS"] = Ntc109Contract,
        ["NTC_COPY_PERMITS"] = Ntc109Contract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_1_09", Svc109Id, categoryId, "PERMITS IN THE AMATEUR SERVICE", "Permits in the Amateur Service", "NTC_1_09", "PERMITS IN THE AMATEUR SERVICE (NTC 1-09)", Ntc109Contract),
        new("NTC_AERO_PERMITS", SvcAeroId, categoryId, "PERMITS IN THE AERONAUTICAL SERVICE", null, "NTC_AERO_PERMITS", "PERMITS IN THE AERONAUTICAL SERVICE", Ntc109Contract),
        new("NTC_MAR_PERMITS", SvcMarId, categoryId, "PERMITS IN THE MARITIME SERVICE", null, "NTC_MAR_PERMITS", "PERMITS IN THE MARITIME SERVICE", Ntc109Contract),
        new("NTC_FLM_PERMITS", SvcFlmId, categoryId, "PERMITS TO GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", null, "NTC_FLM_PERMITS", "PERMITS TO FIXED AND LAND MOBILE STATIONS", Ntc109Contract),
        new("NTC_PTE_PERMITS", SvcPteId, categoryId, "PERMITS FOR PUBLIC TELECOMMUNICATIONS ENTITIES (PTEs)", null, "NTC_PTE_PERMITS", "PERMITS FOR PTEs", Ntc109Contract),
        new("NTC_EQUIP_PERMITS", SvcEquipId, categoryId, "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT", null, "NTC_EQUIP_PERMITS", "PERMITS FOR EQUIPMENT", Ntc109Contract),
        new("NTC_MP_PERMITS", SvcMpId, categoryId, "PERMITS FOR MOBILE PHONE", null, "NTC_MP_PERMITS", "PERMITS FOR MOBILE PHONE", Ntc109Contract),
        new("NTC_COPY_PERMITS", SvcCopyId, categoryId, "COPY OF PERMITS", null, "NTC_COPY_PERMITS", "COPY OF PERMITS", Ntc109Contract)
    };

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        // Amateur Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000060"), Svc109Id, ServiceVariantType.New, "Amateur Radio Station Permit to Purchase"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000061"), Svc109Id, ServiceVariantType.NA, "Amateur Radio Station Permit to Possess for Storage"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000062"), Svc109Id, ServiceVariantType.NA, "Amateur Radio Station Permit to Purchase/Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000063"), Svc109Id, ServiceVariantType.New, "Amateur Radio Station Permit to Sell/Transfer"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000064"), Svc109Id, ServiceVariantType.NA, "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000067"), Svc109Id, ServiceVariantType.New, "Special Permit for Use of Vanity Call Sign"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000065"), Svc109Id, ServiceVariantType.Renewal, "Special Permit for Use of Vanity Call Sign"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000066"), Svc109Id, ServiceVariantType.New, "Special Permit for the Use of Special Event Call Sign"),

        // Aeronautical Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000070"), SvcAeroId, ServiceVariantType.NA, "Aeronautical Station Permit to Purchase"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000071"), SvcAeroId, ServiceVariantType.NA, "Aeronautical Station Permit to Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000072"), SvcAeroId, ServiceVariantType.NA, "Aeronautical Station Permit to Purchase/Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000078"), SvcAeroId, ServiceVariantType.NA, "Permit to Possess for Storage (Aeronautical)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000073"), SvcAeroId, ServiceVariantType.NA, "Aeronautical Station Permit to Sell/Transfer"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000074"), SvcAeroId, ServiceVariantType.NA, "Aircraft Station Permit to Purchase"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000075"), SvcAeroId, ServiceVariantType.NA, "Aircraft Station Permit to Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000076"), SvcAeroId, ServiceVariantType.NA, "Aircraft Station Permit to Purchase/Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000077"), SvcAeroId, ServiceVariantType.NA, "Aircraft Station Permit to Sell/Transfer"),

        // Maritime Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000080"), SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Purchase (Domestic Trade)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000081"), SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Possess (Domestic Trade)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000082"), SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Possess for Storage"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000083"), SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Purchase/Possess (Domestic Trade)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000084"), SvcMarId, ServiceVariantType.NA, "Ship Station Permit to Sell/Transfer"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000085"), SvcMarId, ServiceVariantType.NA, "Private Coastal Station Permit to Purchase"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000086"), SvcMarId, ServiceVariantType.NA, "Private Coastal Station Permit to Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000087"), SvcMarId, ServiceVariantType.NA, "Private Coastal Station Permit to Purchase/Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000088"), SvcMarId, ServiceVariantType.NA, "Public Coastal Station Permit to Purchase"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000089"), SvcMarId, ServiceVariantType.NA, "Public Coastal Station Permit to Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000090"), SvcMarId, ServiceVariantType.NA, "Public Coastal Station Permit to Purchase/Possess"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000091"), SvcMarId, ServiceVariantType.NA, "Public Coastal Station Permit to Sell/Transfer"),

        // FLM Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000100"), SvcFlmId, ServiceVariantType.NA, "Permit to Purchase (VSAT)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000107"), SvcFlmId, ServiceVariantType.NA, "Permit to Purchase (Private)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000108"), SvcFlmId, ServiceVariantType.NA, "Permit to Purchase (Civic Action Group)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000109"), SvcFlmId, ServiceVariantType.NA, "Permit to Purchase (Government)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000101"), SvcFlmId, ServiceVariantType.NA, "Permit to Possess (VSAT)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000110"), SvcFlmId, ServiceVariantType.NA, "Permit to Possess (Private)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000111"), SvcFlmId, ServiceVariantType.NA, "Permit to Possess (Civic Action Group)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000112"), SvcFlmId, ServiceVariantType.NA, "Permit to Possess (Government)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000102"), SvcFlmId, ServiceVariantType.NA, "Permit to Purchase/Possess (VSAT)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000113"), SvcFlmId, ServiceVariantType.NA, "Permit to Purchase/Possess (Private)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000114"), SvcFlmId, ServiceVariantType.NA, "Permit to Purchase/Possess (Civic Action Group)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000115"), SvcFlmId, ServiceVariantType.NA, "Permit to Purchase/Possess (Government)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000103"), SvcFlmId, ServiceVariantType.NA, "Permit to Possess for Storage (FLM)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000104"), SvcFlmId, ServiceVariantType.NA, "Permit to Sell/Transfer (FLM)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000105"), SvcFlmId, ServiceVariantType.New, "Construction Permit (FLM)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000116"), SvcFlmId, ServiceVariantType.Modification, "Construction Permit (FLM)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000106"), SvcFlmId, ServiceVariantType.NA, "Temporary Permit to Demonstrate and Propagate (VSAT)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000117"), SvcFlmId, ServiceVariantType.NA, "Temporary Permit to Demonstrate and Propagate (Private)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000118"), SvcFlmId, ServiceVariantType.NA, "Temporary Permit to Demonstrate and Propagate (Civic Action Group)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000119"), SvcFlmId, ServiceVariantType.NA, "Temporary Permit to Demonstrate and Propagate (Government)"),

        // PTE Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000120"), SvcPteId, ServiceVariantType.NA, "Permit to Possess for Storage (PTE)"),

        // Equipment Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000130"), SvcEquipId, ServiceVariantType.NA, "Permit to Transport"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000131"), SvcEquipId, ServiceVariantType.New, "Dealer Permit (Radio Communications Equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000134"), SvcEquipId, ServiceVariantType.Renewal, "Dealer Permit (Radio Communications Equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000135"), SvcEquipId, ServiceVariantType.Modification, "Dealer Permit (Radio Communications Equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000132"), SvcEquipId, ServiceVariantType.New, "Manufacturer Permit (Radio Communications Equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000136"), SvcEquipId, ServiceVariantType.Renewal, "Manufacturer Permit (Radio Communications Equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000137"), SvcEquipId, ServiceVariantType.Modification, "Manufacturer Permit (Radio Communications Equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000133"), SvcEquipId, ServiceVariantType.New, "Service Center Permit (Radio Communications Equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000138"), SvcEquipId, ServiceVariantType.Renewal, "Service Center Permit (Radio Communications Equipment)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000139"), SvcEquipId, ServiceVariantType.Modification, "Service Center Permit (Radio Communications Equipment)"),

        // Mobile Phone Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000140"), SvcMpId, ServiceVariantType.New, "Dealer Permit (Mobile Phone)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000144"), SvcMpId, ServiceVariantType.Renewal, "Dealer Permit (Mobile Phone)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000146"), SvcMpId, ServiceVariantType.Modification, "Dealer Permit (Mobile Phone)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000141"), SvcMpId, ServiceVariantType.New, "Retailer/Reseller Permit (Mobile Phone)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000148"), SvcMpId, ServiceVariantType.Renewal, "Retailer/Reseller Permit (Mobile Phone)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000149"), SvcMpId, ServiceVariantType.Modification, "Retailer/Reseller Permit (Mobile Phone)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000142"), SvcMpId, ServiceVariantType.New, "Service Center Permit (Mobile Phone)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000152"), SvcMpId, ServiceVariantType.Renewal, "Service Center Permit (Mobile Phone)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000153"), SvcMpId, ServiceVariantType.Modification, "Service Center Permit (Mobile Phone)"),

        // Copy of Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000150"), SvcCopyId, ServiceVariantType.NA, "Certified True Copy (Permit)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000151"), SvcCopyId, ServiceVariantType.NA, "Duplicate Copy (Permit)")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["AM_NEW_STATION_REQ"] = new(Guid.Parse("70000000-0000-0000-0000-000000000050"), "Proof for New Amateur Radio Station License", "Valid Report of Rating or Amateur Radio Operator Certificate."),
        ["AM_CHANGE_EQUIP"] = new(Guid.Parse("70000000-0000-0000-0000-000000000051"), "Valid Amateur Radio Station License", "Copy of existing Amateur Radio Station License."),
        ["AM_SELLER_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000052"), "Seller's Amateur Radio Station License", "Amateur Radio Station License of the equipment seller."),
        ["LETTER_OF_INTENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000053"), "Letter of Intent", "Formal letter stating intended operational parameters and purpose."),
        ["FOREIGN_AMA_ROC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000054"), "Foreign Amateur Radio Operator Certificate", "Valid certificate issued by country of citizenship."),
        ["RECIPROCAL_PROOF"] = new(Guid.Parse("70000000-0000-0000-0000-000000000055"), "Proof of Reciprocity", "Proof that home country provides reciprocal operating privileges."),
        ["PARA_ENDORSEMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000056"), "Endorsement from PARA, Inc.", "Official endorsement letter from Philippine Amateur Radio Association."),
        ["SPECIAL_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000057"), "Special Permit", "Previously issued vanity/special call sign permit."),
        ["CALL_SIGN_ASSIGNMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000058"), "Call Sign Assignment Notice", "Official call sign assignment notice from NTC."),
        ["AERO_CAAP_APPROVAL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000059"), "CAAP Frequency / Operating Approval", "Clearance and authorization from CAAP."),
        ["AERO_SELLER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000060"), "Seller's Aeronautical Station Permit", "Valid permit of seller authorizing equipment transfer."),
        ["MARINA_VESSEL_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000061"), "MARINA Vessel Authority / Registration", "MARINA Certificate of Philippine Registry or authority."),
        ["SHIP_STORAGE_JUSTIFICATION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000062"), "Justification for Ship Equipment Storage", "Written explanation for de-installation and storage."),
        ["MAR_SELLER_LICENSE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000063"), "Seller's Ship Station License", "Copy of valid ship station license of the transferor."),
        ["COASTAL_STATION_JUSTIFICATION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000064"), "Private Coastal Station Justification", "Operational requirement justification for coastal station."),
        ["ENGINEERING_PLAN_PECE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000065"), "Engineering Plan Signed by PECE", "Complete technical network plans and specifications prepared and signed by PECE."),
        ["PTE_FRANCHISE_PROOF"] = new(Guid.Parse("70000000-0000-0000-0000-000000000066"), "PTE Franchise / Certificate of Public Convenience", "Legislative franchise or CPCN for public correspondence service."),
        ["PUBLIC_COASTAL_TRANSFER_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000067"), "Public Coastal Station Transfer Authority", "Board resolution and transfer agreement between operators."),
        ["SEC_DTI_REG"] = new(Guid.Parse("70000000-0000-0000-0000-000000000068"), "SEC / DTI Registration Certificate", "Certificate of Incorporation or Business Name Registration."),
        ["NETWORK_DIAGRAM"] = new(Guid.Parse("70000000-0000-0000-0000-000000000069"), "Network Layout Diagram", "Overall system and network topology diagram."),
        ["VSAT_SERVICE_CONTRACT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000070"), "VSAT Service / Hub Agreement", "Contract with authorized VSAT satellite service provider."),
        ["MAYORS_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000071"), "Valid Mayor's / Business Permit", "Current local government business permit."),
        ["CAG_ACCREDITATION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000072"), "Civic Action Group NTC Accreditation", "Valid Accreditation Certificate as Civic Action Group."),
        ["GOVT_AGENCY_AUTHORIZATION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000073"), "Government Agency Head Authorization", "Official requisition signed by Head of Office / Department."),
        ["EXISTING_PERMIT_RSL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000074"), "Copy of Existing Permit / License", "Copy of existing Permit to Purchase/Possess or Station License."),
        ["DEED_OF_SALE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000075"), "Deed of Sale / Assignment", "Notarized Deed of Sale or Transfer Agreement."),
        ["CONSTRUCTION_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000076"), "Valid Construction Permit", "Construction Permit issued by NTC."),
        ["PURCHASE_RECEIPT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000077"), "Official Sales Invoice / Receipt of Equipment", "Sales invoice from authorized dealer or importation documents."),
        ["VEHICLE_OR_CR"] = new(Guid.Parse("70000000-0000-0000-0000-000000000078"), "LTO Official Receipt / Certificate of Registration (OR/CR)", "For mobile land units: LTO vehicle registration."),
        ["DEMO_PROPAGATE_JUSTIFICATION"] = new(Guid.Parse("70000000-0000-0000-0000-000000000079"), "Technical Justification for Propagation Test", "Engineering justification and test parameters for signal demonstration."),
        ["EQUIP_TEST_SCHEDULE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000080"), "Test Schedule & Operational Parameters", "Detailed itinerary, frequencies, power levels, and duration of test."),
        ["TRANSPORT_EQUIP_LIST"] = new(Guid.Parse("70000000-0000-0000-0000-000000000081"), "List of Equipment to be Transported with Serial Numbers", "Detailed itemized list of transceivers, serial numbers, and origin/destination."),
        ["CAPITAL_PROOF_DEALER"] = new(Guid.Parse("70000000-0000-0000-0000-000000000083"), "Proof of Capital (Financial Statement / Bank Cert)", "Audited Financial Statements or Bank Certification showing capital compliance."),
        ["DEALER_SHOP_INSP"] = new(Guid.Parse("70000000-0000-0000-0000-000000000084"), "NTC Service Shop / Showroom Inspection Report", "Official technical site inspection report of shop premises."),
        ["ECE_PECE_EMPLOYMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000085"), "Proof of Employment of Registered ECE / PECE", "PRC ID and employment contract of supervising electronics engineer."),
        ["TECH_EMPLOYMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000086"), "Proof of Employment of Qualified Technicians", "Employment contracts and certifications of skilled radio technicians."),
        ["EXPIRING_DEALER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000087"), "Copy of Expiring Dealer Permit", "Copy of existing/expiring Dealer Permit."),
        ["MFG_FACILITY_LAYOUT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000088"), "Manufacturing Facility Plant Layout & Production Process", "Plant layout, assembly line diagram, and quality control process description."),
        ["TEST_EQUIP_LIST"] = new(Guid.Parse("70000000-0000-0000-0000-000000000089"), "List of Test & Measuring Equipment with Calibration Certs", "Itemized list of spectrum analyzers, signal generators, power meters with valid calibration."),
        ["SEMI_ANNUAL_REPORT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000090"), "Semi-Annual Sales & Stocks Report", "Submitted semi-annual sales and stocks transactions report."),
        ["EXPIRING_MFG_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000091"), "Copy of Expiring Manufacturer Permit", "Copy of existing/expiring Manufacturer Permit."),
        ["SVC_CENTER_SERVICE_AGREEMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000092"), "Service Agreement with Authorized Brand/Manufacturer", "Appointment or authorization agreement from equipment manufacturer."),
        ["EXPIRING_SVC_CENTER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000093"), "Copy of Expiring Service Center Permit", "Copy of existing/expiring Service Center Permit."),
        ["MP_DISTRIBUTOR_AGREEMENT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000094"), "Distributorship Agreement with Mobile Phone Brand", "Distributorship agreement or appointment from accredited brand supplier."),
        ["MP_SHOWROOM_INSP"] = new(Guid.Parse("70000000-0000-0000-0000-000000000095"), "NTC Mobile Phone Retail/Showroom Inspection Report", "Official NTC showroom inspection certificate."),
        ["EXPIRING_MP_DEALER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000096"), "Copy of Expiring Mobile Phone Dealer Permit", "Copy of existing/expiring Mobile Phone Dealer Permit."),
        ["BARANGAY_CLEARANCE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000097"), "Valid Barangay Business Clearance", "Current Barangay Clearance for business operations."),
        ["RETAILER_SUPPLY_CONTRACT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000098"), "Supply Contract from Accredited Mobile Phone Dealer", "Supply agreement or invoice from NTC-accredited dealer."),
        ["EXPIRING_RETAILER_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000099"), "Copy of Expiring Retailer/Reseller Permit", "Copy of existing/expiring Retailer/Reseller Permit."),
        ["MP_SALES_REPORT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000100"), "Semi-Annual Sales Report of Mobile Phone Units", "Report of mobile phones sold with IMEIs."),
        ["MP_SERVICE_AUTH"] = new(Guid.Parse("70000000-0000-0000-0000-000000000101"), "Mobile Phone Brand Service Center Authorization", "Authorization contract from phone manufacturer."),
        ["MP_TEST_TOOLS_LIST"] = new(Guid.Parse("70000000-0000-0000-0000-000000000102"), "List of Mobile Diagnostic Tools & Repair Equipment", "List of diagnostic software, soldering stations, and multimeters."),
        ["EXPIRING_MP_SVC_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000103"), "Copy of Expiring Mobile Phone Service Center Permit", "Copy of existing/expiring Service Center Permit."),
        ["AFFIDAVIT_OF_LOSS_PERMIT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000104"), "Duly Notarized Affidavit of Loss (Permit)", "Notarized affidavit describing circumstances of lost or damaged permit.")
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // Amateur Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000060"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000060"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000061"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000061"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000062"), Guid.Parse("70000000-0000-0000-0000-000000000050"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000062"), Guid.Parse("70000000-0000-0000-0000-000000000051"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000063"), Guid.Parse("70000000-0000-0000-0000-000000000052"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000055"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000056"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000064"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000067"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000067"), Guid.Parse("70000000-0000-0000-0000-000000000057"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000057"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000065"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000058"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000066"), Guid.Parse("70000000-0000-0000-0000-000000000054"), true),

        // Aeronautical Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000070"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000071"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000072"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000078"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000073"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000074"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000075"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000076"), Guid.Parse("70000000-0000-0000-0000-000000000059"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000077"), Guid.Parse("70000000-0000-0000-0000-000000000060"), true),

        // Maritime Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000080"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000081"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000082"), Guid.Parse("70000000-0000-0000-0000-000000000062"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000083"), Guid.Parse("70000000-0000-0000-0000-000000000061"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000084"), Guid.Parse("70000000-0000-0000-0000-000000000063"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000085"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000086"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000087"), Guid.Parse("70000000-0000-0000-0000-000000000064"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000088"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000089"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000090"), Guid.Parse("70000000-0000-0000-0000-000000000066"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000091"), Guid.Parse("70000000-0000-0000-0000-000000000067"), true),

        // FLM Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000100"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000107"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000108"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000109"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000101"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000110"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000111"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000112"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000102"), Guid.Parse("70000000-0000-0000-0000-000000000070"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000113"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000114"), Guid.Parse("70000000-0000-0000-0000-000000000072"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000069"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000115"), Guid.Parse("70000000-0000-0000-0000-000000000073"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000103"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000104"), Guid.Parse("70000000-0000-0000-0000-000000000075"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000076"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000065"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000077"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000105"), Guid.Parse("70000000-0000-0000-0000-000000000078"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000116"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000106"), Guid.Parse("70000000-0000-0000-0000-000000000080"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000117"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000118"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000079"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000119"), Guid.Parse("70000000-0000-0000-0000-000000000068"), true),

        // PTE Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000120"), Guid.Parse("70000000-0000-0000-0000-000000000074"), true),

        // Equipment Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000130"), Guid.Parse("70000000-0000-0000-0000-000000000081"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000083"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000084"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000131"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000085"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000134"), Guid.Parse("70000000-0000-0000-0000-000000000086"), false),
        new(Guid.Parse("60000000-0000-0000-0000-000000000135"), Guid.Parse("70000000-0000-0000-0000-000000000087"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000088"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000089"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000132"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000136"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000137"), Guid.Parse("70000000-0000-0000-0000-000000000091"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000082"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000092"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000089"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000133"), Guid.Parse("70000000-0000-0000-0000-000000000086"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000093"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000085"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000138"), Guid.Parse("70000000-0000-0000-0000-000000000090"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000139"), Guid.Parse("70000000-0000-0000-0000-000000000093"), true),

        // Mobile Phone Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000140"), Guid.Parse("70000000-0000-0000-0000-000000000095"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000144"), Guid.Parse("70000000-0000-0000-0000-000000000094"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000053"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000146"), Guid.Parse("70000000-0000-0000-0000-000000000096"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000141"), Guid.Parse("70000000-0000-0000-0000-000000000071"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000141"), Guid.Parse("70000000-0000-0000-0000-000000000098"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000148"), Guid.Parse("70000000-0000-0000-0000-000000000099"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000148"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000149"), Guid.Parse("70000000-0000-0000-0000-000000000099"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000149"), Guid.Parse("70000000-0000-0000-0000-000000000100"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000101"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000142"), Guid.Parse("70000000-0000-0000-0000-000000000102"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000103"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000097"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000101"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000152"), Guid.Parse("70000000-0000-0000-0000-000000000102"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000153"), Guid.Parse("70000000-0000-0000-0000-000000000103"), true),

        // Copy of Permits
        new(Guid.Parse("60000000-0000-0000-0000-000000000150"), Guid.Parse("70000000-0000-0000-0000-000000000025"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000151"), Guid.Parse("70000000-0000-0000-0000-000000000104"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000151"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_09", Guid.Parse("f0900000-0000-0000-0000-000000000001"), Guid.Parse("f09a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            new("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_AERO_PERMITS", Guid.Parse("fae00000-0000-0000-0000-000000000001"), Guid.Parse("faea0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            new("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_MAR_PERMITS", Guid.Parse("fb000000-0000-0000-0000-000000000001"), Guid.Parse("fb0a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            new("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_FLM_PERMITS", Guid.Parse("fb100000-0000-0000-0000-000000000001"), Guid.Parse("fb1a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            new("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_PTE_PERMITS", Guid.Parse("fb200000-0000-0000-0000-000000000001"), Guid.Parse("fb2a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            new("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_EQUIP_PERMITS", Guid.Parse("fb300000-0000-0000-0000-000000000001"), Guid.Parse("fb3a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            new("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_MP_PERMITS", Guid.Parse("fb400000-0000-0000-0000-000000000001"), Guid.Parse("fb4a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            new("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_COPY_PERMITS", Guid.Parse("fb500000-0000-0000-0000-000000000001"), Guid.Parse("fb5a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            new("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            new("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            new("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            new("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            new("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            new("circumstances", "Circumstances of Loss/Damage", new() { "circumstances" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            new("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        }),
        new("NTC_1_14", Guid.Parse("f1400000-0000-0000-0000-000000000001"), Guid.Parse("f14a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("station", "Station Technical Details", new() { "stationLocation" }),
            new("equipment", "Equipment Details", new() { "equipmentDetails" }),
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
