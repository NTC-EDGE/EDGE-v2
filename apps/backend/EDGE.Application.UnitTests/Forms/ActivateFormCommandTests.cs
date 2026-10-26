using System;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Forms.Commands.ActivateForm;
using EDGE.Domain.Entities;
using FluentAssertions;
using Moq;
using Xunit;

namespace EDGE.Application.UnitTests.Forms;

public class ActivateFormCommandTests
{
    private readonly Mock<IFormRepository> _mockFormRepo = new();

    [Fact]
    public async Task Handle_WhenFormExists_ActivatesFormAndReturnsSuccess()
    {
        var formId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var form = new Form
        {
            Id = formId,
            ServiceId = serviceId,
            Name = "Amateur Radio Form v2",
            Version = "2.0",
            IsActive = true
        };

        _mockFormRepo
            .Setup(r => r.SetFormActiveAsync(formId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(form);

        var handler = new ActivateFormCommandHandler(_mockFormRepo.Object);
        var result = await handler.Handle(new ActivateFormCommand(formId), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FormId.Should().Be(formId);
        result.Data.Version.Should().Be("2.0");
        result.Data.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WhenFormNotFound_ReturnsFailure()
    {
        var formId = Guid.NewGuid();
        _mockFormRepo
            .Setup(r => r.SetFormActiveAsync(formId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Form?)null);

        var handler = new ActivateFormCommandHandler(_mockFormRepo.Object);
        var result = await handler.Handle(new ActivateFormCommand(formId), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.IsNotFound.Should().BeTrue();
    }

    [Fact]
    public void Validator_WhenIdIsEmpty_FailsValidation()
    {
        var validator = new ActivateFormCommandValidator();
        var result = validator.Validate(new ActivateFormCommand(Guid.Empty));

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Id");
    }
}
