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
}
