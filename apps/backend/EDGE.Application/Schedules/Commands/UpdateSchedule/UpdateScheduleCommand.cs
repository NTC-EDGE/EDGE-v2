using MediatR;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.UpdateSchedule;

public record UpdateScheduleCommand(
    Guid Id,
    string Venue,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? StartApplication = null,
    DateTime? EndApplication = null,
    int? MaximumSlots = null,
    string? Remarks = null,
    string? StartTime = null,
    string? EndTime = null
) : IRequest<ScheduleDto?>;

public record UpdateScheduleRequest(
    string Venue,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? StartApplication = null,
    DateTime? EndApplication = null,
    int? MaximumSlots = null,
    string? Remarks = null,
    string? StartTime = null,
    string? EndTime = null
);
