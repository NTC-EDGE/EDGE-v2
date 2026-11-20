using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Forms.Commands.ActivateForm;
using EDGE.Application.Forms.Commands.DeleteForm;
using EDGE.Application.Forms.Commands.DuplicateForm;
using EDGE.Application.Forms.Commands.SaveVariantForm;
using EDGE.Application.Forms.Commands.UpdateForm;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Queries.GetFormById;
using EDGE.Application.Forms.Queries.GetFormByVariantId;
using EDGE.Application.Forms.Queries.GetForms;
using EDGE.Application.Forms.Queries.GetFormSummaries;
using EDGE.Application.Forms.Queries.GetFormFilterOptions;
using EDGE.Application.Forms.Queries.GetFormWorkspace;
using EDGE.Application.Forms.Services;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Persistence.Repositories;

namespace EDGE.Application.UnitTests.Forms;

public class BaseAndVariantFormSupersetSyncTests
{
    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task SaveVariantForm_NewFieldReflectsInBaseForm_AndPreservesBaseFieldLabel()
    {
        using var context = CreateDbContext();
        var formRepo = new FormRepository(context);
        var variantRepo = new ServiceVariantRepository(context);
        var serviceRepo = new ServiceRepository(context);
        var contractValidator = new ContractFormValidator();

        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "Licensing", Code = "LIC", Type = ServiceCategoryType.License };
        var serviceId = Guid.NewGuid();
        var service = new Service { Id = serviceId, ServiceCategoryId = category.Id, ServiceCategory = category, Name = "Commercial ROC", Code = "NTC_1_02", Contract = "{}" };
        var varNew = new ServiceVariant { Id = Guid.NewGuid(), ServiceId = serviceId, Type = ServiceVariantType.New, Description = "Commercial ROC" };
        var varRenewal = new ServiceVariant { Id = Guid.NewGuid(), ServiceId = serviceId, Type = ServiceVariantType.Renewal, Description = "Commercial ROC" };

        context.ServiceCategories.Add(category);
        context.Services.Add(service);
        context.ServiceVariants.AddRange(varNew, varRenewal);
        await context.SaveChangesAsync();

        var baseFieldId = Guid.NewGuid();
        var baseFormId = Guid.NewGuid();

