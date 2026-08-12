using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.CreateSoa;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class CreateSoaCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly CreateSoaCommandHandler _handler;

    public CreateSoaCommandHandlerTests()
    {
        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string? id, string defaultRole, CancellationToken _) => new StaffUserContext(null, "Test Staff", defaultRole));

        _handler = new CreateSoaCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotFound()
    {
        // Arrange
        var command = new CreateSoaCommand(
            Guid.NewGuid(),
            null,
            "Individual",
            "John Doe",
            "123 Main St",
            DateTime.UtcNow.AddDays(30),
            new List<CreateSoaLineItemRequest>());

        _repositoryMock
            .Setup(r => r.GetByIdAsync(command.ApplicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Application not found.");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenIssuedToTypeInvalid()
    {
        // Arrange
        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };
        var command = new CreateSoaCommand(
            app.Id,
            null,
            "InvalidType",
            "John Doe",
            "123 Main St",
            DateTime.UtcNow.AddDays(30),
            new List<CreateSoaLineItemRequest>());

        _repositoryMock
            .Setup(r => r.GetByIdAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Invalid IssuedToType.");
    }

    [Fact]
    public async Task Handle_ShouldCreateSoa_AndRecalculateAmountsServerSide_WhenValidRequest()
    {
        // Arrange
        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };
        var lineItem1 = new CreateSoaLineItemRequest("Processing Fee", "FEE-01", "Desc", null, null, 1, 2, 500m, 9999m); // client provided wrong amount 9999m
        var lineItem2 = new CreateSoaLineItemRequest("Filing Fee", "FEE-02", "Desc", null, null, 1, 1, 300m, 0m);

        var command = new CreateSoaCommand(
            app.Id,
            null,
            "Company",
            "Acme Corp",
            "456 Market St",
            DateTime.UtcNow.AddDays(30),
            new List<CreateSoaLineItemRequest> { lineItem1, lineItem2 });

        _repositoryMock
            .Setup(r => r.GetByIdAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        StatementOfAccount? savedSoa = null;
        _repositoryMock
            .Setup(r => r.AddSoaAsync(It.IsAny<StatementOfAccount>(), It.IsAny<CancellationToken>()))
            .Callback<StatementOfAccount, CancellationToken>((s, _) => savedSoa = s)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedSoa.Should().NotBeNull();
        savedSoa!.IssuedToName.Should().Be("Acme Corp");
        savedSoa.IssuedToType.Should().Be(IssuedToType.Company);

        // Verify Server-Side Fee Recalculation:
        // Item 1: 2 units * 500 = 1000 (overrides client 9999)
        // Item 2: 1 unit * 300 = 300
        // Total = 1300
        savedSoa.LineItems.Should().HaveCount(2);
        savedSoa.TotalAmount.Should().Be(1300m);
        savedSoa.Histories.Should().HaveCount(1);
        savedSoa.Histories.First().ToStatus.Should().Be(SoaStatus.Pending);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
