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

public class RevokePermissionCommandHandlerTests
{
    private readonly Mock<IRolePermissionRepository> _rolePermissionRepositoryMock = new();
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly RevokePermissionCommandHandler _handler;

    public RevokePermissionCommandHandlerTests()
    {
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _handler = new RevokePermissionCommandHandler(
            _rolePermissionRepositoryMock.Object,
            _roleRepositoryMock.Object,
            _tenantContextServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFalse_WhenRoleNotFound()
    {
        var roleId = Guid.NewGuid();
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Role?)null);

        var command = new RevokePermissionCommand(roleId, Permissions.ReadRoles);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenNonSuperAdminAttemptsToRevokeFromStandardRole()
    {
        var roleId = Guid.NewGuid();
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var standardRole = new Role { Id = roleId, Name = "Evaluator", TenantId = null, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(standardRole);

        var command = new RevokePermissionCommand(roleId, Permissions.ReadRoles);
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Standard system roles cannot be modified*");
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenTenantAdminRevokesFromAnotherTenantRole()
    {
        var roleId = Guid.NewGuid();
        var foreignTenantId = Guid.NewGuid();
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(foreignTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("You are only authorized to revoke permissions from roles belonging to your own regional tenant."));

        var foreignRole = new Role { Id = roleId, Name = "Foreign Custom Role", TenantId = foreignTenantId, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(foreignRole);

        var command = new RevokePermissionCommand(roleId, Permissions.ReadRoles);
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*own regional tenant*");
    }

    [Fact]
    public async Task Handle_ShouldRevokePermission_WhenTenantAdminModifiesOwnTenantRole()
    {
        var roleId = Guid.NewGuid();
        var ownTenantId = Guid.NewGuid();
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(ownTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var ownRole = new Role { Id = roleId, Name = "Own Role", TenantId = ownTenantId, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ownRole);

        var existing = new RolePermission { RoleId = roleId, PermissionKey = Permissions.ReadRoles };
        _rolePermissionRepositoryMock
            .Setup(rp => rp.GetAsync(roleId, Permissions.ReadRoles, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var command = new RevokePermissionCommand(roleId, Permissions.ReadRoles);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeTrue();
        _rolePermissionRepositoryMock.Verify(rp => rp.Delete(existing), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
