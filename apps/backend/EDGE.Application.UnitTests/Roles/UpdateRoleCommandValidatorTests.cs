using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FluentValidation.TestHelper;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Roles.Commands;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Roles;

public class UpdateRoleCommandValidatorTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly UpdateRoleCommandValidator _validator;

    public UpdateRoleCommandValidatorTests()
    {
        _validator = new UpdateRoleCommandValidator(_roleRepositoryMock.Object);
    }

    [Fact]
    public async Task Validate_ShouldPass_WhenRoleNameIsUnchangedOrUnique()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var role = new Role { Id = roleId, Name = "Current Role", TenantId = tenantId };
        var command = new UpdateRoleCommand(roleId, "Updated Role Name", "updated_key");

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(role);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Updated Role Name", tenantId, roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _validator.TestValidateAsync(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenUpdatedNameMatchesExistingRoleInTenantOrStandard()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var role = new Role { Id = roleId, Name = "Current Role", TenantId = tenantId };
        var command = new UpdateRoleCommand(roleId, "Evaluator", "evaluator");

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(role);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Evaluator", tenantId, roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _validator.TestValidateAsync(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("A role with this name already exists in this tenant or as a standard role.");
    }
}
