using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Users.Commands.SyncClerkUsers;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Users;

public class SyncClerkUsersCommandHandlerTests
{
    private readonly Mock<IClerkUserService> _clerkUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<IUserAuthorizationService> _userAuthorizationServiceMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ILogger<SyncClerkUsersCommandHandler>> _loggerMock = new();

    private readonly SyncClerkUsersCommandHandler _handler;

    public SyncClerkUsersCommandHandlerTests()
    {
        _handler = new SyncClerkUsersCommandHandler(
            _clerkUserServiceMock.Object,
            _userRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _roleRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _userAuthorizationServiceMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldSyncClerkUsersAndCreateMissingLocalUsers_WhenAuthorized()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var defaultTenant = new Tenant { Id = tenantId, Name = "National Capital Region", IsActive = true };
        var evaluatorRole = new Role { Id = Guid.NewGuid(), Key = "evaluator", Name = "Evaluator" };
        var superAdminRole = new Role { Id = Guid.NewGuid(), Key = "superadmin", Name = "Super Admin" };

        _userAuthorizationServiceMock
            .Setup(u => u.HasRoleAsync(SystemRoles.SuperAdmin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _tenantRepositoryMock
            .Setup(t => t.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tenant> { defaultTenant });

        _roleRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Role> { evaluatorRole, superAdminRole });

        _userRepositoryMock
            .Setup(u => u.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User>());

        using var metaDoc = JsonDocument.Parse("{\"is_super_admin\": true, \"role\": \"superadmin\"}");
        var clerkUsers = new List<ClerkUserResponse>
        {
            new()
            {
                Id = "user_clerk_super",
                FirstName = "Admin",
                LastName = "NTC",
                EmailAddresses = new List<ClerkEmailAddress>
                {
                    new() { Id = "em_1", EmailAddress = "superadmin@ntc.gov.ph" }
                },
                PublicMetadata = metaDoc.RootElement.Clone()
            }
        };

        _clerkUserServiceMock
            .Setup(c => c.GetAllUsersAsync(500, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(clerkUsers);

        var command = new SyncClerkUsersCommand();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalClerkUsers.Should().Be(1);
        result.CreatedUsers.Should().Be(1);
        result.UpdatedUsers.Should().Be(0);
        result.TenantMembershipsCreated.Should().Be(1);
        result.SyncedUsers.Should().HaveCount(1);
        result.SyncedUsers[0].Email.Should().Be("superadmin@ntc.gov.ph");
        result.SyncedUsers[0].IsSuperAdmin.Should().BeTrue();

        _userRepositoryMock.Verify(u => u.AddAsync(It.Is<User>(user =>
            user.AuthUserId == "user_clerk_super" &&
            user.Email == "superadmin@ntc.gov.ph" &&
            user.IsSuperAdmin == true
        ), It.IsAny<CancellationToken>()), Times.Once);

        _tenantMemberRepositoryMock.Verify(m => m.AddAsync(It.Is<TenantMember>(tm =>
            tm.TenantId == tenantId &&
            tm.RoleId == superAdminRole.Id
        ), It.IsAny<CancellationToken>()), Times.Once);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCallerLacksPermission()
    {
        // Arrange
        _userAuthorizationServiceMock
            .Setup(u => u.HasRoleAsync(SystemRoles.SuperAdmin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _userAuthorizationServiceMock
            .Setup(u => u.HasPermissionAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new SyncClerkUsersCommand();

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*You do not have permission to sync users from Clerk.*");
    }
}
