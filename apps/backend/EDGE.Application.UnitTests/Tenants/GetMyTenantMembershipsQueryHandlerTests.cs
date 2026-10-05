using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.TenantMembers.Queries;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Tenants;

public class GetMyTenantMembershipsQueryHandlerTests
{
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<IGeographicRepository> _geographicRepositoryMock = new();
    private readonly GetMyTenantMembershipsQueryHandler _handler;

    private readonly Region _ncrRegion = new() { Id = Guid.NewGuid(), Code = "NCR", Name = "National Capital Region", IsActive = true };
    private readonly Region _reg3Region = new() { Id = Guid.NewGuid(), Code = "R03", Name = "Central Luzon", IsActive = true };
    private readonly Tenant _ncrTenant;
    private readonly Tenant _reg3Tenant;

    public GetMyTenantMembershipsQueryHandlerTests()
    {
        _ncrTenant = new Tenant { Id = Guid.NewGuid(), Name = "NTC Regional Office - NCR", Code = "NCR", RegionId = _ncrRegion.Id, IsActive = true };
        _reg3Tenant = new Tenant { Id = Guid.NewGuid(), Name = "NTC Regional Office - Region 3", Code = "R03", RegionId = _reg3Region.Id, IsActive = true };

        _geographicRepositoryMock
            .Setup(g => g.GetRegionsAsync(true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Region> { _ncrRegion, _reg3Region });

        _tenantRepositoryMock
            .Setup(t => t.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tenant> { _ncrTenant, _reg3Tenant });

        _handler = new GetMyTenantMembershipsQueryHandler(
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _geographicRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnAllActiveRegionalTenants_WhenUserIsSuperAdminWithoutExplicitMemberships()
    {
        // Arrange
        var superAdminUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_superadmin_123",
            Email = "superadmin@ntcedge.com",
            IsSuperAdmin = true
        };

        _currentUserServiceMock.Setup(c => c.UserId).Returns(superAdminUser.AuthUserId);
        _currentUserServiceMock.Setup(c => c.Email).Returns(superAdminUser.Email);
        _currentUserServiceMock.Setup(c => c.IsSuperAdminClaim).Returns(true);

        _userRepositoryMock
            .Setup(u => u.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(superAdminUser);

        // Superadmin has 0 explicit tenant memberships
        _tenantMemberRepositoryMock
            .Setup(m => m.GetMembersByUserAsync(superAdminUser.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TenantMember>());

        // Act
        var result = await _handler.Handle(new GetMyTenantMembershipsQuery(), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().HaveCount(2, "SuperAdmin should have access to all active regional offices");
        result.Data.Should().Contain(m => m.RegionCode == "NCR");
        result.Data.Should().Contain(m => m.RegionCode == "R03");
    }

    [Fact]
    public async Task Handle_ShouldReturnOnlyAssignedRegion_WhenUserIsRegularStaff()
    {
        // Arrange
        var staffUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_staff_456",
            Email = "staff@ntc.gov.ph",
            IsSuperAdmin = false
        };

        _currentUserServiceMock.Setup(c => c.UserId).Returns(staffUser.AuthUserId);
        _currentUserServiceMock.Setup(c => c.Email).Returns(staffUser.Email);
        _currentUserServiceMock.Setup(c => c.IsSuperAdminClaim).Returns(false);

        _userRepositoryMock
            .Setup(u => u.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(staffUser);

        // Regular staff is only assigned to Region 3
        _tenantMemberRepositoryMock
            .Setup(m => m.GetMembersByUserAsync(staffUser.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TenantMember>
            {
                new() { Id = Guid.NewGuid(), TenantId = _reg3Tenant.Id, UserId = staffUser.Id }
            });

        // Act
        var result = await _handler.Handle(new GetMyTenantMembershipsQuery(), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().HaveCount(1, "Regular staff should only receive their assigned regional office");
        result.Data![0].RegionCode.Should().Be("R03");
        result.Data[0].TenantId.Should().Be(_reg3Tenant.Id);
    }
}
