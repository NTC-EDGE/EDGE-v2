using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.Commands.CreateSchedule;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Schedules;

public class CreateScheduleCommandHandlerTests
{
    private readonly Mock<IScheduleRepository> _scheduleRepositoryMock = new();
    private readonly Mock<IServiceRepository> _serviceRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();

    private readonly CreateScheduleCommandHandler _handler;

    public CreateScheduleCommandHandlerTests()
    {
        _handler = new CreateScheduleCommandHandler(
            _scheduleRepositoryMock.Object,
            _serviceRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _tenantContextServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreateSchedule_WhenCallerIsAuthorizedAndServiceIsExam()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var service = new Service
        {
            Id = serviceId,
            Name = "Radio Operator Exam",
            Code = "RO-EXAM",
            ServiceCategory = new ServiceCategory { Type = ServiceCategoryType.Exam }
        };

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(tenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _serviceRepositoryMock
            .Setup(s => s.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        var command = new CreateScheduleCommand(
            ServiceId: serviceId,
            TenantId: tenantId,
            Venue: "NTC Regional Testing Center",
            StartDate: DateTime.UtcNow.AddDays(10),
            EndDate: DateTime.UtcNow.AddDays(11),
            StartApplication: DateTime.UtcNow.AddDays(1),
            EndApplication: DateTime.UtcNow.AddDays(7),
            IsPublished: false,
            MaximumSlots: 50,
            Remarks: "Bring valid IDs"
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.ServiceId.Should().Be(serviceId);
        result.TenantId.Should().Be(tenantId);
        result.Venue.Should().Be("NTC Regional Testing Center");
        result.ServiceName.Should().Be("Radio Operator Exam");
        result.MaximumSlots.Should().Be(50);

        _scheduleRepositoryMock.Verify(s => s.AddAsync(It.IsAny<Schedule>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCallerLacksTenantMembership()
    {
        // Arrange
        var foreignTenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(foreignTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("You are not authorized to create schedules for this regional tenant."));

        var command = new CreateScheduleCommand(
            ServiceId: serviceId,
            TenantId: foreignTenantId,
            Venue: "NTC Testing Center",
            StartDate: DateTime.UtcNow.AddDays(5),
            EndDate: DateTime.UtcNow.AddDays(6)
        );

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*You are not authorized to create schedules for this regional tenant.*");

        _scheduleRepositoryMock.Verify(s => s.AddAsync(It.IsAny<Schedule>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidOperationException_WhenServiceIsNotExamCategory()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var service = new Service
        {
            Id = serviceId,
            Name = "Vessel Station Permit",
            Code = "VSP-01",
            ServiceCategory = new ServiceCategory { Type = ServiceCategoryType.Permit }
        };

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(tenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _serviceRepositoryMock
            .Setup(s => s.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        var command = new CreateScheduleCommand(
            ServiceId: serviceId,
            TenantId: tenantId,
            Venue: "Testing Center",
            StartDate: DateTime.UtcNow.AddDays(5),
            EndDate: DateTime.UtcNow.AddDays(6)
        );

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Schedules can only be created for Examination services.*");
    }
}
