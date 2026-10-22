using System;
using FluentValidation.TestHelper;
using Xunit;
using EDGE.Application.Tenants.Commands;

namespace EDGE.Application.UnitTests.Tenants;

public class CreateTenantCommandValidatorTests
{
    private readonly CreateTenantCommandValidator _validator = new();

    [Fact]
    public void Validate_ShouldPass_WhenValidCommand()
    {
        // Arrange
        var command = new CreateTenantCommand("Valid Tenant", "NTC-VAL", "Description", Guid.NewGuid());

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_ShouldFail_WhenNameOrCodeOrRegionIsEmpty()
    {
        // Arrange
        var command = new CreateTenantCommand("", "", null, Guid.Empty);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
        result.ShouldHaveValidationErrorFor(x => x.Code);
        result.ShouldHaveValidationErrorFor(x => x.RegionId);
    }
}
