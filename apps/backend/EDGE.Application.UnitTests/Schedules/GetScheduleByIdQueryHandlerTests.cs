using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.Queries.GetScheduleById;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Schedules;

public class GetScheduleByIdQueryHandlerTests
{
    private readonly Mock<IScheduleRepository> _scheduleRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();

    private readonly GetScheduleByIdQueryHandler _handler;

    public GetScheduleByIdQueryHandlerTests()
    {
        _handler = new GetScheduleByIdQueryHandler(
            _scheduleRepositoryMock.Object,
            _tenantContextServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnSchedule_WhenScheduleExistsAndCallerIsActiveMember()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();

        var schedule = new Schedule
        {
            Id = scheduleId,
            TenantId = tenantId,
            ServiceId = serviceId,
            Venue = "Main Testing Center",
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(11),
            Service = new Service
            {
                Id = serviceId,
                Name = "Radio Operator Exam",
                Code = "RO-EXAM"
            }
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedule);

        _tenantContextServiceMock
            .Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(new GetScheduleByIdQuery(scheduleId), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(scheduleId);
        result.Venue.Should().Be("Main Testing Center");
        result.ServiceName.Should().Be("Radio Operator Exam");
    }

    [Fact]
    public async Task Handle_ShouldReturnNull_WhenCallerIsNotActiveMemberOfScheduleTenant()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();
        var foreignTenantId = Guid.NewGuid();

        var schedule = new Schedule
        {
            Id = scheduleId,
            TenantId = foreignTenantId,
            Venue = "Foreign Center"
        };

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(schedule);

        _tenantContextServiceMock
            .Setup(t => t.IsUserActiveMemberAsync(foreignTenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(new GetScheduleByIdQuery(scheduleId), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ShouldReturnNull_WhenScheduleDoesNotExist()
    {
        // Arrange
        var scheduleId = Guid.NewGuid();

        _scheduleRepositoryMock
            .Setup(s => s.GetByIdAsync(scheduleId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Schedule?)null);

        // Act
        var result = await _handler.Handle(new GetScheduleByIdQuery(scheduleId), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }
}
