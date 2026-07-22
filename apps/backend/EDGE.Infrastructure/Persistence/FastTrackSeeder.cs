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

        // 1. Seed Service Categories (exactly matching 2.1 in spec)
        var categories = new Dictionary<string, ServiceCategory>
        {
            ["Exams"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000001"), Name = "Exams", Code = "EXAM", Type = ServiceCategoryType.Exam },
            ["Certificates"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000002"), Name = "Certificates", Code = "CERT", Type = ServiceCategoryType.Certificate },
            ["Licenses"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000003"), Name = "Licenses", Code = "LIC", Type = ServiceCategoryType.License },
            ["Permits"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000004"), Name = "Permits", Code = "PRM", Type = ServiceCategoryType.Permit },
            ["Accreditations"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000005"), Name = "Accreditations", Code = "ACCR", Type = ServiceCategoryType.Accreditation },
            ["RequestsAndComplaints"] = new() { Id = Guid.Parse("c0000000-0000-0000-0000-000000000006"), Name = "Requests and Complaints", Code = "REQ", Type = ServiceCategoryType.RequestsAndComplaints }
        };

        await context.ServiceCategories.AddRangeAsync(categories.Values);
        await context.SaveChangesAsync();

        // 2. Seed Services (NTC 1-01 and NTC 1-02 matching contract spec)
        var ntc101Contract = @"
        {
            ""allowsBulkSubmission"": true,
            ""serviceCategory"": ""Exams"",
            ""applicationTypes"": [""New""],
            ""requiredSections"": [
                { ""key"": ""applicantPerson"", ""title"": ""Personal Information"", ""required"": true },
                { ""key"": ""examSelection"", ""title"": ""Exam Selection"", ""required"": true },
                { ""key"": ""assistanceRequest"", ""title"": ""Special Needs Assistance"", ""required"": false },
                { ""key"": ""admissionSlip"", ""title"": ""Admission Slip"", ""required"": true },
                { ""key"": ""declaration"", ""title"": ""Declaration"", ""required"": true }
            ],
            ""elements"": []
        }";

        var ntc102Contract = @"
        {
            ""allowsBulkSubmission"": true,
            ""serviceCategory"": ""Certificates"",
            ""applicationTypes"": [""New"", ""Renewal""],
            ""requiredSections"": [
                { ""key"": ""companyInfo"", ""title"": ""Company Information"", ""required"": true },
                { ""key"": ""stationDetails"", ""title"": ""Station Technical Details"", ""required"": true }
            ],
            ""elements"": []
        }";

        var services = new Dictionary<string, Service>
        {
            ["NTC_1_01"] = new()
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000001"),
                ServiceCategoryId = categories["Exams"].Id,
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
                ServiceCategoryId = categories["Certificates"].Id,
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
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000002"), ServiceId = services["NTC_1_02"].Id, Type = ServiceVariantType.New, Description = "New Radio Station License Application" },
            new() { Id = Guid.Parse("60000000-0000-0000-0000-000000000003"), ServiceId = services["NTC_1_02"].Id, Type = ServiceVariantType.Renewal, Description = "Renew Radio Station License" }
        };

        await context.ServiceVariants.AddRangeAsync(variants);

        // 3.5. Seed Examination Schedules and Schedules
        var examSchedule = new ExaminationSchedule
        {
            Id = Guid.Parse("e0000000-0000-0000-0000-000000000001"),
            ServiceId = services["NTC_1_01"].Id,
            ExamDate = DateTime.UtcNow.AddDays(30),
            Venue = "NTC Central Office Examination Room",
            MaxSlots = 50,
            AvailableSlots = 50
        };
        await context.ExaminationSchedules.AddAsync(examSchedule);

        var generalSchedule = new Schedule
        {
            Id = Guid.Parse("e0000000-0000-0000-0000-000000000001"),
            ServiceId = services["NTC_1_01"].Id,
            TenantId = tenant.Id,
            Venue = "NTC Central Office Examination Room",
            StartDate = DateTime.UtcNow.AddDays(30),
            EndDate = DateTime.UtcNow.AddDays(30).AddHours(2),
            IsPublished = true,
            MaximumSlots = 50
        };
        await context.Schedules.AddAsync(generalSchedule);

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

        var section101ApplicantPerson = new FormSection
        {
            Id = Guid.Parse("f01a0000-0000-0000-0000-000000000001"),
            FormId = form101.Id,
            Key = "applicantPerson",
            Title = "Personal Information",
            OrderIndex = 1
        };
        var section101ExamSelection = new FormSection
        {
            Id = Guid.Parse("f01a0000-0000-0000-0000-000000000002"),
            FormId = form101.Id,
            Key = "examSelection",
            Title = "Exam Selection",
            OrderIndex = 2
        };
        var section101Assistance = new FormSection
        {
            Id = Guid.Parse("f01a0000-0000-0000-0000-000000000003"),
            FormId = form101.Id,
            Key = "assistanceRequest",
            Title = "Special Needs Assistance",
            OrderIndex = 3
        };
        var section101Admission = new FormSection
        {
            Id = Guid.Parse("f01a0000-0000-0000-0000-000000000004"),
            FormId = form101.Id,
            Key = "admissionSlip",
            Title = "Admission Slip",
            OrderIndex = 4
        };
        var section101Declaration = new FormSection
        {
            Id = Guid.Parse("f01a0000-0000-0000-0000-000000000005"),
            FormId = form101.Id,
            Key = "declaration",
            Title = "Declaration",
            OrderIndex = 5
        };
        await context.FormSections.AddRangeAsync(
            section101ApplicantPerson, 
            section101ExamSelection, 
            section101Assistance, 
            section101Admission, 
            section101Declaration
        );

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

        // 6. Seed Fields (matching pages 5 & 6 spec)
        var fields = new Dictionary<string, Field>
        {
            // NTC 1-01 fields
            ["fullName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000001"), FieldType = "text", Label = "Full Name", SyncBackOnSubmit = true },
            ["birthDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000002"), FieldType = "date", Label = "Birth Date", SyncBackOnSubmit = true },
            ["address"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000003"), FieldType = "text", Label = "Address", SyncBackOnSubmit = true },
            ["contactNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000004"), FieldType = "text", Label = "Contact No", SyncBackOnSubmit = true },
            ["email"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000005"), FieldType = "text", Label = "Email Address", SyncBackOnSubmit = true },
            ["education"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000006"), FieldType = "text", Label = "Education", SyncBackOnSubmit = false },
            
            ["examCategory"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000007"), FieldType = "dropdown", Label = "Exam Category", SyncBackOnSubmit = false, ValidationRules = @"[""Amateur"",""Commercial"",""GMDSS""]" },
            ["examineeType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000008"), FieldType = "text", Label = "Examinee Type", SyncBackOnSubmit = false },
            ["elements"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000009"), FieldType = "text", Label = "Elements", SyncBackOnSubmit = false },
            
            ["specialNeeds"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000010"), FieldType = "text", Label = "Special Needs", SyncBackOnSubmit = false },
            ["admissionNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000011"), FieldType = "text", Label = "Admission Number", SyncBackOnSubmit = false },
            
            ["signatureField"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000012"), FieldType = "signature", Label = "Signature", SyncBackOnSubmit = false },
            ["declarationCheckbox"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000013"), FieldType = "checkbox", Label = "I declare the info is true", SyncBackOnSubmit = false },

            // NTC 1-02 fields
            ["companyName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000014"), FieldType = "text", Label = "Company Name", SyncBackOnSubmit = true },
            ["registrationNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000015"), FieldType = "text", Label = "SEC/DTI Registration Number", SyncBackOnSubmit = true },
            ["tin"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000016"), FieldType = "text", Label = "TIN", SyncBackOnSubmit = false },
            
            ["stationType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000017"), FieldType = "dropdown", Label = "Station Type", SyncBackOnSubmit = false, ValidationRules = @"[""Fixed"",""Mobile"",""Base""]" },
            ["frequency"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000018"), FieldType = "text", Label = "Assigned Frequency (MHz)", SyncBackOnSubmit = false },
            ["powerOutput"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000019"), FieldType = "text", Label = "Transmitter Power Output (W)", SyncBackOnSubmit = false },
            ["location"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000020"), FieldType = "text", Label = "Station Location", SyncBackOnSubmit = false }
        };

        await context.Fields.AddRangeAsync(fields.Values);
        await context.SaveChangesAsync();

        // 7. Seed Section Field mapping joints
        var sectionFields = new List<SectionField>
        {
            // Form 101 - applicantPerson Section
            new() { FormSectionId = section101ApplicantPerson.Id, FieldId = fields["fullName"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section101ApplicantPerson.Id, FieldId = fields["birthDate"].Id, IsRequired = true, OrderIndex = 2 },
            new() { FormSectionId = section101ApplicantPerson.Id, FieldId = fields["address"].Id, IsRequired = true, OrderIndex = 3 },
            new() { FormSectionId = section101ApplicantPerson.Id, FieldId = fields["contactNo"].Id, IsRequired = true, OrderIndex = 4 },
            new() { FormSectionId = section101ApplicantPerson.Id, FieldId = fields["email"].Id, IsRequired = true, OrderIndex = 5 },
            new() { FormSectionId = section101ApplicantPerson.Id, FieldId = fields["education"].Id, IsRequired = true, OrderIndex = 6 },

            // Form 101 - examSelection Section
            new() { FormSectionId = section101ExamSelection.Id, FieldId = fields["examCategory"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section101ExamSelection.Id, FieldId = fields["examineeType"].Id, IsRequired = true, OrderIndex = 2 },
            new() { FormSectionId = section101ExamSelection.Id, FieldId = fields["elements"].Id, IsRequired = true, OrderIndex = 3 },

            // Form 101 - assistanceRequest Section
            new() { FormSectionId = section101Assistance.Id, FieldId = fields["specialNeeds"].Id, IsRequired = false, OrderIndex = 1 },

            // Form 101 - admissionSlip Section (read-only/output)
            new() { FormSectionId = section101Admission.Id, FieldId = fields["admissionNumber"].Id, IsRequired = true, OrderIndex = 1 },

            // Form 101 - declaration Section
            new() { FormSectionId = section101Declaration.Id, FieldId = fields["signatureField"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section101Declaration.Id, FieldId = fields["declarationCheckbox"].Id, IsRequired = true, OrderIndex = 2 },

            // Form 102 - companyInfo Section
            new() { FormSectionId = section102Company.Id, FieldId = fields["companyName"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section102Company.Id, FieldId = fields["registrationNumber"].Id, IsRequired = true, OrderIndex = 2 },
            new() { FormSectionId = section102Company.Id, FieldId = fields["tin"].Id, IsRequired = true, OrderIndex = 3 },

            // Form 102 - stationDetails Section
            new() { FormSectionId = section102Station.Id, FieldId = fields["stationType"].Id, IsRequired = true, OrderIndex = 1 },
            new() { FormSectionId = section102Station.Id, FieldId = fields["frequency"].Id, IsRequired = true, OrderIndex = 2 },
            new() { FormSectionId = section102Station.Id, FieldId = fields["powerOutput"].Id, IsRequired = true, OrderIndex = 3 },
            new() { FormSectionId = section102Station.Id, FieldId = fields["location"].Id, IsRequired = true, OrderIndex = 4 }
        };

        await context.SectionFields.AddRangeAsync(sectionFields);
        await context.SaveChangesAsync();
    }
}
