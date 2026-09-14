using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.Commands.SetSchedulePublishStatus;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Schedules;

public class SetSchedulePublishCommandHandlerTests
{
    private readonly Mock<IScheduleRepository> _scheduleRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();

    private readonly SetSchedulePublishCommandHandler _handler;

    public SetSchedulePublishCommandHandlerTests()
    {
        _handler = new SetSchedulePublishCommandHandler(
            _scheduleRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _tenantContextServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldPublishSchedule_WhenApplicationDatesAreSetAndCallerAuthorized()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var schedule = new Schedule
        {
            Id = scheduleId,
            TenantId = tenantId,
            IsPublished = false,
            StartApplication = DateTime.UtcNow.AddDays(1),
            EndApplication = DateTime.UtcNow.AddDays(10),
            StartDate = DateTime.UtcNow.AddDays(15),
            EndDate = DateTime.UtcNow.AddDays(16),
            Venue = "Regional Exam Center"
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedule);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(tenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new SetSchedulePublishStatusCommand(scheduleId, true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.IsPublished.Should().BeTrue();
        _scheduleRepositoryMock.Verify(s => s.Update(schedule), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCallerLacksTenantMembership()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var foreignTenantId = Guid.NewGuid();

        var schedule = new Schedule
        {
            Id = scheduleId,
            TenantId = foreignTenantId,
            IsPublished = false
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedule);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(foreignTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("You are not authorized to publish schedules for this regional tenant."));

        var command = new SetSchedulePublishStatusCommand(scheduleId, true);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*You are not authorized to publish schedules for this regional tenant.*");

        _scheduleRepositoryMock.Verify(s => s.Update(It.IsAny<Schedule>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldThrowValidationException_WhenPublishingWithoutApplicationDates()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var schedule = new Schedule
        {
            Id = scheduleId,
            TenantId = tenantId,
            IsPublished = false,
            StartApplication = null,
            EndApplication = null
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedule);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(tenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new SetSchedulePublishStatusCommand(scheduleId, true);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<FluentValidation.ValidationException>();
    }
}
