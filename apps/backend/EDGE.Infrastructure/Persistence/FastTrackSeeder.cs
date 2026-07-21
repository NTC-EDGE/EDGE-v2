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
        if (await context.ServiceCategories.AnyAsync())
        {
            return;
        }

        var tenant = await context.Tenants.FirstOrDefaultAsync() 
            ?? throw new InvalidOperationException("Tenant not seeded. Run RolePermissionDataSeeder first.");

        // 1. Seed Service Categories
        var categories = new Dictionary<string, ServiceCategory>
        {
            ["Certificate"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000001"), Name = "Certificate", Code = "CERT", Type = ServiceCategoryType.Certificate },
            ["Accreditation"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000002"), Name = "Accreditation", Code = "ACCR", Type = ServiceCategoryType.Accreditation },
            ["Exam"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000003"), Name = "Exam", Code = "EXAM", Type = ServiceCategoryType.Exam },
            ["License"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000004"), Name = "License", Code = "LIC", Type = ServiceCategoryType.License },
            ["Permit"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000005"), Name = "Permit", Code = "PERM", Type = ServiceCategoryType.Permit },
            ["RequestsAndComplaints"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000006"), Name = "Requests & Complaints", Code = "REQ", Type = ServiceCategoryType.RequestsAndComplaints }
        };

        await context.ServiceCategories.AddRangeAsync(categories.Values);
        await context.SaveChangesAsync();

        // 2. Seed Services (NTC 1-01, NTC 1-02)
        var ntc101Contract = @"
        {
            ""serviceCategory"": ""Certificate"",
            ""requiredSections"": [
                { ""key"": ""personalInfo"", ""title"": ""Personal Information"" },
                { ""key"": ""eligibility"", ""title"": ""Eligibility & Operator Details"" }
            ],
            ""elements"": []
        }";

        var ntc102Contract = @"
        {
            ""serviceCategory"": ""License"",
            ""requiredSections"": [
                { ""key"": ""companyInfo"", ""title"": ""Company Information"" },
                { ""key"": ""stationDetails"", ""title"": ""Station Technical Details"" }
            ],
            ""elements"": []
        }";

        var services = new Dictionary<string, Service>
        {
            ["NTC_1_01"] = new()
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000001"),
                ServiceCategoryId = categories["Certificate"].Id,
                TenantId = tenant.Id,
                Name = "Radio Operator Certificate",
                Group = "Safety Certificates",
                Code = "NTC_1_01",
                Description = "Application for Radio Operator Certificate (NTC 1-01)",
                Contract = ntc101Contract
            },
            ["NTC_1_02"] = new()
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000002"),
                ServiceCategoryId = categories["License"].Id,
                TenantId = tenant.Id,
                Name = "Radio Station License",
                Group = "Commercial Licensing",
                Code = "NTC_1_02",
                Description = "Application for New/Renewal Radio Station License (NTC 1-02)",
                Contract = ntc102Contract
            }
        };

        await context.Services.AddRangeAsync(services.Values);
        await context.SaveChangesAsync();

        // 3. Seed Service Variants
        var variants = new List<ServiceVariant>
        {
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000001"), ServiceId = services["NTC_1_01"].Id, Type = ServiceVariantType.New, Description = "New Radio Operator Certificate Application" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000002"), ServiceId = services["NTC_1_01"].Id, Type = ServiceVariantType.Renewal, Description = "Renew Radio Operator Certificate" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000003"), ServiceId = services["NTC_1_02"].Id, Type = ServiceVariantType.New, Description = "New Radio Station License Application" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000004"), ServiceId = services["NTC_1_02"].Id, Type = ServiceVariantType.Renewal, Description = "Renew Radio Station License" }
        };

        await context.ServiceVariants.AddRangeAsync(variants);

        // 4. Seed Field Offices
        var ncrRegion = await context.Regions.FirstOrDefaultAsync(r => r.Code == "13" || r.Name.Contains("NCR") || r.Name.Contains("National Capital Region"));
        var region1 = await context.Regions.FirstOrDefaultAsync(r => r.Code == "01" || r.Name.Contains("Region I"));

        if (ncrRegion != null)
        {
            await context.FieldOffices.AddAsync(new FieldOffice
            {
                Id = Guid.Parse("f0000000-0000-0000-0000-000000000001"),
                Name = "NTC NCR Field Office",
                RegionId = ncrRegion.Id,
                Code = "NTC-NCR"
            });
        }

        if (region1 != null)
        {
            await context.FieldOffices.AddAsync(new FieldOffice
            {
                Id = Guid.Parse("f0000000-0000-0000-0000-000000000002"),
                Name = "NTC Regional Office I",
                RegionId = region1.Id,
                Code = "NTC-R1"
            });
        }

        // 5. Seed Form Builders for NTC 1-01 and NTC 1-02
        // NTC 1-01 Form
        var form101 = new Form
        {
            Id = Guid.Parse("f0100000-0000-0000-0000-000000000001"),
            ServiceId = services["NTC_1_01"].Id,
            Version = "1.0",
            CategorySelectionRequired = false
        };
        await context.Forms.AddAsync(form101);

        var section101Personal = new FormSection
        {
            Id = Guid.Parse("f01a0000-0000-0000-0000-000000000001"),
            FormId = form101.Id,
            Key = "personalInfo",
            Title = "Personal Information",
            OrderIndex = 1
        };
        var section101Elig = new FormSection
        {
            Id = Guid.Parse("f01a0000-0000-0000-0000-000000000002"),
            FormId = form101.Id,
            Key = "eligibility",
            Title = "Eligibility & Operator Details",
            OrderIndex = 2
        };
        await context.FormSections.AddRangeAsync(section101Personal, section101Elig);

        // NTC 1-02 Form
        var form102 = new Form
        {
            Id = Guid.Parse("f0200000-0000-0000-0000-000000000001"),
            ServiceId = services["NTC_1_02"].Id,
            Version = "1.0",
            CategorySelectionRequired = false
        };
        await context.Forms.AddAsync(form102);

        var section102Company = new FormSection
        {
            Id = Guid.Parse("f02a0000-0000-0000-0000-000000000001"),
            FormId = form102.Id,
            Key = "companyInfo",
            Title = "Company Information",
            OrderIndex = 1
        };
        var section102Station = new FormSection
        {
            Id = Guid.Parse("f02a0000-0000-0000-0000-000000000002"),
            FormId = form102.Id,
            Key = "stationDetails",
            Title = "Station Technical Details",
            OrderIndex = 2
        };
        await context.FormSections.AddRangeAsync(section102Company, section102Station);
        await context.SaveChangesAsync();

        // 6. Seed Fields
        var fields = new Dictionary<string, Field>
        {
            ["firstName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000001"), FieldType = "text", Label = "First Name", SyncBackOnSubmit = true },
            ["lastName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000002"), FieldType = "text", Label = "Last Name", SyncBackOnSubmit = true },
            ["email"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000003"), FieldType = "text", Label = "Email Address", SyncBackOnSubmit = false },
            ["contactNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000004"), FieldType = "text", Label = "Contact Number", SyncBackOnSubmit = false },
            ["operatorClass"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000005"), FieldType = "dropdown", Label = "Operator Class", SyncBackOnSubmit = false, ValidationRules = @"[""First Class"",""Second Class"",""Third Class""]" },
            ["licenseNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000006"), FieldType = "text", Label = "License Number", SyncBackOnSubmit = false },
            ["expiryDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000007"), FieldType = "date", Label = "Expiry Date", SyncBackOnSubmit = false },
            
            ["companyName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000008"), FieldType = "text", Label = "Company Name", SyncBackOnSubmit = true },
            ["registrationNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000009"), FieldType = "text", Label = "SEC/DTI Registration Number", SyncBackOnSubmit = true },
            ["tin"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000010"), FieldType = "text", Label = "TIN", SyncBackOnSubmit = false },
            ["stationType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000011"), FieldType = "dropdown", Label = "Station Type", SyncBackOnSubmit = false, ValidationRules = @"[""Fixed"",""Mobile"",""Base""]" },
            ["frequency"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000012"), FieldType = "text", Label = "Assigned Frequency (MHz)", SyncBackOnSubmit = false },
            ["powerOutput"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000013"), FieldType = "text", Label = "Transmitter Power Output (W)", SyncBackOnSubmit = false },
            ["location"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000014"), FieldType = "text", Label = "Station Location", SyncBackOnSubmit = false }
        };

        await context.Fields.AddRangeAsync(fields.Values);
        await context.SaveChangesAsync();

        // 7. Seed Section Field mapping joints
        var sectionFields = new List<SectionField>
        {
            // Form 101 - Personal Info Section
            new() { FormSectionId = section101Personal.Id, FieldId = fields["firstName"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section101Personal.Id, FieldId = fields["lastName"].Id, IsRequired = true, OrderIndex = 2 },
            new() { FormSectionId = section101Personal.Id, FieldId = fields["email"].Id, IsRequired = true, OrderIndex = 3 },
            new() { FormSectionId = section101Personal.Id, FieldId = fields["contactNumber"].Id, IsRequired = true, OrderIndex = 4 },

            // Form 101 - Eligibility Section
            new() { FormSectionId = section101Elig.Id, FieldId = fields["operatorClass"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section101Elig.Id, FieldId = fields["licenseNumber"].Id, IsRequired = true, OrderIndex = 2 },
            new() { FormSectionId = section101Elig.Id, FieldId = fields["expiryDate"].Id, IsRequired = true, OrderIndex = 3 },

            // Form 102 - Company Info Section
            new() { FormSectionId = section102Company.Id, FieldId = fields["companyName"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section102Company.Id, FieldId = fields["registrationNumber"].Id, IsRequired = true, OrderIndex = 2 },
            new() { FormSectionId = section102Company.Id, FieldId = fields["tin"].Id, IsRequired = true, OrderIndex = 3 },

            // Form 102 - Station Details Section
            new() { FormSectionId = section102Station.Id, FieldId = fields["stationType"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section102Station.Id, FieldId = fields["frequency"].Id, IsRequired = true, OrderIndex = 2 },
            new() { FormSectionId = section102Station.Id, FieldId = fields["powerOutput"].Id, IsRequired = true, OrderIndex = 3 },
            new() { FormSectionId = section102Station.Id, FieldId = fields["location"].Id, IsRequired = true, OrderIndex = 4 }
        };

        await context.SectionFields.AddRangeAsync(sectionFields);
        await context.SaveChangesAsync();
    }
}
