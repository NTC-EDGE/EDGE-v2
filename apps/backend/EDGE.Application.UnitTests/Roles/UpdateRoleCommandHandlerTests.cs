using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Roles.Commands;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;

namespace EDGE.Application.UnitTests.Roles;

public class UpdateRoleCommandHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly UpdateRoleCommandHandler _handler;

    public UpdateRoleCommandHandlerTests()
    {
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _handler = new UpdateRoleCommandHandler(
            _roleRepositoryMock.Object,
            _tenantContextServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldUpdateRole_WhenNameIsUnique()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var role = new Role { Id = roleId, Name = "Original Name", Key = "original_key", TenantId = tenantId };
        var command = new UpdateRoleCommand(roleId, "New Name", "new_key");

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(role);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("New Name", tenantId, roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("New Name");
        result.Key.Should().Be("new_key");

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidOperationException_WhenNameAlreadyExists()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var role = new Role { Id = roleId, Name = "Original Name", Key = "original_key", TenantId = tenantId };
        var command = new UpdateRoleCommand(roleId, "Admin", "admin");

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(role);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Admin", tenantId, roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists in this tenant or as a standard role*");

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldReturnNull_WhenRoleNotFound()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var command = new UpdateRoleCommand(roleId, "Non-existent", "key");

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Role?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenNonSuperAdminAttemptsToUpdateStandardRole()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var command = new UpdateRoleCommand(roleId, "Renamed Admin", "renamed_admin");

        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var standardRole = new Role { Id = roleId, Name = "Administrator", TenantId = null, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(standardRole);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Standard system roles cannot be modified*");
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenTenantAdminUpdatesRoleOfAnotherTenant()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var foreignTenantId = Guid.NewGuid();
        var command = new UpdateRoleCommand(roleId, "Updated Foreign Role", "upd_foreign");

        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(foreignTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("You are only authorized to update roles belonging to your own regional tenant."));

        var foreignRole = new Role { Id = roleId, Name = "Foreign Role", TenantId = foreignTenantId, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(foreignRole);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*own regional tenant*");
    }
}
