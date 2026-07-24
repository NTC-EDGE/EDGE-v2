using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class FastTrackSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Services.CountAsync() >= 12)
        {
            return;
        }

        var tenant = await context.Tenants.FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Tenant not seeded. Run RolePermissionDataSeeder first.");

        // 1. Seed Service Categories (matching spec)
        var categories = new Dictionary<string, ServiceCategory>();
        var existingCategories = await context.ServiceCategories.ToListAsync();

        ServiceCategory GetOrAddCategory(string key, string name, string code, ServiceCategoryType type, Guid defaultId)
        {
            var existing = existingCategories.FirstOrDefault(c => c.Code == code || c.Type == type);
            if (existing != null)
                return existing;

            var cat = new ServiceCategory { Id = defaultId, Name = name, Code = code, Type = type };
            context.ServiceCategories.Add(cat);
            return cat;
        }

        categories["Exams"] = GetOrAddCategory("Exams", "Exams", "EXAM", ServiceCategoryType.Exam, Guid.Parse("c0000000-0000-0000-0000-000000000001"));
        categories["Certificates"] = GetOrAddCategory("Certificates", "Certificates", "CERT", ServiceCategoryType.Certificate, Guid.Parse("c0000000-0000-0000-0000-000000000002"));
        categories["Licenses"] = GetOrAddCategory("Licenses", "Licenses", "LIC", ServiceCategoryType.License, Guid.Parse("c0000000-0000-0000-0000-000000000003"));
        categories["Permits"] = GetOrAddCategory("Permits", "Permits", "PRM", ServiceCategoryType.Permit, Guid.Parse("c0000000-0000-0000-0000-000000000004"));
        categories["Accreditations"] = GetOrAddCategory("Accreditations", "Accreditations", "ACCR", ServiceCategoryType.Accreditation, Guid.Parse("c0000000-0000-0000-0000-000000000005"));
        categories["RequestsAndComplaints"] = GetOrAddCategory("RequestsAndComplaints", "Requests and Complaints", "REQ", ServiceCategoryType.RequestsAndComplaints, Guid.Parse("c0000000-0000-0000-0000-000000000006"));

        await context.SaveChangesAsync();

        // 2. Contracts definitions
        var ntc101Contract = @"
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
                ""examCategories"": [""Radiotelegraphy"", ""Radiotelephony"", ""Amateur"", ""Restricted Radiotelephone""]
            },
            ""entityType"": ""Application""
        }";

        var ntc102Contract = @"
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

        var ntc103Contract = @"
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
            ""entityType"": ""Application""
        }";

        var ntc104Contract = @"
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

        var ntc105Contract = @"
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

        var ntc109Contract = @"
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

        var ntc110Contract = @"
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

        var ntc111Contract = @"
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

        var ntc114Contract = @"
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

        var ntc118Contract = @"
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

        var ntc119Contract = @"
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

        var ntc120Contract = @"
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

        var ntc121Contract = @"
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

        var ntc122Contract = @"
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

        // 3. Seed Services dictionary with correct names & categories
        var serviceDefs = new List<(string Key, Guid Id, Guid CategoryId, string Name, string? Group, string Code, string Desc, string Contract)>
        {
            ("NTC_1_01", Guid.Parse("50000000-0000-0000-0000-000000000001"), categories["Exams"].Id, "Application for Radio Operator Examination", null, "NTC_1_01", "Application for Radio Operator Examination (NTC 1-01)", ntc101Contract),
            ("NTC_1_02", Guid.Parse("50000000-0000-0000-0000-000000000002"), categories["Certificates"].Id, "Application for Radio Operator Certificate", "Radio Operator Certificates (ROC) excluding Amateur ROC", "NTC_1_02", "Application for Radio Operator Certificate (NTC 1-02)", ntc102Contract),
            ("NTC_1_03", Guid.Parse("50000000-0000-0000-0000-000000000003"), categories["Licenses"].Id, "Application for Amateur Radio Operator Certificate / Station License", "License in the Amateur Service", "NTC_1_03", "Application for Amateur Radio License (NTC 1-03)", ntc103Contract),
            ("NTC_1_04", Guid.Parse("50000000-0000-0000-0000-000000000004"), categories["Licenses"].Id, "Application for Ship/Ship-Earth Station License", "Ship/Ship-Earth Station", "NTC_1_04", "Application for Ship/Ship-Earth Station License (NTC 1-04)", ntc104Contract),
            ("NTC_1_05", Guid.Parse("50000000-0000-0000-0000-000000000005"), categories["Permits"].Id, "Form A (Multiple Stations/Equipment)", null, "NTC_1_05", "Form A Continuation Sheet (NTC 1-05)", ntc105Contract),
            ("NTC_1_09", Guid.Parse("50000000-0000-0000-0000-000000000009"), categories["Permits"].Id, "Application for Permit to Purchase/Possess/Sell/Transfer", "Permits in the Amateur Service", "NTC_1_09", "Application for Permit to Purchase/Possess/Sell/Transfer (NTC 1-09)", ntc109Contract),
            ("NTC_1_10", Guid.Parse("50000000-0000-0000-0000-000000000010"), categories["Permits"].Id, "Form E (Multiple Stations/Equipment)", null, "NTC_1_10", "Form E Continuation Sheet (NTC 1-10)", ntc110Contract),
            ("NTC_1_11", Guid.Parse("50000000-0000-0000-0000-000000000011"), categories["Permits"].Id, "Application for Construction Permit / Radio Station License", null, "NTC_1_11", "Application for Construction Permit / Radio Station License (NTC 1-11)", ntc111Contract),
            ("NTC_1_14", Guid.Parse("50000000-0000-0000-0000-000000000014"), categories["Permits"].Id, "Application for Temporary Permit to Propagate/Demonstrate", null, "NTC_1_14", "Application for Temporary Permit to Propagate/Demonstrate (NTC 1-14)", ntc114Contract),
            ("NTC_1_18", Guid.Parse("50000000-0000-0000-0000-000000000018"), categories["Accreditations"].Id, "Application for Dealer/Manufacturer/Service Center/CPE Supplier Accreditation", "Customer Premises Equipment Supplier Accreditation", "NTC_1_18", "Application for CPE Supplier Accreditation (NTC 1-18)", ntc118Contract),
            ("NTC_1_19", Guid.Parse("50000000-0000-0000-0000-000000000019"), categories["Certificates"].Id, "Application for Certificate of Registration (WDN/SRD/RFID)", null, "NTC_1_19", "Application for Certificate of Registration WDN/SRD/RFID (NTC 1-19)", ntc119Contract),
            ("NTC_1_20", Guid.Parse("50000000-0000-0000-0000-000000000020"), categories["Certificates"].Id, "Application for Certificate of Registration (VAS/PCSOTSP/VoIP)", null, "NTC_1_20", "Application for Certificate of Registration VAS/VoIP (NTC 1-20)", ntc120Contract),
            ("NTC_1_21", Guid.Parse("50000000-0000-0000-0000-000000000021"), categories["Certificates"].Id, "Application for Duplicate of Permit/License/Certificate", null, "NTC_1_21", "Application for Duplicate Permit/License/Certificate (NTC 1-21)", ntc121Contract),
            ("NTC_1_22", Guid.Parse("50000000-0000-0000-0000-000000000022"), categories["Licenses"].Id, "Application for TVRO Registration Certificate / TVRO Station License / CATV Station License", null, "NTC_1_22", "Application for TVRO/CATV License (NTC 1-22)", ntc122Contract)
        };

        var services = new Dictionary<string, Service>();
        var existingServices = await context.Services.ToListAsync();

        foreach (var def in serviceDefs)
        {
            var s = existingServices.FirstOrDefault(x => x.Code == def.Code);
            if (s == null)
            {
                s = new Service
                {
                    Id = def.Id,
                    ServiceCategoryId = def.CategoryId,
                    TenantId = tenant.Id,
                    Name = def.Name,
                    Group = def.Group,
                    Code = def.Code,
                    Description = def.Desc,
                    Contract = def.Contract
                };
                context.Services.Add(s);
            }
            else
            {
                s.Name = def.Name;
                s.Group = def.Group;
                s.ServiceCategoryId = def.CategoryId;
                s.Contract = def.Contract;
            }
            services[def.Key] = s;
        }

        await context.SaveChangesAsync();

        // 4. Seed Service Variants
        var existingVariants = await context.ServiceVariants.ToListAsync();
        var variantsToSeed = new List<ServiceVariant>
        {
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000001"), ServiceId = services["NTC_1_01"].Id, Type = ServiceVariantType.New, Description = "New Radio Operator Exam Application" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000002"), ServiceId = services["NTC_1_02"].Id, Type = ServiceVariantType.New, Description = "New Radio Operator Certificate Application" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000003"), ServiceId = services["NTC_1_02"].Id, Type = ServiceVariantType.Renewal, Description = "Renew Radio Operator Certificate" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000004"), ServiceId = services["NTC_1_03"].Id, Type = ServiceVariantType.New, Description = "New Amateur Radio License Application" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000005"), ServiceId = services["NTC_1_04"].Id, Type = ServiceVariantType.New, Description = "New Ship Station License Application" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000006"), ServiceId = services["NTC_1_11"].Id, Type = ServiceVariantType.New, Description = "New Radio Station License Application" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000007"), ServiceId = services["NTC_1_11"].Id, Type = ServiceVariantType.Renewal, Description = "Renew Radio Station License" }
        };

        foreach (var v in variantsToSeed)
        {
            if (!existingVariants.Any(x => x.Id == v.Id || (x.ServiceId == v.ServiceId && x.Type == v.Type)))
            {
                context.ServiceVariants.Add(v);
            }
        }





        await context.SaveChangesAsync();

        // 7. Seed Central Reusable Fields Pool (Deterministic GUIDs)
        var fieldsPool = new Dictionary<string, Field>
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

        var existingFields = await context.Fields.ToListAsync();
        foreach (var f in fieldsPool.Values)
        {
            if (!existingFields.Any(x => x.Id == f.Id))
            {
                context.Fields.Add(f);
            }
        }
        await context.SaveChangesAsync();

        // 8. Seed Form Builders & Sections per Service
        var existingForms = await context.Forms.Include(f => f.Sections).ThenInclude(s => s.SectionFields).ToListAsync();

        async Task SeedFormForService(string serviceKey, Guid formId, Guid sectionGuidPrefix, List<(string Key, string Title, List<string> FieldKeys)> sectionDefs)
        {
            var service = services[serviceKey];
            var form = existingForms.FirstOrDefault(f => f.ServiceId == service.Id);
            if (form == null)
            {
                form = new Form
                {
                    Id = formId,
                    ServiceId = service.Id,
                    Version = "1.0",
                    CategorySelectionRequired = false
                };
                context.Forms.Add(form);
                await context.SaveChangesAsync();
            }

            int sectionOrder = 1;
            int sectionIndex = 1;
            foreach (var (key, title, fieldKeys) in sectionDefs)
            {
                var section = form.Sections.FirstOrDefault(s => s.Key == key);
                if (section == null)
                {
                    var bytes = sectionGuidPrefix.ToByteArray();
                    bytes[15] = (byte)sectionIndex;
                    section = new FormSection
                    {
                        Id = new Guid(bytes),
                        FormId = form.Id,
                        Key = key,
                        Title = title,
                        OrderIndex = sectionOrder++
                    };
                    context.FormSections.Add(section);
                    await context.SaveChangesAsync();
                }

                int fieldOrder = 1;
                foreach (var fk in fieldKeys)
                {
                    if (fieldsPool.TryGetValue(fk, out var f))
                    {
                        if (!context.SectionFields.Any(sf => sf.FormSectionId == section.Id && sf.FieldId == f.Id))
                        {
                            context.SectionFields.Add(new SectionField
                            {
                                FormSectionId = section.Id,
                                FieldId = f.Id,
                                IsRequired = key != "assistanceRequest" && key != "knownByAnotherName" && key != "club" && key != "examination" && key != "radioOfficers",
                                OrderIndex = fieldOrder++
                            });
                        }
                    }
                }
                sectionIndex++;
            }
            await context.SaveChangesAsync();
        }

        // Seed Forms per NTC Service
        await SeedFormForService("NTC_1_01", Guid.Parse("f0100000-0000-0000-0000-000000000001"), Guid.Parse("f01a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "address", "contactNo", "email", "education" }),
            ("examSelection", "Exam Selection", new() { "examCategory", "examineeType", "elements" }),
            ("assistanceRequest", "Special Needs Assistance", new() { "specialNeeds" }),
            ("admissionSlip", "Admission Slip", new() { "admissionNumber" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" })
        });

        await SeedFormForService("NTC_1_02", Guid.Parse("f0200000-0000-0000-0000-000000000001"), Guid.Parse("f02a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "address", "contactNo", "email", "weight_kg", "height_cm", "employmentStatus", "employmentLocation" }),
            ("typeOfCertificate", "Type of Certificate", new() { "typeOfCertificate" }),
            ("examSeminarDetails", "Exam / Seminar Details", new() { "examSeminarDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_03", Guid.Parse("f0300000-0000-0000-0000-000000000001"), Guid.Parse("f03a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "address", "contactNo", "email" }),
            ("permitType", "Permit / License Type", new() { "permitType" }),
            ("classOfStation", "Class of Station", new() { "classOfStation" }),
            ("club", "Club Details", new() { "clubDetails" }),
            ("examination", "Examination History", new() { "examSeminarDetails" }),
            ("equipment", "Equipment Details", new() { "equipmentDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_04", Guid.Parse("f0400000-0000-0000-0000-000000000001"), Guid.Parse("f04a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("vessel", "Vessel Details", new() { "vesselName", "callSign", "imoNumber" }),
            ("equipment", "Equipment List", new() { "equipmentDetails" }),
            ("radioOfficers", "Radio Officers", new() { "radioOfficers" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_09", Guid.Parse("f0900000-0000-0000-0000-000000000001"), Guid.Parse("f09a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("proposedStation", "Proposed Station", new() { "stationLocation" }),
            ("equipment", "Equipment Details", new() { "equipmentDetails" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "equipmentDetails" }),
            ("intendedUse", "Intended Use", new() { "equipmentDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_11", Guid.Parse("f1100000-0000-0000-0000-000000000001"), Guid.Parse("f11a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("stations", "Station Details", new() { "stationLocation" }),
            ("equipment", "Equipment Details", new() { "equipmentDetails" }),
            ("antennas", "Antenna Details", new() { "antennaDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_14", Guid.Parse("f1400000-0000-0000-0000-000000000001"), Guid.Parse("f14a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("station", "Station Technical Details", new() { "stationLocation" }),
            ("equipment", "Equipment Details", new() { "equipmentDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_18", Guid.Parse("f1800000-0000-0000-0000-000000000001"), Guid.Parse("f18a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("personnel", "Personnel Credentials", new() { "personnelDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_19", Guid.Parse("f1900000-0000-0000-0000-000000000001"), Guid.Parse("f19a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("devices", "Registered Devices", new() { "devicesDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_20", Guid.Parse("f2000000-0000-0000-0000-000000000001"), Guid.Parse("f20a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("knownByAnotherName", "Trade Name", new() { "fullName" }),
            ("valueAddedServices", "Value-Added Services", new() { "valueAddedServices" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_21", Guid.Parse("f2100000-0000-0000-0000-000000000001"), Guid.Parse("f21a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("permitLicenseCertificateNo", "Existing Permit/License Number", new() { "circumstances" }),
            ("circumstances", "Circumstances of Loss/Damage", new() { "circumstances" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_22", Guid.Parse("f2200000-0000-0000-0000-000000000001"), Guid.Parse("f22a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("tvroEquipment", "TVRO Equipment Details", new() { "tvroDetails" }),
            ("antennaSystem", "Antenna System Details", new() { "antennaDetails" }),
            ("signalReception", "Signal Reception Details", new() { "tvroDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });
    }
}
