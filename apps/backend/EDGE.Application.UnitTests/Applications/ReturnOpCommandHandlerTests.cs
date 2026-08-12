using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.ReturnOp;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class ReturnOpCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly ReturnOpCommandHandler _handler;

    public ReturnOpCommandHandlerTests()
    {
        _handler = new ReturnOpCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenOpNotFound()
    {
        // Arrange
        var command = new ReturnOpCommand(Guid.NewGuid(), "Incomplete requirements", ReturnTarget.Accountant);

        _repositoryMock
            .Setup(r => r.GetOpByIdAsync(command.OpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderOfPayment?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Order of Payment not found.");
    }

    [Fact]
    public async Task Handle_ShouldSetOpStatusReturned_WhenReturnToAccountant()
    {
        // Arrange
        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            Status = OpStatus.Billed,
            StatementOfAccount = new StatementOfAccount { Id = Guid.NewGuid(), Status = SoaStatus.Approved }
        };

        var command = new ReturnOpCommand(op.Id, "Fix billing line items", ReturnTarget.Accountant);

        _repositoryMock
            .Setup(r => r.GetOpByIdAsync(op.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(op);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        op.Status.Should().Be(OpStatus.Returned);
        op.Remarks.Should().Be("Fix billing line items");
        op.Histories.Should().HaveCount(1);
        op.Histories.First().ToStatus.Should().Be(OpStatus.Returned);
        op.StatementOfAccount.Status.Should().Be(SoaStatus.Approved); // SOA remains Approved when returning to Accountant

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldSetOpAndSoaStatusReturned_WhenReturnToEvaluator()
    {
        // Arrange
        var soa = new StatementOfAccount { Id = Guid.NewGuid(), Status = SoaStatus.Approved };
        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            Status = OpStatus.Billed,
            StatementOfAccount = soa
        };

        var command = new ReturnOpCommand(op.Id, "Re-evaluate applicant qualifications", ReturnTarget.Evaluator);

        _repositoryMock
            .Setup(r => r.GetOpByIdAsync(op.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(op);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        op.Status.Should().Be(OpStatus.Returned);
        soa.Status.Should().Be(SoaStatus.Returned); // SOA transitions to Returned when returning to Evaluator

        _repositoryMock.Verify(r => r.AddSoaHistoryAsync(It.Is<SoaHistory>(h => h.ToStatus == SoaStatus.Returned), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
