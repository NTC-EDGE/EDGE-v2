using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Forms.Commands.ActivateVariantForm;
using EDGE.Application.Forms.Commands.RevertVariantForm;
using EDGE.Application.Forms.Commands.SaveVariantForm;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Queries.GetFormByVariantId;
using EDGE.Application.Forms.Services;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Forms;

public class VariantFormCommandTests
{
    private readonly Mock<IServiceVariantRepository> _mockVariantRepo = new();
    private readonly Mock<IFormRepository> _mockFormRepo = new();
    private readonly Mock<IServiceRepository> _mockServiceRepo = new();
    private readonly ContractFormValidator _contractValidator = new();

    #region SaveVariantForm Tests

    [Fact]
    public void SaveVariantForm_Validator_ValidatesVariantId()
    {
        var validator = new SaveVariantFormCommandValidator();

        var invalidResult = validator.Validate(new SaveVariantFormCommand(Guid.Empty, new List<FormSectionDto>()));
        invalidResult.IsValid.Should().BeFalse();
        invalidResult.Errors.Should().Contain(e => e.PropertyName == "VariantId");

        var validResult = validator.Validate(new SaveVariantFormCommand(Guid.NewGuid(), new List<FormSectionDto>()));
        validResult.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task SaveVariantForm_WhenVariantNotFound_ReturnsFail()
    {
        var variantId = Guid.NewGuid();
        _mockVariantRepo.Setup(r => r.GetByIdAsync(variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceVariant?)null);

        var handler = new SaveVariantFormCommandHandler(_mockVariantRepo.Object, _mockFormRepo.Object);
        var result = await handler.Handle(new SaveVariantFormCommand(variantId, new List<FormSectionDto>()), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain($"Service variant with ID {variantId} was not found");
    }

    [Fact]
    public async Task SaveVariantForm_WhenVariantExists_SavesAndReturnsCustomizedFormDto()
    {
        var serviceId = Guid.NewGuid();
        var variantId = Guid.NewGuid();
        var variant = new ServiceVariant
        {
            Id = variantId,
            ServiceId = serviceId,
            Description = "Dealer Permit Variant",
            Type = ServiceVariantType.New
        };

        var baseForm = new Form
        {
            Id = Guid.NewGuid(),
            Key = "ntc_dealer_base",
            ServiceId = serviceId,
            Name = "Dealer Base Form"
        };

        var savedForm = new Form
        {
            Id = Guid.NewGuid(),
            Key = $"var_{variantId}",
            ServiceId = serviceId,
            ServiceVariantId = variantId,
            BaseFormId = baseForm.Id,
            Name = "Dealer Custom Variant Form",
            Version = "1.1",
            IsActive = true,
            Sections = new List<FormSection>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Key = "sec_particulars",
                    Title = "Applicant Particulars",
                    OrderIndex = 0,
                    SectionFields = new List<SectionField>
                    {
                        new()
                        {
                            FieldId = Guid.NewGuid(),
                            IsRequired = true,
                            OrderIndex = 0,
                            Field = new Field { Label = "Business Name", FieldType = "Text" }
                        }
                    }
                }
            }
        };

        _mockVariantRepo.Setup(r => r.GetByIdAsync(variantId, It.IsAny<CancellationToken>())).ReturnsAsync(variant);
        _mockFormRepo.Setup(r => r.GetFormByServiceIdAsync(serviceId, null, null, It.IsAny<CancellationToken>())).ReturnsAsync(baseForm);
        _mockFormRepo.Setup(r => r.GetActiveVariantFormAsync(variantId, It.IsAny<CancellationToken>())).ReturnsAsync((Form?)null);
        _mockFormRepo.Setup(r => r.SaveFormStructureAsync(
            It.IsAny<Guid>(), serviceId, "1.1", false, It.IsAny<List<FormSectionDto>>(),
            "Custom Variant", true, $"var_{variantId}", variantId, baseForm.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(savedForm);

        var handler = new SaveVariantFormCommandHandler(_mockVariantRepo.Object, _mockFormRepo.Object);
        var command = new SaveVariantFormCommand(
            VariantId: variantId,
            Sections: new List<FormSectionDto>(),
            Name: "Custom Variant",
            Version: "1.1",
            IsActive: true);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.IsCustomized.Should().BeTrue();
        result.Data.ServiceVariantId.Should().Be(variantId);
        result.Data.BaseFormId.Should().Be(baseForm.Id);
        result.Data.Sections.Should().HaveCount(1);
        result.Data.Sections[0].Fields.Should().HaveCount(1);
        result.Data.Sections[0].Fields[0].Label.Should().Be("Business Name");
    }

    #endregion

    #region ActivateVariantForm Tests

    [Fact]
    public void ActivateVariantForm_Validator_ValidatesVariantId()
    {
        var validator = new ActivateVariantFormCommandValidator();

        var invalidResult = validator.Validate(new ActivateVariantFormCommand(Guid.Empty, true));
        invalidResult.IsValid.Should().BeFalse();
        invalidResult.Errors.Should().Contain(e => e.PropertyName == "VariantId");

        var validResult = validator.Validate(new ActivateVariantFormCommand(Guid.NewGuid(), true));
        validResult.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task ActivateVariantForm_WhenFormExists_ActivatesSuccessfully()
    {
        var variantId = Guid.NewGuid();
        _mockFormRepo.Setup(r => r.SetVariantFormActiveAsync(variantId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new ActivateVariantFormCommandHandler(_mockFormRepo.Object);
        var result = await handler.Handle(new ActivateVariantFormCommand(variantId, true), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().BeTrue();
        result.Message.Should().Contain("Variant form successfully activated.");
    }

    [Fact]
    public async Task ActivateVariantForm_WhenNoCustomForm_ReturnsFail()
    {
        var variantId = Guid.NewGuid();
        _mockFormRepo.Setup(r => r.SetVariantFormActiveAsync(variantId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var handler = new ActivateVariantFormCommandHandler(_mockFormRepo.Object);
        var result = await handler.Handle(new ActivateVariantFormCommand(variantId, true), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("No customized form exists for this variant");
    }

    #endregion

    #region RevertVariantForm Tests

    [Fact]
    public void RevertVariantForm_Validator_ValidatesVariantId()
    {
        var validator = new RevertVariantFormCommandValidator();

        var invalidResult = validator.Validate(new RevertVariantFormCommand(Guid.Empty));
        invalidResult.IsValid.Should().BeFalse();
        invalidResult.Errors.Should().Contain(e => e.PropertyName == "VariantId");

        var validResult = validator.Validate(new RevertVariantFormCommand(Guid.NewGuid()));
        validResult.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task RevertVariantForm_WhenSuccessful_RestoresInheritance()
    {
        var variantId = Guid.NewGuid();
        _mockFormRepo.Setup(r => r.RevertVariantFormAsync(variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new RevertVariantFormCommandHandler(_mockFormRepo.Object);
        var result = await handler.Handle(new RevertVariantFormCommand(variantId), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().BeTrue();
        result.Message.Should().Contain("restored inheritance from base form template");
    }

    [Fact]
    public async Task RevertVariantForm_WhenRepositoryReturnsFalse_ReturnsFail()
    {
        var variantId = Guid.NewGuid();
        _mockFormRepo.Setup(r => r.RevertVariantFormAsync(variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var handler = new RevertVariantFormCommandHandler(_mockFormRepo.Object);
        var result = await handler.Handle(new RevertVariantFormCommand(variantId), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Failed to revert variant form");
    }

    #endregion

    #region GetFormByVariantId Tests

    [Fact]
    public void GetFormByVariantId_Validator_ValidatesVariantId()
    {
        var validator = new GetFormByVariantIdQueryValidator();

        var invalidResult = validator.Validate(new GetFormByVariantIdQuery(Guid.Empty));
        invalidResult.IsValid.Should().BeFalse();
        invalidResult.Errors.Should().Contain(e => e.PropertyName == "VariantId");

        var validResult = validator.Validate(new GetFormByVariantIdQuery(Guid.NewGuid()));
        validResult.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task GetFormByVariantId_WhenVariantNotFound_ReturnsFail()
    {
        var variantId = Guid.NewGuid();
        _mockVariantRepo.Setup(r => r.GetByIdAsync(variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceVariant?)null);

        var handler = new GetFormByVariantIdQueryHandler(
            _mockVariantRepo.Object, _mockFormRepo.Object, _mockServiceRepo.Object, _contractValidator);

        var result = await handler.Handle(new GetFormByVariantIdQuery(variantId), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain($"Service variant with ID {variantId} was not found");
    }

    [Fact]
    public async Task GetFormByVariantId_WhenServiceNotFound_ReturnsFail()
    {
        var variantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var variant = new ServiceVariant { Id = variantId, ServiceId = serviceId };

        _mockVariantRepo.Setup(r => r.GetByIdAsync(variantId, It.IsAny<CancellationToken>())).ReturnsAsync(variant);
        _mockServiceRepo.Setup(r => r.GetByIdAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Entities.Service?)null);

        var handler = new GetFormByVariantIdQueryHandler(
            _mockVariantRepo.Object, _mockFormRepo.Object, _mockServiceRepo.Object, _contractValidator);

        var result = await handler.Handle(new GetFormByVariantIdQuery(variantId), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain($"Service with ID {serviceId} was not found");
    }

    [Fact]
    public async Task GetFormByVariantId_WhenFormFound_ReturnsCustomizedStatusAccurately()
    {
        var variantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var variant = new ServiceVariant { Id = variantId, ServiceId = serviceId, Description = "Mobile Radio Variant" };
        var service = new Domain.Entities.Service { Id = serviceId, Name = "Radio Service", Code = "RAD-01", Contract = "{}" };

        var customizedForm = new Form
        {
            Id = Guid.NewGuid(),
            Key = $"var_{variantId}",
            ServiceId = serviceId,
            ServiceVariantId = variantId,
            Name = "Customized Mobile Radio Form",
            Version = "2.0",
            IsActive = true,
            Sections = new List<FormSection>
            {
                new()
                {
                    Key = "sec_general",
                    Title = "General Details",
                    OrderIndex = 0,
                    SectionFields = new List<SectionField>()
                }
            }
        };

        _mockVariantRepo.Setup(r => r.GetByIdAsync(variantId, It.IsAny<CancellationToken>())).ReturnsAsync(variant);
        _mockServiceRepo.Setup(r => r.GetByIdAsync(serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _mockFormRepo.Setup(r => r.GetFormByServiceIdAsync(serviceId, variantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customizedForm);
        _mockFormRepo.Setup(r => r.GetVersionsByServiceIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Form> { customizedForm });

        var handler = new GetFormByVariantIdQueryHandler(
            _mockVariantRepo.Object, _mockFormRepo.Object, _mockServiceRepo.Object, _contractValidator);

        var result = await handler.Handle(new GetFormByVariantIdQuery(variantId), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.IsCustomized.Should().BeTrue();
        result.Data.ServiceVariantId.Should().Be(variantId);
        result.Data.Sections.Should().HaveCount(1);
    }

    #endregion
}
