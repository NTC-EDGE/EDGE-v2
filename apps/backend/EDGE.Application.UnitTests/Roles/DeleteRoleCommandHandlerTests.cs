using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Roles.Commands;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Roles;

public class DeleteRoleCommandHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly DeleteRoleCommandHandler _handler;

    public DeleteRoleCommandHandlerTests()
    {
        _handler = new DeleteRoleCommandHandler(
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

        var result = await _handler.Handle(new DeleteRoleCommand(roleId), CancellationToken.None);
        result.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidOperationException_WhenAttemptingToDeleteStandardRole()
    {
        var roleId = Guid.NewGuid();
        var standardRole = new Role { Id = roleId, Name = "Cashier", TenantId = null, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(standardRole);

        Func<Task> act = async () => await _handler.Handle(new DeleteRoleCommand(roleId), CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Standard system roles cannot be deleted*");
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenDeletingRoleOfAnotherTenant()
    {
        var roleId = Guid.NewGuid();
        var foreignTenantId = Guid.NewGuid();
        var foreignRole = new Role { Id = roleId, Name = "Foreign Role", TenantId = foreignTenantId, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(foreignRole);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(foreignTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("You are only authorized to delete roles belonging to your own regional tenant."));

        Func<Task> act = async () => await _handler.Handle(new DeleteRoleCommand(roleId), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*own regional tenant*");
    }

    [Fact]
    public async Task Handle_ShouldDeleteCustomRole_WhenBelongsToOwnTenant()
    {
        var roleId = Guid.NewGuid();
        var ownTenantId = Guid.NewGuid();
        var ownRole = new Role { Id = roleId, Name = "Own Custom Role", TenantId = ownTenantId, IsSystemRole = false };
        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ownRole);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(ownTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await _handler.Handle(new DeleteRoleCommand(roleId), CancellationToken.None);

        result.Should().BeTrue();
        _roleRepositoryMock.Verify(r => r.Delete(ownRole), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
