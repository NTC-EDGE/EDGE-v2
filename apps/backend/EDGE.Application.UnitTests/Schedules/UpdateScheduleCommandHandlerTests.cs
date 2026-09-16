using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.Commands.UpdateSchedule;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Schedules;

public class UpdateScheduleCommandHandlerTests
{
    private readonly Mock<IScheduleRepository> _scheduleRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();

    private readonly UpdateScheduleCommandHandler _handler;

    public UpdateScheduleCommandHandlerTests()
    {
        _handler = new UpdateScheduleCommandHandler(
            _scheduleRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _tenantContextServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldUpdateSchedule_WhenDraftAndCallerIsAuthorized()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();

        var existingSchedule = new Schedule
        {
            Id = scheduleId,
            TenantId = tenantId,
            ServiceId = serviceId,
            Venue = "Old Venue",
            IsPublished = false,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(11),
            Service = new Service
            {
                Id = serviceId,
                Name = "Radio Operator Exam",
                Code = "RO-EXAM",
                ServiceCategory = new ServiceCategory { Type = ServiceCategoryType.Exam }
            }
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSchedule);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(tenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new UpdateScheduleCommand(
            Id: scheduleId,
            Venue: "New Examination Hall",
            StartDate: DateTime.UtcNow.AddDays(12),
            EndDate: DateTime.UtcNow.AddDays(13),
            MaximumSlots: 75,
            Remarks: "Updated Venue",
            StartTime: "09:00 AM",
            EndTime: "04:00 PM"
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Venue.Should().Be("New Examination Hall");
        result.MaximumSlots.Should().Be(75);
        result.Remarks.Should().Be("Updated Venue");
        result.StartTime.Should().Be("09:00 AM");
        result.EndTime.Should().Be("04:00 PM");

        _scheduleRepositoryMock.Verify(s => s.Update(It.IsAny<Schedule>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCallerLacksTenantMembership()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var foreignTenantId = Guid.NewGuid();

        var existingSchedule = new Schedule
        {
            Id = scheduleId,
            TenantId = foreignTenantId,
            Venue = "Foreign Venue",
            IsPublished = false
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSchedule);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(foreignTenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("You are not authorized to modify schedules for this regional tenant."));

        var command = new UpdateScheduleCommand(
            Id: scheduleId,
            Venue: "Attempted Update",
            StartDate: DateTime.UtcNow.AddDays(10),
            EndDate: DateTime.UtcNow.AddDays(11)
        );

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*You are not authorized to modify schedules for this regional tenant.*");

        _scheduleRepositoryMock.Verify(s => s.Update(It.IsAny<Schedule>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidOperationException_WhenScheduleIsAlreadyPublished()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var publishedSchedule = new Schedule
        {
            Id = scheduleId,
            TenantId = tenantId,
            Venue = "Published Venue",
            IsPublished = true
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(publishedSchedule);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(tenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new UpdateScheduleCommand(
            Id: scheduleId,
            Venue: "Attempted Edit on Published",
            StartDate: DateTime.UtcNow.AddDays(10),
            EndDate: DateTime.UtcNow.AddDays(11)
        );

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Published schedules cannot be edited*");
    }
}
