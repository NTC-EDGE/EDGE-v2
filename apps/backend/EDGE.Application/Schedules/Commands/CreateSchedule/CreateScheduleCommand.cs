using MediatR;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.CreateSchedule;

public record CreateScheduleCommand(
    Guid ServiceId,
    Guid TenantId,
    string Venue,
    DateTime StartDate,
    DateTime EndDate,
    string? SeatNumber = null,
    string? Remarks = null,
    Guid? ApplicationId = null
) : IRequest<ScheduleDto>;
