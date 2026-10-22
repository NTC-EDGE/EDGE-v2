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

public class DuplicateRoleCommandValidatorTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly DuplicateRoleCommandValidator _validator;

    public DuplicateRoleCommandValidatorTests()
    {
        _validator = new DuplicateRoleCommandValidator(_roleRepositoryMock.Object);
    }

    [Fact]
    public async Task Validate_ShouldPass_WhenRoleNameIsUniqueInTargetTenant()
    {
        // Arrange
        var sourceRoleId = Guid.NewGuid();
        var targetTenantId = Guid.NewGuid();
        var command = new DuplicateRoleCommand(sourceRoleId, "Regional Evaluator", "regional_evaluator", "Desc", targetTenantId);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Regional Evaluator", targetTenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _validator.TestValidateAsync(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenRoleNameAlreadyExistsInTargetTenantOrStandard()
    {
        // Arrange
        var sourceRoleId = Guid.NewGuid();
        var targetTenantId = Guid.NewGuid();
        var command = new DuplicateRoleCommand(sourceRoleId, "Administrator", "admin", "Desc", targetTenantId);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Administrator", targetTenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _validator.TestValidateAsync(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("A role with this name already exists in this tenant or as a standard role.");
    }
}
