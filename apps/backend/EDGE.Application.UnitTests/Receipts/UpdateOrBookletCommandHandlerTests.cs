using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Receipts.Commands.Booklets.UpdateOrBooklet;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Receipts;

public class UpdateOrBookletCommandHandlerTests
{
    private readonly Mock<IOrBookletRepository> _mockBookletRepo;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<ITenantMemberRepository> _mockTenantMemberRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly UpdateOrBookletCommandHandler _handler;

    public UpdateOrBookletCommandHandlerTests()
    {
        _mockBookletRepo = new Mock<IOrBookletRepository>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockTenantMemberRepo = new Mock<ITenantMemberRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        _handler = new UpdateOrBookletCommandHandler(
            _mockBookletRepo.Object,
            _mockUserRepo.Object,
            _mockTenantMemberRepo.Object,
            _mockUnitOfWork.Object
        );
    }

    [Fact]
    public async Task Handle_UpdateAssignedCashiers_SyncsCashierList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var bookletId = Guid.NewGuid();
        var cashier1Id = Guid.NewGuid();
        var cashier2Id = Guid.NewGuid();

        var booklet = new OrBooklet
        {
            Id = bookletId,
            TenantId = tenantId,
            BookletNumber = "BKL-001",
            StartNumber = 100001,
            EndNumber = 100050,
            CurrentNumber = 100001,
            TotalCount = 50,
            IssuedCount = 0,
            AssignedUserId = cashier1Id,
            AssignedCashiers = new List<OrBookletCashier>
            {
                new OrBookletCashier { BookletId = bookletId, CashierUserId = cashier1Id, IsPrimary = true }
            }
        };

        _mockBookletRepo.Setup(b => b.GetByIdAsync(bookletId, It.IsAny<CancellationToken>())).ReturnsAsync(booklet);
        _mockBookletRepo.Setup(b => b.ExistsBookletNumberAsync(tenantId, "BKL-001-EDITED", bookletId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var cashier1 = new User { Id = cashier1Id, FirstName = "Jane", LastName = "Doe" };
        var cashier2 = new User { Id = cashier2Id, FirstName = "John", LastName = "Smith" };

        _mockUserRepo.Setup(u => u.GetByIdAsync(cashier1Id, It.IsAny<CancellationToken>())).ReturnsAsync(cashier1);
        _mockUserRepo.Setup(u => u.GetByIdAsync(cashier2Id, It.IsAny<CancellationToken>())).ReturnsAsync(cashier2);

        var command = new UpdateOrBookletCommand(
            Id: bookletId,
            TenantId: tenantId,
            BookletNumber: "BKL-001-EDITED",
            Prefix: "NTC-",
            StartNumber: 100001,
            EndNumber: 100050,
            TotalCount: 50,
            AssignedUserId: cashier1Id,
            AssignedUserIds: new List<Guid> { cashier1Id, cashier2Id },
            Remarks: "Updated shared roster"
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.BookletNumber.Should().Be("BKL-001-EDITED");
        result.Data.AssignedUserIds.Should().HaveCount(2);
        booklet.AssignedCashiers.Should().HaveCount(2);

        _mockBookletRepo.Verify(b => b.UpdateAsync(booklet, It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CannotModifySeriesRange_WhenReceiptsAlreadyIssued()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var bookletId = Guid.NewGuid();

        var booklet = new OrBooklet
        {
            Id = bookletId,
            TenantId = tenantId,
            BookletNumber = "BKL-001",
            StartNumber = 100001,
            EndNumber = 100050,
            CurrentNumber = 100005,
            TotalCount = 50,
            IssuedCount = 4
        };

        _mockBookletRepo.Setup(b => b.GetByIdAsync(bookletId, It.IsAny<CancellationToken>())).ReturnsAsync(booklet);

        var command = new UpdateOrBookletCommand(
            Id: bookletId,
            TenantId: tenantId,
            BookletNumber: "BKL-001",
            Prefix: null,
            StartNumber: 200001, // Attempt to modify start number after receipts issued
            EndNumber: 200050,
            TotalCount: 50
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("already been issued");
    }
}
