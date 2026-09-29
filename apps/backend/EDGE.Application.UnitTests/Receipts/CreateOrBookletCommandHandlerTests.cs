using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Receipts.Commands.Booklets.CreateOrBooklet;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Receipts;

public class CreateOrBookletCommandHandlerTests
{
    private readonly Mock<IOrBookletRepository> _mockBookletRepo;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<ITenantMemberRepository> _mockTenantMemberRepo;
    private readonly Mock<ITenantRepository> _mockTenantRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly CreateOrBookletCommandHandler _handler;

    public CreateOrBookletCommandHandlerTests()
    {
        _mockBookletRepo = new Mock<IOrBookletRepository>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockTenantMemberRepo = new Mock<ITenantMemberRepository>();
        _mockTenantRepo = new Mock<ITenantRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        _handler = new CreateOrBookletCommandHandler(
            _mockBookletRepo.Object,
            _mockUserRepo.Object,
            _mockTenantMemberRepo.Object,
            _mockTenantRepo.Object,
            _mockUnitOfWork.Object
        );
    }

    [Fact]
    public async Task Handle_MultipleCashiers_AssignsAllCashiersSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var cashier1Id = Guid.NewGuid();
        var cashier2Id = Guid.NewGuid();

        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Name = "Region 10" });

        _mockBookletRepo.Setup(b => b.ExistsBookletNumberAsync(tenantId, "BKL-001", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var cashier1 = new User { Id = cashier1Id, FirstName = "Jane", LastName = "Doe" };
        var cashier2 = new User { Id = cashier2Id, FirstName = "John", LastName = "Smith" };

        _mockUserRepo.Setup(u => u.GetByIdAsync(cashier1Id, It.IsAny<CancellationToken>())).ReturnsAsync(cashier1);
        _mockUserRepo.Setup(u => u.GetByIdAsync(cashier2Id, It.IsAny<CancellationToken>())).ReturnsAsync(cashier2);

        var cashierRole = new Role { Id = Guid.NewGuid(), Key = "cashier", Name = "Cashiering Officer" };

        _mockTenantMemberRepo.Setup(m => m.GetByTenantAndUserAsync(tenantId, cashier1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantMember { TenantId = tenantId, UserId = cashier1Id, Role = cashierRole, RoleId = cashierRole.Id });
        _mockTenantMemberRepo.Setup(m => m.GetByTenantAndUserAsync(tenantId, cashier2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantMember { TenantId = tenantId, UserId = cashier2Id, Role = cashierRole, RoleId = cashierRole.Id });

        OrBooklet? savedBooklet = null;
        _mockBookletRepo.Setup(b => b.AddAsync(It.IsAny<OrBooklet>(), It.IsAny<CancellationToken>()))
            .Callback<OrBooklet, CancellationToken>((b, _) => savedBooklet = b)
            .Returns(Task.CompletedTask);

        var command = new CreateOrBookletCommand(
            TenantId: tenantId,
            BookletNumber: "BKL-001",
            Prefix: "NTC-",
            StartNumber: 100001,
            EndNumber: null,
            TotalCount: 50,
            AssignedUserId: cashier1Id,
            AssignedUserIds: new List<Guid> { cashier1Id, cashier2Id },
            Remarks: "Shared between Jane and John"
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AssignedUserIds.Should().HaveCount(2);
        result.Data.AssignedUserIds.Should().Contain(new[] { cashier1Id, cashier2Id });
        result.Data.AssignedCashiers.Should().HaveCount(2);

        savedBooklet.Should().NotBeNull();
        savedBooklet!.AssignedCashiers.Should().HaveCount(2);
        savedBooklet.AssignedCashiers.Any(c => c.CashierUserId == cashier1Id && c.IsPrimary).Should().BeTrue();
        savedBooklet.AssignedCashiers.Any(c => c.CashierUserId == cashier2Id && !c.IsPrimary).Should().BeTrue();

        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NonCashierRole_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var evaluatorUserId = Guid.NewGuid();

        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Name = "Region 10" });

        _mockBookletRepo.Setup(b => b.ExistsBookletNumberAsync(tenantId, "BKL-001", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var evaluatorUser = new User { Id = evaluatorUserId, FirstName = "Eva", LastName = "Luator" };
        var evaluatorRole = new Role { Id = Guid.NewGuid(), Key = "evaluator", Name = "Technical Evaluator" };

        _mockUserRepo.Setup(u => u.GetByIdAsync(evaluatorUserId, It.IsAny<CancellationToken>())).ReturnsAsync(evaluatorUser);
        _mockTenantMemberRepo.Setup(m => m.GetByTenantAndUserAsync(tenantId, evaluatorUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantMember { TenantId = tenantId, UserId = evaluatorUserId, Role = evaluatorRole, RoleId = evaluatorRole.Id });

        var command = new CreateOrBookletCommand(
            TenantId: tenantId,
            BookletNumber: "BKL-001",
            Prefix: "NTC-",
            StartNumber: 100001,
            AssignedUserId: evaluatorUserId
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not authorized to hold Official Receipt booklets");
    }

    [Fact]
    public async Task Handle_DuplicateBookletNumber_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Name = "Region 10" });

        _mockBookletRepo.Setup(b => b.ExistsBookletNumberAsync(tenantId, "BKL-001", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new CreateOrBookletCommand(
            TenantId: tenantId,
            BookletNumber: "BKL-001",
            Prefix: "NTC-",
            StartNumber: 100001
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("already exists");
    }
}
