using MediatR;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.UpdateSchedule;

public record UpdateScheduleCommand(
    Guid Id,
    Guid ServiceId,
    Guid TenantId,
    string Venue,
    DateTime StartDate,
    DateTime EndDate,
    string? SeatNumber = null,
    string? Remarks = null,
    Guid? ApplicationId = null
) : IRequest<ScheduleDto?>;
