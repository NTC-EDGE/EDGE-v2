using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using EDGE.Application.Forms.Services;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace EDGE.Application.UnitTests.Forms;

public class FormContractAndSeederTests
{
    private readonly ContractFormValidator _validator = new();

    private static readonly HashSet<string> ForbiddenSectionKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "applicant",
        "applicantPerson",
        "applicantAddress",
        "applicantContact",
        "applicantEducation",
        "declaration",
        "payment",
        "fees",
        "accounting",
        "cashier",
        "vasRegistration",
        "bsd",
        "typeOfApplication",
        "permitType"
    };

    [Fact]
    public void Contracts_MustNotContain_ApplicantDemographicsFeesOrPostApprovalSections()
    {
        var contractMap = FastTrackSeederData.GetContractMap();
        contractMap.Should().NotBeEmpty();

        var jsonOptions = new JsonDocumentOptions
        {
            AllowTrailingCommas = true,
            CommentHandling = JsonCommentHandling.Skip
        };

        foreach (var (serviceKey, contractJson) in contractMap)
        {
            if (string.IsNullOrWhiteSpace(contractJson)) continue;

            using var doc = JsonDocument.Parse(contractJson, jsonOptions);
            var root = doc.RootElement;

            if (root.TryGetProperty("requiredSections", out var sectionsEl) &&
                sectionsEl.ValueKind == JsonValueKind.Array)
            {
                foreach (var s in sectionsEl.EnumerateArray())
                {
                    if (s.TryGetProperty("key", out var keyEl))
                    {
                        var key = keyEl.GetString() ?? string.Empty;
                        ForbiddenSectionKeys.Should().NotContain(
                            key,
                            because: $"Service '{serviceKey}' contract must not require '{key}' because it is managed as a first-class domain entity, not a dynamic FormSection."
                        );
                    }
                }
            }
        }
    }

    [Fact]
    public void AllServiceDefs_MustHaveUniqueCodesAndUniqueIds()
    {
        var categoryIds = new Dictionary<string, Guid>
        {
            ["Exams"] = Guid.NewGuid(),
            ["Certificates"] = Guid.NewGuid(),
            ["Licenses"] = Guid.NewGuid(),
            ["Permits"] = Guid.NewGuid(),
            ["Accreditations"] = Guid.NewGuid(),
            ["RequestsAndComplaints"] = Guid.NewGuid()
        };

        var serviceDefs = FastTrackSeederData.GetServiceDefs(categoryIds);
        foreach (var s in serviceDefs)
        {
            Console.WriteLine($"Service: Key={s.Key}, Id={s.Id}, Code={s.Code}, Name={s.Name}");
        }

        var duplicateCodes = serviceDefs.GroupBy(s => s.Code).Where(g => g.Count() > 1).ToList();
        duplicateCodes.Should().BeEmpty(because: $"There should be no duplicate Codes in ServiceDefs, but found: {string.Join(", ", duplicateCodes.Select(g => $"{g.Key} ({g.Count()})"))}");

        serviceDefs.Select(s => s.Code).Should().OnlyHaveUniqueItems();
        serviceDefs.Select(s => s.Id).Should().OnlyHaveUniqueItems();
    }

    [Fact]
    public async Task BackfillNewServices_SelfHealsCodeCollisions_WhenConflictingLegacyServicesExistInDatabase()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);

        // Seed a dummy tenant
        var tenant = new Tenant { Id = Guid.NewGuid(), Name = "NTC Central Office", Code = "NTC-CO" };
        context.Tenants.Add(tenant);

        // Seed conflicting legacy services with codes "NTC_1_04", "NTC_1_11", "NTC_1_25" on obsolete IDs
        var legacy04 = new Service
        {
            Id = Guid.Parse("50000000-0000-0000-0000-000000000013"),
            Code = "NTC_1_04",
            Name = "Old Maritime License",
            ServiceCategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000003")
        };
        var legacy11 = new Service
        {
            Id = Guid.Parse("50000000-0000-0000-0000-000000000014"),
            Code = "NTC_1_11",
            Name = "Old FLM License",
            ServiceCategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000003")
        };
        var legacy25 = new Service
        {
            Id = Guid.NewGuid(),
            Code = "NTC_1_25",
            Name = "Old Complaint Form Service",
            ServiceCategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000006")
        };

        context.Services.AddRange(legacy04, legacy11, legacy25);
        await context.SaveChangesAsync();

        // Act: Run BackfillNewServicesAsync
        await FastTrackCatalogSeeder.BackfillNewServicesAsync(context);

        // Assert: No duplicate codes exist across all services in database
        var allServices = await context.Services.IgnoreQueryFilters().ToListAsync();
        var codeGroups = allServices.GroupBy(s => s.Code.ToUpperInvariant()).Where(g => g.Count() > 1).ToList();
        codeGroups.Should().BeEmpty(because: $"All service codes must be strictly unique, but duplicates found: {string.Join(", ", codeGroups.Select(g => $"{g.Key} ({g.Count()})"))}");

        // Canonical services must exist with active status and their target IDs
        var s104 = allServices.FirstOrDefault(s => s.Id == Guid.Parse("50000000-0000-0000-0000-000000000072"));
        s104.Should().NotBeNull();
        s104!.Code.Should().Be("NTC_1_04");
        s104.IsDeleted.Should().BeFalse();

        var s111 = allServices.FirstOrDefault(s => s.Id == Guid.Parse("50000000-0000-0000-0000-000000000073"));
        s111.Should().NotBeNull();
        s111!.Code.Should().Be("NTC_1_11");
        s111.IsDeleted.Should().BeFalse();

        var s125 = allServices.FirstOrDefault(s => s.Id == Guid.Parse("50000000-0000-0000-0000-000000000080"));
        s125.Should().NotBeNull();
        s125!.Code.Should().Be("NTC_1_25");
        s125.IsDeleted.Should().BeFalse();

        // Conflicting services must have had their codes disambiguated with _LEGACY_ and marked IsDeleted = true
        var disambiguated = allServices.Where(s => s.Code.Contains("_LEGACY_")).ToList();
        foreach (var leg in disambiguated)
        {
            leg.IsDeleted.Should().BeTrue();
        }
    }

    [Fact]
    public void SeededForms_MustMatchExactSpreadsheet13CanonicalFormsAndUniformCodes()
    {
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        formDefs.Should().HaveCount(13);

        var expectedSpreadsheetCodes = new[]
        {
            "NTC_1_01", // Radio Operator Examination
            "NTC_1_02", // Commercial Radio Operator Certificate
            "NTC_1_03", // Amateur Radio Operator Certificate & License
            "NTC_1_04", // Ship Station License
            "NTC_1_09", // Permit to Purchase/Possess/Storage/Sell/Transfer
            "NTC_1_11", // Radio Station License
            "NTC_1_18", // CPE Supplier Accreditation & Equipment/Mobile Phone Permits
            "NTC_1_19", // RFID / SRD / WDN Registration
            "NTC_1_20", // VAS Provider Registration
            "NTC_1_21", // Certified True Copy / Duplicate Copy
            "NTC_1_22", // TVRO Registration & Station License
            "NTC_1_24", // Request for Blocking / Unblocking of IMEI and SIM
            "NTC_1_25"  // Consumer Complaints & Tape Preservation
        };

        var actualKeys = formDefs.Select(f => f.ServiceKey).ToList();
        actualKeys.Should().BeEquivalentTo(expectedSpreadsheetCodes, because: "Every one of the 13 canonical forms must match the spreadsheet specification, including NTC_1_25.");

        foreach (var def in formDefs)
        {
            System.Text.RegularExpressions.Regex.IsMatch(def.ServiceKey, @"^NTC_1_\d{2}$")
                .Should().BeTrue(because: $"Form code '{def.ServiceKey}' must follow the uniform NTC_1_XX pattern.");
        }
    }

    [Fact]
    public void SeededForms_TotalCount_MustBeStrictlyLessThan15()
    {
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        formDefs.Should().NotBeEmpty();
        formDefs.Count.Should().BeLessThan(15, because: "NTC Citizen's Charter and canonical forms set mandates strictly fewer than 15 baseline forms.");
        formDefs.Count.Should().Be(13, because: "There are exactly 13 canonical NTC forms across all 6 categories matching the spreadsheet plan.");
    }

    [Fact]
    public void AllSeededForms_MustValidateCleanlyAgainstContracts()
    {
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        formDefs.Should().NotBeEmpty();

        var contractMap = FastTrackSeederData.GetContractMap();

        foreach (var formDef in formDefs)
        {
            if (!contractMap.TryGetValue(formDef.ServiceKey, out var contractJson) || string.IsNullOrWhiteSpace(contractJson))
            {
                continue;
            }

            var form = new Form
            {
                Id = formDef.FormId,
                ServiceId = Guid.NewGuid(),
                Version = "1.0",
                Sections = formDef.Sections.Select((s, idx) => new FormSection
                {
                    Id = Guid.NewGuid(),
                    FormId = formDef.FormId,
                    Key = s.Key,
                    Title = s.Title,
                    OrderIndex = idx + 1
                }).ToList()
            };

            var result = _validator.Validate(contractJson, form);
            result.IsValid.Should().BeTrue(
                because: $"Form for service '{formDef.ServiceKey}' must satisfy its contract without missing required sections. Errors: {string.Join("; ", result.Errors)}"
            );
            result.Errors.Should().BeEmpty();
        }
    }

    [Fact]
    public void FieldsPool_MustNotContain_ObsoletePaymentFields()
    {
        var pool = FastTrackSeederData.GetFieldsPool();
        pool.Should().NotBeNull();

        pool.Should().NotContainKey("paymentOrNumber", because: "Official Receipts and Payments are managed by the Receipt entity, not dynamic form answers.");
        pool.Should().NotContainKey("paymentAmount", because: "Payment amounts belong to OrderOfPayment and Receipt entities.");
        pool.Should().NotContainKey("paymentDate", because: "Payment timestamps belong to transaction records.");
    }

    [Fact]
    public void GetRequiredSectionKeys_ReturnsOnlyActualFormSections()
    {
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        var contractMap = FastTrackSeederData.GetContractMap();

        foreach (var formDef in formDefs)
        {
            if (!contractMap.TryGetValue(formDef.ServiceKey, out var contractJson) || string.IsNullOrWhiteSpace(contractJson))
            {
                continue;
            }

            var actualSectionKeys = formDef.Sections.Select(s => s.Key).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var contractRequiredKeys = _validator.GetRequiredSectionKeys(contractJson);

            foreach (var reqKey in contractRequiredKeys)
            {
                actualSectionKeys.Should().Contain(
                    reqKey,
                    because: $"Contract required section '{reqKey}' for service '{formDef.ServiceKey}' must exist in the seeded form sections."
                );
            }
        }
    }

    [Fact]
    public void Ntc109_StationEquipmentSection_ContainsOperatingParametersBeforeParticulars()
    {
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        var ntc109 = formDefs.FirstOrDefault(f => f.ServiceKey.Equals("NTC_1_09", StringComparison.OrdinalIgnoreCase));
        ntc109.Should().NotBeNull("NTC_1_09 form definition must exist in seeded forms.");

        var stationSection = ntc109!.Sections.FirstOrDefault(s => s.Key.Equals("stationEquipment", StringComparison.OrdinalIgnoreCase));
        stationSection.Should().NotBeNull("stationEquipment section must exist in NTC_1_09 form.");

        stationSection!.FieldKeys.Should().Contain(new[] { "noOfYears", "preferredCallSign", "callSign" });
        stationSection!.FieldKeys.Should().ContainInOrder(new[]
        {
            "callSign",
            "serviceArea",
            "frequency",
            "bandwidth",
            "bandwidthUnit",
            "emission",
            "powerOutput",
            "hoursOfOperation",
            "particulars"
        }, "NTC 1-09 Station/Equipment section must contain operating parameters before particulars in order.");
    }

    [Fact]
    public void Ntc109_StationEquipmentSection_ContainsVanityCallSignParameters()
    {
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        var ntc109 = formDefs.FirstOrDefault(f => f.ServiceKey.Equals("NTC_1_09", StringComparison.OrdinalIgnoreCase));
        ntc109.Should().NotBeNull("NTC_1_09 form definition must exist in seeded forms.");

        var stationSection = ntc109!.Sections.FirstOrDefault(s => s.Key.Equals("stationEquipment", StringComparison.OrdinalIgnoreCase));
        stationSection.Should().NotBeNull("stationEquipment section must exist in NTC_1_09 form.");

        stationSection!.FieldKeys.Should().ContainInOrder(new[]
        {
            "noOfYears",
            "preferredCallSign",
            "particulars"
        }, "NTC 1-09 Station/Equipment section must contain no. of years, preferred call sign, and particulars.");
    }

    [Fact]
    public void AllFormDefFieldKeys_MustExistInFieldsPool()
    {
        var fieldsPool = FastTrackSeederData.GetFieldsPool();
        var formDefs = FastTrackSeederData.GetAllFormDefs();

        foreach (var formDef in formDefs)
        {
            foreach (var sec in formDef.Sections)
            {
                foreach (var fk in sec.FieldKeys)
                {
                    fieldsPool.Should().ContainKey(
                        fk,
                        because: $"Form '{formDef.ServiceKey}' section '{sec.Key}' references field key '{fk}', which must exist in CommonSeederData.GetFieldsPool()."
                    );
                }
            }
        }
    }

    [Fact]
    public async Task FastTrackSeeder_IsStrictlyIdempotent_AcrossMultipleConsecutiveRuns()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);

        // Seed required tenant
        context.Tenants.Add(new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "NTC Central Office",
            Code = "NTC-CENTRAL"
        });
        await context.SaveChangesAsync();

        // Run #1: Initial full seed
        await FastTrackSeeder.SeedAsync(context);

        var formsAfterRun1 = await context.Forms.IgnoreQueryFilters().CountAsync();
        var sectionsAfterRun1 = await context.FormSections.IgnoreQueryFilters().CountAsync();
        var sectionFieldsAfterRun1 = await context.SectionFields.CountAsync();
        var fieldsAfterRun1 = await context.Fields.IgnoreQueryFilters().CountAsync();
        var servicesAfterRun1 = await context.Services.IgnoreQueryFilters().CountAsync();
        var variantsAfterRun1 = await context.ServiceVariants.IgnoreQueryFilters().CountAsync();

        formsAfterRun1.Should().Be(13);
        sectionsAfterRun1.Should().BeGreaterThan(0);
        sectionFieldsAfterRun1.Should().BeGreaterThan(0);

        // Run #2 & Run #3: Consecutive re-runs must be 100% no-op and preserve exact counts and LastModifiedAt == null on unmodified forms
        await FastTrackSeeder.SeedAsync(context);
        await FastTrackSeeder.SeedAsync(context);

        (await context.Forms.IgnoreQueryFilters().CountAsync()).Should().Be(formsAfterRun1);
        (await context.FormSections.IgnoreQueryFilters().CountAsync()).Should().Be(sectionsAfterRun1);
        (await context.SectionFields.CountAsync()).Should().Be(sectionFieldsAfterRun1);
        (await context.Fields.IgnoreQueryFilters().CountAsync()).Should().Be(fieldsAfterRun1);
        (await context.Services.IgnoreQueryFilters().CountAsync()).Should().Be(servicesAfterRun1);
        (await context.ServiceVariants.IgnoreQueryFilters().CountAsync()).Should().Be(variantsAfterRun1);

        // Ensure no duplicate (FormId, Key) exists across FormSections
        var allSections = await context.FormSections.IgnoreQueryFilters().ToListAsync();
        var duplicateSections = allSections
            .GroupBy(s => (s.FormId, Key: s.Key.Trim().ToLowerInvariant()))
            .Where(g => g.Count() > 1)
            .ToList();
        duplicateSections.Should().BeEmpty("Each form must have at most one section per key.");

        // Ensure every service has at most 1 active Base Form
        var activeBaseForms = await context.Forms
            .IgnoreQueryFilters()
            .Where(f => !f.IsDeleted && f.IsActive && f.ServiceVariantId == null)
            .ToListAsync();
        activeBaseForms.GroupBy(f => f.ServiceId).Where(g => g.Count() > 1).Should().BeEmpty();
    }

    [Fact]
    public async Task FastTrackFormSeeder_SelfHealsDuplicateSections_AndPreservesSectionFieldsAndReferencedForms()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);

        context.Tenants.Add(new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "NTC Central Office",
            Code = "NTC-CENTRAL"
        });
        await context.SaveChangesAsync();

        await FastTrackSeeder.SeedAsync(context);

        var ntc101Form = await context.Forms.FirstAsync(f => f.Key == "NTC_1_01");
        var existingSection = await context.FormSections.FirstAsync(s => s.FormId == ntc101Form.Id && s.Key == "educationalBackground");

        // 1. Simulate a duplicate FormSection where the original has 0 fields and the duplicate has fields
        var existingSfs = await context.SectionFields.Where(sf => sf.FormSectionId == existingSection.Id).ToListAsync();
        context.SectionFields.RemoveRange(existingSfs);

        var duplicateSection = new FormSection
        {
            Id = Guid.NewGuid(),
            FormId = ntc101Form.Id,
            Key = " educationalBackground ",
            Title = "Duplicate Educational Section",
            OrderIndex = 99
        };
        context.FormSections.Add(duplicateSection);
        foreach (var sf in existingSfs)
        {
            context.SectionFields.Add(new SectionField
            {
                FormSectionId = duplicateSection.Id,
                FieldId = sf.FieldId,
                IsRequired = sf.IsRequired,
                OrderIndex = sf.OrderIndex
            });
        }

        // 2. Simulate an obsolete unnamed deleted form that is referenced by an historical FormSubmission
        var referencedObsoleteForm = new Form
        {
            Id = Guid.NewGuid(),
            ServiceId = ntc101Form.ServiceId,
            Key = string.Empty,
            Name = string.Empty,
            IsDeleted = true,
            IsActive = false
        };
        context.Forms.Add(referencedObsoleteForm);
        context.FormSubmissions.Add(new FormSubmission
        {
            Id = Guid.NewGuid(),
            FormId = referencedObsoleteForm.Id,
            ApplicationId = Guid.NewGuid()
        });
        await context.SaveChangesAsync();

        // Act: Re-run form seeder
        await FastTrackFormSeeder.SeedFormsInternalAsync(context);

        // Assert: Duplicate section was cleaned up and fields were preserved on the kept section
        var sectionsFor101 = await context.FormSections
            .IgnoreQueryFilters()
            .Where(s => s.FormId == ntc101Form.Id && s.Key.Trim().ToLower() == "educationalbackground")
            .ToListAsync();
        sectionsFor101.Should().HaveCount(1);

        var keptSectionFields = await context.SectionFields
            .Where(sf => sf.FormSectionId == sectionsFor101[0].Id)
            .ToListAsync();
        keptSectionFields.Should().HaveCount(3);

        // Assert: Referenced obsolete form was NOT physically purged (preventing FK violation on FormSubmissions)
        var stillExists = await context.Forms
            .IgnoreQueryFilters()
            .AnyAsync(f => f.Id == referencedObsoleteForm.Id);
        stillExists.Should().BeTrue("Forms referenced by FormSubmissions must remain soft-deleted rather than physically deleted.");
    }

    [Fact]
    public async Task SeededCanonicalBaseForms_IncludeNoOfYearsOnAll8MultiYearForms_WithVariantScopedVisibility()
    {
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        var expectedFormsWithNoOfYears = new[]
        {
            "NTC_1_02", // Commercial & Specialty Radio Operator Certificates (ROC)
            "NTC_1_03", // Amateur Radio Operator Certificates & Station Licenses
            "NTC_1_04", // Maritime Ship Station & Coastal Station Licenses
            "NTC_1_09", // Permits in Amateur (Vanity / Foreign Visitor), Aero, Maritime, FLM, PTE
            "NTC_1_11", // Radio Station Licenses (Fixed & Land Mobile, Aeronautical, Other)
            "NTC_1_18", // CPE Supplier Accreditation, RCE Permits, Mobile Phone Permits
            "NTC_1_20", // VAS Provider Certificate of Registration (Renewal)
            "NTC_1_22"  // TVRO / CATV Station Licenses
        };

        var expectedFormsWithoutNoOfYears = new[]
        {
            "NTC_1_01", // Exam Admission Slip
            "NTC_1_19", // RFID / SRD / WDN Registration (per unit)
            "NTC_1_21", // Certified True Copy / Duplicate Copy (uses noOfCopies)
            "NTC_1_24", // Request for Blocking / Unblocking of IMEI & SIM
            "NTC_1_25"  // Consumer Complaints & Tape Preservation
        };

        foreach (var code in expectedFormsWithNoOfYears)
        {
            var def = formDefs.FirstOrDefault(f => f.ServiceKey.Equals(code, StringComparison.OrdinalIgnoreCase));
            def.Should().NotBeNull($"Canonical form '{code}' must exist.");
            def!.Sections.SelectMany(s => s.FieldKeys).Should().Contain(
                "noOfYears",
                because: $"Canonical base form '{code}' serves multi-year transactions whose fees depend on Number of Years (YR).");
        }

        foreach (var code in expectedFormsWithoutNoOfYears)
        {
            var def = formDefs.FirstOrDefault(f => f.ServiceKey.Equals(code, StringComparison.OrdinalIgnoreCase));
            def.Should().NotBeNull($"Canonical form '{code}' must exist.");
            def!.Sections.SelectMany(s => s.FieldKeys).Should().NotContain(
                "noOfYears",
                because: $"Canonical base form '{code}' does not use Number of Years.");
        }

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);
        context.Tenants.Add(new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "NTC Central Office",
            Code = "NTC-CENTRAL"
        });
        await context.SaveChangesAsync();

        await FastTrackSeeder.SeedAsync(context);

        var repo = new EDGE.Infrastructure.Persistence.Repositories.FormRepository(context);
        var allVariants = await context.ServiceVariants.AsNoTracking().ToListAsync();

        // 1. NTC 1-02: Commercial ROC (New) includes noOfYears, Commercial ROC (Modification) and Foreign Pilot (New) exclude it
        var rocNew = allVariants.First(v => v.Description == "Commercial Radio Operator Certificate" && v.Type == EDGE.Domain.Enums.ServiceVariantType.New);
        var rocMod = allVariants.First(v => v.Description == "Commercial Radio Operator Certificate" && v.Type == EDGE.Domain.Enums.ServiceVariantType.Modification);
        var foreignPilotNew = allVariants.First(v => v.Description.Contains("Foreign Pilot") && v.Type == EDGE.Domain.Enums.ServiceVariantType.New);

        var formRocNew = await repo.GetFormByServiceIdAsync(rocNew.ServiceId, rocNew.Id);
        var formRocMod = await repo.GetFormByServiceIdAsync(rocMod.ServiceId, rocMod.Id);
        var formForeignPilot = await repo.GetFormByServiceIdAsync(foreignPilotNew.ServiceId, foreignPilotNew.Id);

        formRocNew!.Sections.SelectMany(s => s.SectionFields).Select(sf => sf.FieldId)
            .Should().Contain(FastTrackFormSeeder.CanonicalNoOfYearsFieldId);
        formRocMod!.Sections.SelectMany(s => s.SectionFields).Select(sf => sf.FieldId)
            .Should().NotContain(FastTrackFormSeeder.CanonicalNoOfYearsFieldId);
        formForeignPilot!.Sections.SelectMany(s => s.SectionFields).Select(sf => sf.FieldId)
            .Should().NotContain(FastTrackFormSeeder.CanonicalNoOfYearsFieldId);

        // 2. NTC 1-18: CPE Supplier Accreditation (New) and RCE Dealer Permit (New) include noOfYears, Modification excludes it
        var rceDealerNew = allVariants.First(v => v.Id == EDGE.Infrastructure.Persistence.SeederData.PermitsCategorySeederData.VarEquipDealerNew);
        var rceDealerMod = allVariants.First(v => v.Id == EDGE.Infrastructure.Persistence.SeederData.PermitsCategorySeederData.VarEquipDealerMod);

        var formRceNew = await repo.GetFormByServiceIdAsync(rceDealerNew.ServiceId, rceDealerNew.Id);
        var formRceMod = await repo.GetFormByServiceIdAsync(rceDealerMod.ServiceId, rceDealerMod.Id);

        formRceNew!.Sections.SelectMany(s => s.SectionFields).Select(sf => sf.FieldId)
            .Should().Contain(FastTrackFormSeeder.CanonicalNoOfYearsFieldId);
        formRceMod!.Sections.SelectMany(s => s.SectionFields).Select(sf => sf.FieldId)
            .Should().NotContain(FastTrackFormSeeder.CanonicalNoOfYearsFieldId);

        // 3. NTC 1-09: Vanity Call Sign (New) includes noOfYears, Permit to Purchase excludes it
        var vanityNew = allVariants.First(v => (v.Description ?? string.Empty).Contains("Vanity Call Sign", StringComparison.OrdinalIgnoreCase) && v.Type == EDGE.Domain.Enums.ServiceVariantType.New);
        var amaPurchase = allVariants.First(v => string.Equals(v.Description, "Amateur Radio Station Permit to Purchase", StringComparison.OrdinalIgnoreCase));

        var formVanity = await repo.GetFormByServiceIdAsync(vanityNew.ServiceId, vanityNew.Id);
        var formPurchase = await repo.GetFormByServiceIdAsync(amaPurchase.ServiceId, amaPurchase.Id);

        formVanity!.Sections.SelectMany(s => s.SectionFields).Select(sf => sf.FieldId)
            .Should().Contain(FastTrackFormSeeder.CanonicalNoOfYearsFieldId);
        formPurchase!.Sections.SelectMany(s => s.SectionFields).Select(sf => sf.FieldId)
            .Should().NotContain(FastTrackFormSeeder.CanonicalNoOfYearsFieldId);
    }
}
