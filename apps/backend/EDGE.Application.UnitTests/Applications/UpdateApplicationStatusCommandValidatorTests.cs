using System;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;
using EDGE.Application.Applications.Commands.UpdateApplicationStatus;

namespace EDGE.Application.UnitTests.Applications;

public class UpdateApplicationStatusCommandValidatorTests
{
    private readonly UpdateApplicationStatusCommandValidator _validator;

    public UpdateApplicationStatusCommandValidatorTests()
    {
        _validator = new UpdateApplicationStatusCommandValidator();
    }

    [Fact]
    public async Task Validate_EmptyId_FailsValidation()
    {
        var command = new UpdateApplicationStatusCommand
        {
            Id = Guid.Empty,
            Status = "Evaluating",
        };

        var result = await _validator.ValidateAsync(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Id");
    }

    [Fact]
    public async Task Validate_InvalidStatus_FailsValidation()
    {
        var command = new UpdateApplicationStatusCommand
        {
            Id = Guid.NewGuid(),
            Status = "NonExistentStatus",
        };

        var result = await _validator.ValidateAsync(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Status");
    }

    [Fact]
    public async Task Validate_ReturnedStatus_WithoutRemarks_FailsValidation()
    {
        var command = new UpdateApplicationStatusCommand
        {
            Id = Guid.NewGuid(),
            Status = "Returned",
            Remarks = "",
        };

        var result = await _validator.ValidateAsync(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Remarks" && e.ErrorMessage.Contains("return reason"));
    }

    [Fact]
    public async Task Validate_ReturnedStatus_WithWhitespaceRemarks_FailsValidation()
    {
        var command = new UpdateApplicationStatusCommand
        {
            Id = Guid.NewGuid(),
            Status = "Returned",
            Remarks = "   ",
        };

        var result = await _validator.ValidateAsync(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Remarks" && e.ErrorMessage.Contains("return reason"));
    }

    [Fact]
    public async Task Validate_ReturnedAction_WithoutRemarks_FailsValidation()
    {
        var command = new UpdateApplicationStatusCommand
        {
            Id = Guid.NewGuid(),
            Status = "Evaluating",
            Action = "Returned to Evaluator",
            Remarks = null,
        };

        var result = await _validator.ValidateAsync(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Remarks" && e.ErrorMessage.Contains("return reason"));
    }

    [Fact]
    public async Task Validate_ReturnedStatus_WithValidRemarks_PassesValidation()
    {
        var command = new UpdateApplicationStatusCommand
        {
            Id = Guid.NewGuid(),
            Status = "Returned",
            Remarks = "Notice of Discrepancy: Missing photo attachment and unclear proof of address.",
        };

        var result = await _validator.ValidateAsync(command);

        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task Validate_EvaluatingStatus_WithoutRemarks_PassesValidation()
    {
        var command = new UpdateApplicationStatusCommand
        {
            Id = Guid.NewGuid(),
            Status = "Evaluating",
            Remarks = null,
        };

        var result = await _validator.ValidateAsync(command);

        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }
}
