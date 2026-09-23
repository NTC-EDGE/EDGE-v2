using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.RolePermissions.Commands;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.RolePermissions;

public class AssignPermissionCommandHandlerTests
{
    private readonly Mock<IRolePermissionRepository> _rolePermissionRepositoryMock = new();
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly AssignPermissionCommandHandler _handler;

    public AssignPermissionCommandHandlerTests()
    {
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _handler = new AssignPermissionCommandHandler(
            _rolePermissionRepositoryMock.Object,
            _roleRepositoryMock.Object,
            _tenantContextServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFalse_WhenRoleNotFound()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Role?)null);

        var command = new AssignPermissionCommand(roleId, Permissions.ReadRoles);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
        _rolePermissionRepositoryMock.Verify(rp => rp.AddAsync(It.IsAny<RolePermission>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenPermissionKeyIsInvalid()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Id = roleId, Name = "Test Role" });

        var command = new AssignPermissionCommand(roleId, "invalid.permission.key");

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not a valid system permission*");
    }

    [Fact]
    public async Task Handle_ShouldAddNewPermission_WhenNoExistingRecordExists()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Id = roleId, Name = "Test Role" });

        _rolePermissionRepositoryMock
            .Setup(rp => rp.GetAsync(roleId, Permissions.ReadRoles, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync((RolePermission?)null);

        var command = new AssignPermissionCommand(roleId, Permissions.ReadRoles);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _rolePermissionRepositoryMock.Verify(rp => rp.AddAsync(
            It.Is<RolePermission>(p => p.RoleId == roleId && p.PermissionKey == Permissions.ReadRoles),
            It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldRestoreSoftDeletedPermission_WhenRecordWasPreviouslyDeleted()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var existingDeleted = new RolePermission
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            PermissionKey = Permissions.ReadRoles,
            IsDeleted = true,
            IsDeletedBy = "test_user"
        };

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Id = roleId, Name = "Test Role" });

        _rolePermissionRepositoryMock
            .Setup(rp => rp.GetAsync(roleId, Permissions.ReadRoles, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDeleted);

        var command = new AssignPermissionCommand(roleId, Permissions.ReadRoles);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        existingDeleted.IsDeleted.Should().BeFalse();
        existingDeleted.IsDeletedBy.Should().BeEmpty();
        _rolePermissionRepositoryMock.Verify(rp => rp.AddAsync(It.IsAny<RolePermission>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldReturnTrue_WithoutModifying_WhenPermissionAlreadyActive()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var existingActive = new RolePermission
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            PermissionKey = Permissions.ReadRoles,
            IsDeleted = false
        };

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Id = roleId, Name = "Test Role" });

        _rolePermissionRepositoryMock
            .Setup(rp => rp.GetAsync(roleId, Permissions.ReadRoles, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingActive);

        var command = new AssignPermissionCommand(roleId, Permissions.ReadRoles);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _rolePermissionRepositoryMock.Verify(rp => rp.AddAsync(It.IsAny<RolePermission>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenNonSuperAdminAttemptsToModifyStandardRole()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var standardRole = new Role { Id = roleId, Name = "Evaluator", TenantId = null, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(standardRole);

        var command = new AssignPermissionCommand(roleId, Permissions.ReadRoles);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Standard system roles cannot be modified*");
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenTenantAdminAttemptsToModifyRoleOfAnotherTenant()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var foreignTenantId = Guid.NewGuid();
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(foreignTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("You are only authorized to assign permissions to roles belonging to your own regional tenant."));

        var foreignTenantRole = new Role { Id = roleId, Name = "Foreign Custom Role", TenantId = foreignTenantId, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(foreignTenantRole);

        var command = new AssignPermissionCommand(roleId, Permissions.ReadRoles);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*own regional tenant*");
    }

    [Fact]
    public async Task Handle_ShouldAllowAssignment_WhenTenantAdminModifiesOwnTenantRole()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var ownTenantId = Guid.NewGuid();
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(ownTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var ownTenantRole = new Role { Id = roleId, Name = "Custom Local Role", TenantId = ownTenantId, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ownTenantRole);

        _rolePermissionRepositoryMock
            .Setup(rp => rp.GetAsync(roleId, Permissions.ReadRoles, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync((RolePermission?)null);

        var command = new AssignPermissionCommand(roleId, Permissions.ReadRoles);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _rolePermissionRepositoryMock.Verify(rp => rp.AddAsync(
            It.Is<RolePermission>(p => p.RoleId == roleId && p.PermissionKey == Permissions.ReadRoles),
            It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
