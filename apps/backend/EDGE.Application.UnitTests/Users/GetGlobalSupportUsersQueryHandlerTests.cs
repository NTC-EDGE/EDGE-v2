using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Users.Queries.GetGlobalSupportUsers;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Users;

public class GetGlobalSupportUsersQueryHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly GetGlobalSupportUsersQueryHandler _handler;

    public GetGlobalSupportUsersQueryHandlerTests()
    {
        _handler = new GetGlobalSupportUsersQueryHandler(_userRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnMappedGlobalSupportUsers()
    {
        var tenantId = Guid.NewGuid();
        var testUsers = new List<User>
        {
            new()
            {
                Id = Guid.NewGuid(),
                FirstName = "Maria",
                LastName = "Santos",
                Email = "maria@example.com",
                IsSuperAdmin = false,
                TenantMemberships = new List<TenantMember>
                {
                    new()
                    {
                        TenantId = tenantId,
                        Tenant = new Tenant { Id = tenantId, Name = "Region IV-A" },
                        Role = new Role { Id = Guid.NewGuid(), Key = "support", Name = "Support Specialist" }
                    }
                }
            }
        };

        _userRepositoryMock
            .Setup(r => r.GetPaginatedUsersAsync(1, 1000, "Maria", tenantId, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((testUsers, 1));

        var query = new GetGlobalSupportUsersQuery(Search: "Maria", TenantId: tenantId.ToString(), RegionId: null);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result[0].FirstName.Should().Be("Maria");
        result[0].TenantName.Should().Be("Region IV-A");
        result[0].AssignedRoles.Should().Contain("Support Specialist");
    }

    [Fact]
    public async Task Handle_ShouldFallbackToSuperAdminRole_WhenNoTenantMemberships()
    {
        var testUsers = new List<User>
        {
            new()
            {
                Id = Guid.NewGuid(),
                FirstName = "Root",
                LastName = "Admin",
                Email = "admin@example.com",
                IsSuperAdmin = true,
                TenantMemberships = new List<TenantMember>()
            }
        };

        _userRepositoryMock
            .Setup(r => r.GetPaginatedUsersAsync(1, 1000, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((testUsers, 1));

        var query = new GetGlobalSupportUsersQuery(Search: null, TenantId: null, RegionId: null);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result[0].AssignedRoles.Should().Contain("SUPER_ADMIN");
    }
}
