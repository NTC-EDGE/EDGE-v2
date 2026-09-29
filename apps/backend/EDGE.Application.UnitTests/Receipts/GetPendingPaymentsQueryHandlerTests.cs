using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Receipts.Queries.PendingPayments;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Receipts;

public class GetPendingPaymentsQueryHandlerTests
{
    private readonly Mock<IOfficialReceiptRepository> _mockReceiptRepo;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<ITenantMemberRepository> _mockTenantMemberRepo;
    private readonly Mock<ITenantContextService> _mockTenantContextService;
    private readonly Mock<IFieldOfficeRepository> _mockFieldOfficeRepo;
    private readonly GetPendingPaymentsQueryHandler _handler;

    public GetPendingPaymentsQueryHandlerTests()
    {
        _mockReceiptRepo = new Mock<IOfficialReceiptRepository>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockTenantMemberRepo = new Mock<ITenantMemberRepository>();
        _mockTenantContextService = new Mock<ITenantContextService>();
        _mockFieldOfficeRepo = new Mock<IFieldOfficeRepository>();

        _handler = new GetPendingPaymentsQueryHandler(
            _mockReceiptRepo.Object,
            _mockCurrentUserService.Object,
            _mockUserRepo.Object,
            _mockTenantMemberRepo.Object,
            _mockTenantContextService.Object,
            _mockFieldOfficeRepo.Object
        );
    }

    [Fact]
    public async Task Handle_CashierInFieldOffice1_IsScopedToFieldOffice1()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var fieldOfficeId = Guid.NewGuid();
        var fieldOfficeName = "NTC Field Office 1 - Cagayan de Oro";

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockCurrentUserService.Setup(u => u.IsAdminClaim).Returns(false);
        _mockTenantContextService.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var cashierRole = new Role { Id = Guid.NewGuid(), Key = "cashier", Name = "Cashiering Officer" };
        var fieldOffice = new FieldOffice { Id = fieldOfficeId, TenantId = tenantId, Name = fieldOfficeName };
        var membership = new TenantMember
        {
            TenantId = tenantId,
            UserId = userId,
            RoleId = cashierRole.Id,
            Role = cashierRole,
            FieldOfficeId = fieldOfficeId,
            FieldOffice = fieldOffice
        };

        _mockTenantMemberRepo.Setup(m => m.GetByTenantAndUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(membership);

        string? capturedFieldOffice = null;
        _mockReceiptRepo.Setup(r => r.GetPendingOrdersOfPaymentAsync(
            tenantId,
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()
        )).Callback<Guid, string?, string?, CancellationToken>(
            (tid, s, fo, ct) => capturedFieldOffice = fo
        ).ReturnsAsync(new List<OrderOfPayment>());

        var query = new GetPendingPaymentsQuery(tenantId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedFieldOffice.Should().Be(fieldOfficeName);
    }

    [Fact]
    public async Task Handle_AdminOrRegionalDirector_HasFullRegionVisibility_NotRestrictedToFieldOffice()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var fieldOfficeId = Guid.NewGuid();

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockCurrentUserService.Setup(u => u.IsAdminClaim).Returns(false);
        _mockTenantContextService.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var adminRole = new Role { Id = Guid.NewGuid(), Key = "regionaladmin", Name = "Regional Administrator" };
        var fieldOffice = new FieldOffice { Id = fieldOfficeId, TenantId = tenantId, Name = "Branch 1" };
        var membership = new TenantMember
        {
            TenantId = tenantId,
            UserId = userId,
            RoleId = adminRole.Id,
            Role = adminRole,
            FieldOfficeId = fieldOfficeId,
            FieldOffice = fieldOffice
        };

        _mockTenantMemberRepo.Setup(m => m.GetByTenantAndUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(membership);

        string? capturedFieldOffice = "INITIAL";
        _mockReceiptRepo.Setup(r => r.GetPendingOrdersOfPaymentAsync(
            tenantId,
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()
        )).Callback<Guid, string?, string?, CancellationToken>(
            (tid, s, fo, ct) => capturedFieldOffice = fo
        ).ReturnsAsync(new List<OrderOfPayment>());

        var query = new GetPendingPaymentsQuery(tenantId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedFieldOffice.Should().BeNull();
    }
}
