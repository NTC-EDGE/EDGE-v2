using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.Commands.DeleteSchedule;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Schedules;

public class DeleteScheduleCommandHandlerTests
{
    private readonly Mock<IScheduleRepository> _scheduleRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();

    private readonly DeleteScheduleCommandHandler _handler;

    public DeleteScheduleCommandHandlerTests()
    {
        _handler = new DeleteScheduleCommandHandler(
            _scheduleRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _tenantContextServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldDeleteSchedule_WhenDraftAndCallerIsAuthorized()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var draftSchedule = new Schedule
        {
            Id = scheduleId,
            TenantId = tenantId,
            IsPublished = false
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(draftSchedule);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(tenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(new DeleteScheduleCommand(scheduleId), CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _scheduleRepositoryMock.Verify(s => s.Delete(draftSchedule), Times.Once);
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
            .ThrowsAsync(new UnauthorizedAccessException("You are not authorized to delete schedules for this regional tenant."));

        // Act
        Func<Task> act = async () => await _handler.Handle(new DeleteScheduleCommand(scheduleId), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*You are not authorized to delete schedules for this regional tenant.*");

        _scheduleRepositoryMock.Verify(s => s.Delete(It.IsAny<Schedule>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidOperationException_WhenScheduleIsPublished()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var publishedSchedule = new Schedule
        {
            Id = scheduleId,
            TenantId = tenantId,
            IsPublished = true
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(publishedSchedule);

        _tenantContextServiceMock
            .Setup(t => t.EnsureUserActiveMemberAsync(tenantId, It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        Func<Task> act = async () => await _handler.Handle(new DeleteScheduleCommand(scheduleId), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Published schedules cannot be deleted*");
    }
}
