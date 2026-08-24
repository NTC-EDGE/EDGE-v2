using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Users.Commands.AdminCreateUser;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Users;

public class AdminCreateUserCommandHandlerTests
{
    private readonly Mock<IClerkUserService> _clerkUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserAuthorizationService> _userAuthorizationServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ILogger<AdminCreateUserCommandHandler>> _loggerMock = new();

    private readonly AdminCreateUserCommandHandler _handler;

    public AdminCreateUserCommandHandlerTests()
    {
        _handler = new AdminCreateUserCommandHandler(
            _clerkUserServiceMock.Object,
            _userRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _roleRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _tenantContextServiceMock.Object,
            _currentUserServiceMock.Object,
            _userAuthorizationServiceMock.Object,
            _unitOfWorkMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreateUserInClerkAndDatabase_WhenCallerIsAuthorized()
    {
        // Arrange
        var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var role = new Role { Id = Guid.NewGuid(), Key = "evaluator", Name = "Evaluator" };

        _userAuthorizationServiceMock
            .Setup(u => u.HasRoleAsync("superadmin", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _roleRepositoryMock
            .Setup(r => r.GetByKeyAsync("evaluator", It.IsAny<CancellationToken>()))
            .ReturnsAsync(role);

        _clerkUserServiceMock
            .Setup(c => c.GetUsersByEmailAsync("new.evaluator@ntc.gov.ph"))
            .ReturnsAsync(new List<ClerkUserResponse>());

        var createdClerkUser = new ClerkUserResponse
        {
            Id = "user_clerk123",
            FirstName = "Maria",
            LastName = "Santos",
            EmailAddresses = new List<ClerkEmailAddress>
            {
                new() { Id = "email_1", EmailAddress = "new.evaluator@ntc.gov.ph" }
            }
        };

        _clerkUserServiceMock
            .Setup(c => c.CreateUserAsync(It.IsAny<CreateClerkUserPayload>()))
            .ReturnsAsync(createdClerkUser);

        _userRepositoryMock
            .Setup(u => u.GetByEmailAsync("new.evaluator@ntc.gov.ph", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var command = new AdminCreateUserCommand(
            Email: "new.evaluator@ntc.gov.ph",
            FirstName: "Maria",
            LastName: "Santos",
            RoleKey: "evaluator",
            TenantId: tenantId,
            Division: "Licensing & Registration Division",
            Position: "Technical Evaluator II"
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.AuthUserId.Should().Be("user_clerk123");
        result.Email.Should().Be("new.evaluator@ntc.gov.ph");
        result.FirstName.Should().Be("Maria");
        result.LastName.Should().Be("Santos");
        result.RoleKey.Should().Be("evaluator");
        result.InvitationSent.Should().BeTrue();

        _clerkUserServiceMock.Verify(c => c.CreateUserAsync(It.Is<CreateClerkUserPayload>(p =>
            p.EmailAddress == "new.evaluator@ntc.gov.ph" &&
            p.FirstName == "Maria" &&
            p.LastName == "Santos"
        )), Times.Once);

        _clerkUserServiceMock.Verify(c => c.CreateInvitationAsync(It.Is<CreateClerkInvitationPayload>(p =>
            p.EmailAddress == "new.evaluator@ntc.gov.ph" &&
            p.Notify == true
        )), Times.Once);

        _userRepositoryMock.Verify(u => u.AddAsync(It.Is<User>(user =>
            user.AuthUserId == "user_clerk123" &&
            user.Email == "new.evaluator@ntc.gov.ph"
        ), It.IsAny<CancellationToken>()), Times.Once);

        _tenantMemberRepositoryMock.Verify(m => m.AddAsync(It.Is<TenantMember>(member =>
            member.TenantId == tenantId &&
            member.RoleId == role.Id &&
            member.Division == "Licensing & Registration Division"
        ), It.IsAny<CancellationToken>()), Times.Once);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCallerHasNoPermissions()
    {
        // Arrange
        _userAuthorizationServiceMock
            .Setup(u => u.HasRoleAsync("superadmin", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _userAuthorizationServiceMock
            .Setup(u => u.HasPermissionAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new AdminCreateUserCommand(
            Email: "unauth@ntc.gov.ph",
            FirstName: "Unauthorized",
            LastName: "User"
        );

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*You do not have permission to create users.*");
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenNonSuperAdminTriesToCreateSuperAdmin()
    {
        // Arrange
        _userAuthorizationServiceMock
            .Setup(u => u.HasRoleAsync("superadmin", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _userAuthorizationServiceMock
            .Setup(u => u.HasPermissionAsync(Permissions.ManageUsers, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new AdminCreateUserCommand(
            Email: "superadmin.wannabe@ntc.gov.ph",
            FirstName: "Wannabe",
            LastName: "Admin",
            IsSuperAdmin: true
        );

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Only Super Administrators can create or grant SuperAdmin privileges.*");
    }
}
