using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.AddSoaLineItem;
using EDGE.Application.Applications.Commands.UpdateSoaLineItem;
using EDGE.Application.Applications.Commands.DeleteSoaLineItem;
using EDGE.Application.Applications.Commands.UpdateSoa;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class SoaLineItemCommandHandlersTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();

    public SoaLineItemCommandHandlersTests()
    {
        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string? id, string defaultRole, CancellationToken _) => new StaffUserContext(Guid.NewGuid(), "Jane Evaluator", defaultRole));
    }

    [Fact]
    public async Task AddSoaLineItem_ShouldAddLineItem_AndRecalculateTotal()
    {
        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            TotalAmount = 500m,
            LineItems = new List<SoaLineItem>
            {
                new() { Id = Guid.NewGuid(), Amount = 500m, FeeRate = 500m, NoOfUnits = 1 }
            }
        };

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(soa.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(soa);

        var handler = new AddSoaLineItemCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);

        var command = new AddSoaLineItemCommand(
            soa.Id,
            "Surcharge",
            "SUR-01",
            "Late filing surcharge",
            null,
            null,
            1,
            2,
            150m);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        soa.LineItems.Should().HaveCount(2);
        soa.TotalAmount.Should().Be(800m); // 500 + (2 * 150)
        soa.Histories.Should().HaveCount(1);
        soa.Histories.First().Action.Should().Contain("Surcharge");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateSoaLineItem_ShouldUpdateFields_AndRecalculateTotal()
    {
        var lineItemId = Guid.NewGuid();
        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            TotalAmount = 500m,
            LineItems = new List<SoaLineItem>
            {
                new() { Id = lineItemId, Particular = "Old Fee", ItemCode = "OLD", Amount = 500m, FeeRate = 500m, NoOfUnits = 1, ValidityYears = 1 }
            }
        };

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(soa.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(soa);

        var handler = new UpdateSoaLineItemCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);

        var command = new UpdateSoaLineItemCommand(
            soa.Id,
            lineItemId,
            "Updated Fee",
            "NEW-01",
            "Updated Description",
            null,
            null,
            3,
            2,
            400m);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var updatedItem = soa.LineItems.First();
        updatedItem.Particular.Should().Be("Updated Fee");
        updatedItem.ItemCode.Should().Be("NEW-01");
        updatedItem.ValidityYears.Should().Be(3);
        updatedItem.NoOfUnits.Should().Be(2);
        updatedItem.FeeRate.Should().Be(400m);
        updatedItem.Amount.Should().Be(800m);
        soa.TotalAmount.Should().Be(800m);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteSoaLineItem_ShouldRemoveLineItem_AndRecalculateTotal()
    {
        var lineItem1 = new SoaLineItem { Id = Guid.NewGuid(), Particular = "Fee 1", Amount = 500m };
        var lineItem2 = new SoaLineItem { Id = Guid.NewGuid(), Particular = "Fee 2", Amount = 300m };
        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            TotalAmount = 800m,
            LineItems = new List<SoaLineItem> { lineItem1, lineItem2 }
        };

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(soa.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(soa);

        var handler = new DeleteSoaLineItemCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);

        var command = new DeleteSoaLineItemCommand(soa.Id, lineItem2.Id);
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        soa.LineItems.Should().HaveCount(1);
        soa.LineItems.First().Id.Should().Be(lineItem1.Id);
        soa.TotalAmount.Should().Be(500m);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateSoa_ShouldUpdateDueDateAndRemarks()
    {
        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            DueDate = DateTime.UtcNow.AddDays(10),
            IssuedToName = "Old Name"
        };

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(soa.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(soa);

        var handler = new UpdateSoaCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);

        var newDueDate = DateTime.UtcNow.AddDays(45);
        var command = new UpdateSoaCommand(soa.Id, newDueDate, "New Name", "New Address", "New Remarks");
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        soa.DueDate.Should().Be(newDueDate);
        soa.IssuedToName.Should().Be("New Name");
        soa.IssuedToAddress.Should().Be("New Address");
        soa.Remarks.Should().Be("New Remarks");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
