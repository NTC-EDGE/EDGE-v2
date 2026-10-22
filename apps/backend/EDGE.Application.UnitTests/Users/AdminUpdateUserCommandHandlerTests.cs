using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Users.Commands.UpdateUser;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;

namespace EDGE.Application.UnitTests.Users;

public class AdminUpdateUserCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<IClerkUserService> _clerkUserServiceMock = new();
    private readonly Mock<ILogger<AdminUpdateUserCommandHandler>> _loggerMock = new();

    private readonly AdminUpdateUserCommandHandler _handler;

    public AdminUpdateUserCommandHandlerTests()
    {
        _tenantContextServiceMock
            .Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _handler = new AdminUpdateUserCommandHandler(
            _userRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _roleRepositoryMock.Object,
            _tenantContextServiceMock.Object,
            _unitOfWorkMock.Object,
            _clerkUserServiceMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnNull_WhenUserNotFound()
    {
        var userId = Guid.NewGuid();
        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var command = new AdminUpdateUserCommand(userId, "John", "Doe");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenRevokingSoleRemainingSuperAdmin()
    {
        var userId = Guid.NewGuid();
        var user = new User { Id = userId, FirstName = "Sole", LastName = "Admin", IsSuperAdmin = true };

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _userRepositoryMock
            .Setup(r => r.CountSuperAdminsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new AdminUpdateUserCommand(userId, "Sole", "Admin", IsSuperAdmin: false);

        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Cannot revoke SuperAdmin privilege from the sole remaining SuperAdmin*");
    }

    [Fact]
    public async Task Handle_ShouldRevokeSuperAdmin_WhenMultipleSuperAdminsExist()
    {
        var userId = Guid.NewGuid();
        var user = new User { Id = userId, FirstName = "One", LastName = "Admin", IsSuperAdmin = true };

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _userRepositoryMock
            .Setup(r => r.CountSuperAdminsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        var command = new AdminUpdateUserCommand(userId, "One", "Admin", IsSuperAdmin: false);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result!.IsSuperAdmin.Should().BeFalse();
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
