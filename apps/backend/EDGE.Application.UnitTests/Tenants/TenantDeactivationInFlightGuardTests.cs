using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.Commands;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Tenants;

public class TenantDeactivationInFlightGuardTests
{
    private readonly Mock<ITenantRepository> _mockTenantRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;

    public TenantDeactivationInFlightGuardTests()
    {
        _mockTenantRepo = new Mock<ITenantRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
    }

    [Fact]
    public async Task ToggleTenantActive_WhenDeactivatingTenantWithInFlightApplications_ThrowsInvalidOperationExceptionWithBreakdown()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "NTC Region X - Northern Mindanao",
            Code = "NTC-R10",
            IsActive = true,
            RegionId = Guid.NewGuid()
        };

        _mockTenantRepo.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        _mockTenantRepo.Setup(r => r.GetInFlightApplicationCountsByStatusAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<ApplicationStatus, int>
            {
                { ApplicationStatus.Evaluating, 2 },
                { ApplicationStatus.ForAccountant, 1 },
                { ApplicationStatus.PendingPayment, 1 }
            });

        var handler = new ToggleTenantActiveCommandHandler(_mockTenantRepo.Object, _mockUnitOfWork.Object);

        // Act
        var act = async () => await handler.Handle(new ToggleTenantActiveCommand(tenantId), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Cannot deactivate Regional Office 'NTC Region X - Northern Mindanao' while 4 application(s) are actively in-flight*")
            .WithMessage("*2 Under Evaluation*")
            .WithMessage("*1 With Accountant for SOA Review*")
            .WithMessage("*1 Pending Cashier Payment / Collection*");

        tenant.IsActive.Should().BeTrue();
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ToggleTenantActive_WhenDeactivatingTenantWithZeroInFlightApplications_DeactivatesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "NTC Region X - Northern Mindanao",
            Code = "NTC-R10",
            IsActive = true,
            RegionId = Guid.NewGuid()
        };

        _mockTenantRepo.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        _mockTenantRepo.Setup(r => r.GetInFlightApplicationCountsByStatusAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<ApplicationStatus, int>());

        var handler = new ToggleTenantActiveCommandHandler(_mockTenantRepo.Object, _mockUnitOfWork.Object);

        // Act
        var result = await handler.Handle(new ToggleTenantActiveCommand(tenantId), CancellationToken.None);

        // Assert
        result.IsActive.Should().BeFalse();
        tenant.IsActive.Should().BeFalse();
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateTenant_WhenChangingActiveToInactiveWithInFlightApplications_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var regionId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "NTC-NCR",
            Code = "NTC-NCR",
            IsActive = true,
            RegionId = regionId
        };

        _mockTenantRepo.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        _mockTenantRepo.Setup(r => r.GetInFlightApplicationCountsByStatusAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<ApplicationStatus, int>
            {
                { ApplicationStatus.Returned, 1 },
                { ApplicationStatus.ForIssuance, 1 }
            });

        var handler = new UpdateTenantCommandHandler(_mockTenantRepo.Object, _mockUnitOfWork.Object);
        var command = new UpdateTenantCommand(
            Id: tenantId,
            Name: "NTC-NCR",
            Code: "NTC-NCR",
            Description: "Main Office",
            IsActive: false,
            RegionId: regionId);

        // Act
        var act = async () => await handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Cannot deactivate Regional Office 'NTC-NCR' while 2 application(s) are actively in-flight*")
            .WithMessage("*1 Returned Awaiting Client Compliance*")
            .WithMessage("*1 Paid & Awaiting Document Issuance*");

        tenant.IsActive.Should().BeTrue();
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteTenant_WhenInFlightApplicationsExist_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "NTC Region VII",
            Code = "NTC-R7",
            IsActive = true,
            RegionId = Guid.NewGuid()
        };

        _mockTenantRepo.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        _mockTenantRepo.Setup(r => r.GetInFlightApplicationCountsByStatusAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<ApplicationStatus, int>
            {
                { ApplicationStatus.Submitted, 3 }
            });

        var handler = new DeleteTenantCommandHandler(_mockTenantRepo.Object, _mockUnitOfWork.Object);

        // Act
        var act = async () => await handler.Handle(new DeleteTenantCommand(tenantId), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Cannot delete Regional Office 'NTC Region VII' while 3 application(s) are actively in-flight*");

        _mockTenantRepo.Verify(r => r.Delete(It.IsAny<Tenant>()), Times.Never);
    }
}
