using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using static EDGE.Infrastructure.Persistence.ServiceInformationDataSeeder;

namespace EDGE.Infrastructure.Persistence;

public static class FastTrackSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Skip the full initial seed if services are already present.
        // However, always run the contract-update pass below so that changes to
        // requirementDiscriminatorFields / requirementContextGroups in the contract
        // JSON strings are applied to existing rows without needing a full re-seed.
        bool skipInitialSeed = await context.Services.CountAsync() >= 12;
        if (skipInitialSeed)
        {
            await UpdateContractsAsync(context);
            await BackfillNewServicesAsync(context);      // 1. Seed new Services first (so variants FK matches)
            await UpdateVariantsAsync(context);          // 2. Update/upsert all variants
            await BackfillNewCatalogDetailsAsync(context); // 3. Backfill elements, notes, requirements, and fees
            await ServiceInformationDataSeeder.SeedAsync(context);  // 4. Seed ServiceInformations entity records
            await SeedFormsInternalAsync(context);       // 5. Seed Form layouts
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

        // Seed Master Fee Entities
        if (!await context.Fees.AnyAsync())
        {
            context.Fees.AddRange(new[]
            {
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000001"), Code = "FILING_FEE", Name = "Filing & Application Processing Fee", Description = "Standard mandatory filing fee charged upon submission of application documents.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000002"), Code = "INSP_FEE", Name = "Technical Site Inspection Fee", Description = "On-site technical evaluation and radio station inspection fee.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000003"), Code = "LIC_RIGHTS_FEE", Name = "Spectrum & License Rights Fee", Description = "Radio frequency spectrum rights and operational permit fee.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000004"), Code = "PERMIT_ISSUE_FEE", Name = "Permit & Certificate Issuance Fee", Description = "Official document printing and certificate issuance charge.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000005"), Code = "EXAM_REG_FEE", Name = "Operator Competency Exam Fee", Description = "Registration fee for commercial and amateur radio operator examinations.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000006"), Code = "SURCHARGE_LATE_FEE", Name = "Late Filing Surcharge & Penalty", Description = "Administrative surcharge penalty for late permit renewal applications.", IsActive = true }
            });
            await context.SaveChangesAsync();
        }

        // 3. Seed Services dictionary with correct names & categories
        var categoryIds = categories.ToDictionary(kv => kv.Key, kv => kv.Value.Id);
        var serviceDefs = FastTrackSeederData.GetServiceDefs(categoryIds);

        var services = new Dictionary<string, Service>();
        var existingServices = await context.Services.ToListAsync();

        foreach (var def in serviceDefs)
        {
            var s = existingServices.FirstOrDefault(x => x.Code == def.Code);
            if (s != null && s.Id != def.Id)
            {
                context.Services.Remove(s);
                await context.SaveChangesAsync();
                s = null;
            }

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

        // Seed new services (so variants FK matches)
        await BackfillNewServicesAsync(context);

        // 4. Seed Service Variants
        await UpdateVariantsAsync(context);

        // 5. Backfill elements, notes, requirements, and fees
        await BackfillNewCatalogDetailsAsync(context);

        await context.SaveChangesAsync();

        await SeedFormsInternalAsync(context);
    }

    private static async Task SeedFormsInternalAsync(ApplicationDbContext context)
    {
        // 7. Seed Central Reusable Fields Pool (Deterministic GUIDs)
        var fieldsPool = FastTrackSeederData.GetFieldsPool();

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
        var existingForms = await context.Forms.AsNoTracking().Select(f => f.ServiceId).ToListAsync();
        var services = new Dictionary<string, Service>();

        async Task SeedFormForService(string serviceKey, Guid formId, Guid sectionGuidPrefix, List<(string Key, string Title, List<string> FieldKeys)> sectionDefs)
        {
            if (!services.TryGetValue(serviceKey, out var service))
            {
                service = await context.Services.FirstOrDefaultAsync(s => s.Code == serviceKey);
                if (service == null) return;
                services[serviceKey] = service;
            }

            // Check if the form already exists in the DB (no-tracking)
            var formExists = existingForms.Contains(service.Id);
            if (!formExists)
            {
                var newForm = new Form
                {
                    Id = formId,
                    ServiceId = service.Id,
                    Version = "1.0",
                    CategorySelectionRequired = false
                };
                context.Forms.Add(newForm);
                await context.SaveChangesAsync();
                existingForms.Add(service.Id);
            }
            else
            {
                // Resolve the actual formId from the DB in case it differs
                formId = await context.Forms
                    .AsNoTracking()
                    .Where(f => f.ServiceId == service.Id)
                    .Select(f => f.Id)
                    .FirstAsync();
            }

            // 1. Fetch existing sections for this form (no-tracking to avoid stale state)
            var existingSections = await context.FormSections
                .AsNoTracking()
                .Where(s => s.FormId == formId)
                .ToListAsync();

            var existingSectionIds = existingSections.Select(s => s.Id).ToList();

            // 2. Remove all existing SectionFields for this form's sections to prevent field mixing/orphans
            if (existingSectionIds.Count > 0)
            {
                var existingSectionFields = await context.SectionFields
                    .Where(sf => existingSectionIds.Contains(sf.FormSectionId))
                    .ToListAsync();
                if (existingSectionFields.Count > 0)
                {
                    context.SectionFields.RemoveRange(existingSectionFields);
                    await context.SaveChangesAsync();
                }
            }

            // 3. Update existing sections or insert new sections matching sectionDefs
            var processedSectionIds = new HashSet<Guid>();
            int sectionOrder = 1;
            int sectionIndex = 1;

            foreach (var (key, title, fieldKeys) in sectionDefs)
            {
                var bytes = sectionGuidPrefix.ToByteArray();
                bytes[15] = (byte)sectionIndex;
                Guid sectionId = new Guid(bytes);
                processedSectionIds.Add(sectionId);

                // Re-check DB directly to avoid EF change tracker stale state
                var sectionExistsInDb = await context.FormSections
                    .AsNoTracking()
                    .AnyAsync(s => s.Id == sectionId);

                if (!sectionExistsInDb)
                {
                    try
                    {
                        context.FormSections.Add(new FormSection
                        {
                            Id = sectionId,
                            FormId = formId,
                            Key = key,
                            Title = title,
                            OrderIndex = sectionOrder
                        });
                        await context.SaveChangesAsync();
                    }
                    catch (Microsoft.EntityFrameworkCore.DbUpdateException)
                    {
                        // Section was inserted by a concurrent call or prior iteration — detach and continue
                        context.ChangeTracker.Clear();
                        var tracked = await context.FormSections.FindAsync(sectionId);
                        if (tracked != null)
                        {
                            tracked.FormId = formId;
                            tracked.Key = key;
                            tracked.Title = title;
                            tracked.OrderIndex = sectionOrder;
                            await context.SaveChangesAsync();
                        }
                    }
                }
                else
                {
                    var existingSection = await context.FormSections.FindAsync(sectionId);
                    if (existingSection != null)
                    {
                        existingSection.FormId = formId;
                        existingSection.Key = key;
                        existingSection.Title = title;
                        existingSection.OrderIndex = sectionOrder;
                        await context.SaveChangesAsync();
                    }
                }

                sectionOrder++;
                sectionIndex++;

                int fieldOrder = 1;
                foreach (var fk in fieldKeys)
                {
                    if (fieldsPool.TryGetValue(fk, out var f))
                    {
                        context.SectionFields.Add(new SectionField
                        {
                            FormSectionId = sectionId,
                            FieldId = f.Id,
                            IsRequired = key != "assistanceRequest" && key != "knownByAnotherName" && key != "club" && key != "examination" && key != "radioOfficers" && key != "payment",
                            OrderIndex = fieldOrder++
                        });
                    }
                }
                await context.SaveChangesAsync();
            }

            // 4. Clean up any obsolete sections for this form that are no longer present in sectionDefs
            var obsoleteSections = existingSections.Where(s => !processedSectionIds.Contains(s.Id)).ToList();
            if (obsoleteSections.Count > 0)
            {
                context.FormSections.RemoveRange(obsoleteSections);
                await context.SaveChangesAsync();
            }
        }

        // Seed Forms per NTC Service
        await SeedFormForService("NTC_1_01", Guid.Parse("f0100000-0000-0000-0000-000000000001"), Guid.Parse("f01a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "sex", "civilStatus", "nationality" }),
            ("applicantAddress", "Address Information", new() { "region", "province", "city", "barangay", "street", "zipCode" }),
            ("applicantContact", "Contact Information", new() { "contactNo", "email", "emergencyContactPerson", "emergencyContactNo" }),
            ("applicantEducation", "Educational Background", new() { "schoolName", "courseDegree", "yearGraduated" }),
            ("examSelection", "Exam Selection", new() { "examCategory", "examineeType", "elements" }),
            ("assistanceRequest", "Special Needs Assistance", new() { "specialNeeds" }),
            ("admissionSlip", "Admission Slip", new() { "admissionNumber" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" })
        });

        await SeedFormForService("NTC_1_02", Guid.Parse("f0200000-0000-0000-0000-000000000001"), Guid.Parse("f02a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "sex", "nationality", "weight_kg", "height_cm" }),
            ("applicantAddress", "Address Information", new() { "region", "province", "city", "barangay", "street", "zipCode" }),
            ("employmentStatus", "Employment Status", new() { "employmentStatus", "employmentType" }),
            ("applicantContact", "Contact Information", new() { "contactNo", "email" }),
            ("typeOfCertificate", "Type of Certificate", new() { "typeOfCertificate" }),
            ("examSeminarDetails", "Exam / Seminar Details", new() { "examSeminarAddress", "examSeminarDate", "examSeminarRating" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_03", Guid.Parse("f0300000-0000-0000-0000-000000000001"), Guid.Parse("f03a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "sex", "nationality" }),
            ("applicantAddress", "Address Information", new() { "region", "province", "city", "barangay", "street", "zipCode" }),
            ("employmentStatus", "Employment Status", new() { "employmentStatus", "employmentType" }),
            ("applicantContact", "Contact Information", new() { "contactNo", "email" }),
            ("permitType", "Permit / License Type", new() { "permitType" }),
            ("classOfStation", "Class of Station", new() { "classOfStation" }),
            ("club", "Club Details", new() { "clubDetails" }),
            ("examSeminarDetails", "Exam / Seminar Details", new() { "examSeminarAddress", "examSeminarDate", "examSeminarRating" }),
            ("equipment", "Equipment Details", new() { "equipmentDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_04", Guid.Parse("f0400000-0000-0000-0000-000000000001"), Guid.Parse("f04a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "birthDate", "sex", "nationality" }),
            ("applicantAddress", "Address Information", new() { "region", "province", "city", "barangay", "street", "zipCode" }),
            ("applicantContact", "Contact Information", new() { "contactNo", "email" }),
            ("vessel", "Vessel Details", new() { "vesselName", "callSign", "imoNumber" }),
            ("equipment", "Equipment List", new() { "equipmentDetails" }),
            ("radioOfficers", "Radio Officers", new() { "radioOfficers" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_1_09", Guid.Parse("f0900000-0000-0000-0000-000000000001"), Guid.Parse("f09a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            ("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            ("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            ("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            ("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_AERO_PERMITS", Guid.Parse("fae00000-0000-0000-0000-000000000001"), Guid.Parse("faea0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            ("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            ("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            ("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            ("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_MAR_PERMITS", Guid.Parse("fb000000-0000-0000-0000-000000000001"), Guid.Parse("fb0a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            ("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            ("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            ("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            ("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_FLM_PERMITS", Guid.Parse("fb100000-0000-0000-0000-000000000001"), Guid.Parse("fb1a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            ("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            ("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            ("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            ("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_PTE_PERMITS", Guid.Parse("fb200000-0000-0000-0000-000000000001"), Guid.Parse("fb2a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            ("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            ("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            ("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            ("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_EQUIP_PERMITS", Guid.Parse("fb300000-0000-0000-0000-000000000001"), Guid.Parse("fb3a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            ("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            ("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            ("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            ("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_MP_PERMITS", Guid.Parse("fb400000-0000-0000-0000-000000000001"), Guid.Parse("fb4a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            ("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            ("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            ("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            ("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_COPY_PERMITS", Guid.Parse("fb500000-0000-0000-0000-000000000001"), Guid.Parse("fb5a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email", "callSign" }),
            ("proposedStation", "Proposed Station & Operating Specs", new() { "stationLocation", "stationClass", "serviceArea", "frequency", "bandwidth", "emission", "powerOutput", "hoursOfOperation", "configuration", "dataRate", "remarks" }),
            ("equipment", "Particulars of Equipment", new() { "equipmentDetails", "classOfStation", "serialNumber", "frequencyRange" }),
            ("antennas", "Particulars of Antenna", new() { "antennaType", "height", "gain", "directivity", "diameter", "polarization", "beamwidth", "remarks" }),
            ("sourceOfEquipment", "Source of Equipment", new() { "dealerName", "authorizedSellerBuyer", "orInvoiceNo", "permitRslNo", "sellerAddress", "amateurLicenseNo" }),
            ("intendedUse", "Intended Use of Equipment", new() { "intendedUseType", "specifyDetails" }),
            ("circumstances", "Circumstances of Loss/Damage", new() { "circumstances" }),
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

        await SeedFormForService("NTC_AMA_LICENSES", Guid.Parse("f7000000-0000-0000-0000-000000000001"), Guid.Parse("f70a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicantPerson", "Basic Applicant Information", new() { "fullName", "middleName", "suffix", "birthDate", "contactNo", "email", "address", "location", "callSign" }),
            ("permitType", "Transaction & License Options", new() { "appType", "classOfStation", "noOfYears" }),
            ("classOfStation", "Class of Station", new() { "classOfStation" }),
            ("existingLicense", "Existing License Details", new() { "licenseNo", "dateOfExpiry", "modificationDueTo" }),
            ("examBackground", "Examination / Seminar Background", new() { "placeOfExamSeminar", "dateOfExamSeminar", "ratings" }),
            ("equipment", "Particulars of Radio Equipment", new() { "particularsEquipment" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_AERO_LICENSES", Guid.Parse("f7100000-0000-0000-0000-000000000001"), Guid.Parse("f71a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant/Station Owner Details", new() { "fullName", "address", "contactNo", "email" }),
            ("stations", "Station Details", new() { "stationLocation" }),
            ("equipment", "Equipment Details", new() { "equipmentDetails" }),
            ("antennas", "Antenna Details", new() { "antennaDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_MAR_LICENSES", Guid.Parse("f7200000-0000-0000-0000-000000000001"), Guid.Parse("f72a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant/Station Owner Details", new() { "fullName", "address", "contactNo", "email" }),
            ("vessel", "Vessel Details", new() { "vesselName", "callSign", "imoNumber" }),
            ("equipment", "Equipment List", new() { "equipmentDetails" }),
            ("radioOfficers", "Radio Officers", new() { "radioOfficers" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_FLM_LICENSES", Guid.Parse("f7300000-0000-0000-0000-000000000001"), Guid.Parse("f73a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant/Station Owner Details", new() { "fullName", "address", "contactNo", "email" }),
            ("stations", "Station Details", new() { "stationLocation" }),
            ("equipment", "Equipment Details", new() { "equipmentDetails" }),
            ("antennas", "Antenna Details", new() { "antennaDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_OTHER_LICENSES", Guid.Parse("f7400000-0000-0000-0000-000000000001"), Guid.Parse("f74a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant/Station Owner Details", new() { "fullName", "address", "contactNo", "email" }),
            ("stations", "Station Details", new() { "stationLocation" }),
            ("equipment", "Equipment Details", new() { "equipmentDetails" }),
            ("antennas", "Antenna Details", new() { "antennaDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_TVRO_CATV_LICENSES", Guid.Parse("f7500000-0000-0000-0000-000000000001"), Guid.Parse("f75a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("tvroEquipment", "TVRO Equipment Details", new() { "tvroDetails" }),
            ("antennaSystem", "Antenna System Details", new() { "antennaDetails" }),
            ("signalReception", "Signal Reception Details", new() { "tvroDetails" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_COPY_LICENSES", Guid.Parse("f7600000-0000-0000-0000-000000000001"), Guid.Parse("f76a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("permitLicenseCertificateNo", "Existing Permit/License Number", new() { "circumstances" }),
            ("circumstances", "Circumstances of Loss/Damage", new() { "circumstances" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" }),
            ("payment", "Payment Details", new() { "paymentOrNumber", "paymentAmount", "paymentDate" })
        });

        await SeedFormForService("NTC_REQ_COMPLAINTS", Guid.Parse("f8000000-0000-0000-0000-000000000001"), Guid.Parse("f80a0000-0000-0000-0000-000000000000"), new()
        {
            ("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            ("details", "Details of Request or Complaint", new() { "circumstances" }),
            ("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" })
        });
    }

    /// <summary>
    /// Applies the current contract JSON definitions to existing Service rows.
    /// Called on every startup so that changes to requirementDiscriminatorFields,
    /// requirementContextGroups, or any other contract metadata are reflected in
    /// the DB without requiring a full re-seed or manual SQL update.
    /// </summary>
    private static async Task UpdateContractsAsync(ApplicationDbContext context)
    {
        var services = await context.Services
            .Where(s => s.Code != null)
            .ToListAsync();

        if (services.Count == 0)
            return;

        var contractMap = FastTrackSeederData.GetContractMap();

        bool anyChange = false;
        foreach (var service in services)
        {
            if (service.Code == null)
                continue;

            // Normalize underscores vs hyphens
            var key = service.Code.Replace("-", "_").ToUpperInvariant();
            if (!contractMap.TryGetValue(key, out var newContract))
                continue;

            var normalizedNew     = newContract.Trim();
            var normalizedCurrent = (service.Contract ?? string.Empty).Trim();
            if (normalizedCurrent == normalizedNew)
                continue;

            service.Contract = newContract;
            anyChange = true;
        }

        if (anyChange)
            await context.SaveChangesAsync();
    }

    private static async Task UpdateVariantsAsync(ApplicationDbContext context)
    {
        var existingVariants = await context.ServiceVariants.ToListAsync();
        var variantDefs = FastTrackSeederData.GetVariantDefs();
        var variantDefIds = variantDefs.Select(d => d.Id).ToHashSet();
        
        bool anyChange = false;

        // Remove variants no longer defined in seeder
        foreach (var ev in existingVariants)
        {
            if (!variantDefIds.Contains(ev.Id))
            {
                context.ServiceVariants.Remove(ev);
                anyChange = true;
            }
        }

        var existingServiceIds = (await context.Services.Select(s => s.Id).ToListAsync()).ToHashSet();

        // Upsert seeder variants
        foreach (var def in variantDefs)
        {
            if (!existingServiceIds.Contains(def.ServiceId))
            {
                continue;
            }

            var ev = existingVariants.FirstOrDefault(v => v.Id == def.Id);
            if (ev == null)
            {
                context.ServiceVariants.Add(new ServiceVariant
                {
                    Id = def.Id,
                    ServiceId = def.ServiceId,
                    Type = def.Type,
                    Description = def.Description
                });
                anyChange = true;
            }
            else
            {
                if (ev.ServiceId != def.ServiceId || ev.Type != def.Type || ev.Description != def.Description)
                {
                    ev.ServiceId = def.ServiceId;
                    ev.Type = def.Type;
                    ev.Description = def.Description;
                    anyChange = true;
                }
            }
        }

        if (anyChange)
        {
            await context.SaveChangesAsync();
        }
    }

    private static async Task BackfillNewServicesAsync(ApplicationDbContext context)
    {
        var tenant = await context.Tenants.FirstOrDefaultAsync();
        if (tenant == null) return;

        var existingCategories = await context.ServiceCategories.ToListAsync();
        var categoryIds = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);

        void AddCategoryMapping(string key, ServiceCategoryType type)
        {
            var cat = existingCategories.FirstOrDefault(c => c.Type == type);
            if (cat != null)
            {
                categoryIds[key] = cat.Id;
            }
        }

        AddCategoryMapping("Exams", ServiceCategoryType.Exam);
        AddCategoryMapping("Certificates", ServiceCategoryType.Certificate);
        AddCategoryMapping("Licenses", ServiceCategoryType.License);
        AddCategoryMapping("Permits", ServiceCategoryType.Permit);
        AddCategoryMapping("Accreditations", ServiceCategoryType.Accreditation);
        AddCategoryMapping("RequestsAndComplaints", ServiceCategoryType.RequestsAndComplaints);

        // Ensure fallback keys exist
        foreach (var key in new[] { "Exams", "Certificates", "Licenses", "Permits", "Accreditations", "RequestsAndComplaints" })
        {
            if (!categoryIds.ContainsKey(key))
            {
                categoryIds[key] = key switch
                {
                    "Exams" => Guid.Parse("c0000000-0000-0000-0000-000000000001"),
                    "Certificates" => Guid.Parse("c0000000-0000-0000-0000-000000000002"),
                    "Licenses" => Guid.Parse("c0000000-0000-0000-0000-000000000003"),
                    "Permits" => Guid.Parse("c0000000-0000-0000-0000-000000000004"),
                    "Accreditations" => Guid.Parse("c0000000-0000-0000-0000-000000000005"),
                    _ => Guid.Parse("c0000000-0000-0000-0000-000000000006")
                };
            }
        }

        var serviceDefs = FastTrackSeederData.GetServiceDefs(categoryIds);
        var existingServices = await context.Services.ToListAsync();
        bool anyChange = false;

        foreach (var def in serviceDefs)
        {
            var s = existingServices.FirstOrDefault(x => x.Code == def.Code);
            if (s != null && s.Id != def.Id)
            {
                context.Services.Remove(s);
                await context.SaveChangesAsync();
                s = null;
                anyChange = true;
            }

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
                anyChange = true;
            }
            else
            {
                if (s.Name != def.Name || s.Group != def.Group || s.ServiceCategoryId != def.CategoryId || s.Contract != def.Contract)
                {
                    s.Name = def.Name;
                    s.Group = def.Group;
                    s.ServiceCategoryId = def.CategoryId;
                    s.Contract = def.Contract;
                    anyChange = true;
                }
            }
        }

        if (anyChange)
        {
            await context.SaveChangesAsync();
        }
    }

    private static async Task BackfillNewCatalogDetailsAsync(ApplicationDbContext context)
    {
        var svc101 = Guid.Parse("50000000-0000-0000-0000-000000000001");

        var allVariantsInDb = await context.ServiceVariants.AsNoTracking().ToListAsync();
        var allVariantsByDef = FastTrackSeederData.GetVariantDefs();

        Guid ResolveVariantId(Guid hardcodedVariantId)
        {
            var matchingById = allVariantsInDb.FirstOrDefault(v => v.Id == hardcodedVariantId);
            if (matchingById != null) return matchingById.Id;

            var def = allVariantsByDef.FirstOrDefault(d => d.Id == hardcodedVariantId);
            if (def != default)
            {
                var matchingDbVariant = allVariantsInDb.FirstOrDefault(v =>
                    v.ServiceId == def.ServiceId && v.Type == def.Type &&
                    (string.IsNullOrEmpty(def.Description) || v.Description == def.Description));
                if (matchingDbVariant != null)
                {
                    return matchingDbVariant.Id;
                }
            }
            return hardcodedVariantId;
        }

        // 2. Seed ServiceVariantElements
        var elementsToSeed = FastTrackSeederData.GetBackfillElements();
        var existingSve = (await context.ServiceVariantElements.AsNoTracking().Select(e => new { e.ServiceVariantId, e.Code }).ToListAsync())
            .Select(e => (e.ServiceVariantId, e.Code)).ToHashSet();

        foreach (var el in elementsToSeed)
        {
            Guid actualVariantId = ResolveVariantId(el.VariantId);
            if (!existingSve.Contains((actualVariantId, el.Code)))
            {
                context.ServiceVariantElements.Add(new ServiceVariantElement
                {
                    Id = Guid.NewGuid(),
                    ServiceVariantId = actualVariantId,
                    Code = el.Code,
                    Description = el.Description
                });
            }
        }
        await context.SaveChangesAsync();

        // 2b. Also seed the master Elements table so that billing/fee mappings can reference them
        var uniqueElementCodes = elementsToSeed
            .GroupBy(e => e.Code)
            .Select(g => g.First())
            .ToList();

        var existingElements = (await context.Elements.AsNoTracking().Select(e => e.Code.ToLower()).ToListAsync()).ToHashSet();

        foreach (var el in uniqueElementCodes)
        {
            if (!existingElements.Contains(el.Code.ToLower()))
            {
                context.Elements.Add(new Element
                {
                    Id = Guid.NewGuid(),
                    Code = el.Code.ToUpper(),
                    Name = el.Code,
                    Description = el.Description
                });
            }
        }
        await context.SaveChangesAsync();

        // 3. Seed ServiceNotes
        var notesToSeed = FastTrackSeederData.GetBackfillNotes(svc101);
        var existingNotes = (await context.ServiceNotes.AsNoTracking().Select(n => new { n.ServiceId, n.ServiceVariantId, n.Notes }).ToListAsync())
            .Select(n => (n.ServiceId, n.ServiceVariantId, n.Notes)).ToHashSet();

        foreach (var note in notesToSeed)
        {
            Guid? actualVariantId = note.ServiceVariantId.HasValue ? ResolveVariantId(note.ServiceVariantId.Value) : null;
            if (!existingNotes.Contains((note.ServiceId, actualVariantId, note.Content)))
            {
                context.ServiceNotes.Add(new ServiceNote
                {
                    Id = Guid.NewGuid(),
                    ServiceId = note.ServiceId,
                    ServiceVariantId = actualVariantId,
                    Notes = note.Content
                });
            }
        }
        await context.SaveChangesAsync();

        // 4. Seed Requirements
        var reqs = FastTrackSeederData.GetBackfillRequirements();
        var existingReqIds = (await context.Requirements.AsNoTracking().Select(r => r.Id).ToListAsync()).ToHashSet();

        foreach (var req in reqs.Values)
        {
            if (!existingReqIds.Contains(req.Id))
            {
                context.Requirements.Add(new Requirement
                {
                    Id = req.Id,
                    Name = req.Name,
                    Description = req.Desc
                });
            }
        }
        await context.SaveChangesAsync();

        // 5. Seed ServiceVariantRequirements
        var tenantId = await context.Tenants.Select(t => (Guid?)t.Id).FirstOrDefaultAsync();
        var variantReqsToSeed = FastTrackSeederData.GetBackfillVariantRequirements();
        var existingSvr = (await context.ServiceVariantRequirements.AsNoTracking().Select(r => new { r.ServiceVariantId, r.RequirementId }).ToListAsync())
            .Select(r => (r.ServiceVariantId, r.RequirementId)).ToHashSet();

        foreach (var vr in variantReqsToSeed)
        {
            Guid actualVariantId = ResolveVariantId(vr.VariantId);
            if (!existingSvr.Contains((actualVariantId, vr.ReqId)))
            {
                context.ServiceVariantRequirements.Add(new ServiceVariantRequirement
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ServiceVariantId = actualVariantId,
                    RequirementId = vr.ReqId,
                    IsRequired = vr.IsRequired
                });
                existingSvr.Add((actualVariantId, vr.ReqId));
            }
        }
        await context.SaveChangesAsync();

         // Deduplicate any existing duplicate database records
         var allSvr = await context.ServiceVariantRequirements.ToListAsync();
         var duplicatesToRemove = allSvr
             .GroupBy(r => new { r.ServiceVariantId, r.RequirementId })
             .SelectMany(g => g.Skip(1))
             .ToList();

         if (duplicatesToRemove.Any())
         {
             context.ServiceVariantRequirements.RemoveRange(duplicatesToRemove);
             await context.SaveChangesAsync();
         }

        // 6. Seed ServiceFees
        var examFeeId = Guid.Parse("f0000000-0000-0000-0000-000000000005"); // Operator Competency Exam Fee

        if (!await context.ServiceFees.AnyAsync(sf => sf.ServiceId == svc101 && sf.FeeId == examFeeId))
        {
            context.ServiceFees.Add(new ServiceFee
            {
                Id = Guid.NewGuid(),
                ServiceId = svc101,
                FeeId = examFeeId,
                Amount = 50.00m,
                IsActive = true
            });
        }
        await context.SaveChangesAsync();
        await ServiceInformationDataSeeder.SeedAsync(context);
    }
}
