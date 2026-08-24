using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FluentValidation.TestHelper;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Roles.Commands;

namespace EDGE.Application.UnitTests.Roles;

public class CreateRoleCommandValidatorTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly CreateRoleCommandValidator _validator;

    public CreateRoleCommandValidatorTests()
    {
        _validator = new CreateRoleCommandValidator(_roleRepositoryMock.Object);
    }

    [Fact]
    public async Task Validate_ShouldPass_WhenRoleNameIsUnique()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateRoleCommand("Custom Evaluator", "custom_evaluator", "Desc", tenantId, false);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Custom Evaluator", tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _validator.TestValidateAsync(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenRoleNameAlreadyExistsInTenantOrStandard()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateRoleCommand("Evaluator", "evaluator", "Desc", tenantId, false);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Evaluator", tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _validator.TestValidateAsync(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("A role with this name already exists in this tenant or as a standard role.");
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenNameIsEmpty()
    {
        // Arrange
        var command = new CreateRoleCommand("", "key", null, null, false);

        // Act
        var result = await _validator.TestValidateAsync(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenKeyIsEmpty()
    {
        // Arrange
        var command = new CreateRoleCommand("Valid Name", "", null, null, false);

        // Act
        var result = await _validator.TestValidateAsync(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Key);
    }
}
