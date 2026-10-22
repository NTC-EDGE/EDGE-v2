using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Users.Queries;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Users;

public class GetUsersQueryHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly GetUsersQueryHandler _handler;

    public GetUsersQueryHandlerTests()
    {
        _handler = new GetUsersQueryHandler(_userRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnPaginatedResponse_WithMappedDto()
    {
        var tenantId = Guid.NewGuid();
        var testUsers = new List<User>
        {
            new()
            {
                Id = Guid.NewGuid(),
                FirstName = "Juan",
                LastName = "Dela Cruz",
                Email = "juan@example.com",
                IsSuperAdmin = false,
                TenantMemberships = new List<TenantMember>
                {
                    new()
                    {
                        TenantId = tenantId,
                        Tenant = new Tenant { Id = tenantId, Name = "Region VII" },
                        Role = new Role { Id = Guid.NewGuid(), Key = "admin", Name = "Administrator" }
                    }
                }
            }
        };

        _userRepositoryMock
            .Setup(r => r.GetPaginatedUsersAsync(1, 20, "Juan", tenantId, null, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync((testUsers, 1));

        var query = new GetUsersQuery(1, 20, "Juan", tenantId, null, true);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data[0].FirstName.Should().Be("Juan");
        result.Data[0].TenantMemberships.Should().HaveCount(1);
        result.Data[0].TenantMemberships[0].TenantName.Should().Be("Region VII");
        result.TotalCount.Should().Be(1);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(20);
    }

    [Fact]
    public async Task Handle_ShouldClampPageSizeAndPageNumberDefaults()
    {
        _userRepositoryMock
            .Setup(r => r.GetPaginatedUsersAsync(1, 50, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<User>(), 0));

        var query = new GetUsersQuery(0, -5, null, null, null, null);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(50);
    }
}
