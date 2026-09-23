using System;
using System.Collections.Generic;
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

public class DuplicateRoleCommandHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<IRolePermissionRepository> _rolePermissionRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly DuplicateRoleCommandHandler _handler;

    public DuplicateRoleCommandHandlerTests()
    {
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _handler = new DuplicateRoleCommandHandler(
            _roleRepositoryMock.Object,
            _rolePermissionRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _tenantContextServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldDuplicateRole_WhenNameIsUnique()
    {
        // Arrange
        var sourceRoleId = Guid.NewGuid();
        var targetTenantId = Guid.NewGuid();
        var sourceRole = new Role { Id = sourceRoleId, Name = "Source Role", Description = "Desc", Key = "source_role" };
        var targetTenant = new Tenant { Id = targetTenantId, Name = "Target Tenant", Code = "TARGET" };
        var command = new DuplicateRoleCommand(sourceRoleId, "Duplicated Role", "dup_role", "New Desc", targetTenantId);

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(sourceRoleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sourceRole);

        _tenantRepositoryMock
            .Setup(t => t.GetByIdAsync(targetTenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(targetTenant);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Duplicated Role", targetTenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _rolePermissionRepositoryMock
            .Setup(rp => rp.GetPermissionKeysForRoleAsync(sourceRoleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<string> { "roles.read" });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Duplicated Role");
        result.TenantId.Should().Be(targetTenantId);

        _roleRepositoryMock.Verify(r => r.AddAsync(It.Is<Role>(role => role.Name == "Duplicated Role" && role.TenantId == targetTenantId), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidOperationException_WhenRoleNameAlreadyExists()
    {
        // Arrange
        var sourceRoleId = Guid.NewGuid();
        var targetTenantId = Guid.NewGuid();
        var sourceRole = new Role { Id = sourceRoleId, Name = "Source Role", Key = "source_role" };
        var targetTenant = new Tenant { Id = targetTenantId, Name = "Target Tenant", Code = "TARGET" };
        var command = new DuplicateRoleCommand(sourceRoleId, "Existing Name", "dup_role", null, targetTenantId);

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(sourceRoleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sourceRole);

        _tenantRepositoryMock
            .Setup(t => t.GetByIdAsync(targetTenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(targetTenant);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Existing Name", targetTenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists in this tenant or as a standard role*");

        _roleRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Role>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