        await formRepo.SaveFormStructureAsync(
            baseFormId,
            serviceId,
            "1.0",
            false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "general",
                    Title = "General Information",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = baseFieldId, Label = "Applicant Name", Type = "text", IsRequired = true, OrderIndex = 0 }
                    }
                }
            },
            "NTC 1-02: Commercial ROC",
            true,
            "NTC_1_02");

        // Customize Renewal variant: rename base field label AND add a new Renewal-only field
        var renewalExtraFieldId = Guid.NewGuid();
        var saveVariantHandler = new SaveVariantFormCommandHandler(variantRepo, formRepo);
        var saveRes = await saveVariantHandler.Handle(new SaveVariantFormCommand(
            varRenewal.Id,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "general",
                    Title = "General Information",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = baseFieldId, Label = "Renewing Licensee Name", Type = "text", IsRequired = true, OrderIndex = 0 },
                        new() { FieldId = renewalExtraFieldId, Label = "Renewal Logbook Reference No.", Type = "text", IsRequired = true, OrderIndex = 1 }
                    }
                }
            },
            "Commercial ROC Renewal Form",
            "1.0",
            true), CancellationToken.None);

        saveRes.Succeeded.Should().BeTrue();

        // Load Base Form ("All Sections & Fields") -> MUST contain BOTH fields, while Base Field keeps original "Applicant Name"!
        var getByIdHandler = new GetFormByIdQueryHandler(formRepo, contractValidator);
        var baseRes = await getByIdHandler.Handle(new GetFormByIdQuery(baseFormId), CancellationToken.None);

        baseRes.Succeeded.Should().BeTrue();
        var baseFields = baseRes.Data!.Sections.SelectMany(s => s.Fields).ToList();
        baseFields.Should().HaveCount(2);

        var baseNameField = baseFields.First(f => f.FieldId == baseFieldId);
        baseNameField.Label.Should().Be("Applicant Name", "shared Base Form label must not be globally overwritten by a single variant edit");

        var syncedVariantField = baseFields.First(f => f.FieldId == renewalExtraFieldId);
        syncedVariantField.Label.Should().Be("Renewal Logbook Reference No.");
        syncedVariantField.VisibilityCondition.Should().Contain("Commercial ROC (Renewal)");
        FormRepository.IsConditionApplicableToVariant(syncedVariantField.VisibilityCondition, varRenewal).Should().BeTrue();
        FormRepository.IsConditionApplicableToVariant(syncedVariantField.VisibilityCondition, varNew).Should().BeFalse();

        // Load Renewal Variant Form -> resolves overridden label "Renewing Licensee Name" + extra field
        var getVarHandler = new GetFormByVariantIdQueryHandler(variantRepo, formRepo, serviceRepo, contractValidator);
        var renewalRes = await getVarHandler.Handle(new GetFormByVariantIdQuery(varRenewal.Id), CancellationToken.None);
        renewalRes.Succeeded.Should().BeTrue();
        renewalRes.Data!.Sections[0].Fields.First(f => f.FieldId == baseFieldId).Label.Should().Be("Renewing Licensee Name");
        renewalRes.Data.Sections[0].Fields.Should().Contain(f => f.FieldId == renewalExtraFieldId);
    }

    [Fact]
    public async Task UpdateForm_RespectsPropagateToCustomizedVariantsFlag()
    {
        using var context = CreateDbContext();
        var formRepo = new FormRepository(context);
        var variantRepo = new ServiceVariantRepository(context);
        var serviceRepo = new ServiceRepository(context);
        var contractValidator = new ContractFormValidator();

        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "Licensing", Code = "LIC", Type = ServiceCategoryType.License };
        var serviceId = Guid.NewGuid();
        var service = new Service { Id = serviceId, ServiceCategoryId = category.Id, ServiceCategory = category, Name = "Station License", Code = "NTC_1_11", Contract = "{}" };
        var varRenewal = new ServiceVariant { Id = Guid.NewGuid(), ServiceId = serviceId, Type = ServiceVariantType.Renewal, Description = "Station License" };
        context.ServiceCategories.Add(category);
        context.Services.Add(service);
        context.ServiceVariants.Add(varRenewal);
        await context.SaveChangesAsync();

        var fieldId = Guid.NewGuid();
        var baseFormId = Guid.NewGuid();

        await formRepo.SaveFormStructureAsync(
            baseFormId, serviceId, "1.0", false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "station",
                    Title = "Station Info",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = fieldId, Label = "Call Sign", Type = "text", IsRequired = true, OrderIndex = 0 }
                    }
                }
            },
            "NTC 1-11", true, "NTC_1_11");

        // Customize Renewal with overridden label
        var saveVariantHandler = new SaveVariantFormCommandHandler(variantRepo, formRepo);
        await saveVariantHandler.Handle(new SaveVariantFormCommand(
            varRenewal.Id,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "station",
                    Title = "Station Info",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = fieldId, Label = "Existing RSL Call Sign", Type = "text", IsRequired = true, OrderIndex = 0 }
                    }
                }
            },
            "Renewal Form", "1.0", true), CancellationToken.None);

        var currentBase = await formRepo.GetByIdAsync(baseFormId);
        var currentRules = currentBase!.Sections.First().SectionFields.First().Field!.ValidationRules;

        var updateHandler = new UpdateFormCommandHandler(formRepo, contractValidator);
        var getVarHandler = new GetFormByVariantIdQueryHandler(variantRepo, formRepo, serviceRepo, contractValidator);

        // 1. Update Base Form with PropagateToCustomizedVariants = false -> Renewal keeps "Existing RSL Call Sign"
        await updateHandler.Handle(new UpdateFormCommand(
            baseFormId, serviceId, "1.0", false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "station",
                    Title = "Station Info",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = fieldId, Label = "Assigned Call Sign", Type = "text", IsRequired = true, OrderIndex = 0, ValidationRules = currentRules }
                    }
                }
            },
            "NTC 1-11", true, "NTC_1_11", null, null, PropagateToCustomizedVariants: false), CancellationToken.None);

        var varAfterKeep = await getVarHandler.Handle(new GetFormByVariantIdQuery(varRenewal.Id), CancellationToken.None);
        varAfterKeep.Data!.Sections[0].Fields[0].Label.Should().Be("Existing RSL Call Sign");

        // 2. Update Base Form with PropagateToCustomizedVariants = true -> Renewal adopts "Official Station Call Sign"
        await updateHandler.Handle(new UpdateFormCommand(
            baseFormId, serviceId, "1.0", false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "station",
                    Title = "Station Info",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = fieldId, Label = "Official Station Call Sign", Type = "text", IsRequired = true, OrderIndex = 0, ValidationRules = currentRules }
                    }
                }
            },
            "NTC 1-11", true, "NTC_1_11", null, null, PropagateToCustomizedVariants: true), CancellationToken.None);

        var varAfterPropagate = await getVarHandler.Handle(new GetFormByVariantIdQuery(varRenewal.Id), CancellationToken.None);
        varAfterPropagate.Data!.Sections[0].Fields[0].Label.Should().Be("Official Station Call Sign");
    }

    [Fact]
    public async Task DeletionProtection_BlocksDeletingInUseBaseFormSectionOrField_AllowsWhenUnused()
    {
        using var context = CreateDbContext();
        var formRepo = new FormRepository(context);
        var mockUow = new Mock<IUnitOfWork>();
        mockUow.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(() => context.SaveChanges());

        var serviceId = Guid.NewGuid();
        context.Services.Add(new Service { Id = serviceId, Name = "Permits", Code = "NTC_1_09", Contract = "{}" });
        context.ServiceVariants.Add(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = serviceId, Type = ServiceVariantType.New, Description = "Permit to Purchase" });
        await context.SaveChangesAsync();

        var usedFieldId = Guid.NewGuid();
        var unusedFieldId = Guid.NewGuid();
        var baseFormId = Guid.NewGuid();

        await formRepo.SaveFormStructureAsync(
            baseFormId, serviceId, "1.0", false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "equipment",
                    Title = "Equipment Details",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = usedFieldId, Label = "Serial Number", Type = "text", IsRequired = true, OrderIndex = 0 },
                        new() { FieldId = unusedFieldId, Label = "Deprecated Legacy Code", Type = "text", IsRequired = false, OrderIndex = 1, VisibilityCondition = "{\"variants\":[\"__NONE__\"]}" }
                    }
                }
            },
            "NTC 1-09", true, "NTC_1_09");

        // 1. Deleting active Base Form used by Service Variants must be blocked
        var deleteFormHandler = new DeleteFormCommandHandler(formRepo, mockUow.Object);
        var delFormRes = await deleteFormHandler.Handle(new DeleteFormCommand(baseFormId), CancellationToken.None);
        delFormRes.Succeeded.Should().BeFalse();
        delFormRes.Message.Should().Contain("Service Variant");

        // 2. Deleting usedFieldId in All Sections must be blocked
        var updateHandler = new UpdateFormCommandHandler(formRepo);
        var badUpdateRes = await updateHandler.Handle(new UpdateFormCommand(
            baseFormId, serviceId, "1.0", false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "equipment",
                    Title = "Equipment Details",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = unusedFieldId, Label = "Deprecated Legacy Code", Type = "text", IsRequired = false, OrderIndex = 0, VisibilityCondition = "{\"variants\":[\"__NONE__\"]}" }
                    }
                }
            }), CancellationToken.None);

        badUpdateRes.Succeeded.Should().BeFalse();
        badUpdateRes.Message.Should().Contain("Serial Number");

        // 3. Deleting unusedFieldId (0 Service Variants use it) MUST succeed!
        var goodUpdateRes = await updateHandler.Handle(new UpdateFormCommand(
            baseFormId, serviceId, "1.0", false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "equipment",
                    Title = "Equipment Details",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = usedFieldId, Label = "Serial Number", Type = "text", IsRequired = true, OrderIndex = 0 }
                    }
                }
            }), CancellationToken.None);

        goodUpdateRes.Succeeded.Should().BeTrue();
        goodUpdateRes.Data!.Sections[0].Fields.Should().ContainSingle(f => f.FieldId == usedFieldId);
    }

    [Fact]
    public async Task SingleActiveInvariant_EnforcedAcrossBaseAndVariantVersions_AndPreventsDraftLeak()
    {
        using var context = CreateDbContext();
        var formRepo = new FormRepository(context);
        var mockUow = new Mock<IUnitOfWork>();
        mockUow.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(() => context.SaveChanges());

        var serviceId = Guid.NewGuid();
        var variantId = Guid.NewGuid();
        context.Services.Add(new Service { Id = serviceId, Name = "Exam", Code = "NTC_1_01", Contract = "{}" });
        context.ServiceVariants.Add(new ServiceVariant { Id = variantId, ServiceId = serviceId, Type = ServiceVariantType.FirstTaker, Description = "Commercial Exam" });
        await context.SaveChangesAsync();

        var v1Id = Guid.NewGuid();
        await formRepo.SaveFormStructureAsync(v1Id, serviceId, "1.0", false, new List<FormSectionDto>(), "Exam v1", true, "NTC_1_01");

        // Duplicate v1.0 -> v2.0 Draft (newer LastModifiedAt!)
        var dupHandler = new DuplicateFormCommandHandler(formRepo, mockUow.Object);
        var dupRes = await dupHandler.Handle(new DuplicateFormCommand(v1Id, "2.0"), CancellationToken.None);
        dupRes.Succeeded.Should().BeTrue();
        var v2Id = dupRes.Data!.FormId;

        // Modify v2.0 Draft so its LastModifiedAt is strictly newer than v1.0
        await formRepo.SaveFormStructureAsync(v2Id, serviceId, "2.0", false, new List<FormSectionDto>(), "Exam v2 Draft", false, "NTC_1_01");

        // Client lookup MUST still return v1.0 (Active), NEVER v2.0 (Draft)!
        var clientForm = await formRepo.GetFormByServiceIdAsync(serviceId);
        clientForm.Should().NotBeNull();
        clientForm!.Id.Should().Be(v1Id);
        clientForm.Version.Should().Be("1.0");

        // Activate v2.0 -> v2.0 becomes Active AND v1.0 is atomically deactivated
        var activateHandler = new ActivateFormCommandHandler(formRepo);
        var actRes = await activateHandler.Handle(new ActivateFormCommand(v2Id), CancellationToken.None);
        actRes.Succeeded.Should().BeTrue();

        var allBaseForms = await context.Forms.Where(f => f.ServiceId == serviceId && f.ServiceVariantId == null).ToListAsync();
        allBaseForms.Count(f => f.IsActive).Should().Be(1, "only one Base Form version may ever be active");
        allBaseForms.Single(f => f.IsActive).Id.Should().Be(v2Id);

        // Variant forms: create two variant versions and verify SetVariantFormActiveAsync enforces strictly 1 active
        var varV1 = Guid.NewGuid();
        var varV2 = Guid.NewGuid();
        await formRepo.SaveFormStructureAsync(varV1, serviceId, "1.0", false, new List<FormSectionDto>(), "Var v1", true, $"var_{variantId}", variantId, v2Id);
        await formRepo.SaveFormStructureAsync(varV2, serviceId, "2.0", false, new List<FormSectionDto>(), "Var v2", false, $"var_{variantId}", variantId, v2Id);

        await formRepo.SetVariantFormActiveAsync(variantId, true);
        var allVarForms = await context.Forms.Where(f => f.ServiceVariantId == variantId).ToListAsync();
        allVarForms.Count(f => f.IsActive).Should().Be(1, "only one Service Variant form version may ever be active");
    }

    [Fact]
    public async Task DedicatedSummariesAndWorkspaceQueries_ReturnScopedLightweightPayloads()
    {
        using var context = CreateDbContext();
        var formRepo = new FormRepository(context);

        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "Permits", Code = "PRM", Type = ServiceCategoryType.Permit };
        var targetServiceId = Guid.NewGuid();
        var unrelatedServiceId = Guid.NewGuid();

        var targetService = new Service { Id = targetServiceId, ServiceCategoryId = category.Id, ServiceCategory = category, Name = "Amateur Permits", Code = "NTC_1_09", Contract = "{\"requiredSections\":[{\"key\":\"applicant\",\"required\":true}]}" };
        var unrelatedService = new Service { Id = unrelatedServiceId, ServiceCategoryId = category.Id, ServiceCategory = category, Name = "Maritime Licenses", Code = "NTC_1_04", Contract = "{}" };

        var targetVar1 = new ServiceVariant { Id = Guid.NewGuid(), ServiceId = targetServiceId, Type = ServiceVariantType.New, Description = "Permit to Purchase" };
        var targetVar2 = new ServiceVariant { Id = Guid.NewGuid(), ServiceId = targetServiceId, Type = ServiceVariantType.Renewal, Description = "Permit to Possess" };
        var unrelatedVar = new ServiceVariant { Id = Guid.NewGuid(), ServiceId = unrelatedServiceId, Type = ServiceVariantType.New, Description = "Ship Station" };

        context.ServiceCategories.Add(category);
        context.Services.AddRange(targetService, unrelatedService);
        context.ServiceVariants.AddRange(targetVar1, targetVar2, unrelatedVar);
        await context.SaveChangesAsync();

        var baseFormId = Guid.NewGuid();
        await formRepo.SaveFormStructureAsync(
            baseFormId, targetServiceId, "1.0", false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "applicant",
                    Title = "Applicant Details",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = Guid.NewGuid(), Label = "Full Name", Type = "text", IsRequired = true, OrderIndex = 0 }
                    }
                }
            },
            "NTC 1-09: Amateur Permits", true, "NTC_1_09");

        // 1. Lightweight Summaries Endpoint
        var summariesHandler = new GetFormSummariesQueryHandler(formRepo);
        var summariesRes = await summariesHandler.Handle(new GetFormSummariesQuery(PageNumber: 1, PageSize: 10), CancellationToken.None);
        summariesRes.Data.Should().HaveCount(1);
        summariesRes.Data[0].FormId.Should().Be(baseFormId);
        summariesRes.Data[0].LinkedVariantsCount.Should().Be(2);
        summariesRes.Data[0].AvailableVersions.Should().ContainSingle(v => v.FieldsCount == 1 && v.SectionsCount == 1);

        // 2. Lightweight On-Demand Filter Options Endpoint
        var filterHandler = new GetFormFilterOptionsQueryHandler(formRepo);
        var filterRes = await filterHandler.Handle(new GetFormFilterOptionsQuery(), CancellationToken.None);
        filterRes.Succeeded.Should().BeTrue();
        filterRes.Data!.Categories.Should().ContainSingle(c => c.Id == category.Id);
        filterRes.Data.Services.Should().HaveCount(2);

        // 3. Scoped Workspace Bootstrap Endpoint -> returns ONLY targetService's 2 variants (never unrelatedService's variants!)
        var workspaceHandler = new GetFormWorkspaceQueryHandler(formRepo);
        var wsRes = await workspaceHandler.Handle(new GetFormWorkspaceQuery(baseFormId), CancellationToken.None);
        wsRes.Succeeded.Should().BeTrue();
        wsRes.Data!.Form.FormId.Should().Be(baseFormId);
        wsRes.Data.Form.Sections[0].Required.Should().BeTrue();
        wsRes.Data.LinkedServices.Should().ContainSingle(s => s.Id == targetServiceId);
        wsRes.Data.ServiceVariants.Should().HaveCount(2);
        wsRes.Data.ServiceVariants.Select(v => v.Id).Should().NotContain(unrelatedVar.Id);
    }

    [Fact]
    public async Task PerServiceVariantVersioning_SupportsDraftCreationIsolationAndSingleActiveActivation()
    {
        using var context = CreateDbContext();
        var formRepo = new FormRepository(context);
        var variantRepo = new ServiceVariantRepository(context);
        var serviceRepo = new ServiceRepository(context);
        var contractValidator = new ContractFormValidator();

        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "Licensing", Code = "LIC", Type = ServiceCategoryType.License };
        var serviceId = Guid.NewGuid();
        var service = new Service { Id = serviceId, ServiceCategoryId = category.Id, ServiceCategory = category, Name = "Commercial ROC", Code = "NTC_1_02", Contract = "{}" };
        var varNew = new ServiceVariant { Id = Guid.NewGuid(), ServiceId = serviceId, Type = ServiceVariantType.New, Description = "Commercial ROC" };
        var varRenewal = new ServiceVariant { Id = Guid.NewGuid(), ServiceId = serviceId, Type = ServiceVariantType.Renewal, Description = "Commercial ROC" };

        context.ServiceCategories.Add(category);
        context.Services.Add(service);
        context.ServiceVariants.AddRange(varNew, varRenewal);
        await context.SaveChangesAsync();

        var baseFieldId = Guid.NewGuid();
        var newOnlyFieldId = Guid.NewGuid();
        var baseFormId = Guid.NewGuid();

        await formRepo.SaveFormStructureAsync(
            baseFormId, serviceId, "1.0", false,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "general",
                    Title = "General Info",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = baseFieldId, Label = "Applicant Name", Type = "text", IsRequired = true, OrderIndex = 0 },
                        new() { FieldId = newOnlyFieldId, Label = "Initial Training School", Type = "text", IsRequired = true, OrderIndex = 1, VisibilityCondition = "{\"variants\":[\"Commercial ROC (New)\"]}" }
                    }
                }
            },
            "NTC 1-02", true, "NTC_1_02");

        // 1. Clicking Renewal Variant loads ONLY Renewal's needed fields (excludes Initial Training School!)
        var getVarHandler = new GetFormByVariantIdQueryHandler(variantRepo, formRepo, serviceRepo, contractValidator);
        var initialRenewal = await getVarHandler.Handle(new GetFormByVariantIdQuery(varRenewal.Id), CancellationToken.None);
        initialRenewal.Succeeded.Should().BeTrue();
        initialRenewal.Data!.IsCustomized.Should().BeFalse();
        initialRenewal.Data.Sections[0].Fields.Should().ContainSingle(f => f.FieldId == baseFieldId);

        // 2. Create a v2.0 Draft specifically for Renewal Variant -> v1.0 stays Live, v2.0 starts as Draft!
        var draftExtraFieldId = Guid.NewGuid();
        var saveVarHandler = new SaveVariantFormCommandHandler(variantRepo, formRepo);
        var createDraftRes = await saveVarHandler.Handle(new SaveVariantFormCommand(
            varRenewal.Id,
            new List<FormSectionDto>
            {
                new()
                {
                    Key = "general",
                    Title = "General Info",
                    OrderIndex = 0,
                    Fields = new List<FormFieldDto>
                    {
                        new() { FieldId = baseFieldId, Label = "Draft v2 Renewal Name", Type = "text", IsRequired = true, OrderIndex = 0 },
                        new() { FieldId = draftExtraFieldId, Label = "Draft v2 Medical Certificate No.", Type = "text", IsRequired = true, OrderIndex = 1 }
                    }
                }
            },
            "Commercial ROC Renewal Form",
            "2.0",
            IsActive: false,
            FormId: null,
            CreateNewVersion: true), CancellationToken.None);

        createDraftRes.Succeeded.Should().BeTrue();
        var v2DraftId = createDraftRes.Data!.FormId;
        createDraftRes.Data.IsActive.Should().BeFalse();
        createDraftRes.Data.AvailableVersions.Should().HaveCount(2);
        createDraftRes.Data.AvailableVersions.Count(v => v.IsActive).Should().Be(1, "strictly one version of Renewal Variant is active");

        // 3. While v2.0 is Draft: Live Renewal Variant (v1.0) AND Base Form ("All Sections") remain untouched!
        var liveRenewalCheck = await getVarHandler.Handle(new GetFormByVariantIdQuery(varRenewal.Id), CancellationToken.None);
        liveRenewalCheck.Data!.Version.Should().Be("1.0");
        liveRenewalCheck.Data.Sections[0].Fields.First(f => f.FieldId == baseFieldId).Label.Should().Be("Applicant Name");
        liveRenewalCheck.Data.Sections[0].Fields.Should().NotContain(f => f.FieldId == draftExtraFieldId);

        var getBaseHandler = new GetFormByIdQueryHandler(formRepo, contractValidator);
        var baseBeforeActivate = await getBaseHandler.Handle(new GetFormByIdQuery(baseFormId), CancellationToken.None);
        baseBeforeActivate.Data!.Sections[0].Fields.Should().NotContain(f => f.FieldId == draftExtraFieldId);

        // 4. Activate Renewal v2.0 -> v2.0 becomes sole Active version for Renewal AND syncs new field into All Sections!
        var activateHandler = new ActivateFormCommandHandler(formRepo, contractValidator);
        var actRes = await activateHandler.Handle(new ActivateFormCommand(v2DraftId), CancellationToken.None);
        actRes.Succeeded.Should().BeTrue();
        actRes.Data!.IsActive.Should().BeTrue();
        actRes.Data.AvailableVersions.Count(v => v.IsActive).Should().Be(1);

        var liveRenewalAfter = await getVarHandler.Handle(new GetFormByVariantIdQuery(varRenewal.Id), CancellationToken.None);
        liveRenewalAfter.Data!.FormId.Should().Be(v2DraftId);
        liveRenewalAfter.Data.Version.Should().Be("2.0");
        liveRenewalAfter.Data.Sections[0].Fields.First(f => f.FieldId == baseFieldId).Label.Should().Be("Draft v2 Renewal Name");
        liveRenewalAfter.Data.Sections[0].Fields.Should().Contain(f => f.FieldId == draftExtraFieldId);

        var baseAfterActivate = await getBaseHandler.Handle(new GetFormByIdQuery(baseFormId), CancellationToken.None);
        baseAfterActivate.Data!.Sections[0].Fields.Should().Contain(f => f.FieldId == draftExtraFieldId);
    }
}
