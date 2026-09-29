using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Receipts.Commands.Booklets.TransferOrBooklet;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Receipts;

public class TransferOrBookletCommandHandlerTests
{
    private readonly Mock<IOrBookletRepository> _mockBookletRepo;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<ITenantMemberRepository> _mockTenantMemberRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly TransferOrBookletCommandHandler _handler;

    public TransferOrBookletCommandHandlerTests()
    {
        _mockBookletRepo = new Mock<IOrBookletRepository>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockTenantMemberRepo = new Mock<ITenantMemberRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        _handler = new TransferOrBookletCommandHandler(
            _mockBookletRepo.Object,
            _mockUserRepo.Object,
            _mockTenantMemberRepo.Object,
            _mockUnitOfWork.Object
        );
    }

    [Fact]
    public async Task Handle_TransferToNewPrimaryAndAdditionalCashiers_UpdatesAssignedCashiersCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var bookletId = Guid.NewGuid();
        var initialCashierId = Guid.NewGuid();
        var newPrimaryId = Guid.NewGuid();
        var coCashierId = Guid.NewGuid();

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
            AssignedUserId = initialCashierId,
            AssignedCashiers = new List<OrBookletCashier>
            {
                new OrBookletCashier { BookletId = bookletId, CashierUserId = initialCashierId, IsPrimary = true }
            }
        };

        _mockBookletRepo.Setup(b => b.GetByIdAsync(bookletId, It.IsAny<CancellationToken>())).ReturnsAsync(booklet);

        var newPrimaryUser = new User { Id = newPrimaryId, FirstName = "Alice", LastName = "Wonder" };
        var coCashierUser = new User { Id = coCashierId, FirstName = "Bob", LastName = "Builder" };

        _mockUserRepo.Setup(u => u.GetByIdAsync(newPrimaryId, It.IsAny<CancellationToken>())).ReturnsAsync(newPrimaryUser);
        _mockUserRepo.Setup(u => u.GetByIdAsync(coCashierId, It.IsAny<CancellationToken>())).ReturnsAsync(coCashierUser);

        _mockTenantMemberRepo.Setup(m => m.GetByTenantAndUserAsync(tenantId, newPrimaryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantMember { TenantId = tenantId, UserId = newPrimaryId });

        var command = new TransferOrBookletCommand(
            Id: bookletId,
            TenantId: tenantId,
            NewAssignedUserId: newPrimaryId,
            AdditionalUserIds: new List<Guid> { coCashierId },
            TransferReason: "Shift handover"
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AssignedUserId.Should().Be(newPrimaryId);
        result.Data.AssignedUserIds.Should().HaveCount(2);
        result.Data.AssignedUserIds.Should().Contain(new[] { newPrimaryId, coCashierId });

        booklet.AssignedCashiers.Should().HaveCount(2);
        booklet.AssignedCashiers.Any(c => c.CashierUserId == newPrimaryId && c.IsPrimary).Should().BeTrue();
        booklet.AssignedCashiers.Any(c => c.CashierUserId == coCashierId && !c.IsPrimary).Should().BeTrue();
        booklet.Remarks.Should().Contain("Shift handover");

        _mockBookletRepo.Verify(b => b.UpdateAsync(booklet, It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
