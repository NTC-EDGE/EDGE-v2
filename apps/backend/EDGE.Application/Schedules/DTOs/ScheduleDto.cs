namespace EDGE.Application.Schedules.DTOs;

public record ScheduleDto(
    Guid Id,
    Guid ServiceId,
    Guid TenantId,
    Guid? ApplicationId,
    string? SeatNumber,
    string Venue,
    DateTime StartDate,
    DateTime EndDate,
    string? Remarks,
    DateTime CreatedAt
);
